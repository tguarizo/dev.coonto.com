# Coonto RC2.2 — evidências e situação de fechamento

Atualizado em 10/10/2026. Ambiente: https://dev.coonto.com/

## Resultado

Textos e dimensão visual implementados e publicados. Fechamento completo da RC2.2 bloqueado pelo áudio: a chave ElevenLabs não tem `user_read`. Nenhum crédito foi consumido nesta tentativa de finalização.

## Evidências

- Publicação de 24 ilustrações: Martha 12 capítulos, Dante 6 movimentos, O Alienista abertura + 5 fases. Pacotes offline incluem as imagens.
- 77 testes aprovados localmente e no GitHub, incluindo retomada por conta, isolamento de dados, revisão concorrente, permissões e licença offline. TypeScript e build aprovados.
- Navegador Chromium em 375×812, 768×1024 e 1440×1000: 24 interações de Martha e 14 de Dante, todas as alternativas e retornos; avanço, retorno, 100% somente após registrar decisões; nenhuma rolagem horizontal ou erro de execução. Imagens carregadas e decodificadas.
- O Alienista: documento protegido testado como fixture local, com seis imagens. Isso não simula login no ambiente publicado.
- Workflow visual 38095404381 aprovado. Evidências: https://github.com/tguarizo/dev.coonto.com/actions/runs/38095404381/artifacts/11685383598
- Capturas conferidas de livros originais nas três larguras, Martha, Dante e O Alienista. Correção de contraste das legendas e deslocamento da âncora de livros para respeitar o cabeçalho.
- Saúde pública: HTTP 200, versão 1.9.6-rc.2.2, banco pronto. Páginas públicas de Martha e Dante apresentam as edições ilustradas.
- Os 24 PNGs, o TXT de O Alienista e o PDF de Martha foram baixados integralmente do ambiente publicado e seus SHA-256 são idênticos aos arquivos locais. PDF completo de Dante na fonte externa respondeu 200 com assinatura PDF.
- Endpoints privados de progresso de Martha e documento de O Alienista retornaram 401 para visitante.
- Workflow 38095404386: implantação complementar de contraste e âncora concluída com sucesso.
- Workflow 38094886083: implantação e publicação das edições no banco concluídas; etapa final de áudio falhou ao consultar saldo.

## Bloqueio de áudio confirmado

Diagnóstico: workflow 38095692544, job 114340995405.
Resposta: `401 missing_permissions`, falta de `user_read`.

Inventário real no servidor:

| Obra | Arquivos totais | Validados | Pendentes | Caracteres pendentes |
| --- | ---: | ---: | ---: | ---: |
| Memórias de Martha | 108 | 57 | 51 | 22.090 |
| Dante — Canto I | 62 | 6 | 56 | 16.758 |
| O Alienista | 48 | 48 | 0 | 0 |
| Total | 218 | 111 | 107 | 38.848 |

Auditoria de arquivos existentes: workflow 38096136780, job 114342300536. Os 111 arquivos válidos têm hash correspondente ao texto/modelo/voz, duração MP3 positiva e registro publicado no banco. O Alienista: 48/48, duração total 1.449 segundos. A tentativa de consultar saldo continuou recusada por `user_read`, sem gerar arquivos.

Na ElevenLabs: Developers → API Keys → (…) → Edit, habilitar User → Read na chave que o Coonto já utiliza. Não é necessário substituir a chave nem compartilhá-la. Documentação: https://elevenlabs.io/docs/pt/help-center/technical/how-do-i-authorize-myself-using-an-api-key

Após habilitar, consultar o saldo, gerar somente os arquivos faltantes e exigir auditoria de hash de texto/modelo/voz, arquivo MP3 com duração válida e registro publicado. A geração conserva versões anteriores e não repete automaticamente tentativa incompleta. Reserva prevista: 500 créditos, sem autorizar excedente pago.

## Ainda não declarados concluídos

- Geração e auditoria completa da locução, escuta das pronúncias e controles/offline com todos os novos arquivos.
- Identificação das palavras específicas do comentário ambíguo da avaliadora.
- Login real por OTP e sessão autenticada na versão publicada; isolamento e retomada foram verificados nos testes automatizados.
- Nova avaliação editorial de Fred Sommer e demais participantes. Não foram enviados contatos.
- Parecer de liberação ampla ao mercado. RC técnica e aprovação editorial/comercial são registros distintos.

Os demais projetos e as fases de pagamento, CRM, guias, manual, marketing, história do Brasil e Tuuvo permanecem no checklist para depois deste fechamento.
