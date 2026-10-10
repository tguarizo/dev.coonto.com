# Coonto — checklist de pendências

Atualizado em 09/10/2026. Versão em preparação: **1.9.6-rc.2.2**.

Comando acordado: `/checklist` apresenta a lista do projeto ativo, organizada por prioridade, concluídos, pendências e bloqueios. Para Coonto, este documento é a referência; Tuuvo terá seu próprio checklist. Atualizar os estados somente com evidências de conclusão.

## Situação atual

A RC2.2 está preparada e compilada localmente, mas ainda não foi publicada em dev.coonto.com. A última versão confirmada pelo usuário no servidor é 1.9.6-rc.2.1. Preparação no código, publicação e aprovação dos avaliadores são etapas diferentes.

## 1. Preparação concluída

- [x] Revisar a linguagem das 24 interações de Memórias de Martha e das 14 de Dante, preservando estrutura, referências e histórico.
- [x] Preservar a reformulação editorial de O Alienista elogiada por Fred Sommer.
- [x] Criar e integrar uma ilustração de abertura para cada uma das três obras.
- [x] Incluir essas imagens nos pacotes offline.
- [x] Reorganizar a seção de livros originais e alinhar suas ações.
- [x] Restaurar a assinatura “Plataforma de aprendizagem interativa” no cabeçalho.
- [x] Implementar abertura da página inicial com logo, assinatura, duração de dois segundos e opção de pular, uma vez por sessão.
- [x] Preparar publicação das edições de Martha e Dante em dev, com proteção contra sobrescrever conteúdo divergente.
- [x] Preparar geração de áudio por trecho para permitir correções isoladas.
- [x] Validar TypeScript e build após a abertura; 75 testes passaram na revisão editorial anterior.
- [x] Registrar alterações em commits locais.

## 2. Publicar para avaliação — prioridade imediata

- [ ] Obter autorização explícita para enviar os commits à branch develop do repositório público tguarizo/dev.coonto.com. O envio anterior foi bloqueado pela revisão automática.
- [ ] Enviar os commits e acompanhar o workflow de implantação em dev.coonto.com.
- [ ] Confirmar a versão 1.9.6-rc.2.2 no rodapé e no container.
- [ ] Confirmar que as novas edições de Martha e Dante foram publicadas no banco.
- [ ] Conferir no ambiente publicado o slogan, a abertura e as três imagens.

Nesta rodada, a revisão editorial pode ocorrer sem a nova locução, conforme a orientação do usuário. Os áudios antigos incompatíveis com os textos revisados não devem ser apresentados.

## 3. Fechar Martha, Dante e a dimensão visual

- [ ] Percorrer Martha e Dante no ambiente publicado e verificar clareza, continuidade e qualidade dos retornos.
- [ ] Fazer avaliação visual no celular, tablet e computador; a conferência visual em tablet ainda não foi concluída.
- [ ] Conferir a seção de livros originais e os três downloads.
- [ ] Definir quais passagens precisam de imagens além da abertura e aprovar seu escopo.
- [ ] Produzir e integrar as imagens dessas passagens, com identidade consistente e sem antecipar descobertas.
- [ ] Conferir legibilidade, proporções, textos alternativos e carregamento das imagens.
- [ ] Testar retomada, navegação entre capítulos e leitura offline com as alterações.

As três imagens atuais são de abertura. A ilustração das demais passagens permanece pendente.

## 4. Áudio — depois da validação editorial

- [ ] Identificar as palavras e os trechos com pronúncia inadequada no relato da avaliadora.
- [ ] Esclarecer o comentário sobre o tablet: imagem, disposição da pergunta ou divergência com a locução.
- [ ] Conferir saldo atual da ElevenLabs e estimar apenas os arquivos faltantes no servidor.
- [ ] Gerar locução correspondente aos textos aprovados de Martha e Dante.
- [ ] Corrigir isoladamente as pronúncias confirmadas.
- [ ] Ouvir amostras das três obras, conferindo as vozes acordadas para situação, preparação e comentário.
- [ ] Verificar os controles de reprodução e o funcionamento offline.

Não foram consumidos créditos da ElevenLabs nesta preparação.

## 5. Nova avaliação geral

- [ ] Disponibilizar a versão publicada para Fred Sommer e os demais avaliadores. O contato fica a cargo do usuário até haver instrução para envio.
- [ ] Registrar os comentários por obra e por trecho, distinguindo texto, imagem, áudio e navegação.
- [ ] Revisar home, catálogo, abertura das obras, ajuda e biblioteca.
- [ ] Conferir entrada como visitante, OTP por e-mail/SMS, manutenção da sessão e retomada da leitura.
- [ ] Conferir acessos e separação de ambientes: aluno, professor, gestão educacional, CRM e administração.
- [ ] Corrigir os problemas que impedem a experiência de leitura e repetir a verificação dos pontos afetados.
- [ ] Registrar o parecer de liberação antes de ampliar a exposição ao mercado.

Os itens de acesso e CRM são verificações de liberação; esta lista não afirma que estejam com defeito.

## 6. Pagamento e licenças

- [ ] Mapear o método de pagamento realmente implementado, os preços e os direitos liberados por compra ou assinatura.
- [ ] Rever compra por obra, Coonto Club e contratação por instituição; distinguir proposta comercial de funcionamento disponível.
- [ ] Testar o fluxo completo em ambiente de testes: pagamento aprovado, recusado, repetido, cancelamento e falha de comunicação.
- [ ] Conferir confirmação de pagamento, liberação da licença e apresentação ao usuário.
- [ ] Definir o tratamento de renovação, inadimplência e reembolso antes da ativação comercial.
- [ ] Confirmar a política de gratuidade durante a avaliação e o momento de ativação da cobrança.

## 7. CRM e guias por participante

- [ ] Revisar menus, permissões, convites, formulários, registros e relatórios do CRM.
- [ ] Conferir separação entre CRM comercial, gestão educacional e administração da plataforma, incluindo isolamento entre instituições.
- [ ] Refazer guias baseados nas telas e nos direitos efetivamente disponíveis.
- [ ] Preparar guia do administrador/master: entrada inicial, convites e gestão de acessos.
- [ ] Preparar guia do gestor comercial/marketing: contatos, oportunidades, parceiros e acompanhamento.
- [ ] Preparar guia do parceiro comercial: indicados, acompanhamento e relatórios autorizados.
- [ ] Preparar guia do curador: avaliação editorial e registros disponíveis.
- [ ] Preparar guia do professor: turma, acompanhamento e recursos pedagógicos disponíveis.
- [ ] Preparar guia do administrador escolar/órgão: instituições, turmas e visão de desempenho autorizada.
- [ ] Registrar o que cada perfil pode ver e alterar, como começar e como pedir ajuda. A jornada do aluno pertence ao manual do produto.

## 8. Manual de uso do produto

- [ ] Explicar como começar, escolher uma obra, decidir, compreender os retornos e retomar a experiência.
- [ ] Explicar quando usar: antes, durante e depois da leitura, com exemplos para aluno e professor.
- [ ] Explicar expectativas: participação na narrativa, formulação de hipóteses e apoio à compreensão; não prometer resultado pedagógico ainda não medido.
- [ ] Orientar uso individual, em sala, com áudio, sem áudio e offline.
- [ ] Incluir roteiro de primeiro uso, dúvidas frequentes e canais de ajuda.
- [ ] Validar o manual com alguém que ainda não conhece o Coonto.

## 9. Avaliação agora e lançamento após as férias

Diretriz do usuário: aproveitar o período próximo aos vestibulares para avaliar, testar hipóteses, implementar e melhorar. O lançamento mais amplo será após as férias; a data exata permanece a definir. A avaliação atual não deve depender de implantação extensa em escolas neste período.

- [ ] Definir o público e a dimensão da próxima rodada de testes.
- [ ] Definir hipóteses de entendimento, facilidade de uso, retorno à experiência e interesse em adoção.
- [ ] Preparar experiências curtas e convites para avaliação voluntária.
- [ ] Registrar resultados e decidir a próxima versão a partir deles.
- [ ] Definir critérios de prontidão do produto e janela de lançamento após as férias.

## 10. Divulgação, parceiros e influenciadores educacionais

- [ ] Preparar plano de ação em duas etapas: conhecimento/recrutamento agora e adoção comercial após as férias.
- [ ] Criar material institucional simples com demonstração do produto e chamada para participar da avaliação.
- [ ] Preparar peças para Instagram: carrosséis, cards e roteiros curtos de vídeo com identidade visual Coonto.
- [ ] Preparar modelos de e-mail para avaliadores, escolas, parceiros comerciais e influenciadores educacionais.
- [ ] Preparar apresentação de recrutamento de parceiros: público, atuação, suporte e proposta de colaboração.
- [ ] Preparar convite e material para influenciadores: experiência demonstrável, público e formato da colaboração.
- [ ] Definir condições comerciais, eventual remuneração e acompanhamento antes de oferecer acordos.
- [ ] Definir mensagem, chamada para ação, canais, calendário, responsáveis e indicadores de cada peça.
- [ ] Publicar demonstrações e aprendizados autorizados para tornar o Coonto conhecido.
- [ ] Coletar contatos interessados e acompanhar sua origem e retorno no CRM.

Produção de rascunhos está autorizada. Envio de e-mails, contato com pessoas e publicação em redes dependem de instrução específica; este checklist não autoriza essas ações.

## 11. Incursão em História do Brasil

- [ ] Escolher uma época delimitada para uma prova de conceito, sem ampliar todo o catálogo de uma vez.
- [ ] Selecionar fontes verificáveis e conferir direitos dos textos e imagens.
- [ ] Definir situações, atores e tensões do período, distinguindo fato documentado de hipótese interpretativa.
- [ ] Construir uma experiência curta de decisões, descobertas, explicações e retomada das fontes.
- [ ] Obter revisão de professor ou especialista em História.
- [ ] Avaliar se o formato ajuda a compreender relações e perspectivas, além de recordar datas.

## 12. Exploração paralela do Tuuvo

- [ ] Ler e discutir o paper inicial de posicionamento, relação com Coonto e escopo do piloto.
- [ ] Escolher um problema empresarial concreto e dois manuais utilizáveis legalmente.
- [ ] Diferenciar o que pode ser reaproveitado da engine e o que exige fluxo e interface próprios.
- [ ] Definir indicadores de entendimento, revisão e dispersão sem confundir tempo de resposta com competência.
- [ ] Testar competição, ranking e termômetro como hipóteses de produto, com explicação clara das medidas.
- [ ] Definir condições para iniciar implementação sem comprometer o fechamento do RC do Coonto.

## Ordem de trabalho acordada

Fechar a RC do Coonto e publicar para avaliação continua sendo a prioridade imediata. Pagamento, CRM e documentação compõem a preparação para lançamento. Divulgação e recrutamento podem avançar durante a avaliação. História do Brasil e Tuuvo entram como explorações delimitadas em paralelo, com implementação condicionada ao fechamento do núcleo atual.

## Próxima decisão

Após a revisão geral, transformar estas frentes em um calendário com responsáveis, entregáveis e critérios de conclusão. Não há datas de entrega ou lançamento confirmadas neste checklist.
