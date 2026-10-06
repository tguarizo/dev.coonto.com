# Conta de inicialização

Endereço aprovado: `master@coonto.com`. A caixa é criada pelo titular na Locaweb e pode ser acessada pelo webmail. Nenhuma senha da caixa é necessária no Coonto.

`COONTO_BOOTSTRAP_MASTER_EMAIL=master@coonto.com` fica no `.env` privado da implantação. `scripts/configure-bootstrap.py` prepara esse valor em dev sem alterar configurações existentes (incluindo valor vazio, que significa desativado). Produção usa seu próprio `.env`; nenhuma alteração de produção é feita por esse deploy.

Com `AUTH_MODE=email`, a primeira confirmação de um código real pelo endereço indicado ativa o administrador inicial e grava um recibo único no banco. SMS, validação compartilhada, outros endereços e simples pedido de código não ativam o acesso. O recibo permanece após retirar o acesso; login posterior não o recria, inclusive se o endereço aparecer em `ADMIN_EMAILS`.

## Transferência

1. Criar a caixa e entrar em `https://crm.dev.coonto.com/backoffice` com o código recebido no webmail. Informar o nome no primeiro cadastro.
2. Em Administradores, autorizar o e-mail administrativo definitivo.
3. Entrar com o código dessa conta definitiva e confirmar o acesso ao CRM.
4. Pela conta definitiva, retirar o acesso de `master@coonto.com`. As sessões da conta inicial são encerradas; a persona owner também é revogada.
5. Remover ou esvaziar `COONTO_BOOTSTRAP_MASTER_EMAIL` no `.env` e recriar o serviço app. Mesmo se a variável permanecer, o recibo impede nova ativação automática.

Não apagar o recibo para recuperação. Isso exige procedimento operacional separado. A rotina não cria nem acessa a caixa de correio e não envia mensagens por iniciativa própria.

## Limite desta etapa

Esta é a configuração inicial usando o login por código existente. A permissão operacional ainda é `admin`, sem distinção de master e administradores com poderes delegados. OAuth/OIDC, a associação de celular à conta e a nova matriz de atribuições serão etapas posteriores. Administradores legados em `ADMIN_EMAILS` continuam como antes, exceto a conta temporária master. Não se declara concluído o novo modelo de segurança.
