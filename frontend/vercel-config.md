# Configuração do Vercel para MedCheck

## Variáveis de Ambiente no Dashboard do Vercel

Configure as seguintes variáveis de ambiente no dashboard do Vercel:

### Produção

```
VITE_API_URL=https://medcheck-app-medcheck.up.railway.app
VITE_APP_NAME=MedCheck
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ALLOWED_ORIGINS=https://medcheck-app.vercel.app,https://medcheck-app-medcheck.up.railway.app
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

### Preview (Para branches de teste)

```
VITE_API_URL=https://medcheck-app-medcheck.up.railway.app
VITE_APP_NAME=MedCheck Preview
VITE_APP_VERSION=1.0.0-preview
VITE_ENVIRONMENT=preview
VITE_ALLOWED_ORIGINS=https://medcheck-app-preview.vercel.app,https://medcheck-app-medcheck.up.railway.app
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=true
```

## Configuração de Domínio

1. **Domínio Principal**: `medcheck-app.vercel.app`
2. **Domínio Personalizado**: Configure se necessário

## Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Configurações de Segurança

O arquivo `vercel.json` já inclui:

- Headers de segurança (CSP, XSS Protection, etc.)
- Cache otimizado para assets estáticos
- Redirects para API do Railway
- Configuração SPA para React Router

## Deploy Automático

O Vercel fará deploy automático quando:

1. Push para branch `main` → Deploy de produção
2. Push para outras branches → Deploy de preview
3. Pull requests → Deploy de preview

## Monitoramento

- Logs disponíveis no dashboard do Vercel
- Analytics integrado (se habilitado)
- Error reporting configurado

## Comandos Úteis

```bash
# Deploy manual (se necessário)
npx vercel --prod

# Preview local
npm run preview

# Build local para testar
npm run build
```
