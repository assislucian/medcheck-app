#!/bin/bash

set -e

echo "🚀 Configurando Vercel do ZERO - Melhores Práticas"
echo "=================================================="

# Verificar se está no diretório correto
if [ ! -d "frontend" ]; then
    echo "❌ Execute este script na raiz do projeto (onde está a pasta frontend)"
    exit 1
fi

echo "📋 Verificando dependências..."
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel@latest
fi

echo "📂 Entrando no diretório frontend..."
cd frontend

echo "🧹 Limpando configurações antigas..."
rm -rf .vercel
rm -rf node_modules/.cache
rm -rf dist

echo "📦 Instalando dependências..."
npm ci --prefer-offline --no-audit

echo "🔧 Verificando build local..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build falhou. Corrija os erros antes de continuar."
    exit 1
fi

echo "✅ Build local OK!"

echo "🔗 Configurando Vercel..."
echo "   - Framework: Vite"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Install Command: npm ci --prefer-offline --no-audit"

# Configurar Vercel interativamente
vercel

echo ""
echo "🎯 CONFIGURAÇÕES IMPORTANTES NO DASHBOARD:"
echo "==========================================="
echo "1. Acesse: https://vercel.com/dashboard"
echo "2. Vá para o projeto 'medcheck-app'"
echo "3. Settings > General:"
echo "   ✅ Framework Preset: Vite"
echo "   ✅ Root Directory: frontend"
echo "   ✅ Build Command: npm run build"
echo "   ✅ Output Directory: dist"
echo "   ✅ Install Command: npm ci --prefer-offline --no-audit"
echo ""
echo "4. Settings > Environment Variables:"
echo "   ✅ VITE_API_URL = https://medcheck-app-medcheck.up.railway.app"
echo "   ✅ VITE_APP_ENV = production"
echo "   ✅ NODE_ENV = production"
echo ""
echo "5. Settings > Git:"
echo "   ✅ Production Branch: main"
echo "   ✅ Automatic deployments: Enabled"
echo ""
echo "6. Settings > Functions:"
echo "   ✅ Region: Frankfurt (fra1)"
echo ""

echo "🚀 Fazendo primeiro deploy..."
vercel --prod

echo ""
echo "✅ SETUP COMPLETO!"
echo "=================="
echo "🌐 Seu site será deployado automaticamente a cada push para main"
echo "📊 Dashboard: https://vercel.com/dashboard"
echo "🔧 CLI: vercel --help"
echo ""
echo "📋 Comandos úteis:"
echo "  vercel ls               # Listar deployments"
echo "  vercel logs             # Ver logs"
echo "  vercel --prod           # Deploy manual para produção"
echo "  vercel inspect [url]    # Inspecionar deployment"
echo ""
echo "🎉 Configuração do Vercel concluída com sucesso!" 