# 🔧 TEMPLATE DE VARIÁVEIS DE AMBIENTE - MEDCHECK

**Para configuração segura em produção**

---

## 📋 INSTRUÇÕES DE USO

1. **Copie as variáveis necessárias** para seu ambiente
2. **Gere chaves seguras** para JWT_SECRET e ADMIN_SECRET
3. **Configure URLs** do seu deployment
4. **Mantenha segredos seguros** - nunca versione arquivos .env!

---

## 🔐 VARIÁVEIS OBRIGATÓRIAS

### **Ambiente e Segurança**
```env
ENV=production
DEBUG=false
PORT=10000

JWT_SECRET=your-super-secure-256-bit-jwt-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_SECRET=your-super-secure-admin-secret-here
```

### **CORS e Origens**
```env
CORS_ALLOWED_ORIGINS=https://medcheck-frontend.onrender.com,https://your-domain.com
FRONTEND_ORIGINS=https://medcheck-frontend.onrender.com
FRONTEND_ORIGIN_REGEX=https://(.*\.)?medcheck.*\.onrender\.com
```

### **Banco de Dados**
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## ⚡ VARIÁVEIS DE PERFORMANCE

```env
CACHE_TTL=300
ENABLE_PERFORMANCE_OPTIMIZATIONS=true
LOG_LEVEL=INFO
DISABLE_RATE_LIMIT=false
RATE_LIMIT_PER_MINUTE=60
```

---

## 🎨 FRONTEND (React/Vite)

**Arquivo: `frontend/.env`**
```env
VITE_API_URL=https://medcheck-backend.onrender.com
NODE_ENV=production
VITE_ENABLE_CACHE=true
VITE_PERFORMANCE_MODE=optimized
VITE_BUILD_SOURCEMAP=false
VITE_TERSER_DROP_CONSOLE=true
```

---

## 🛠️ DESENVOLVIMENTO (DESABILITAR EM PRODUÇÃO)

```env
# APENAS para desenvolvimento - NÃO usar em produção!
SKIP_AUTH=false
# CRM_LOGADO=
# UF_LOGADO=
```

---

## 🔑 GERANDO CHAVES SEGURAS

### **JWT Secret (256-bit)**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### **Admin Secret (256-bit)**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📋 CONFIGURAÇÃO NO RENDER

### **Backend Service**
1. **Dashboard → Web Service → Environment**
2. **Adicionar todas as variáveis acima**
3. **Usar "Generate Value" para JWT_SECRET**
4. **Conectar DATABASE_URL automaticamente**

### **Frontend Service**
1. **Dashboard → Web Service → Environment**
2. **Adicionar variáveis VITE_***
3. **Configurar VITE_API_URL para URL do backend**

---

## ✅ CHECKLIST DE SEGURANÇA

- [ ] ENV=production configurado
- [ ] DEBUG=false configurado
- [ ] JWT_SECRET gerado com 256 bits
- [ ] ADMIN_SECRET gerado com 256 bits
- [ ] CORS_ALLOWED_ORIGINS configurado corretamente
- [ ] DATABASE_URL configurado
- [ ] SKIP_AUTH=false (ou removido)
- [ ] Rate limiting ativado
- [ ] Logs em nível INFO ou superior

---

## 🚨 SEGURANÇA CRÍTICA

⚠️ **NUNCA:**
- Versionar arquivos .env
- Usar senhas padrão
- Expor segredos em logs
- Usar SKIP_AUTH=true em produção

✅ **SEMPRE:**
- Gerar chaves únicas
- Usar HTTPS em produção
- Monitorar logs de segurança
- Rotacionar chaves periodicamente

---

**Template atualizado: Janeiro 2025** 