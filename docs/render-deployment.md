# 🚀 Deploy no Render - Guia Completo

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com)
2. Repositório GitHub com o código
3. PostgreSQL database configurado

## 🔧 Configuração das Variáveis de Ambiente

Configure estas variáveis no painel do Render:

### 🛡️ Segurança Obrigatória

```
JWT_SECRET=sua-chave-secreta-super-forte-aqui-mude-antes-do-deploy-32-chars-min
JWT_EXPIRE_MINUTES=60
ENV=production
DEBUG=false
```

### 🌐 CORS - Frontend

```
CORS_ALLOWED_ORIGINS=https://seu-frontend.vercel.app,https://seu-frontend-staging.vercel.app
```

### 🗄️ Banco de Dados

```
# Será fornecido automaticamente pelo Render PostgreSQL
DATABASE_URL=postgresql://user:password@hostname:port/database
```

### ⚡ Performance

```
RATE_LIMIT=10 per minute
LOG_LEVEL=INFO
```

## 📦 Configuração do Serviço

### 1. Web Service

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python -m uvicorn src.api:app --host 0.0.0.0 --port $PORT --workers 2 --loop uvloop --http httptools --log-level warning --access-log --no-use-colors`
- **Environment**: `Python 3.11+`

### 2. PostgreSQL Database

- Crie um PostgreSQL database no Render
- Copie a `DATABASE_URL` para as variáveis do web service

## 🔍 Health Checks

O sistema possui endpoints para monitoramento:

- `/health` - Verificação básica de saúde
- `/docs` - Documentação da API (Swagger)

## 🛠️ Configurações de Produção Aplicadas

### ✅ Segurança

- Headers de segurança configurados
- Rate limiting ativo
- Autenticação obrigatória
- CORS restritivo

### ✅ Performance

- Queries otimizadas
- Índices no banco
- Connection pooling
- Timeouts configurados

### ✅ Monitoramento

- Logs estruturados
- Health checks
- Error tracking

## 🚨 Checklist Pré-Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] JWT_SECRET gerado (32+ caracteres)
- [ ] CORS configurado para URLs do frontend
- [ ] Database PostgreSQL criado
- [ ] Testes de produção executados
- [ ] Rate limiting configurado

## 🔧 Comandos Úteis

### Executar localmente com configurações de produção:

```bash
ENV=production DEBUG=false uvicorn src.api:app --host 0.0.0.0 --port 8000
```

### Testar health check:

```bash
curl https://seu-app.onrender.com/health
```

### Verificar docs:

```bash
curl https://seu-app.onrender.com/docs
```

## 🐛 Troubleshooting

### Database Connection Issues

- Verificar se DATABASE_URL está correto
- Confirmar se o PostgreSQL está ativo
- Testar conexão via `/health`

### CORS Errors

- Verificar CORS_ALLOWED_ORIGINS
- Incluir todas as URLs do frontend
- Não usar wildcard (\*) em produção

### Performance Issues

- Monitorar logs no Render
- Verificar rate limiting
- Analisar queries lentas

## 📊 Monitoramento Pós-Deploy

1. **Health Check**: GET `/health`
2. **API Docs**: GET `/docs`
3. **Logs**: Painel do Render
4. **Metrics**: Built-in monitoring do Render
