# Coonto v1.8 — validação e ativação

## Entrega

- /como-funciona: conceito, desenho dos dois usos, antes/durante/depois e instalação no celular.
- /professor: espaço existente com acesso mais visível e apoio por perguntas e respostas.
- /leitura/o-alienista: Minhas anotações em qualquer cena; retomada por estado da conta/aparelho; progresso antigo não sobrescreve novo.
- /catalogo: autores das candidatas e A Divina Comédia, de Dante Alighieri, como bônus em avaliação, indisponível.
- /ajuda: três modos, perguntas aprovadas, perguntas novas registradas para revisão.
- crm.dev.coonto.com/backoffice/ajuda: busca, edição, rascunhos, aprovação, arquivamento, contexto de cena/progresso e uso/custos de 30 dias.
- PWA: ícones próprios, instruções de instalação, cópia independente do React para reabrir a obra e o texto original sem internet.
- Migração 009 aplicada automaticamente pelo instalador. Reaplicar não apaga alterações no banco de respostas.

## Roteiro de validação

1. Entre em O Alienista, faça uma escolha, anote uma ideia e abra o capítulo original em outra aba. Volte, continue e recarregue. Confira a mesma etapa e a nota.
2. Toque em Minhas anotações, edite uma nota e feche. A etapa não deve mudar.
3. Com internet, toque em Salvar neste aparelho e aguarde a confirmação. Feche a aba, desconecte a rede e reabra /minha-biblioteca ou /leitura/o-alienista no mesmo navegador. Confira obra, notas e capítulo original.
4. Reconecte e reabra a leitura conectada. Confira a sincronização. Atualizar cópia offline baixa a versão mais recente; a versão antiga da v1.7 precisa ser preparada novamente.
5. Em /professor, abra uma cena pelo roteiro e avance. A preparação não deve alterar a leitura pessoal.
6. Em /ajuda, teste uma pergunta sugerida em cada modo (professor requer abrir /professor; estudante requer obra na biblioteca).
7. No CRM, procure uma pergunta inédita, escreva/revise uma resposta e aprove. Refaça exatamente a pergunta no contexto permitido. Ela deve usar o banco aprovado.
8. Verifique telas no celular, tablet e computador.

## IA — ativação opcional

O banco aprovado funciona sem credencial OpenAI. Perguntas sem resposta são registradas como rascunho para revisão. A IA livre não é anunciada como ativa antes da configuração.

No .env privado do servidor, configurar OPENAI_API_KEY, COONTO_AI_ENABLED=true e o modelo/tarifas desejados. O padrão é gpt-5-mini; limite padrão: 20 novas perguntas por usuário em 24 horas. O limite é reservado no banco antes da chamada, evitando requisições simultâneas acima do limite. Respostas aprovadas não consomem chamadas de IA.

Tokens reais informados pela API e custo estimado por tarifas configuradas ficam no CRM. As respostas da IA aparecem identificadas, nunca são publicadas automaticamente. Não colocar chaves no GitHub, em documentos ou em variáveis NEXT_PUBLIC_.

## ElevenLabs — áudio preparado, aguardando vozes e geração

Configurar ELEVENLABS_API_KEY, ELEVENLABS_NARRATOR_VOICE_ID e ELEVENLABS_BACAMARTE_VOICE_ID no .env privado. Não exibir valores em logs.

Os roteiros estão em content/o-alienista-audio.json. Atualmente contêm apenas a narração fiel ao texto da experiência. Antes de usar a segunda voz, separar falas de Bacamarte em segmentos com speaker=bacamarte, revisar sua origem e identificar adaptações. Não atribuir a Bacamarte o texto explicativo do narrador.

No servidor com Node 22, dentro do projeto:

```
node --env-file=.env scripts/generate-work-audio.mjs --scene=s2
```

Esse comando é uma prévia sem consumo. Após revisar roteiro e vozes:

```
node --env-file=.env scripts/generate-work-audio.mjs --generate --scene=s2
```

Gera só a cena s2. Para gerar as demais aprovadas, remover --scene. Arquivos existentes são preservados; --scene=s2 --force regenera somente a correção necessária. Para cenas com duas vozes, instalar ffmpeg no host.

Os arquivos ficam em ./audio/o-alienista, ignorados pelo Git e montados no contêiner em /app/audio. A reprodução serve o MP3 pronto e não chama o ElevenLabs. Sem MP3, permanece a voz do navegador. A qualidade nova não está ativa antes de gerar/revisar os arquivos. Depois da geração, atualizar a cópia offline da obra para baixar os MP3 disponíveis.

## SMS

O login por e-mail continua funcionando. SMS_ENABLED=false é uma reserva de configuração. A implementação do fornecedor, envio e validação por telefone depende da API e especificações ainda não fornecidas. Não há botão de SMS anunciado como ativo.

## Fora desta entrega

- Perguntas e respostas offline: etapa posterior, conforme documento do usuário.
- A Divina Comédia: apenas candidata, sem conteúdo produzido.
- Acompanhamento pedagógico de turmas: não afirmar avaliação automática ou acesso do professor ao progresso de alunos além dos recursos atuais.
- Os testes locais usam contas e banco descartáveis. Login administrativo real e dados de produção exigem validação autenticada pelo responsável.
