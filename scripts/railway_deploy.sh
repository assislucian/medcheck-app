#!/bin/bash

# Script de Deploy para Railway
echo "🚀 Iniciando deploy no Railway..."

# Verifica se o Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado. Instale com:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Função para gerar secrets seguros
generate_secret() {
    python3 -c "import secrets; print(secrets.token_urlsafe(32))"
}

echo "🔧 Configurando variáveis de ambiente..."

# Gera secrets se não existirem
if [ -z "$(railway variables get JWT_SECRET 2>/dev/null)" ]; then
    JWT_SECRET=$(generate_secret)
    echo "🔐 Configurando JWT_SECRET..."
    railway variables set JWT_SECRET="$JWT_SECRET"
fi

if [ -z "$(railway variables get ADMIN_SECRET 2>/dev/null)" ]; then
    ADMIN_SECRET=$(generate_secret)
    echo "🔐 Configurando ADMIN_SECRET..."
    railway variables set ADMIN_SECRET="$ADMIN_SECRET"
fi

# Configura outras variáveis essenciais
echo "🌍 Configurando ENV=production..."
railway variables set ENV="production"

echo "🔗 Configurando CORS..."
railway variables set CORS_ORIGINS="https://medcheck.app,https://www.medcheck.app"

echo "📁 Configurando diretórios..."
railway variables set UPLOAD_DIR="./uploads"
railway variables set RESULTS_DIR="./results"

# Verifica se o banco está configurado
if [ -z "$(railway variables get DATABASE_URL 2>/dev/null)" ]; then
    echo "⚠️  DATABASE_URL não configurada. Configure manualmente:"
    echo "   railway add postgresql"
    echo "   ou"
    echo "   railway variables set DATABASE_URL='postgresql://user:pass@host:port/db'"
fi

echo "📤 Fazendo deploy..."
railway up

echo "✅ Deploy concluído! Verifique em:"
echo "   https://railway.app/dashboard"
echo ""
echo "📋 Para testar a aplicação:"
echo "   curl https://[seu-app].railway.app/healthz" 