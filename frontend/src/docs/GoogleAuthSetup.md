# Configurando Login com Google no MedCheck

Este guia explica como configurar o login com Google para o seu aplicativo MedCheck.

## 1. Criar um projeto no Google Cloud

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o ID do projeto (você precisará dele mais tarde)

## 2. Configurar a tela de consentimento OAuth

1. No menu lateral, navegue até "APIs e Serviços" > "Tela de consentimento OAuth"
2. Selecione o tipo de usuário "Externo"
3. Preencha as informações obrigatórias:
   - Nome do aplicativo: MedCheck
   - E-mail de suporte do usuário: seu-email@exemplo.com
   - Domínios autorizados: adicione o domínio do seu projeto Supabase (`<PROJECT_ID>.supabase.co`)
   - Links para os termos de serviço e política de privacidade
4. Adicione os escopos necessários:
   - .../auth/userinfo.email
   - .../auth/userinfo.profile
   - openid

## 3. Criar credenciais OAuth

1. Ainda em "APIs e Serviços", vá para "Credenciais"
2. Clique em "Criar credenciais" e escolha "ID do cliente OAuth"
3. Para "Tipo de aplicativo", selecione "Aplicativo da Web"
4. Dê um nome à sua aplicação (ex: "MedCheck Web Client")
5. Em "Origens JavaScript autorizadas", adicione:
   - URL do seu site (ex: `https://seu-dominio.com`)
   - Para desenvolvimento local: `http://localhost:3000` (ou a porta que você usa)
6. Em "URIs de redirecionamento autorizados", adicione:
   - O URL de retorno do Supabase (encontrado no painel do Supabase em Autenticação > Provedores > Google)
7. Clique em "Criar"

## 4. Configurar o Supabase

1. No painel do Supabase, navegue até "Authentication" > "Providers"
2. Ative o provedor Google
3. Cole o ID do cliente e o Segredo do cliente (Client Secret) do Google
4. Salve suas configurações

## 5. Configuração de URL no Supabase

Para evitar erros de redirecionamento:

1. No painel do Supabase, vá para "Authentication" > "URL Configuration"
2. Defina o "Site URL" como a URL do seu aplicativo
3. Adicione quaisquer URLs de redirecionamento necessárias

## Solução de problemas comuns

### Erro "requested path is invalid"

Certifique-se de que o URL do site e o URL de redirecionamento estão corretamente configurados no Supabase em Authentication > URL Configuration.

### Redirecionamento para localhost

Se você estiver sendo redirecionado para localhost:3000 mesmo em produção, verifique se o URL do site está definido corretamente no Supabase.
