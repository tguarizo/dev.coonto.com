# Áudio das obras no CRM

Endereço: https://crm.dev.coonto.com/backoffice/audio. Requer sessão de administrador no domínio do CRM. Chaves permanecem no ambiente privado do servidor.

1. Selecionar “Quem é Simão Bacamarte?”, revisar o texto e clicar em “Gerar rascunho · usa créditos”.
2. Ouvir a amostra e conferir ritmo, naturalidade, Bacamarte e Itaguaí.
3. Aprovar e publicar apenas após revisão. A reprodução na obra passa a usar o MP3 salvo, sem novas chamadas ao fornecedor.
4. A primeira aprovação libera “Gerar restantes · usa créditos”. O lote usa os textos de narração e gera somente cenas sem rascunho concluído/publicado. Manter a página aberta; falhas interrompem o lote. Atualizar a página antes de retomar.
5. Escolher cada cena para ouvir e aprovar individualmente. A edição gera uma nova versão e preserva o áudio atual até a aprovação. Versões antigas podem ser republicadas sem geração.
6. Para duas vozes, acrescentar um segundo trecho. Revisar a fala de Bacamarte e identificar qualquer adaptação na experiência; a explicação do narrador não é uma fala do personagem.

## Infraestrutura entregue automaticamente

Migração 010 cria histórico das versões. O instalador prepara ./audio com proprietário 1001, o volume persistente permite escrita e a imagem inclui ffmpeg para combinar dois trechos. Atualizações de código não apagam MP3s. A chave e os IDs continuam no .env privado, carregado pelo Compose.

Limite global padrão: 20.000 caracteres reservados por janela de 24 horas, inclusive tentativas com falha. COONTO_AUDIO_DAILY_CHAR_LIMIT permite ajustar entre 5.000 e 100.000. Máximo de 5.000 por cena/geração. Uma única operação de geração/publicação por vez; sem repetição automática de requisições ao fornecedor.

O CRM mostra caracteres enviados, incluindo requisições com falha; não afirma saldo ou cobrança exata. Cada clique em gerar/corrigir pode consumir créditos. Ouvir, publicar e restaurar versões não chama ElevenLabs.

Prévia de rascunhos exige administrador e domínio CRM. A leitura pública segue as permissões existentes da biblioteca e serve apenas áudio aprovado. Atualizar a cópia offline para baixar as versões publicadas.

## Validação

Testar chave ausente, restrição de acesso, falha do fornecedor, geração sem publicação, aprovação individual, preservação do áudio anterior durante correção, restauração sem chamada ao fornecedor, limite diário e exclusão mútua. Testes usam fornecedor simulado; não consomem créditos reais. Geração com a chave e audição real são feitas pelo administrador após o deploy.
