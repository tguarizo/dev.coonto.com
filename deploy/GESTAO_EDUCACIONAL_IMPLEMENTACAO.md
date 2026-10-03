# Coonto — implementação da gestão educacional

Checkpoint: 3 de outubro de 2026. Primeira etapa na branch
`codex/rigor-gestao-educacional`, a partir de `2519128`.

## Escopo acordado

1. Identidade visual comum e menu vertical para Coonto Administração,
   Professor, Escola e Rede.
2. Identidade única com entrada por código, seleção de ambiente e instituição,
   baseada em autorização vigente no servidor.
3. Professor: preparação, turmas atribuídas, atividades, entregas e devolutivas.
4. Escola: visão da instituição, turmas, equipes e atividades institucionais.
5. Rede: escolas vinculadas, gestão de licenças e detalhamento autorizado.
6. Indicadores com período, denominador e edição; distinguir participação,
   leitura, entrega e evidência de aprendizagem.
7. Revogação, auditoria, verificações de isolamento e publicação em dev.

## Preparado nesta etapa

- CRM com ícones, menu recolhível e identidade azul/violeta sobre fundo escuro.
  Seleção de área considera rota, busca e âncora; menu móvel continua vertical.
- `/ambientes`: lista apenas ambientes existentes. Cada vínculo institucional
  aparece separadamente. Leitores sem outros ambientes seguem para a biblioteca.
- Entrada geral por código encaminha para `/ambientes`; destinos explícitos,
  como checkout e biblioteca, são preservados. CRM conserva sessão por host.
- `/gestao-escolar`: exige uma instituição. Um vínculo único pode ser selecionado
  automaticamente; múltiplos vínculos exigem escolha. Instituição, turma ou
  atividade não autorizada resulta em 404, sem trocar para dados de outra turma.
- Professor vê suas turmas atribuídas; gestor vê as turmas da instituição.
  A persona global, incluindo owner, não substitui o vínculo institucional.
- `/atividades`: aluno matriculado envia uma resposta institucional e lê sua
  devolutiva. A interface identifica a instituição destinatária antes do envio.
- Professor/gestor publica atividades e registra devolutivas. Reenvio do aluno
  substitui a entrega e limpa a devolutiva anterior; isso é informado na tela.
- Migração 017: vigência e revogação do vínculo institucional.
- Migração 018: atividades e entregas em tabelas separadas da leitura pessoal.
- CRM pode revogar/reativar o acesso institucional; mudança e evento de auditoria
  são gravados na mesma transação. Reativação reinicia a vigência sem prazo final.
- Todas as consultas e alterações do novo fluxo verificam instituição ativa,
  vínculo vigente e turma atribuída/matrícula atual no servidor.
- O painel escolar anterior deixou de consultar progresso da biblioteca pessoal.
  Contagens de entregas e devolutivas não são apresentadas como aprendizagem.

## Validação

- Suíte automatizada: 40 testes, incluindo banco PostgreSQL em PGlite.
- Migrações executadas duas vezes para verificar aplicação repetível.
- Casos: instituição indevida, turma não atribuída, aluno não matriculado,
  owner sem vínculo, revogação, expiração, instituição pausada e auditoria do CRM.
- Teste de renderização do painel verifica que leitura pessoal e contatos dos
  alunos não aparecem e que turma fora do contexto é rejeitada.
- TypeScript e build de produção aprovados. O aviso preexistente de rastreamento
  de arquivos em `lib/work-audio.ts` permanece.
- Ainda falta validação visual e funcional em navegador com contas de cada papel.

## Próximas etapas

- Coonto Rede, vínculos com escolas e autorização independente para comprador
  de licenças e gestor pedagógico; detalhamento sem acesso automático a respostas.
- Licenças contratadas, distribuídas, ativadas e usadas por obra e vigência.
  O mecanismo legado continua disponível no CRM; não foi refeito nesta etapa.
- Períodos letivos, vigência por matrícula/atribuição, múltiplas funções no mesmo
  vínculo, substituição de professor e grupo de professor independente.
- Prazo/encerramento de atividade, rubricas, histórico de revisões e instrumentos
  de avaliação; a primeira versão não possui notas ou inferência de aprendizagem.
- Política de nova autenticação dos gestores, contexto preferido revalidado,
  relatórios com denominadores, exportações autorizadas e auditoria ampliada.
- Aplicar migrações 017 e 018 antes de disponibilizar este código, validar contas
  e navegação em dev, então publicar. Nenhuma migração foi aplicada em ambiente
  remoto e nenhuma mudança desta etapa foi publicada.

A documentação de arquitetura descreve o destino do projeto. Este checkpoint
identifica apenas o que foi implementado e verificado no código local.
