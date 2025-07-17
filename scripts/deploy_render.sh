#!/bin/bash

# Script de Deploy para Render
# Execute este script localmente para validar antes do deploy

set -e

echo "🚀 Preparando Deploy para Render..."

# Verificar se estamos no diretório correto
if [ ! -f "src/api.py" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar Python
echo "🐍 Verificando Python..."
python --version || python3 --version

# Verificar dependências
echo "📦 Verificando dependências..."
if [ ! -f "requirements.txt" ]; then
    echo "❌ Arquivo requirements.txt não encontrado"
    exit 1
fi

# Instalar dependências (simular build do Render)
echo "⬇️ Instalando dependências..."
pip install -r requirements.txt

# Executar testes de produção
echo "🔍 Executando testes de produção..."
if [ -f "test_production_readiness.py" ]; then
    python test_production_readiness.py
    if [ $? -ne 0 ]; then
        echo "❌ Testes de produção falharam!"
        exit 1
    fi
else
    echo "⚠️ Arquivo de testes não encontrado, pulando..."
fi

# Verificar variáveis de ambiente necessárias
echo "🔧 Verificando configuração..."
required_vars=("JWT_SECRET" "DATABASE_URL")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "⚠️ Variáveis de ambiente faltando para produção:"
    printf '   - %s\n' "${missing_vars[@]}"
    echo "💡 Configure no painel do Render antes do deploy"
fi

# Simular inicialização
echo "🏃 Testando inicialização da aplicação..."
timeout 10s uvicorn src.api:app --host 0.0.0.0 --port 8000 &
APP_PID=$!

sleep 5

# Testar health check
echo "❤️ Testando health check..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Health check OK"
else
    echo "❌ Health check falhou"
    kill $APP_PID 2>/dev/null || true
    exit 1
fi

# Parar aplicação de teste
kill $APP_PID 2>/dev/null || true

echo ""
echo "🎉 PRÉ-VALIDAÇÃO CONCLUÍDA COM SUCESSO!"
echo ""
echo "📋 PRÓXIMOS PASSOS PARA DEPLOY NO RENDER:"
echo ""
echo "1. 🔗 Conecte seu repositório GitHub ao Render"
echo "2. 🛠️ Configure as variáveis de ambiente:"
echo "   - JWT_SECRET (32+ caracteres)"
echo "   - CORS_ALLOWED_ORIGINS (URLs do frontend)"
echo "   - ENV=production"
echo "   - DEBUG=false"
echo ""
echo "3. 📦 Configure o Web Service:"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: uvicorn src.api:app --host 0.0.0.0 --port \$PORT"
echo "   - Environment: Python 3.11+"
echo ""
echo "4. 🗄️ Crie um PostgreSQL database e configure DATABASE_URL"
echo ""
echo "5. 🚀 Deploy!"
echo ""
echo "📚 Consulte docs/render-deployment.md para detalhes completos" 