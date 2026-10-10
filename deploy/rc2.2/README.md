# Coonto 1.9.6-rc.2.2 - revisão em preparação

Base: RC2.1, commit dca8f547f31370be1b7c2b50a25116d1123f17dd.

## Alterações

- Perguntas das 38 interações de Martha e Dante reformuladas em linguagem mais direta; alternativas e comentários selecionados simplificados. Os 42 retornos de Dante foram revisados.
- 12 capítulos/24 interações de Martha e 6 movimentos/14 interações de Dante preservados, incluindo IDs, ordem das alternativas e referências. Notas e históricos permanecem compatíveis.
- Livros originais em cartões compactos, com ações alinhadas e detalhes de edição expansíveis. Três colunas no desktop e uma até 960 px.
- Três ilustrações de abertura: Itaguaí/Bacamarte, Martha e sua mãe, Dante e a selva. Exibidas após a situação correspondente, sem antecipar escolhas. As passagens posteriores ainda precisam de ilustrações específicas.
- Imagens incluídas no download offline, tanto no Alienista quanto no leitor RC.
- Produção de áudio aceita --item=obra/trecho para revisar um trecho isolado.

## Publicação de conteúdo em dev

Após implantar o código, executar no container:

```
node scripts/publish-rc2-dev.mjs --publish-dev
```

A operação exige APP_URL com host dev.coonto.com e DATABASE_URL. Publica as duas edições na mesma transação, preservando usuários, notas e permissões. Se a edição publicada divergir do predecessor revisado, aborta as duas alterações. A comparação ignora somente o identificador de versão e preserva a ordem das alternativas. Uma edição já arquivada não é reativada automaticamente.

O workflow de dev executa essa etapa para commits com [rc2-editorial]. O marcador [sync-only] do workflow existente impede a geração automática de áudio.

## Áudio pendente

O relato da avaliadora não identifica as palavras nem as cenas com pronúncia incorreta. Não foram feitas chamadas à ElevenLabs nem alterações de pronúncia por suposição. Os novos textos precisam de locução correspondente após validação editorial; o endpoint já bloqueia arquivos cujo hash não corresponde ao texto atual.

Prévia, sem consumir créditos:

```
node scripts/generate-beta-audio.mjs --work=memorias-de-martha
node scripts/generate-beta-audio.mjs --work=divina-comedia-canto-i
node scripts/generate-beta-audio.mjs --item=memorias-de-martha/cap-1-i-1-pre
```

Acrescentar --generate somente no ambiente configurado para produzir os arquivos. Conferir saldo, limite diário e ouvir os resultados. A prévia local sem acervo reporta 108 arquivos/35.771 caracteres para Martha e 62 arquivos/17.654 caracteres para Dante; o servidor calcula os faltantes a partir do manifesto real.

## Validação

Typecheck, build de produção e 75 testes passaram após os ajustes finais. Captura visual automatizada bloqueada pela ausência do binário Chromium; não declarar validação visual em tablet concluída.

## Evidências da revisão

Fred Sommer avaliou positivamente a linguagem, o humor, as perguntas, alternativas e feedbacks de O Alienista. Recomendou preservar a reformulação editorial e priorizar imagens narrativas consistentes, sem decoração nem antecipação de descobertas. Outra avaliadora relatou pronúncias estranhas; seu comentário sobre tablet permanece ambíguo. Esse parecer editorial não equivale a aprovação técnica de toda a versão.
