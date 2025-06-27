#!/bin/bash

# Script de teste para verificar se o Railway está funcionando corretamente

echo "🚀 Testando deployment do Railway..."

# URL do serviço
RAILWAY_URL="https://medcheck-app-medcheck.up.railway.app"

echo "📋 URL do serviço: $RAILWAY_URL"

# Teste 1: Health check
echo "🔍 Testando health check..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$RAILWAY_URL/health")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HEALTH_CODE" = "200" ]; then
    echo "✅ Health check OK (200)"
    echo "📄 Resposta: $HEALTH_BODY"
else
    echo "❌ Health check falhou (código: $HEALTH_CODE)"
    echo "📄 Resposta: $HEALTH_BODY"
fi

# Teste 2: Endpoint raiz
echo "🔍 Testando endpoint raiz..."
ROOT_RESPONSE=$(curl -s -w "\n%{http_code}" "$RAILWAY_URL/")
ROOT_CODE=$(echo "$ROOT_RESPONSE" | tail -n1)
ROOT_BODY=$(echo "$ROOT_RESPONSE" | head -n -1)

if [ "$ROOT_CODE" = "200" ]; then
    echo "✅ Endpoint raiz OK (200)"
    echo "📄 Resposta: $ROOT_BODY"
else
    echo "❌ Endpoint raiz falhou (código: $ROOT_CODE)"
    echo "📄 Resposta: $ROOT_BODY"
fi

# Teste 3: CORS preflight
echo "🔍 Testando CORS preflight..."
CORS_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X OPTIONS \
    -H "Origin: https://medcheck-prddbw64p-assislucians-projects.vercel.app" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    "$RAILWAY_URL/token")
CORS_CODE=$(echo "$CORS_RESPONSE" | tail -n1)

if [ "$CORS_CODE" = "200" ]; then
    echo "✅ CORS preflight OK (200)"
else
    echo "❌ CORS preflight falhou (código: $CORS_CODE)"
fi

# Teste 4: Endpoint de login (deve retornar 422 sem dados)
echo "🔍 Testando endpoint de login..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    "$RAILWAY_URL/token")
LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)

if [ "$LOGIN_CODE" = "422" ]; then
    echo "✅ Endpoint de login OK (422 - dados faltando como esperado)"
else
    echo "❌ Endpoint de login retornou código inesperado: $LOGIN_CODE"
fi

echo "🏁 Testes concluídos!"

# Verificar logs recentes
echo "📋 Verificando logs recentes do Railway..."
railway logs --num 20 2>/dev/null || echo "⚠️  Não foi possível obter logs do Railway"

echo "✨ Script de teste finalizado!" 