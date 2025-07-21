# 🚀 Desenvolvimento Local - MedCheck

## Visão Geral

Este documento explica como configurar e executar o MedCheck localmente para desenvolvimento, **usando configurações IDÊNTICAS ao Render** para garantir que o que funciona localmente funcione na produção.

## 📋 Pré-requisitos

- Python 3.8+
- Node.js 16+ (para frontend)
- Git

## 🔧 Configuração Rápida

### 1. Configurar Ambiente Local (IDÊNTICO ao Render)

```bash
# O arquivo .env já contém as configurações do Render
source .env

# Ou usar o script automatizado
./scripts/dev.sh
```

### 2. Iniciar Backend

```bash
# Método 1: Script automatizado (recomendado)
./scripts/dev.sh

# Método 2: Manual
source .env
python -m uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Iniciar Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Configurações de Autenticação

### Arquivo `.env` (IDÊNTICO ao Render)

```bash
# Ambiente
ENV=production

# Autenticação JWT (mesmo secret do Render)
JWT_SECRET=bQ7nP4yZrS1wV8kC5mT2xA9dL3fH6gJ0
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Admin Secret (mesmo do Render)
ADMIN_SECRET=bQ7nP4yZrS1wV8kC5mT2xA9dL3fH6gJ0

# CORS (mesmo do Render)
FRONTEND_ORIGINS=https://medcheck-app.vercel.app,https://medcheck-app-assislucians-projects.vercel.app
FRONTEND_ORIGIN_REGEX=https://medcheck-app-[a-z0-9-]+-assislucians-projects\.vercel\.app
```

### Credenciais de Teste

- **CRM**: 6091
- **UF**: AC
- **Senha**: @Luassis90

## 🌐 URLs de Desenvolvimento

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔍 Debug e Logs

### Logs do Backend

```bash
# Ver logs em tempo real
tail -f logs/medcheck_audit.log

# Logs de debug do parser
grep "DEBUG" logs/medcheck_audit.log
```

### Logs do Frontend

```bash
# No console do navegador
# F12 → Console
```

## 🚨 Problemas Comuns

### Erro 401 Unauthorized

**Causa**: JWT_SECRET diferente entre local e produção

**Solução**:
```bash
# Verificar configuração
echo $JWT_SECRET

# Deve ser: bQ7nP4yZrS1wV8kC5mT2xA9dL3fH6gJ0
# Recarregar configurações
source .env
```

### Parser não encontra marcadores

**Causa**: PDFs com formato diferente

**Solução**: Logs de debug são normais, não são erros:
```
[DEBUG] Marcador [PM] HONORÁRIOS não encontrado!
```

### CORS Errors

**Causa**: Frontend tentando acessar backend

**Solução**: Verificar FRONTEND_ORIGINS no .env (deve ser igual ao Render)

## 🔄 Fluxo de Desenvolvimento

### 1. Desenvolvimento Local
```bash
# Fazer alterações no código
# Testar localmente com configurações IDÊNTICAS ao Render
./scripts/dev.sh
```

### 2. Commit para GitHub
```bash
# Quando tudo estiver funcionando
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### 3. Deploy Automático
- Render detecta mudanças no GitHub
- Deploy automático para produção
- **Configurações IDÊNTICAS garantem compatibilidade**

## 📁 Estrutura de Arquivos

```
backend_test/
├── .env                    # Configurações IDÊNTICAS ao Render
├── .env.example           # Exemplo de configurações
├── scripts/dev.sh         # Script de desenvolvimento
├── src/api.py             # Backend principal
└── frontend/              # Frontend React
```

## 🛡️ Segurança

### Arquivos Versionados

- `.env` - Configurações de produção (IDÊNTICAS ao Render)
- `scripts/dev.sh` - Script de desenvolvimento
- `src/` - Código fonte

### Arquivos Não Versionados

- `logs/` - Logs de desenvolvimento
- `uploads/` - Arquivos temporários
- `medicos.db` - Banco local

### Variáveis de Ambiente

- **Local**: `.env` (IDÊNTICO ao Render)
- **Produção**: Render Environment Variables (IDÊNTICO ao .env)
- **Teste**: `.env.test` (testes automatizados)

## 🧪 Testes

```bash
# Testes unitários
python -m pytest tests/

# Testes de integração
python -m pytest tests/integration/

# Testes E2E
npm run test:e2e
```

## 📊 Monitoramento

### Health Check

```bash
curl http://localhost:8000/health
```

### Métricas de Performance

```bash
# Verificar uso de memória
ps aux | grep uvicorn

# Verificar conexões
netstat -an | grep 8000
```

## 🆘 Suporte

### Logs Detalhados

```bash
# Ativar logs debug
export LOG_LEVEL=DEBUG
./scripts/dev.sh
```

### Reset do Ambiente

```bash
# Limpar dados locais
rm -rf uploads/* results/* logs/*
rm medicos.db

# Recriar ambiente
./scripts/dev.sh
```

### Verificar Compatibilidade

```bash
# Comparar configurações locais com Render
echo "Local JWT_SECRET: $JWT_SECRET"
echo "Local ENV: $ENV"
echo "Local ADMIN_SECRET: $ADMIN_SECRET"
```

---

## ✅ Checklist de Desenvolvimento

- [ ] `.env` configurado (IDÊNTICO ao Render)
- [ ] Backend rodando na porta 8000
- [ ] Frontend rodando na porta 5173
- [ ] Login funcionando (CRM: 6091, UF: AC)
- [ ] Upload de arquivos funcionando
- [ ] Parser extraindo dados corretamente
- [ ] Cross-reference guias ↔ demonstrativos OK
- [ ] Testes passando
- [ ] Código commitado no GitHub
- [ ] Deploy no Render funcionando

---

## 🎯 **PRINCÍPIO FUNDAMENTAL**

**Configurações IDÊNTICAS = Compatibilidade Garantida**

- ✅ **Local**: `.env` com configurações do Render
- ✅ **Produção**: Render com mesmas configurações
- ✅ **Resultado**: O que funciona localmente funciona na produção

**Benefícios:**
- 🚀 Deploy sem surpresas
- 🔧 Debug mais fácil
- 🛡️ Segurança consistente
- 📊 Performance previsível

---

**🎯 Objetivo**: Manter desenvolvimento local **IDÊNTICO** à produção, garantindo que commits para GitHub funcionem perfeitamente no Render. 