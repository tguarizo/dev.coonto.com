#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"
COMMAND="${1:-help}"
ORIGINAL_ARGS=("$@")
export COMPOSE_PROJECT_NAME="coonto-$(basename "$ROOT_DIR")"

log(){ printf '\n[Coonto] %s\n' "$*"; }
warn(){ printf '\n[Coonto][ATENÇÃO] %s\n' "$*" >&2; }
fail(){ printf '\n[Coonto][ERRO] %s\n' "$*" >&2; printf 'Execute: sudo ./coonto.sh report\n' >&2; exit 1; }
need(){ command -v "$1" >/dev/null 2>&1 || fail "Comando obrigatório ausente: $1"; }
as_root(){ if [[ ${EUID:-$(id -u)} -ne 0 ]]; then exec sudo -E bash "$0" "${ORIGINAL_ARGS[@]}"; fi; }
load_env(){ [[ -f .env ]] || fail "Arquivo .env ausente. Execute sudo ./coonto.sh configure"; sed -i 's/\r$//' .env; set -a; source .env; set +a; export CRM_DOMAIN="${CRM_DOMAIN:-crm.${DOMAIN%.br}}"; }

install_prerequisites(){
  as_root "$@"
  if command -v docker >/dev/null && docker compose version >/dev/null 2>&1 && command -v curl >/dev/null && command -v openssl >/dev/null && command -v gzip >/dev/null; then
    return
  fi
  command -v apt-get >/dev/null || fail "Dependências ausentes e o servidor não usa apt. Instale Docker, Docker Compose, curl, OpenSSL e gzip."
  log "Instalando somente as dependências da aplicação; o Caddy não será alterado nesta etapa"
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2 curl openssl gzip ca-certificates dnsutils
  systemctl enable --now docker
}

configure(){
  as_root "$@"
  [[ -f .env ]] && { log "O arquivo .env já existe e não foi alterado."; return; }
  cp .env.example .env
  local db_password auth_secret validation_code
  db_password="$(openssl rand -hex 24)"
  auth_secret="$(openssl rand -hex 48)"
  validation_code="$(printf '%06d' "$(( 0x$(openssl rand -hex 3) % 1000000 ))")"
  sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${db_password}/" .env
  sed -i "s/^AUTH_SECRET=.*/AUTH_SECRET=${auth_secret}/" .env
  sed -i "s/^VALIDATION_ACCESS_CODE=.*/VALIDATION_ACCESS_CODE=${validation_code}/" .env
  chmod 600 .env
  log "Configuração criada. Código temporário de validação: ${validation_code}"
  warn "Guarde esse código em local seguro. Ele não aparecerá no relatório de suporte."
}

preflight(){
  [[ "$(uname -s)" == "Linux" ]] || fail "Este kit requer Linux."
  need docker; docker compose version >/dev/null 2>&1 || fail "Docker Compose Plugin não encontrado."
  need curl; need openssl; need gzip
  docker info >/dev/null 2>&1 || fail "O serviço Docker não está ativo."
  load_env
  if docker ps --format '{{.Names}}' | grep "^${CADDY_SERVICE}$" >/dev/null; then
    export CADDY_IS_DOCKER=1
  else
    systemctl is-active --quiet "$CADDY_SERVICE" || fail "O Caddy não está ativo (nem no Docker, nem no systemd)."
    export CADDY_IS_DOCKER=0
  fi
  [[ "$ROOT_DIR" != *" "* ]] || fail "Instale o kit em um caminho sem espaços."
  [[ "${DOMAIN:-}" =~ ^[A-Za-z0-9.-]+$ ]] || fail "DOMAIN inválido ou ausente em .env."
  [[ "${CRM_DOMAIN:-}" =~ ^[A-Za-z0-9.-]+$ && "${CRM_DOMAIN}" != "${DOMAIN}" ]] || fail "CRM_DOMAIN inválido em .env."
  [[ "${APP_PORT:-}" =~ ^[0-9]+$ ]] || fail "APP_PORT inválida ou ausente em .env."
  [[ "${CADDYFILE:-}" == /* ]] || fail "CADDYFILE deve ser um caminho absoluto em .env."
  [[ "${CADDY_SERVICE:-}" =~ ^[A-Za-z0-9@_.-]+$ ]] || fail "CADDY_SERVICE inválido ou ausente."
  [[ "${CADDY_BACKUP_ROOT:-}" == /* ]] || fail "CADDY_BACKUP_ROOT deve ser um caminho absoluto."
  [[ -f "${CADDYFILE:-}" ]] || fail "Caddyfile não encontrado em ${CADDYFILE:-}."
  if [[ "${CADDY_IS_DOCKER:-0}" == "1" ]]; then
    docker exec "$CADDY_SERVICE" caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null || fail "Caddyfile inválido no Docker."
  else
    caddy validate --config "$CADDYFILE" --adapter caddyfile >/dev/null || fail "A configuração atual do Caddy já está inválida."
  fi
  [[ "${POSTGRES_PASSWORD:-}" != "CHANGE_ME" && ${#POSTGRES_PASSWORD} -ge 24 ]] || fail "POSTGRES_PASSWORD não configurada no .env."
  [[ "${AUTH_SECRET:-}" != "CHANGE_ME" && ${#AUTH_SECRET} -ge 32 ]] || fail "AUTH_SECRET não configurado no .env."
  if [[ "${AUTH_MODE:-}" == "validation" ]]; then [[ "${VALIDATION_ACCESS_CODE:-}" =~ ^[0-9]{6}$ ]] || fail "VALIDATION_ACCESS_CODE deve ter seis números."; fi
  if [[ "$AUTH_MODE" == "email" ]]; then [[ -n "$SMTP_HOST" && -n "$SMTP_USER" && -n "$SMTP_PASSWORD" && -n "$SMTP_FROM" ]] || fail "AUTH_MODE=email exige a configuração completa do SMTP."; fi
  if ss -ltn 2>/dev/null | awk '{print $4}' | grep -E "[:.]${APP_PORT}$" >/dev/null && ! docker compose ps --format json 2>/dev/null | grep 'coonto' >/dev/null; then fail "A porta local ${APP_PORT} já está em uso por outro serviço."; fi
  local free_kb; free_kb="$(df -Pk "$ROOT_DIR" | awk 'NR==2{print $4}')"; (( free_kb > 3145728 )) || fail "Menos de 3 GB livres no disco."
  log "Verificação concluída: Docker e Caddy estão compatíveis."
}

configure_caddy(){
  as_root "$@"; load_env
  local begin_marker="# BEGIN COONTO MANAGED BLOCK ${DOMAIN}"
  local end_marker="# END COONTO MANAGED BLOCK ${DOMAIN}"
  local caddy_dir candidate stamp backup_dir
  CADDYFILE="$(readlink -f "$CADDYFILE")"
  caddy_dir="$(dirname "$CADDYFILE")"
  candidate="${caddy_dir}/.Caddyfile.coonto.$$.tmp"
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  backup_dir="${CADDY_BACKUP_ROOT}/${stamp}-$$"

  if [[ "${CADDY_IS_DOCKER:-0}" == "1" ]]; then
    docker ps --format '{{.Names}}' | grep "^${CADDY_SERVICE}$" >/dev/null || fail "O Caddy Docker deixou de estar ativo."
  else
    systemctl is-active --quiet "$CADDY_SERVICE" || fail "O Caddy deixou de estar ativo."
  fi
  mkdir -p "$backup_dir"
  cp -a "$CADDYFILE" "$backup_dir/Caddyfile"

  if ! awk -v begin="$begin_marker" -v end="$end_marker" '
    $0 == begin { if (skip) exit 42; skip=1; next }
    $0 == end { if (!skip) exit 42; skip=0; next }
    !skip { print }
    END { if (skip) exit 42 }
  ' "$CADDYFILE" > "$candidate"; then
    rm -f "$candidate"
    fail "Os marcadores do Coonto no Caddyfile estão incompletos. O arquivo original foi preservado."
  fi

  if grep -F "$DOMAIN" "$candidate" >/dev/null || grep -F "$CRM_DOMAIN" "$candidate" >/dev/null; then
    rm -f "$candidate"
    fail "O domínio ${DOMAIN} já aparece fora do bloco gerenciado do Coonto. O Caddyfile não foi modificado."
  fi

  local app_host="127.0.0.1"
  local app_port="${APP_PORT}"
  if [[ "${CADDY_IS_DOCKER:-0}" == "1" ]]; then
    # Conecta o Caddy à rede interna do app para proxy direto
    docker network connect "${COMPOSE_PROJECT_NAME}_coonto_internal" "$CADDY_SERVICE" 2>/dev/null || true
    app_host="${COMPOSE_PROJECT_NAME}-app-1"
    app_port="3000"
  fi

  {
    printf '\n%s\n' "$begin_marker"
    sed -e "s/__DOMAIN__/${DOMAIN}/g" -e "s/__CRM_DOMAIN__/${CRM_DOMAIN}/g" -e "s/__APP_HOST__/${app_host}/g" -e "s/__APP_PORT__/${app_port}/g" deploy/caddy/coonto.caddy.template
    printf '%s\n' "$end_marker"
  } >> "$candidate"

  if [[ "${CADDY_IS_DOCKER:-0}" == "1" ]]; then
    local internal_candidate="/tmp/$(basename "$candidate")"
    docker cp "$candidate" "${CADDY_SERVICE}:${internal_candidate}"
    if ! docker exec "$CADDY_SERVICE" caddy validate --config "$internal_candidate" --adapter caddyfile >/dev/null; then
      docker exec "$CADDY_SERVICE" rm -f "$internal_candidate" 2>/dev/null || true
      rm -f "$candidate"
      fail "A nova configuração é inválida no Docker."
    fi
    docker exec "$CADDY_SERVICE" rm -f "$internal_candidate" 2>/dev/null || true
  else
    if ! caddy validate --config "$candidate" --adapter caddyfile >/dev/null; then
      rm -f "$candidate"
      fail "A nova configuração do Caddy não foi aplicada. O Caddyfile original permanece intacto."
    fi
  fi

  cat "$candidate" > "$CADDYFILE"
  rm -f "$candidate"
  if [[ "${CADDY_IS_DOCKER:-0}" == "1" ]]; then
    if ! docker exec "$CADDY_SERVICE" caddy reload --config /etc/caddy/Caddyfile; then
      cp -a "$backup_dir/Caddyfile" "$CADDYFILE"
      docker exec "$CADDY_SERVICE" caddy reload --config /etc/caddy/Caddyfile >/dev/null 2>&1 || true
      fail "O reload do Caddy falhou. O Caddyfile anterior foi restaurado."
    fi
  else
    if ! systemctl reload "$CADDY_SERVICE"; then
      cp -a "$backup_dir/Caddyfile" "$CADDYFILE"
      systemctl reload "$CADDY_SERVICE" >/dev/null 2>&1 || true
      fail "O reload do Caddy falhou. O Caddyfile anterior foi restaurado."
    fi
  fi
  log "Caddy recarregado com segurança. Backup: ${backup_dir}/Caddyfile"
}

configure_backup_cron(){
  as_root "$@"; load_env
  printf '17 3 * * * root cd %q && bash scripts/backup.sh >> /var/log/coonto-backup-%s.log 2>&1\n' "$ROOT_DIR" "$(basename "$ROOT_DIR")" > "/etc/cron.d/coonto-backup-$(basename "$ROOT_DIR")"
  chmod 644 "/etc/cron.d/coonto-backup-$(basename "$ROOT_DIR")"
}

wait_health(){
  load_env
  for _ in $(seq 1 36); do
    if curl -fsS --max-time 5 "http://127.0.0.1:${APP_PORT}/api/health" >/dev/null 2>&1; then return 0; fi
    sleep 5
  done
  docker compose logs --tail=80 app >&2 || true
  fail "A aplicação não ficou saudável no tempo esperado."
}

wait_public(){
  load_env
  for _ in $(seq 1 18); do
    if curl -fsS --max-time 8 "https://${DOMAIN}/api/health" >/dev/null 2>&1; then return 0; fi
    sleep 5
  done
  fail "A aplicação está ativa localmente, mas o endereço HTTPS ainda não respondeu. O Caddy continua ativo; gere o relatório."
}

backup(){ load_env; bash scripts/backup.sh; }

deploy(){
  as_root "$@"; install_prerequisites; [[ -f .env ]] || configure; preflight; load_env
  if docker image inspect coonto-app:current >/dev/null 2>&1; then docker tag coonto-app:current coonto-app:previous; fi
  if docker compose ps --status running 2>/dev/null | grep 'db' >/dev/null; then log "Gerando backup antes da atualização"; backup; fi
  log "Iniciando PostgreSQL"
  docker compose up -d db
  log "Aplicando migrações"
  docker compose --profile tools run --rm migrate
  log "Construindo e iniciando a aplicação"
  mkdir -p audio/drafts audio/o-alienista
  chown -R 1001:1001 audio
  docker compose build --pull app
  docker compose up -d app
  wait_health
  configure_caddy
  configure_backup_cron
  wait_public
  log "Instalação concluída sem substituir o proxy existente: https://${DOMAIN}"
}

status(){ load_env; docker compose ps; echo; systemctl is-active "$CADDY_SERVICE" || true; caddy validate --config "$CADDYFILE" --adapter caddyfile || true; echo; curl -fsS --max-time 10 "http://127.0.0.1:${APP_PORT}/api/health" || true; echo; }
diagnose(){ status; echo; docker compose logs --tail=80 app; }
rollback(){ as_root "$@"; load_env; docker image inspect coonto-app:previous >/dev/null 2>&1 || fail "Nenhuma imagem anterior disponível."; docker tag coonto-app:current coonto-app:failed-$(date -u +%Y%m%dT%H%M%SZ); docker tag coonto-app:previous coonto-app:current; docker compose up -d --no-build app; wait_health; log "Rollback da aplicação concluído."; }
report(){ bash scripts/report.sh; }
restore(){ as_root "$@"; load_env; local file="${2:-}"; [[ -f "$file" ]] || fail "Informe um arquivo .sql.gz existente."; bash scripts/restore.sh "$file"; }

case "$COMMAND" in
  install|update) deploy "$@" ;;
  configure) install_prerequisites "$@"; configure "$@" ;;
  preflight) preflight ;;
  status) status ;;
  diagnose) diagnose ;;
  backup) backup ;;
  restore) restore "$@" ;;
  rollback) rollback "$@" ;;
  caddy) configure_caddy "$@" ;;
  report) report ;;
  *) cat <<'HELP'
Coonto Deployment Kit — Caddy

  sudo ./coonto.sh install     instala ou atualiza toda a plataforma
  sudo ./coonto.sh status      mostra o estado dos serviços
  sudo ./coonto.sh diagnose    mostra saúde e logs recentes
  sudo ./coonto.sh backup      gera backup do PostgreSQL
  sudo ./coonto.sh restore ARQUIVO.sql.gz restaura um backup após confirmação
  sudo ./coonto.sh rollback    volta para a imagem anterior da aplicação
  sudo ./coonto.sh caddy       valida e aplica somente o bloco do Coonto
  sudo ./coonto.sh report      gera relatório seguro para suporte
HELP
  ;;
esac
