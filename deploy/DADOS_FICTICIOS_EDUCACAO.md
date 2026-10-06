# Coonto — carga fictícia educacional de dev

Versão 1.9.6-beta.6 · conjunto `coonto-education-qa-v1` · 06/10/2026.

## Objetivo e inventário

Exercitar os fluxos existentes com escolas e pessoas fictícias. Todos os nomes têm o prefixo `[TESTE QA]`; os endereços terminam em `@qa.coonto.invalid`. Estes endereços não recebem OTP. Não é uma medição de aprendizagem nem um teste de capacidade para milhares de acessos simultâneos.

| Item | Quantidade |
|---|---:|
| Redes | 2 |
| Escolas | 6 |
| Turmas | 18 |
| Alunos | 181 |
| Professores | 13 |
| Gestores de escola | 6 |
| Perfis de rede | 6 |
| Leitor sem escola | 1 |
| Total de contas | 207 |
| Matrículas em turmas | 183 |
| Atribuições de professores | 19 |
| Atividades | 54 |
| Respostas | 378 |
| Contratos de licença | 7 |
| Reservas para escolas | 19 |
| Concessões de licença de rede | 169 |
| Registros de progresso pessoal | 72 |

As 378 respostas incluem 216 devolutivas. Um aluno tem um direito pessoal independente do vínculo institucional.

## Cenários

- Redes Norte e Sul, cada uma com três escolas; escola Cedro pausada e escola Ipê sem compartilhamento de relatórios.
- Professor em duas escolas, professor sem turma e professor com vínculo revogado.
- Aluno em três turmas de duas escolas; alunos com vínculo revogado, vencido ou com início futuro; leitor sem instituição.
- Duas atividades abertas e uma encerrada por turma; respostas com e sem devolutiva; atividade antiga para verificar filtros por período.
- Contrato válido, vencido, revogado e contrato de uma vaga esgotada; concessões revogadas, ativadas e usadas.
- Comprador de rede separado dos gestores de relatórios; detalhamento permitido para um gestor e negado para outro.
- Notas pessoais com texto identificador para verificar que não aparecem nos relatórios institucionais.

Os prazos são relativos à primeira carga; vínculos futuros se tornam válidos e contratos válidos vencem com a passagem do tempo. Reexecutar não atualiza essas datas.

## Verificações realizadas na bancada

61 testes automatizados: as 54 verificações anteriores mais sete testes da carga, incluindo colisão com conta existente e rollback, repetição sem perda de alterações, validação dos contextos dos 207 usuários, relatórios, ações recusadas e licenciamento.

26 grupos de testes de navegador: 19 anteriores e sete novos com a carga expandida. Incluem 18 perfis de escola/professor, sete de aluno, seis de rede, atividade → resposta → devolutiva, revogação com sessão aberta e relatório móvel de 390 px. Build com TypeScript aprovado. O CLI de inspeção e repetição também foi executado contra o banco isolado; contagens esperadas e encontradas coincidiram.

Sessões e SMTP simulados pertencem exclusivamente à bancada local. A carga remota não inclui sessões, códigos de login, dispositivos de autenticação ou permissões administrativas.

## Como consultar em dev

Entrar com uma conta administrativa já autorizada em `https://crm.dev.coonto.com`. Em **Escolas e turmas**, buscar `TESTE QA`; em **Alunos e contas**, buscar um nome específico ou e-mail fictício; em **Redes e contratos**, consultar as redes Norte e Sul identificadas como teste.

Administradores globais não recebem automaticamente vínculos educacionais. O carregamento não permite entrar como um aluno/professor fictício por OTP. Testes desses perfis foram executados no ambiente isolado. Para uma varredura humana autenticada, usar contas de teste com contatos reais autorizados e vínculos específicos; não substituir os contatos de usuários reais nem conceder administração às contas fictícias.

## Limitações e ajustes encontrados

O cartão de escola do CRM contabiliza licenças diretas do modelo de piloto; contratos de rede são outro mecanismo. O texto foi corrigido para explicitar essa distinção, evitando interpretar `0/0` direto como ausência de licença de rede. As contagens desses mecanismos não foram somadas.

A lista de contas do CRM limita cada busca a 100 resultados; buscar nomes específicos para alcançar os demais. A lista de personas tem limite de 150 e ainda precisa de pesquisa/paginação para revisão completa. Isso deve ser tratado antes de escalar a administração. Contagens de matrícula representam vínculos cadastrados; não equivalem necessariamente a acessos atualmente válidos.

Não foram verificados envio real de email/SMS, carga concorrente de grande volume, aparelhos reais, qualidade editorial, vozes ou eficácia pedagógica. Relatórios de teste incluem dados sintéticos, inclusive nos totais gerais de dev.

## Execução controlada e rastreabilidade

`scripts/qa/education-fixtures.cjs --load` exige `DOMAIN=dev.coonto.com` e `APP_URL=https://dev.coonto.com`, além de conexão ao banco. Em produção é recusado antes de SQL. Toda a carga ocorre numa transação com trava; colisões abortam a carga inteira, sem alterar contas existentes.

O workflow de dev só solicita a carga quando o commit contém `[coonto-qa-load]` ou quando o dispatch manual seleciona `education_qa=load`. Deploys comuns não a executam. A imagem inclui os scripts de QA.

`--inspect` compara registros existentes com as chaves do manifesto em `coonto_qa_datasets`. O recibo torna a segunda carga uma consulta, preservando alterações de testes manuais. O manifesto guarda as chaves de todos os registros para futura remoção seletiva. Ainda não há comando automático de limpeza; não apagar por nome/email nem usar limpeza global do banco.

A confirmação da carga real está no log da etapa **Load requested synthetic education data in dev** do GitHub Actions. O sucesso da bancada, isoladamente, não comprova carregamento remoto.
