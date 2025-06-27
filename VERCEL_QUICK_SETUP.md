# 🚀 Vercel Setup Rápido - MedCheck

## ⚡ Configuração em 5 Minutos

### 1. Import no Vercel

1. Acesse: https://vercel.com/new
2. Import: `assislucian/medcheck-app`
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Environment Variables (Copie e cole)

**Production Environment:**

```
VITE_API_URL=https://medcheck-app-medcheck.up.railway.app
VITE_APP_NAME=MedCheck
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

**Preview Environment:**

```
VITE_API_URL=https://medcheck-app-medcheck.up.railway.app
VITE_APP_NAME=MedCheck Preview
VITE_APP_VERSION=1.0.0-preview
VITE_ENVIRONMENT=preview
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=true
```

### 3. Deploy

- Clique em **Deploy**
- Aguarde o build (2-3 minutos)
- Acesse: `https://medcheck-app.vercel.app`

### 4. Teste

- Login: UF=RN, CRM=6091, senha=@Luassis90
- Verifique se API calls funcionam

## ✅ Checklist Rápido

- [ ] Projeto importado
- [ ] Variáveis configuradas
- [ ] Deploy bem-sucedido
- [ ] Site acessível
- [ ] Login funcionando

## 🔧 Já Configurado Automaticamente

- ✅ CORS com Railway
- ✅ Redirects para API
- ✅ Headers de segurança
- ✅ Cache otimizado
- ✅ SPA routing

## 🚨 Se algo der errado

1. Verifique se Railway está funcionando: https://medcheck-app-medcheck.up.railway.app/health
2. Confirme variáveis de ambiente
3. Verifique logs no dashboard do Vercel

**Railway Status**: Configurado e funcionando ✅
