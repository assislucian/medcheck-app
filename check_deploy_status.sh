#!/bin/bash

# Script para verificar status do deploy no Render

echo "🔍 VERIFICANDO STATUS DO DEPLOY..."
echo "======================================"
echo ""

# URLs para testar
BACKEND_URL="https://medcheck-backend.onrender.com"
FRONTEND_URL="https://medcheck-frontend.onrender.com"

echo "🎯 Testando Backend..."
if curl -s --max-time 10 "$BACKEND_URL/health" > /dev/null; then
    echo "✅ Backend: Online"
    echo "📊 Health check: $(curl -s --max-time 5 "$BACKEND_URL/health" | head -c 100)..."
else
    echo "❌ Backend: Offline ou iniciando..."
fi

echo ""
echo "🎯 Testando Frontend..."
if curl -s --max-time 10 "$FRONTEND_URL" > /dev/null; then
    echo "✅ Frontend: Online"
else
    echo "❌ Frontend: Offline ou iniciando..."
fi

echo ""
echo "🔗 Links úteis:"
echo "   • Dashboard Render: https://dashboard.render.com/"
echo "   • Backend API: $BACKEND_URL"
echo "   • Frontend App: $FRONTEND_URL"
echo "   • API Docs: $BACKEND_URL/docs"
echo ""
echo "⏳ Nota: Deploy pode levar até 5 minutos para completar"