# Login Coonto: e-mail, SMS e Guest

Implementação preparada a partir de develop 726e47f. Sem credenciais.

## Comportamento

- Contato existente: confirma o código e conserva conta, vínculos e licenças.
- Contato novo: código correto pede somente nome; nome informado cria Guest e sessão na mesma transação. Sem código válido, não revela se há cadastro.
- Guest explora o catálogo e obtém a experiência gratuita pelo fluxo gratuito existente, com progresso salvo. Não recebe licenças pagas nem acesso administrativo ou docente.
- Não associar contas automaticamente por nome. E-mail e celular localizam a mesma pessoa somente quando previamente vinculados; interface para adicionar o segundo contato permanece futura.
- Código válido por 10 minutos, uso único, limite de tentativas e sessão atual de 30 dias. Passkeys e nova política de sessão escolar permanecem futuras.
- Cinco imagens existentes de O Alienista, trocadas a cada dois dias desde 30/09/2026 às 00:00 de Brasília. Formulário primeiro no celular.
- `LOGIN_IMAGE_IDS` e `LOGIN_IMAGE_START` configuram seleção e início no `.env` privado. Editor de imagens no CRM permanece futuro.

## Teste independente de e-mail

Com Node 22.13+ e dependências instaladas, preencher somente no `.env` privado: `SMTP_HOST=smtplw.com.br`, `SMTP_PORT=587`, usuário e senha autorizados e `SMTP_FROM` com remetente autorizado na Locaweb. Porta 587 exige STARTTLS; 465 usa TLS direto.

Sem aplicação ou banco em execução:

```bash
node --env-file=.env scripts/test-delivery.cjs email tguarizo@amriz.com.br
```

`accepted_by_smtp` confirma aceitação pelo servidor; confirmar recebimento com Tony, incluindo Spam. Não cria conta, sessão ou código de login. Não presumir que autenticação SMTP permite qualquer remetente.

## MKM Service e teste de SMS

Adaptador baseado no curl enviado por Tony. Preencher `SMS_API_TOKEN` e `SMS_COST_CENTRE_ID=20275` somente no `.env` privado. Não copiar o cookie de sessão do exemplo.

Manter `SMS_ENABLED=false` até receber a documentação e confirmar os campos de sucesso/erro da resposta. O adaptador rejeita erros HTTP, corpo vazio, JSON inválido e rejeições explícitas, mas ainda depende da validação da semântica completa do provedor. HTTP 2xx não significa entrega.

Depois dessa validação, usar configuração de teste com `SMS_ENABLED=true` e executar:

```bash
node --env-file=.env scripts/test-delivery.cjs sms <celular-de-teste-autorizado>
```

Envia somente uma mensagem de teste, sem criar conta ou código. `submitted_to_sms_api` significa submissão; confirmar recebimento antes da ativação pública.

## Atualização e validação

1. Fazer backup do banco e configuração privada.
2. Aplicar migração idempotente `011_guest_contacts.sql` antes de iniciar a nova aplicação. Acrescenta celular e classificação Guest, permite e-mail nulo e preserva roles existentes.
3. Configurar `AUTH_MODE=email` para envio real; não usar código compartilhado de validação.
4. Atualizar pelo processo existente, sem alterar Caddy ou domínios.
5. Testar contato existente, Guest novo, nome, códigos inválidos/expirados/usados, limites, logout e CRM. Repetir por SMS depois da documentação e teste real.
6. Conferir Guest sem acesso ao CRM ou ao espaço docente. Aprovações e convites precisam conceder permissões separadamente.

Verificação local: `node --test tests/*.test.cjs`, `npm run typecheck`, `npm run build`. Provedores testados com respostas simuladas; verificar o fluxo transacional no PostgreSQL do ambiente de validação. Nenhum teste real de entrega foi concluído neste ambiente, que não resolve os hosts SMTP/SMS.
