#!/bin/bash

# Script para desenvolvimento local do MedCheck
# Usa configurações IDÊNTICAS ao Render para garantir compatibilidade

echo "🚀 Iniciando MedCheck em modo desenvolvimento..."
echo "📋 Usando configurações IDÊNTICAS ao Render..."

# Carregar variáveis de ambiente do .env
if [ -f .env ]; then
    echo "📋 Carregando configurações do .env..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Criando .env com configurações do Render..."
    
    cat > .env << EOF
# Configurações IDÊNTICAS ao Render para desenvolvimento local
# Este arquivo replica exatamente as configurações de produção

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

# Banco de dados local (SQLite para desenvolvimento)
DATABASE_URL=sqlite:///./medicos.db

# Configurações de desenvolvimento
SKIP_AUTH=false
CRM_LOGADO=6091
UF_LOGADO=AC

# Diretórios
UPLOAD_DIR=uploads
RESULTS_DIR=results
EOF
    
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verificar se as variáveis críticas estão definidas
if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET não está definido!"
    exit 1
fi

echo "✅ JWT_SECRET configurado: ${JWT_SECRET:0:10}..."
echo "✅ JWT_ALGORITHM: $JWT_ALGORITHM"
echo "✅ ACCESS_TOKEN_EXPIRE_MINUTES: $ACCESS_TOKEN_EXPIRE_MINUTES"
echo "✅ ENV: $ENV"
echo "✅ ADMIN_SECRET: ${ADMIN_SECRET:0:10}..."

# Criar diretórios necessários
mkdir -p uploads results logs

echo "🎯 Iniciando backend na porta 8000..."
echo "📱 Frontend deve estar rodando em http://localhost:5173"
echo "🔗 API disponível em http://localhost:8000"
echo "📚 Docs em http://localhost:8000/docs"
echo ""
echo "💡 Para parar: Ctrl+C"
echo ""

# Iniciar o backend
python -m uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload 