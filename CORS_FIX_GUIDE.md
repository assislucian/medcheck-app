# 🔧 Guia Completo para Resolver Problemas de CORS

## 🐛 Problema Identificado

Você está enfrentando os seguintes erros no Vercel:

```
[Log] Token expirado encontrado no localStorage
[Error] Failed to load resource: the server responded with a status of 404 (dashboard-preview.png)
[Error] Origin https://medcheck-app.vercel.app is not allowed by Access-Control-Allow-Origin. Status code: 502
[Error] XMLHttpRequest cannot load https://medcheck-app-medcheck.up.railway.app/token due to access control checks.
```

## ✅ Solução Implementada

### 1. **Configuração de CORS no Backend (Railway)**

O backend já foi atualizado com as configurações corretas de CORS em `src/api.py`:

```python
allowed_origins = [
    "https://medcheck-app.vercel.app",  # Vercel produção
    "https://www.medcheck-app.vercel.app",  # Vercel produção com www
    # ... outras origens
]

FRONTEND_ORIGIN_REGEX = r"https://medcheck-app-[a-z0-9-]+\.vercel\.app"
```

### 2. **Variáveis de Ambiente do Railway**

Execute o script de configuração automática:

```bash
./scripts/setup_railway.sh
```

Ou configure manualmente no painel do Railway:

```bash
railway variables set FRONTEND_ORIGINS="https://medcheck-app.vercel.app,https://www.medcheck-app.vercel.app"
railway variables set FRONTEND_ORIGIN_REGEX="https://medcheck-app-[a-z0-9-]+\.vercel\.app"
railway variables set ENV="production"
```

### 3. **Configuração do Vercel**

O arquivo `frontend/vercel.json` foi atualizado com:

```json
{
  "env": {
    "VITE_API_URL": "https://medcheck-app-medcheck.up.railway.app"
  }
}
```

### 4. **Health Check Endpoint**

Adicionado endpoint de verificação de saúde no backend:

- `GET /healthz`
- `GET /health`

## 🚀 Passos para Deploy

### 1. **Deploy do Backend (Railway)**

```bash
# Configurar Railway (uma vez)
npm install -g @railway/cli
railway login
railway init

# Executar script de configuração
./scripts/setup_railway.sh

# Ou fazer deploy manual
railway up
```

### 2. **Deploy do Frontend (Vercel)**

O Vercel fará deploy automaticamente via GitHub. A variável `VITE_API_URL` já está configurada no `vercel.json`.

### 3. **Verificação**

Teste os endpoints:

```bash
# Health check do backend
curl https://medcheck-app-medcheck.up.railway.app/healthz

# Teste de CORS
curl -H "Origin: https://medcheck-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://medcheck-app-medcheck.up.railway.app/token
```

## 🔍 Troubleshooting

### Erro 502 no Railway

**Causa:** Backend não está rodando na porta correta.

**Solução:**

1. Verificar se `PORT` está sendo usada corretamente
2. Verificar logs no Railway Dashboard
3. O `Dockerfile` já foi atualizado para usar `${PORT:-8000}`

### CORS ainda bloqueado

**Causa:** Variáveis de ambiente não configuradas.

**Solução:**

1. Verificar variáveis no Railway Dashboard
2. Executar `railway variables list`
3. Redeployar após configurar variáveis

### Token expirado

**Causa:** JWT com tempo de expiração muito curto.

**Solução:**

1. Implementar refresh token no frontend
2. Aumentar `JWT_EXPIRE_MINUTES` no backend
3. Adicionar tratamento de token expirado

### Arquivo dashboard-preview.png não encontrado

**Causa:** Arquivo de imagem não existe.

**Solução:**

1. Remover referência ao arquivo
2. Ou adicionar arquivo placeholder
3. Verificar imports de imagens no frontend

## 🔧 Configurações Adicionais

### Para Desenvolvimento Local

```bash
# Backend
cd backend_test
source .venv/bin/activate
python -m uvicorn src.api:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm run dev
```

### Para Produção

1. **Railway (Backend):**

   - URL: `https://medcheck-app-medcheck.up.railway.app`
   - Health Check: `/healthz`

2. **Vercel (Frontend):**
   - URL: `https://medcheck-app.vercel.app`
   - Configuração automática via `vercel.json`

## 📋 Checklist de Verificação

- [ ] Backend rodando no Railway com health check funcionando
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] CORS configurado para domínios do Vercel
- [ ] Frontend buildando sem erros
- [ ] `vercel.json` com `VITE_API_URL` correto
- [ ] Teste de login funcionando entre Vercel e Railway

## 🆘 Se Ainda Houver Problemas

1. **Verificar logs do Railway:**

   ```bash
   railway logs
   ```

2. **Verificar build do Vercel:**

   - Acessar Vercel Dashboard
   - Verificar logs de build e runtime

3. **Testar localmente:**

   ```bash
   # Simular produção localmente
   cd frontend
   npm run build
   npm run preview
   ```

4. **Verificar rede:**
   ```bash
   # Teste direto da API
   curl https://medcheck-app-medcheck.up.railway.app/
   ```

## 📞 Suporte

Se os problemas persistirem:

1. Verificar logs em tempo real no Railway Dashboard
2. Verificar Function Logs no Vercel Dashboard
3. Usar Developer Tools do navegador para debugar requisições
4. Verificar se as URLs estão corretas e acessíveis

---

**Status:** ✅ Configurações implementadas e prontas para deploy.
