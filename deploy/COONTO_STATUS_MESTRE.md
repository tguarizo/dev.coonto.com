# Coonto — Quadro Mestre de Status

Atualizado em 2026-10-03 com a implementação da gestão educacional beta.3. Publicação deve ser confirmada pelo workflow de develop e pela versão no site.

## Legenda

- [x] Concluído / implementado
- [~] Implementado parcialmente ou em validação
- [ ] Pendente

## Produto, acesso e experiência

- [x] Login por código via e-mail funcionando.
- [x] Login por código via SMS funcionando com token próprio e centro de custo 20708.
- [x] Sessão persistente por 30 dias.
- [x] Dispositivos confiáveis registrados por usuário.
- [x] Limite silencioso de até 3 dispositivos confiáveis ativos por pessoa.
- [x] Reaproveitamento de dispositivo já reconhecido.
- [x] Guest criado automaticamente quando o contato confirmado ainda não pertence a uma conta.
- [x] Uma única conta pode acumular personas e vínculos.
- [x] Homepage com um único logo no header e slogan sob a marca.
- [x] Versão exibida no rodapé público.
- [x] Três exemplos na homepage: O Alienista, Dom Casmurro e A Divina Comédia.
- [x] Exemplos liberados para navegação em qualquer ordem.
- [x] Abertura contextual nos três exemplos antes da decisão.
- [x] Áudio ElevenLabs nos três exemplos da homepage.
- [x] Tipografia da homepage suavizada.
- [x] Bloco de instalação reorganizado; instalação não equivale a licença.
- [x] Roteiro pedagógico-base definido: situar → observar → decidir → descobrir → comprovar no texto → entender → conectar → recuperar.
- [x] O Alienista com abertura conceitual antes da experiência.
- [x] O Alienista com avanço livre.
- [x] Indicador explícito “Agora você está…” no roteiro.
- [x] Jump to capítulo no leitor de O Alienista.
- [x] Link da cena abre apenas o capítulo relacionado no texto de Machado.
- [x] Áudio completo de O Alienista regenerado, incluindo perguntas e alternativas.
- [~] Linguagem de decisão pessoal versus evidência textual ainda precisa de revisão cena a cena para eliminar qualquer resíduo de “certo/errado”.
- [ ] Destacar o trecho/parágrafo exato da obra, e não apenas o capítulo inteiro.
- [~] Novo layout do leitor em rail lateral + canvas de tela cheia precisa de validação visual final no navegador.

## Personas e permissões

- [x] Reader / leitor.
- [x] Educator / professor verificado.
- [x] School Admin / gestor escolar.
- [x] Commercial Partner / parceiro comercial.
- [x] Cultural Partner / curador.
- [x] Owner.
- [x] Developer como persona separada.
- [x] Personas não substituem vínculos institucionais.
- [x] Escopo comercial explícito por lead/organização.
- [x] Curadoria por obra com comentar/aprovar/publicar separados.
- [x] Seleção de ambientes e instituições, com preferência opcional revalidada no servidor.
- [ ] Fluxo de recuperação/troca de contato secundário com validação do novo contato.
- [ ] Tela única para o usuário revisar contatos verificados e dispositivos confiáveis.

## CRM — concluído

- [x] Backoffice administrativo com métricas gerais.
- [x] CRM dividido em relacionamentos, alunos e organizações.
- [x] Busca por nome/e-mail/organização/assunto.
- [x] Leads/parceiros recebidos e mudança de etapa.
- [x] Escolas/cursinhos/parceiros como organizações.
- [x] Vínculo de aluno, professor e gestor a organizações.
- [x] Criação de turmas.
- [x] Matrícula de alunos em turmas.
- [x] Vinculação de professores a turmas.
- [x] Remoção de alunos/professores de turmas.
- [x] Pools de licenças por organização e obra.
- [x] Atribuir/revogar licença individual.
- [x] Área própria de gestão educacional com escopo por escola/turma.
- [x] Área de parceiro comercial limitada aos relacionamentos atribuídos.
- [x] Área de curadoria limitada às obras atribuídas.
- [x] Tela de personas/acessos no backoffice.
- [x] Eventos básicos de CRM registrados.
- [x] Referências/indicações e atribuição de origem modeladas.
- [x] Oportunidades comerciais modeladas no banco.

## CRM — pendências prioritárias para próxima revisão

- [ ] Revisar visualmente todas as telas do CRM no navegador e corrigir UX.
- [ ] Criar ficha única da pessoa/conta com contatos, personas, vínculos, progresso, dispositivos e histórico.
- [ ] Criar ficha única da organização com gestores, professores, turmas, alunos, licenças, oportunidades e histórico.
- [ ] Evoluir pipeline comercial para visualização e edição completa de oportunidades.
- [ ] Permitir criação/edição de oportunidade diretamente pela interface.
- [ ] Criar histórico/timeline por pessoa, organização e oportunidade a partir de crm_events.
- [ ] Melhorar filtros por persona, organização, etapa, atividade e data.
- [ ] Incluir telefone como campo de busca/visualização onde apropriado.
- [ ] Tratar duplicidade de identidade entre e-mail e telefone antes de criar nova conta.
- [ ] Criar fluxo seguro de associação de segundo contato (e-mail + telefone) à mesma pessoa.
- [ ] Revisar gestão de licenças para múltiplas obras, não apenas O Alienista.
- [ ] Criar controles de licença em lote por turma/escola.
- [ ] Criar importação de alunos/professores em lote (CSV ou equivalente).
- [ ] Definir convites de escola/turma e aceite de vínculo.
- [ ] Criar dashboard de adoção por escola/turma: iniciados, ativos, concluídos e retorno.
- [ ] Criar visão agregada pedagógica sem expor notas/anotações privadas do aluno.
- [ ] Implementar ações de curadoria para resolver comentários e efetivar aprovação/publicação conforme permissões.
- [ ] Criar interface para gestão de escopo de parceiro comercial mais simples.
- [ ] Definir e implementar comunicação CRM (e-mail/SMS) com consentimento, templates e log de envio.
- [ ] Integrar pagamentos/Stripe quando o modelo comercial for ativado.
- [ ] Criar auditoria administrativa para alterações sensíveis de persona, licença e acesso.
- [ ] Validar multi-tenant com cenários reais: uma pessoa em mais de uma escola, professor em várias turmas e aluno em múltiplas instituições.
- [ ] Revisar regras LGPD: minimização, retenção, consentimento, exportação e exclusão de dados.
- [ ] Definir relatórios e exportações para escola/gestor.
- [ ] Testar end-to-end todos os perfis sem privilégios indevidos.

## Próxima sequência recomendada

1. Validar visualmente dev.coonto.com, especialmente leitor v1.9.x.
2. Confirmar áudio, jump, contexto e texto relacionado.
3. Abrir CRM e revisar a navegação real.
4. Priorizar ficha de pessoa + ficha de organização.
5. Revisar multi-tenant e licenças.
6. Evoluir pipeline comercial e curadoria.
7. Só depois ativar comunicação comercial e pagamentos.


## Gestão educacional — beta.3

- [x] Coonto Professor e Escola com atividades, entregas e devolutivas institucionais.
- [x] Caderno pessoal separado dos registros escolares.
- [x] Coonto Rede com escolas e permissões explícitas de relatórios e licenças.
- [x] Cadastro de redes, compartilhamento e contratos confirmados no CRM.
- [x] Reservas de vagas e concessões individuais sem exceder a capacidade contratada.
- [x] Confirmação diária por código para gestores escolares e usuários de rede/licenças.
- [x] Relatórios por período, escola, professor e turma com denominador atual explícito.
- [x] 48 testes automatizados, build e fluxo de navegador com contas locais fictícias.
- [ ] Períodos letivos e reconstrução histórica das matrículas/atribuições.
- [ ] Histórico de revisões, rubricas, instrumentos de avaliação e exportações autorizadas.

Detalhes: GESTAO_EDUCACIONAL_IMPLEMENTACAO.md.
