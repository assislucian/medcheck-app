# Guia Completo: Configuração do Vercel do Zero para MedCheck

## 🚀 Passo a Passo para Deploy no Vercel

### 1. Preparação do Repositório

Certifique-se de que o código está no GitHub:

```bash
git status
git push origin main
```

### 2. Criando Projeto no Vercel

1. **Acesse**: https://vercel.com
2. **Login**: Use sua conta GitHub
3. **New Project**: Clique em "New Project"
4. **Import Repository**: Selecione `assislucian/medcheck-app`
5. **Configure Project**:
   - **Project Name**: `medcheck-app`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Configuração de Variáveis de Ambiente

No dashboard do Vercel, vá em **Settings → Environment Variables** e adicione:

#### Para Produção (Production):

```
VITE_API_URL=https://medcheck-app-medcheck.up.railway.app
VITE_APP_NAME=MedCheck
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ALLOWED_ORIGINS=https://medcheck-app.vercel.app,https://medcheck-app-medcheck.up.railway.app
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

#### Para Preview (Preview & Development):

```
VITE_API_URL=https://medcheck-app-medcheck.up.railway.app
VITE_APP_NAME=MedCheck Preview
VITE_APP_VERSION=1.0.0-preview
VITE_ENVIRONMENT=preview
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=true
```

### 4. Configuração de Domínio

1. **Domínio Principal**: `medcheck-app.vercel.app` (automático)
2. **Domínio Personalizado** (opcional):
   - Vá em **Settings → Domains**
   - Adicione seu domínio personalizado
   - Configure DNS conforme instruções

### 5. Verificação da Configuração

O arquivo `frontend/vercel.json` já está configurado com:

- ✅ Redirects para API do Railway
- ✅ Headers de segurança
- ✅ Cache otimizado
- ✅ Configuração SPA

### 6. Deploy Manual (se necessário)

```bash
cd frontend
npx vercel --prod
```

### 7. Configuração do Railway CORS

Certifique-se de que o Railway está configurado para aceitar requests do Vercel:

As seguintes variáveis já estão configuradas no Railway:

```
FRONTEND_ORIGINS=https://medcheck-app.vercel.app,https://medcheck-prddbw64p-assislucians-projects.vercel.app
FRONTEND_ORIGIN_REGEX=https://medcheck-[a-z0-9-]+-assislucians-projects\.vercel\.app
```

### 8. Teste de Funcionamento

Após o deploy, teste:

1. **Frontend**: https://medcheck-app.vercel.app
2. **Health Check via Vercel**: https://medcheck-app.vercel.app/health
3. **Login**: Use as credenciais UF=RN, CRM=6091, senha=@Luassis90

## 🔧 Configurações Avançadas

### Build Commands Personalizados

Se necessário, você pode customizar:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "devCommand": "npm run dev"
}
```

### Configuração de Node.js Version

Adicione no `package.json`:

```json
{
  "engines": {
    "node": "18.x"
  }
}
```

### Headers de Segurança

O `vercel.json` já inclui:

- Content Security Policy
- XSS Protection
- Frame Options
- Referrer Policy

## 🚨 Solução de Problemas

### Erro 404 em Rotas

- ✅ Já configurado no `vercel.json` com SPA fallback

### Erro CORS

- ✅ Redirects configurados para Railway
- ✅ CORS configurado no backend

### Build Failures

```bash
# Teste local antes do deploy
cd frontend
npm install
npm run build
npm run preview
```

### Environment Variables não funcionam

- Certifique-se de usar prefixo `VITE_`
- Redeploy após adicionar variáveis
- Verifique se estão na environment correta (Production/Preview)

## 📊 Monitoramento

### Analytics

- Vercel Analytics automático
- Logs disponíveis no dashboard
- Performance insights

### Logs de Deploy

- Acesse **Deployments** no dashboard
- Clique em qualquer deploy para ver logs
- Function logs disponíveis em **Functions**

## 🎯 Checklist Final

- [ ] Projeto importado do GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] Site acessível
- [ ] Login funcionando
- [ ] API calls funcionando
- [ ] CORS sem erros
- [ ] Performance satisfatória

## 🔄 Deploy Automático

O Vercel fará deploy automático quando:

1. **Push para main** → Deploy de produção
2. **Push para outras branches** → Deploy de preview
3. **Pull requests** → Deploy de preview com URL única

## 📞 Suporte

Se houver problemas:

1. Verifique logs no dashboard do Vercel
2. Teste localmente primeiro
3. Verifique se Railway está funcionando
4. Confirme variáveis de ambiente
