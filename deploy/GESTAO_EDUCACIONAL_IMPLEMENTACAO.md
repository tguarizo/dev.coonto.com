# Coonto — gestão educacional beta.3

Checkpoint: 3 de outubro de 2026. Versão `1.9.6-beta.3`.
Implementação na branch `codex/rigor-gestao-educacional`; destino de publicação:
`develop` / dev.coonto.com. Produção não é destino desta alteração.

## O que está implementado

- Coonto Administração: CRM com menu vertical recolhível, ícones, seleção correta
  de área e identidade comum aos ambientes educacionais.
- Entrada por código preservada. `/ambientes` lista as instituições e ambientes
  autorizados. Preferência de entrada é opcional, vinculada à conta e revalidada
  a cada uso; ela não concede permissões. “Trocar ambiente” abre a seleção.
- Coonto Professor e Escola: contexto institucional único, turmas atribuídas,
  publicação de atividades, entregas dos alunos e devolutivas.
- `/atividades`: destinatário institucional visível antes do envio. Uma nova
  entrega substitui a anterior e aguarda nova devolutiva.
- Caderno e progresso pessoais separados das atividades institucionais. O painel
  escolar deixou de consultar o histórico da biblioteca do aluno.
- Coonto Rede: redes/mantenedoras, escolas vinculadas, permissões independentes
  para licenças, relatórios e detalhamento por escola/professor/turma.
- CRM `/backoffice/redes`: cadastrar rede, autorizar contas existentes, definir
  compartilhamento por escola, registrar contratos confirmados e revogá-los.
  Não há convite ou envio de mensagem automático nesta versão.
- Contratos por obra com quantidade e vigência. Administrador da rede distribui
  reservas às escolas sem exceder a capacidade contratada. Gestor escolar ou
  administrador de licenças atribui vagas a alunos com vínculo vigente.
- Locks no contrato serializam distribuição e atribuição. Repetir uma atribuição
  ativa não consome outra vaga; não é permitido reduzir a reserva abaixo das
  licenças atribuídas. Reserva de capacidade e direito vigente são distintos.
- Licenças institucionais não substituem os direitos pessoais da conta. Revogar
  um contrato ou vínculo bloqueia novos acessos online por aquela concessão.
- Download offline limitado pela validade do direito usado e pelo prazo offline.
  Revogação remota não interrompe imediatamente uma cópia já autorizada em um
  aparelho desconectado; ela é revalidada ao conectar/renovar e tem prazo local.
- Gestores escolares e usuários de rede/licenças confirmam acesso por código
  a cada novo dia em São Paulo. Sessão da leitura pessoal continua persistente.
- Alterações de rede, permissões, contratos e licenças geram auditoria. As
  alterações e seus eventos são persistidos na mesma transação.

## Relatórios disponíveis e limites

- Período de publicação das atividades; escola, professor e turma autorizados.
- Alunos únicos e participações aluno–atividade contados separadamente.
- Entregas/participações elegíveis e devolutivas; denominador explícito.
- Matrículas vigentes no momento da consulta. Não é uma reconstrução de turma
  histórica; mudanças de matrícula podem alterar o denominador de períodos antigos.
- Entrega atual enviada no período, sem histórico de versões nesta beta.
- Recorte de professor considera suas atribuições atuais na escola e inclui as
  atividades das turmas compartilhadas; não mede autoria individual ou desempenho.
- Rede recebe agregados, nunca o corpo das respostas ou o caderno pessoal.
- Licenças: contratadas, reservadas às escolas, atribuídas sem revogação,
  ativadas e conteúdo acessado. “Ativada” registra autorização para download ou
  entrega do conteúdo; “conteúdo acessado” registra conteúdo servido, incluindo
  download. Não mede leitura integral, participação escolar ou aprendizagem.
- Não existem notas de aprendizagem nem classificação de docentes nesta versão.

## Verificação

- 47 testes automatizados; banco PostgreSQL em PGlite e migrações aplicadas duas vezes.
- Tentativas de atravessar instituições/redes, usar turma não atribuída, agir como
  comprador sem permissão pedagógica, exceder capacidade, reduzir reservas ocupadas,
  reaproveitar vínculo vencido/revogado e ampliar acesso por preferência de navegação.
- Preservação de licença pessoal após perda de concessão institucional.
- Confirmação diária nos limites de data de São Paulo e validação de datas dos filtros.
- Fluxo no navegador com banco local isolado e contas fictícias: publicar atividade,
  enviar resposta, dar devolutiva, atribuir licença, detalhar escola/professor, recusar
  escola externa, navegação do CRM e recolhimento do menu no celular.
- TypeScript e build de produção aprovados. Aviso preexistente de rastreamento de
  arquivos em `lib/work-audio.ts` permanece.
- Dados fictícios e sessões de teste não são enviados ao ambiente remoto.

## Migrações e publicação

Aplicar 017, 018 e 019 antes do código. O instalador existente aplica migrações
com parada em erro e realiza backup antes da atualização. GitHub Actions em
`develop` executa a suíte de testes antes de chamar o instalador de dev.

Aguardar sucesso do workflow e conferir versão e rotas públicas após publicação.
Sucesso do build local não comprova que o ambiente remoto foi atualizado.

## Próximas inclusões

- Períodos letivos, vigência por matrícula/atribuição, várias funções na mesma
  instituição, substituições e grupo de professor independente.
- Histórico de entregas, prazo/encerramento de atividades, rubricas e instrumentos
  de avaliação aprovados. Preservar histórico sem reaproveitar leitura pessoal.
- Filtros por obra/edição, denominadores históricos, exportações autorizadas e
  auditoria de consultas/exportações. Não há exportação nesta primeira versão.
- Piloto pedagógico e revisão editorial; opinião e participação não comprovam eficácia.

A arquitetura documentada descreve o destino do projeto. Esta beta concretiza os
fluxos acima e mantém os limites explícitos para as próximas verificações.
