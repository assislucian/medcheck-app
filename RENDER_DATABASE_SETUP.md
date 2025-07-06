# 🗃️ Configuração do Banco PostgreSQL no Render

## ❌ **PROBLEMA IDENTIFICADO**

O backend está rodando no Render, mas **sem banco de dados configurado**. Atualmente está usando SQLite local (temporário).

## ✅ **SOLUÇÃO: PostgreSQL no Render**

### 🗄️ **Passo 1: Criar Banco PostgreSQL**

1. **Acessar Render Dashboard**: https://render.com/dashboard
2. **Criar Novo Banco**:

   - Clicar em **"New +"** → **"PostgreSQL"**
   - **Nome**: `medcheck-database`
   - **Database**: `medcheck`
   - **User**: `medcheck` (ou deixar padrão)
   - **Region**: Mesma do backend (US West Oregon)
   - **Plan**: Free (para desenvolvimento)

3. **Aguardar Criação** (~2-3 minutos)

### 🔗 **Passo 2: Obter URL de Conexão**

Após criação, copiar:

- **Internal Database URL** (para conectar do backend)
- Format: `postgresql://user:password@hostname:port/database`

### ⚙️ **Passo 3: Configurar Backend**

1. **Ir para o Backend Service**: `medcheck-backend`
2. **Environment Variables** → **Add Environment Variable**:

   ```
   Key: DATABASE_URL
   Value: [COLAR A INTERNAL DATABASE URL AQUI]
   ```

3. **Deploy Automático**: Render redeploy automaticamente

### 🧪 **Passo 4: Verificar Funcionamento**

```bash
# Teste health check
curl https://medcheck-backend.onrender.com/health

# Deve mostrar "database":"connected" em vez de SQLite
```

## 📋 **Checklist de Verificação**

- [ ] PostgreSQL criado no Render
- [ ] DATABASE_URL configurada no backend
- [ ] Backend redeployado automaticamente
- [ ] Health check mostra PostgreSQL connected
- [ ] Logs não mostram erros de banco

## 🔧 **Dependências Já Configuradas**

✅ **psycopg2-binary**: Já instalado no requirements.txt  
✅ **SQLAlchemy**: Configurado para PostgreSQL  
✅ **Connection pooling**: Otimizado para Render

## ⚡ **Comandos de Verificação**

```bash
# Health check
curl https://medcheck-backend.onrender.com/health

# Teste de endpoints que usam banco
curl -X POST https://medcheck-backend.onrender.com/token \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Deve retornar erro de validação (422), não erro de banco (500)
```

## 🔄 **Migração Automática**

A aplicação já está configurada para:

- ✅ Criar tabelas automaticamente no primeiro acesso
- ✅ Verificar conexão na inicialização
- ✅ Log de status da conexão

## 🎯 **Resultado Esperado**

Após configuração:

- ✅ Backend usando PostgreSQL real
- ✅ Dados persistentes entre deploys
- ✅ Performance melhorada
- ✅ Pronto para produção

---

**Tempo estimado**: 10-15 minutos  
**Custo**: $0 (PostgreSQL Free tier)  
**Benefício**: Banco persistente e robusto
