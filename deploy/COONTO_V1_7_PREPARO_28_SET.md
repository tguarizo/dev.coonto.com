# Coonto 1.7 — preparo para 28 de setembro de 2026

Base: coleção `conto v1.7.txt` enviada pelo fundador. Esta branch é de preparação. Não equivale a publicação em `dev.coonto.com` nem em `coonto.com`.

| Pedido | Preparado nesta branch | Limite atual |
| --- | --- | --- |
| Apresentar o Coonto como plataforma, não apenas *O Alienista* | Texto e visual da home falam do método e do catálogo. A obra aparece como exemplo e oferta atual. | Conferir visual e mensagem com usuários antes de publicar. |
| Três formas de acesso | Cartões para obra gratuita atual, obra individual (R$ 9,90 como referência) e Coonto Club (R$ 19,90/mês como referência). | Compra e assinatura continuam desativadas. Não prometer acesso a obras em preparação. |
| Gratuidade que pode mudar | Migração `008_featured_free_work.sql`, escolha restrita a obras publicadas no painel administrativo, catálogo e checkout coerentes com a escolha. | Só *O Alienista* está publicado. A troca exige lançar a próxima experiência e seu fluxo de acesso antes de incluí-la na seleção. Acesso já concedido permanece na biblioteca. |
| Reduzir pedidos repetidos de código | Diagnóstico definido abaixo. | A causa ainda precisa ser reproduzida; nenhuma mudança de segurança foi feita por hipótese. |
| Corrigir `coonto.com` | Home do aplicativo foi ajustada nesta branch; publicação principal definida como etapa separada. | `main` contém a antiga página Alpha e seu workflow instala em produção. Não juntar `develop` a `main` sem revisar instalação, domínios e banco de produção. |
| Linguagem clara inspirada nas observações de Fred Sommer | Abertura explica a dificuldade real do leitor e a sequência cena → escolha → pistas → volta ao texto. Textos de leitores, educadores, obra e catálogo foram alinhados. | Revisar com leitores se as escolhas produzem perguntas próprias; evitar prometer "qualquer livro" ou antecipar toda a trama. |
| CRM com áreas localizáveis | Menu vertical no domínio exclusivo do CRM; contatos, alunos e escolas em vistas separadas com busca. O painel abre a caixa de entrada. | Testar com administrador e dados reais antes de liberar. |
| Todos os formulários públicos no CRM | Caixa de entrada reúne pesquisa, parcerias, comentários e sugestões, com busca e links ao registro detalhado. Comentários e sugestões recebem etapa novo/revisado/arquivado. | O banco existente armazena as quatro fontes. Não há migração nova para este trecho; verificar o fluxo real e a escala da busca. |

## Sequência do dia 28

1. Verificar DNS autoritativo e HTTPS de `crm.dev.coonto.com`. Se ainda houver NXDOMAIN, acompanhar os chamados da Locaweb; a aplicação não corrige um registro ausente.
2. Quando o endereço abrir, conferir login de administrador, menu lateral e caixa de entrada das quatro fontes, busca e atualização de etapas, pesquisa individual, contas, atividade e parcerias. Confirmar que `/backoffice` no domínio público responde 404. Seguir também `deploy/CRM_V1_6_ATIVACAO.md`.
3. Revisar a home e os três cartões desta branch em ambiente de teste. Aplicar a migração 008 pelo processo de atualização antes de subir o aplicativo; conferir a coluna `free_work_slug` e o valor inicial `o-alienista`. Ler a linguagem com alguém que não conhece o produto.
4. Publicar a 1.7 em `develop` depois da validação do CRM e da interface. Conferir catálogo, pedido gratuito e acesso prévio com uma conta de teste. A troca de obra gratuita só pode ocorrer quando a próxima obra estiver pronta.
5. Tratar `coonto.com` como implantação própria. Revisar o workflow de `main`, o Caddy e o banco de produção antes de aprovar a nova home. Após publicar, conferir diretamente `https://coonto.com/`, e não apenas `dev.coonto.com`.

## Teste do login

Com uma conta de teste, entrar em `dev.coonto.com`, fechar e reabrir o mesmo navegador e voltar à biblioteca em 1 hora e no dia seguinte. Registrar navegador, aparelho, URL exata, horário, se houve navegação anônima ou limpeza de dados e se o logout foi acionado. Repetir separadamente no CRM com conta administrativa. Os cookies são específicos de cada domínio; entrar em `dev.coonto.com` não autentica automaticamente `crm.dev.coonto.com`. O código atual cria sessão de 30 dias; se o mesmo domínio pedir novo código antes disso, investigar cookie, sessão no banco e redirecionamento com os horários do teste. Só então decidir mudança de implementação ou opção adicional de login.

## Critério de conclusão

A 1.7 estará pronta para publicação quando o CRM separado estiver acessível e validado, o fluxo gratuito e os três cartões forem testados, o motivo do login repetido estiver identificado e houver plano específico para substituir a página Alpha de `coonto.com` sem misturar administração e experiência do usuário.
