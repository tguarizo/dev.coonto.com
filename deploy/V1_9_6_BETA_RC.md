# v1.9.6 / Beta RC — implementação iniciada

Primeira entrega: **1.9.6-beta.1**. Esta entrega inicia a revisão; o Beta RC completo ainda não está aprovado.

## Implementado nesta entrega

- Dois vídeos aprovados recuperados e incorporados em `public/videos`: professora/aluno com tablet (50 s) e aluno depois da aula (44 s). Exibidos na home e em Como funciona, sem autoplay, com controles, reprodução inline e sem carregar o arquivo antes da interação. Ao reproduzir um, o outro pausa.
- Configuração dos vídeos em `content/coonto-videos.json`.
- Martha e Dante acessíveis a partir do catálogo, identificados como percursos iniciais em revisão.
- Layout responsivo para os percursos, navegação livre por etapas, progresso, ajuda contextual, escolhas acessíveis, campo de hipótese/evidência e retorno ao catálogo/pesquisa no fim.
- Revisitar preserva escolhas e anotações da página. Anotações ainda não são persistidas na conta.
- Rótulo “Entre na situação” em 0,576 rem, 20% menor que os 0,72 rem anteriores.
- Mantidos alinhamento dos exemplos e configuração de voz `czvzJwIVS2asEKnthV40` já existentes na branch.

## Critérios ainda pendentes para declarar o Beta RC completo

- Memórias de Martha completa: o percurso atual de seis etapas é um protótipo editorial, não a obra completa.
- Inferno, Canto I: o texto completo está vinculado externamente; a cobertura pedagógica do canto inteiro e curadoria ainda precisam ser concluídas. Removida a descrição indevida de experiência completa.
- Revisão literária por fonte e evidências, incluindo opções com consequências próprias e interpretações divergentes sustentadas pelo texto.
- Confirmar/regenerar arquivos de áudio publicados com a voz escolhida. Configurar uma voz não altera arquivos antigos automaticamente.
- Validação real desktop/mobile de todas as jornadas, perfis, licenças e isolamento institucional.
- Persistência de progresso/anotações de Martha e Dante na conta, respeitando acesso e privacidade.
- Gestão editorial de conteúdo e mídia no CRM, mantendo versões e aprovação/publicação.
- Revisão dos vídeos durante uso real: compreensão, controles, carregamento e continuidade.
- Autenticação e CRM preservados nesta entrega; requerem validação integrada do RC.

## Validação desta entrega

Executar typecheck, build, reprodução/controle dos dois vídeos, navegação das seis etapas de cada percurso, ajuda e retorno em desktop/mobile. Confirmar versão pública após deploy da branch develop.
