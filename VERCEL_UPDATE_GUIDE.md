# 🔧 Guia: Atualizar Frontend no Vercel

## 🎯 **Objetivo**

Conectar o frontend (Vercel) ao novo backend (Render) que está funcionando perfeitamente.

## 📋 **Passos Simples**

### 1. **Acessar Vercel Dashboard**

- Ir para: https://vercel.com/dashboard
- Localizar projeto: `medcheck-app`

### 2. **Atualizar Environment Variable**

- Clicar em **Settings** → **Environment Variables**
- Encontrar: `VITE_API_URL`
- **Valor atual**: `https://medcheck-app-medcheck.up.railway.app`
- **Novo valor**: `https://medcheck-backend.onrender.com`

### 3. **Redeploy**

- Ir para **Deployments**
- Clicar nos três pontos (**...**) no último deploy
- Selecionar **Redeploy**

## 🧪 **Teste Final**

Após o redeploy, testar:

1. **Acesso**: https://medcheck-app.vercel.app
2. **Login**: Deve funcionar sem erros de CORS
3. **API calls**: Devem retornar dados em vez de 502

## ⚡ **Comandos de Verificação**

```bash
# Verificar backend
curl https://medcheck-backend.onrender.com/health

# Verificar token endpoint
curl -X POST https://medcheck-backend.onrender.com/token

# Deve retornar 422 (validation error) em vez de 502
```

## 🎉 **Resultado Esperado**

- ✅ Frontend carrega normalmente
- ✅ Login funciona
- ✅ Sem erros de CORS
- ✅ Uploads e processamento funcionando

---

**Tempo estimado**: 5-10 minutos  
**Dificuldade**: Muito baixa (apenas 1 variável)
