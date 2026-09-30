# Coonto 1.8.2 - autenticação e Guest

Versão intermediária para validar a entrada no Coonto antes de desenvolver os acessos completos de cada persona.

## Incluído

- SMTP independente de Resend, com TLS obrigatório e script de teste externo à plataforma.
- Adaptador SMS MKM validado contra os exemplos da coleção Postman.
- Login por código com tratamento de falhas, validade, uso único e limite de tentativas.
- Cadastro mínimo de Guest após confirmar o contato: somente nome e e-mail ou celular.
- Conta existente preserva permissões e licenças; Guest não recebe acesso ao CRM ou espaço docente.
- Imagens de O Alienista a cada dois dias e formulário primeiro no celular.
- Versão visível no rodapé em todas as telas, inclusive login e CRM; endpoint de saúde usa a mesma versão do pacote.

## Fora desta etapa

Perfis completos de educador, escola, parceiros e curadores; passkey; política escolar de sessão de 24 horas; vinculação de segundo contato na interface; editor do acervo visual no CRM; callbacks autenticados de entrega SMS.

## Testar antes de publicar

Executar primeiro o teste independente de e-mail para Tony, confirmar recebimento, depois SMS no celular autorizado. Credenciais ficam somente no servidor. Aplicar migração 011 e testar o fluxo de conta existente, Guest, nome, código inválido/expirado/usado, logout, retomada e restrições de acesso. Ver instruções em `deploy/LOGIN_EMAIL_SMS_GUEST.md`.

A versão exibida identifica a aplicação que está respondendo. Após atualização, conferir “Coonto v1.8.2” com a página recarregada. Uma página antiga aberta ou salva offline pode conservar a versão anterior até ser recarregada online.
