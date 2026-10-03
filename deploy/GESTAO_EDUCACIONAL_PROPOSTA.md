# Coonto Educação e preparação das correções da beta

Arquitetura acordada com Tony, 3 de outubro de 2026. A implementação inicial de Professor, Escola, Rede e licenças está detalhada em GESTAO_EDUCACIONAL_IMPLEMENTACAO.md. Esta arquitetura também contém expansões futuras e não é comprovação de eficácia pedagógica.

## Nomes e separação

- Coonto Administração: operação interna, CRM de relacionamentos, comercial, suporte, catálogo, curadoria, publicação, contratos e auditoria.
- Coonto Educação: portal institucional único, com a mesma base de experiências e diferentes escopos de acesso.
- Coonto Professor: preparar atividades, escolher obras e capítulos, definir checkpoints, acompanhar turmas e respostas enviadas para a atividade.
- Minha Turma: lista de alunos, atividades, participação e acompanhamento daquela turma. É uma visão do painel, não outro sistema.
- Coonto Escola: direção/coordenadores, professores, turmas e licenças da escola.
- Coonto Rede: secretaria, órgão público ou mantenedora privada; agregados da rede e detalhamento autorizado por escola, turma e professor.

## Estrutura institucional e de acesso

Rede ou mantenedora -> escolas -> turmas -> matrículas de alunos.
Professores possuem vínculos com escolas e atribuições a turmas/atividades. A relação é muitos para muitos; professor não é o pai hierárquico do aluno. Há equipe docente, substituições e mudanças de turma.

Escola independente funciona sem uma rede. Professor independente pode conduzir um grupo autorizado sem inventar uma escola. O aluno mantém sua conta pessoal; uma matrícula institucional não dá acesso ao seu caderno privado nem a todo seu histórico pessoal.

Criar entidades separadas para redes, vínculo rede-escola, períodos letivos, papéis escopados, atividades, atribuições docentes e matrículas com vigência. Aproveitar organizations, classrooms e os vínculos já existentes; não substituir as contas. A migração da rede não deve conceder permissões automaticamente.

Licença contratada é um direito de uso, não permissão para ler dados do aluno. Separar comprador/contrato, distribuição de vagas, licença individual e visibilidade pedagógica. Manter possibilidade de escola particular, rede pública, professor em várias escolas e licença pessoal.

## Matriz proposta

| Perfil | Acesso padrão | Ações |
| --- | --- | --- |
| Aluno | Conta e atividades de suas matrículas | Realizar atividade, ver retorno e próprio histórico |
| Professor | Turmas e atividades atribuídas, durante a vigência | Preparar aula, acompanhar participação, avaliar respostas explicitamente enviadas |
| Coordenador ou gestor escolar | Escola atribuída | Gerir turmas, vínculos, distribuição de licenças e acompanhamento |
| Gestor de rede | Escolas expressamente vinculadas à rede | Agregados, filtros e detalhamento institucional permitido |
| Administrador de licenças | Contrato e distribuição atribuídos | Distribuir/revogar direitos de uso; não recebe respostas pedagógicas por isso |
| Equipe Coonto | Operação atribuída | Suporte e administração; acesso excepcional deve ser explicitamente autorizado e auditado |

Toda consulta, exportação e ação deve aplicar o mesmo escopo no servidor. Ocultar um botão não controla acesso. Registrar mudanças de vínculo, atribuição de papéis, exportações e acesso excepcional. Caderno pessoal permanece privado; respostas de atividade institucional são um objeto separado com destinatário visível ao aluno.

## Detalhamento e indicadores

Visão geral da rede -> escola -> professor (suas atribuições naquela escola) -> turma/atividade. Há também caminho direto escola -> turma. Professor em duas escolas não produz um agregado que revele a escola fora do escopo do gestor.

- Licenças: contratadas, distribuídas, ativadas, vigentes e revogadas; disponibilidade não equivale a utilização.
- Participação: alunos convidados, matriculados elegíveis, que iniciaram e que retornaram no período; informar denominadores e ausências de dados.
- Percurso: etapas únicas visitadas, perguntas respondidas e chegada ao fim; não rotular como aprendizagem.
- Atividades: respostas de referência com contagens e cobertura; justificativas e evidências avaliadas por rubrica aprovada.
- Aprendizagem e retenção: apenas após desenho de avaliação validado; medidas iniciais e posteriores, com instrumentos comparáveis. Não usar automaticamente como classificação de professor ou escola.

Filtros obrigatórios: período letivo, janela de datas, escola, turma, professor, atividade, obra e edição. Consolidar numeradores/denominadores em vez de tirar média de percentuais. Distinguir pessoas únicas de participações: um aluno em duas turmas não vira dois usuários. Fixar a edição no contexto da atividade para comparações.

## Implementação por etapas

1. Consolidar professor e escola já existentes: atividades, matrículas e atribuições; fronteira entre leitura pessoal e atividade escolar; indicadores honestos.
2. Rede/mantenedora e distribuição de licenças: migração, vínculos, convites, administração de vagas e painel agregado.
3. Detalhamento e exportação: filtros, denominadores, auditoria, isolamento entre redes e escolas.
4. Evidências pedagógicas: rubricas, revisão humana e piloto; só depois indicadores de aprendizagem.

Critérios de aceite: gestor da rede A não acessa escola B; professor com duas escolas vê cada contexto separado; substituição/revogação encerra acesso; contrato não concede papel pedagógico; caderno não aparece nos relatórios; exportação aplica os mesmos limites do painel; contagem não duplica alunos; escolas sem rede continuam funcionando.

## Correções preparadas nesta branch

- Alienista: contagens explícitas de respostas alinhadas à referência/respondidas/total; remove percentual de compreensão, fases fixas e barras de acerto. Etapas visitadas são únicas; salto ao fim não significa visitar a obra toda.
- Comunicação: demonstrações da home identificadas, catálogo e texto administrativo consistentes; chegada ao fim é distinta de aprendizagem.
- CRM geral: históricos das três experiências incluídos; contador legado de chegada ao fim nomeado como O Alienista, sem inferir total para Martha/Dante.
- Originais: seção separada do download offline; Alienista TXT local, fac-símile de Martha BBM/USP e PDF completo de Dante aberto na fonte eBooksBrasil. A edição de Dante contém condição contra uso comercial; o arquivo não foi republicado pelo Coonto. Os textos originais não dependem de licença da experiência.
- Gestão escolar: percentuais identificados como visitas; contatos de professores não são listados amplamente para um professor de turma.

## Ainda pendente antes do RC

- Fortalecer a API de progresso do Alienista: validação estruturada e percentual calculado no servidor, revisão de conflitos/retomada e testes com aparelhos distintos. Histórico legado não deve ser reinterpretado silenciosamente; revalidar registros ao retomar e migrar com identificação do método.
- Revisão editorial de todas as atividades, alternativas e retornos, incluindo evidências na fonte. Não fabricar ramificações só para imitar o Alienista. Distinguir decisão pessoal, hipótese interpretativa e pergunta factual; nenhuma nota automática para preferência pessoal.
- Reduzir alternativas obviamente absurdas e conferir que o aluno precisa usar o texto, não apenas adivinhar a intenção da pergunta.
- Revisão humana de todos os áudios, legendas e equivalência áudio/texto. Testar uso offline de verdade com internet desativada, falha parcial de áudio, falta de espaço e sincronização de notas.
- Testar celular real, login, visitante/upgrade, ajuda, retomada, múltiplas abas e dispositivos.
- Revisar indicador de progresso RC: oito etapas internas, retorno integrado à escolha; definir cobertura quando o aluno pula a escolha sem respondê-la, sem obrigar resposta.
- Modelo de fonte e direitos por edição para distribuição local durável dos três originais. Conferir edições e transparência do material anexo.
- Desenho do piloto: testar se o aluno explica a proposta, age sem orientação contínua, volta ao original e lembra posteriormente. Pesquisa de opinião não comprova eficácia nem disposição de pagar.

## Estado real

Professor, Escola e Rede têm implementação inicial na beta.3; veja o checkpoint para distinguir os fluxos prontos das inclusões futuras. Esta preparação mantém a estrutura visual familiar. A base é compartilhada, porém leitores de Alienista e RC ainda têm implementações diferentes. A definição de Coonto Learning Engine é visão arquitetural, não garantia de engine unificada pronta.
