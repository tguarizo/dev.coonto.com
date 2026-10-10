# Plano ativo — fechamento Coonto RC2.2

Atualizado em 10/10/2026. A solicitação atual substitui os limites da prototipagem inicial reproduzida abaixo: o usuário autorizou revisar Martha e Dante, completar as imagens, concluir o áudio e publicar os commits em tguarizo/dev.coonto.com, branch develop, acionando dev.coonto.com.

Prioridade: terminar texto, dimensão visual e verificação da experiência antes de pagamento, CRM, guias, manual e marketing.

Implementado: revisão de Martha/Dante, 24 ilustrações com suporte offline, livros originais, assinatura da marca, abertura da home. 77 testes, TypeScript, build e navegação em três larguras aprovados.

Bloqueio atual: ElevenLabs HTTP 401 `missing_permissions`, ausência de `user_read`. São 107 arquivos faltantes, 38.848 caracteres; geração não iniciada nesta tentativa. Consultar o saldo e concluir áudio/auditoria antes de declarar a RC encerrada.

Estado detalhado e evidências: `CHECKLIST_COONTO.md` e `AVALIACAO_RC2_2.md`. A avaliação externa de Fred Sommer permanece separada da verificação técnica.

---

## Registro histórico — prototipagem de 08/10, anterior ao escopo atual

# Coonto RC2 — CLE e Site (protótipo de validação)
Data: 2026-10-08
Base: develop @ a22e721108f40ffb8dafefb897faa1d464f93fb3

## Escopo
A RC2 será avaliada primeiro com pequenos grupos convidados, fora de escolas. Não há piloto institucional, convites a escolas ou rollout de produção nesta etapa. A branch de trabalho não publica em dev automaticamente.

### Frente A — CLE
- Usar a primeira fase de **O Alienista** como laboratório, preservando as demais obras.
- A entrada deve **situar sem revelar o enredo**: cenário, protagonista, pergunta dramática.
- Preservar o núcleo Decidir → Descobrir → Entender → Lembrar; estudar Situar como apoio inicial.
- Trocar linguagem de prova por narrativa curta, hipóteses equivalentes e retornos com descoberta/consequência/curiosidade.
- Distinguir opinião, hipótese interpretativa e fatos da obra.
- Oferecer ajuda sob demanda; avaliar três graus de apoio sem três roteiros independentes.
- Revisão de fidelidade literária e humor por Fred Sommer antes de tornar texto definitivo.

### Frente B — Site
- Testar a chamada «Ler um clássico pode ser uma aventura.»
- Uma demonstração breve de O Alienista; demais obras apresentadas como catálogo, não três provas sequenciais.
- Menu de leitura organizado por progresso, continuar, fases, descobertas e livro original.
- Manter acesso claro a ajuda, leitura offline e funcionalidades já existentes.
- Testar primeiro em protótipo isolado, não substituir a home publicada até validação.

## Passagem aos pequenos grupos
Rodada exploratória: 3–5 participantes por rodada. Outra rodada: 10–15 pessoas novas, se as correções forem satisfatórias. Quantidades indicativas, não evidência estatística.
- Não explicar previamente o Coonto; observar navegação e hesitações, com consentimento dos participantes.
- Registrar: o que é o produto; quem é o protagonista; qual o conflito; justificativa da primeira escolha; vontade de continuar; pontos de desistência.
- Metas provisórias para revisão: entendimento e usabilidade >=8/10; compreensão da primeira fase >=7/10; >=75% querem continuar; zero falhas impeditivas.
- Não apresentar estas metas como resultados ou critérios estatisticamente comprovados.
- Não encaminhar a escolas antes de obter confiança e avaliação positiva suficiente em grupos controlados.

## Limites e segurança
- Nenhuma alteração de CRM, contas, licenças, multi-tenant, autenticação ou banco.
- Não modificar Dante ou Memórias de Martha nesta primeira etapa.
- Não gerar áudio novo automaticamente nem consumir créditos da ElevenLabs durante prototipagem.
- Separar commits de CLE e Site, e validar npm test, typecheck, navegação e experiência antes de eventual merge para develop.
- O parecer de Fred é sugestão editorial; os exemplos devem ser conferidos com o texto original.
- Manter controle de versão e rollback. A RC2 só será chamada validada após os testes.
