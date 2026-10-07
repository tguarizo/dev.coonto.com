# Coonto 1.9.6-rc.1 — candidata em desenvolvimento

Data: 7 de outubro de 2026. Destino autorizado: dev.coonto.com.

## Resultado da implementação

Dante, Inferno Canto I, usa o roteiro editorial v1: seis movimentos, 14 interações e 42 retornos. Os 136 versos estão preservados; o movimento III termina no verso 87 e o IV começa no 88. A interação II.3 sinaliza a antecipação de versos posteriores. IV.2 e VI.2 admitem duas interpretações sustentáveis, sem pontuação de compreensão.

O texto de apoio e o glossário estão disponíveis antes da decisão, inclusive no pacote offline. A navegação usa “Movimento” para Dante e “Capítulo” para Martha. Notas antigas são preservadas; respostas antigas não são convertidas em respostas às perguntas novas. O progresso continua privado por conta, com controle de revisão para rejeitar gravações concorrentes desatualizadas.

O CRM permite atribuir permissões de curadoria separadamente para O Alienista, Memórias de Martha e Dante. Cada formulário mostra os valores efetivamente gravados. Nenhuma permissão é concedida automaticamente. A ação exige administração autorizada e rejeita obras fora desta lista.

A publicação editorial é transacional, restrita ao domínio de desenvolvimento e repetível sem substituir uma publicação posterior da curadoria. O deploy com marcador `[dante-rc1]` gera somente os áudios de Dante. O plano prevê 62 arquivos e 17.698 caracteres, usando a voz existente e eleven_multilingual_v2. Saldo de 127.639 créditos informado por Tony; não houve consulta independente ao saldo nem geração local com cobrança.

## Evidência antes da publicação

- 73 testes automatizados aprovados, incluindo histórico de leitura, educação, redes, licenças, permissões, conteúdo Dante, progresso e pacote offline.
- TypeScript e compilação de produção aprovados.
- Bancada HTTP com banco descartável e dados fictícios: 25 verificações aprovadas. Abrange 14 páginas administrativas, três negativas de acesso por leitor, professor/escola/rede/licenças, leitores e biblioteca; gravação/retomada privada e conflito de revisão.
- Teste offline percorre as três alternativas de cada uma das 14 interações e mantém referências e notas.
- Prévia do gerador: 62 arquivos / 17.698 caracteres. Não consumiu créditos.
- `git diff --check` aprovado.

Os testes de bancada usam contas e sessões fictícias, sem mensagens reais. Eles não equivalem a uma inspeção visual autenticada do CRM publicado.

## Verificação após publicação

Verificação concluída em 7 de outubro de 2026:

- Aplicação 1.9.6-rc.1 e banco saudável confirmados no endpoint público.
- Conteúdo servido de Dante e Martha comparado integralmente aos JSONs do repositório: correspondência exata (14 e 24 interações).
- 14 interações e 42 retornos de Dante percorridos no navegador público; fonte antes das alternativas, salto de movimento e contador de decisões conferidos. Inspeção visual desktop sem overflow horizontal.
- 62/62 áudios Dante responderam 206, audio/mpeg e 32 bytes para a faixa solicitada. Amostras do início e do fim baixadas e validadas com ffprobe como MP3, com duração positiva.
- Áudios do início e do fim de Martha responderam corretamente. Áudios de O Alienista exigem sessão e responderam 401 sem autenticação; a reprodução autenticada de Alienista não foi repetida nesta verificação pública.
- Progresso privado respondeu 401 sem sessão. CRM, professor, escola e rede redirecionaram para login. Login do CRM dev exibiu a RC1. A revisão administrativa autenticada foi feita na bancada HTTP; não houve inspeção visual remota de uma conta real.
- GitHub Actions de recuperação concluiu com sucesso: https://github.com/tguarizo/dev.coonto.com/actions/runs/37691104713 . O log confirma a recuperação do primeiro arquivo sem nova chamada ao fornecedor e a conclusão dos demais.

Evidências estruturadas: `deploy/RC1_VERIFICACAO.json`.

## Limites e próxima avaliação humana

Esta é uma candidata em desenvolvimento, não uma publicação de produção. OAuth/OIDC continua planejado, sem integração implementada. As pendências funcionais do CRM e gestão constam no status mestre; a RC1 não declara concluídas funcionalidades futuras como importação em lote, pagamentos e comunicação comercial.

Tony e Fred devem percorrer Dante e Martha; Tiago deve revisar CRM e gestão com os perfis autorizados. Clareza editorial favorável não comprova eficácia pedagógica medida. Dispositivos reais, escuta integral da narração e restauração operacional de backup exigem sua própria verificação antes da decisão de produção.

O parecer integral de Fred e o mapa/roteiro editorial permanecem em `deploy/curadoria/dante-canto-i-v1/`. O checkpoint anterior de curadoria é `1fffb01834f0aa3485ae70a0caf85803f59e25f6` no GitHub; seu conteúdo corresponde ao checkpoint local `998d3ba`.

## Correção da retomada de áudio

O primeiro deploy publicou o roteiro e a aplicação, mas interrompeu a geração ao registrar o primeiro áudio de interação de Dante: a restrição do banco ainda aceitava apenas `mov-1` a `mov-6`. Nenhuma geração adicional foi repetida automaticamente.

A migração 022 aceita os identificadores das interações de Dante; as migrações históricas também foram compatibilizadas porque o instalador as repete. A execução de migrações passa a interromper no primeiro erro. O gerador verifica uma versão MP3 já salva pelo mesmo hash de texto/voz/modelo, valida-a com ffprobe e retoma o registro no banco sem repetir TTS. Foram acrescentados dois testes de regressão (75 testes aprovados ao todo): repetição de todas as migrações com registros publicados e recuperação após falha simulada no banco, com uma única chamada ao fornecedor.

A recuperação aplica a migração e o script a esta aplicação RC1 já publicada em dev, sem reconstruir a interface. O código canônico contém a mesma correção para os próximos deploys. A geração e a disponibilidade dos 62 áudios foram confirmadas após a recuperação. O saldo restante e a cobrança efetiva não foram consultados; os logs indicam 16.802 caracteres pendentes na primeira geração, incluindo o arquivo recuperado sem repetição.
