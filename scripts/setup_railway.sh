#!/bin/bash

# Setup script para Railway deployment
echo "🚀 Configurando Railway para MedCheck..."

# Verifica se railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado. Instale com:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Login check
echo "🔐 Verificando login..."
if ! railway whoami &> /dev/null; then
    echo "❌ Faça login primeiro: railway login"
    exit 1
fi

echo "🔧 Configurando variáveis de ambiente..."

# Gera secrets seguros
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_SECRET=$(openssl rand -base64 32)

echo "🔐 Configurando JWT_SECRET..."
railway variables --set JWT_SECRET="$JWT_SECRET"

echo "🔐 Configurando ADMIN_SECRET..."
railway variables --set ADMIN_SECRET="$ADMIN_SECRET"

echo "🌍 Configurando ENV=production..."
railway variables --set ENV=production

echo "🔗 Configurando CORS para Vercel..."
railway variables --set FRONTEND_ORIGINS="https://medcheck-app.vercel.app,https://www.medcheck-app.vercel.app,https://medcheck.app"

echo "🎯 Configurando CORS Regex para preview deployments..."
railway variables --set FRONTEND_ORIGIN_REGEX="https://medcheck-app-[a-z0-9-]+\.vercel\.app"

echo "📁 Configurando diretórios..."
railway variables --set UPLOAD_DIR="/app/uploads"
railway variables --set RESULTS_DIR="/app/results"

echo "⚠️  DATABASE_URL não configurada. Configure manualmente:"
echo "   railway add postgresql"
echo "   ou"
echo "   railway variables --set DATABASE_URL='postgresql://user:pass@host:port/db'"

echo "📤 Fazendo deploy..."
railway up --detach

echo "✅ Deploy concluído! Verifique em:"
echo "   https://railway.app/dashboard"

echo ""
echo "📋 Para testar a aplicação:"
echo "   curl https://[seu-app].railway.app/healthz"

echo ""
echo "🔧 URLs importantes:"
echo "   Health Check: https://[seu-app].railway.app/healthz"
echo "   API Root: https://[seu-app].railway.app/"
echo "   Dashboard: https://[seu-app].railway.app/api/v1/dashboard" 