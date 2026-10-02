# v1.9.6 / Beta RC

## Segunda entrega: 1.9.6-beta.2

- Martha: percurso pelos 12 capítulos do romance da edição de 1899, com faixas de páginas do PDF BBM/USP. As sínteses editoriais não substituem o texto integral; os contos anexados ao volume não são apresentados como capítulos do romance.
- Dante: 136 versos da tradução de Xavier Pinheiro em grafia atualizada, divididos em seis movimentos contínuos. Texto integral, sínteses e hipóteses interpretativas ficam separados. Fonte e licença da transcrição indicadas.
- Oito etapas por capítulo/movimento: Contexto, Leitura, Decisão, Consequência, Autor, Interpretação, Recuperação e Conexão. Três hipóteses com retornos distintos; evidências, revisão e recuperação. Não se atribui nota a escolhas pessoais.
- Histórico e anotações na conta autenticada, separados por obra; controle de revisão impede sobrescrita entre abas. Visitantes usam memória temporária. Exportação das próprias notas, aviso de gravação pendente e progresso medido como etapas visitadas, sem alegar aprendizagem comprovada.
- Biblioteca inclui Martha e Dante. Gestão escolar recebe somente percentuais, com filtro por instituição e turma; notas continuam privadas. Licenças vencidas de O Alienista são recusadas.
- Curadoria RC cria versões imutáveis; edição, aprovação e publicação têm permissões por obra. Publicação transacional arquiva a edição anterior. Fonte, licença e ordem dos capítulos ficam protegidas.
- Estúdio do CRM inclui aberturas de Martha e Dante. Texto de áudio RC deve corresponder ao conteúdo publicado; áudio antigo não é publicado como correspondente à edição nova. Corrigida a indicação da voz narradora no painel e os identificadores de cenas finais no banco.
- Script de atualização de áudio usa a voz Coonto `czvzJwIVS2asEKnthV40`, guarda arquivos anteriores e identifica texto, modelo e vozes por hash. Atualiza 3 exemplos da home, 18 aberturas RC e 48 cenas de O Alienista (prévia inicial: 20.964 caracteres). Preserva textos já publicados no estúdio. Usa bloqueio compartilhado, contabilização de tentativas e limite diário combinado de 25.000 caracteres por padrão, configurável com `COONTO_AUDIO_DAILY_CHAR_LIMIT`. Falhas não são repetidas automaticamente; `--retry` exige revisão da tentativa anterior.
- Exemplos de áudio da home usam a versão no URL e revalidam os arquivos, evitando reaproveitar a voz antiga do cache.
- O deploy executa testes antes da instalação. O passo de áudio pode falhar sem derrubar a versão textual; sua conclusão precisa ser verificada separadamente. Não confundir sucesso da instalação com sucesso da geração de áudio.

### Validação beta.2

24 testes passam, incluindo migrações aplicadas duas vezes, isolamento entre contas/obras, sessões ausentes, conflito de revisão, escopo de curadoria, aprovação/publicação, preservação da fonte, notas privadas, licença vencida, escolas/turmas e correspondência entre áudio/texto/voz. Teste HTTP integrado com sessões sintéticas passa: login válido/vencido, duas contas, biblioteca, estúdio, aprovação/publicação, conflito de edição e vídeos com Range 206. Typecheck e build passam. Uma simulação da produção com fornecedor fictício também passa: 69 arquivos, 66 versões no estúdio, 20.964 caracteres registrados, segunda execução sem geração e preservação dos arquivos antigos após erro 429, sem repetição automática. Nenhum crédito foi consumido nessa simulação. Navegação desktop e os 136 versos foram conferidos na versão pública. A emulação de largura móvel não está disponível neste navegador; permanece teste em aparelho real. O aviso preexistente de tracing de `lib/work-audio.ts` permanece.

### Ainda depende de avaliação humana

Revisão literária da edição beta, audição dos áudios produzidos, compreensão dos vídeos e teste de uso com leitores/alunos reais. A cobertura dos capítulos/versos não equivale à aprovação editorial do RC. O uso offline licenciado de O Alienista permanece; o Beta RC não promete salvamento offline ou licença comercial.

---

Primeira entrega: **1.9.6-beta.1**. Esta entrega inicia a revisão; o Beta RC completo ainda não está aprovado.

## Implementado nesta entrega

- Dois vídeos aprovados recuperados e incorporados em `public/videos`: professora/aluno com tablet (50 s) e aluno depois da aula (44 s). Exibidos na home e em Como funciona, sem autoplay, com controles, reprodução inline e sem carregar o arquivo antes da interação. Ao reproduzir um, o outro pausa.
- Configuração dos vídeos em `content/coonto-videos.json`.
- Martha e Dante acessíveis a partir do catálogo, identificados como percursos iniciais em revisão.
- Layout responsivo para os percursos, navegação livre por etapas, progresso, ajuda contextual, escolhas acessíveis, campo de hipótese/evidência e retorno ao catálogo/pesquisa no fim.
- Revisitar preserva escolhas e anotações da página. Anotações ainda não são persistidas na conta.
- Rótulo “Entre na situação” em 0,576 rem, 20% menor que os 0,72 rem anteriores.
- Mantidos alinhamento dos exemplos e configuração de voz `czvzJwIVS2asEKnthV40` já existentes na branch.

## Pendências registradas na beta.1 (resoluções na beta.2 acima)

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

## Correção da home após revisão

- Corrigida a altura reservada aos títulos em três colunas; autor aparece abaixo do título sem sobreposição.
- Plays discretos e acessíveis por trecho, com reprodução exclusiva.
- Nome da obra e situação usam `ELEVENLABS_NARRATOR_VOICE_ID`, a configuração original. Antes de decidir e comentário usam a última voz Coonto. São 12 trechos, 2.025 caracteres novos; arquivos anteriores preservados. URLs invalidam o cache dos exemplos anteriores.
- Simulação verifica as duas vozes, os 12 arquivos e a repetição sem consumo.

## Continuidade do formato e escolha gratuita

- Martha e Inferno I usam leitura sequencial no espaço da obra, com a mesma composição de O Alienista: cena ilustrativa, cartão de leitura, escolha com retorno imediato, caderno recolhido e Voltar/Continuar. Recursos de capítulo, ajuda e fonte permanecem na lateral; removido o painel de oito abas. O retorno da escolha não vira uma tela repetida. Progresso e notas já salvos continuam compatíveis.
- Ajustes específicos ao conteúdo: Martha segue seus 12 capítulos; Dante mostra os versos do movimento corrente. Textos, hipóteses e fontes permanecem em revisão editorial.
- Catálogo, oferta, pedido de R$ 0,00 e biblioteca oferecem O Alienista, Martha e Inferno I. A fase beta libera as três sem cartão ou assinatura. Pedido por obra é idempotente e não aceita outra conta no corpo.
- “Baixar neste aparelho” nas três experiências. RC ganha leitor offline sequencial, fonte/versos, caderno e áudio disponível, com licença por obra, limite compartilhado de aparelhos e retorno de notas à conta. Revisão concorrente/edição diferente bloqueia sobrescrita e permite exportar notas. Biblioteca offline lista as cópias vigentes no aparelho. PDF original de Martha permanece na fonte online.
- Segundo vídeo mantém 44 segundos e imagens aprovadas. Introdução com a voz Coonto: “Depois da aula, a leitura continua. Com o Coonto, o aluno retoma a história, faz escolhas e confere no texto o caminho do autor.” O áudio anterior é reduzido somente durante essa locução; restante preservado. Geração utiliza o controle diário já existente, apenas 128 caracteres novos. Montagem/versionamento idempotentes; MP4 servido com Range.
- 32 testes passam; typecheck, build e integração HTTP com sessões sintéticas passam. Verificados pedidos gratuitos nas três obras, licença em aparelho compartilhado, isolamento de contas, downloads RC autenticados, leitor offline, expiração e Range do vídeo. Montagem local com fornecedor fictício confirmou duração de 44 segundos, faixa AAC e repetição sem remontagem. Teste visual após deploy e revisão humana do conteúdo continuam necessários. Aviso preexistente de tracing permanece.
