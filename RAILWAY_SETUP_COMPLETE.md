# 🚂 RAILWAY + VERCEL - SETUP COMPLETO

## 📋 CHECKLIST DE MIGRAÇÃO

### ✅ 1. PREPARAÇÃO (COMPLETA)
- [x] Configurações do Neon removidas
- [x] Frontend adaptado para Railway
- [x] Dockerfile.railway criado
- [x] railway.json configurado
- [x] SQL de setup criado

### ⏳ 2. RAILWAY SETUP (FAZER AGORA)

#### A. Criar Conta Railway
1. Acesse: https://railway.app
2. Login com GitHub
3. Conecte este repositório

#### B. Configurar PostgreSQL
1. **New Project** → **Provision PostgreSQL**
2. Espere o deploy completar
3. Acesse **PostgreSQL** → **Connect** 
4. Copie a `DATABASE_URL`

#### C. Configurar Backend
1. **New Service** → **GitHub Repo** → `medcheck-app`
2. **Environment Variables**:
```bash
DATABASE_URL=postgresql://postgres:password@hostname:port/dbname
JWT_SECRET=sua_jwt_secret_256bit_segura
FRONTEND_ORIGINS=https://medcheck-app-vercel.vercel.app
NODE_ENV=production
PYTHONPATH=/app
```

#### D. Configurar Deploy
1. **Settings** → **Build & Deploy**
2. **Root Directory**: `/` (raiz)
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `python -m uvicorn src.api:app --host 0.0.0.0 --port $PORT`
5. **Dockerfile**: `Dockerfile.railway`

### ⏳ 3. VERCEL SETUP (FAZER DEPOIS)

#### A. Deploy Frontend
```bash
cd frontend
npm run build
npx vercel --prod
```

#### B. Environment Variables (Vercel)
```bash
VITE_API_URL=https://medcheck-backend-production.up.railway.app
```

## 🔧 ENVIRONMENT VARIABLES NECESSÁRIAS

### Railway Backend
```bash
DATABASE_URL=postgresql://postgres:***@***:5432/railway
JWT_SECRET=sua_chave_secreta_256_bits
FRONTEND_ORIGINS=https://sua-app.vercel.app,http://localhost:5173
NODE_ENV=production
PYTHONPATH=/app
```

### Vercel Frontend  
```bash
VITE_API_URL=https://medcheck-backend-production.up.railway.app
```

## 📊 CONFIGURAÇÃO DO BANCO

### 1. Executar SQL no Railway
1. Railway → PostgreSQL → **Query**
2. Copie e cole: `setup_railway_db.sql`
3. Execute para criar tabelas

### 2. Testar Conexão
```bash
curl https://medcheck-backend-production.up.railway.app/health
```

## 🔗 INTEGRAÇÃO RAILWAY + VERCEL

### Auto-Detection
O frontend detecta automaticamente:
- `vercel.app` → Usa Railway backend
- `railway.app` → Usa Railway backend  
- Local → Usa `localhost:8000`

### Logs de Debug
Console mostrará:
```javascript
🔧 API_BASE: Vercel detected, using Railway backend = https://medcheck-backend-production.up.railway.app
```

## 🚀 FLUXO DE DEPLOY

### Railway (Backend)
```bash
git push origin main
# Auto-deploy via GitHub
```

### Vercel (Frontend)
```bash
cd frontend && npm run build
npx vercel --prod
```

## ✅ VERIFICAÇÃO FINAL

### 1. Backend Railway
- [ ] Deploy successful
- [ ] Health endpoint: `/health` → 200
- [ ] Database conectado
- [ ] Environment variables configuradas

### 2. Frontend Vercel
- [ ] Deploy successful  
- [ ] Console logs mostram Railway backend
- [ ] Login funcionando
- [ ] Dados carregando

### 3. Integração
- [ ] CORS funcionando
- [ ] API calls sucesso
- [ ] Demonstrativos carregando
- [ ] Crosscheck funcionando

## 🔧 TROUBLESHOOTING

### Backend não conecta database:
```bash
# Verifique DATABASE_URL no Railway
echo $DATABASE_URL
```

### Frontend não encontra backend:
```bash
# Verifique console F12
# Deve mostrar: "Railway backend = https://..."
```

### CORS errors:
```bash
# Adicione seu domínio Vercel em FRONTEND_ORIGINS
FRONTEND_ORIGINS=https://sua-app.vercel.app
```

## 📈 VANTAGENS RAILWAY + VERCEL

### ✅ Railway
- PostgreSQL managed
- Auto-scaling
- Deploy via Git
- Monitoring built-in

### ✅ Vercel  
- Deploy instantâneo
- CDN global
- Perfect for React

### ✅ Integração
- Zero configuration
- Auto-detection
- Robust fallbacks