#!/bin/bash

# Script para desenvolvimento local - MedCheck
# Configura CORS correto para localhost:5173

echo "🚀 Iniciando ambiente de desenvolvimento local..."
echo "🔧 Configurando CORS para localhost:5173..."

# Configurar variáveis de ambiente para desenvolvimento
export FRONTEND_ORIGINS="http://localhost:5173,https://medcheck-app.vercel.app,https://medcheck-app-assislucians-projects.vercel.app"

# Carregar outras variáveis do .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep -v 'FRONTEND_ORIGINS' | xargs)
fi

# Verificar se JWT_SECRET está definido
if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET não está definido!"
    exit 1
fi

echo "✅ CORS configurado para: $FRONTEND_ORIGINS"
echo "✅ Backend será iniciado em: http://localhost:8000"
echo "✅ Frontend deve estar em: http://localhost:5173"
echo ""
echo "💡 Para parar: Ctrl+C"
echo ""

# Criar diretórios necessários
mkdir -p uploads results logs

# Iniciar o backend
python3 -m uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload