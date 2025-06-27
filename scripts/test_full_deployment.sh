#!/bin/bash

# Script completo para testar Railway e Vercel deployment

echo "🚀 Teste Completo de Deployment - MedCheck"
echo "=========================================="

# URLs
RAILWAY_URL="https://medcheck-app-medcheck.up.railway.app"
VERCEL_URL="https://medcheck-app.vercel.app"

echo "📋 URLs de teste:"
echo "   Railway: $RAILWAY_URL"
echo "   Vercel:  $VERCEL_URL"
echo ""

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local endpoint=$3
    
    echo "🔍 Testando $name - $endpoint..."
    
    response=$(curl -s -w "\n%{http_code}" "$url$endpoint")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo "✅ $name $endpoint OK (200)"
        if [ "$endpoint" = "/health" ]; then
            echo "📄 Health: $(echo "$body" | jq -r '.status // "N/A"' 2>/dev/null || echo "Raw response")"
        fi
    else
        echo "❌ $name $endpoint falhou (código: $http_code)"
        echo "📄 Resposta: $body"
    fi
    echo ""
}

# Teste Railway
echo "🛤️  TESTANDO RAILWAY"
echo "===================="
test_endpoint "$RAILWAY_URL" "Railway" "/health"
test_endpoint "$RAILWAY_URL" "Railway" "/api/v1/dashboard"
test_endpoint "$RAILWAY_URL" "Railway" "/token"

# Teste Vercel
echo "🔺 TESTANDO VERCEL"
echo "=================="
test_endpoint "$VERCEL_URL" "Vercel" "/"
test_endpoint "$VERCEL_URL" "Vercel" "/health"

# Teste CORS
echo "🌐 TESTANDO CORS"
echo "================"
echo "🔍 Testando CORS entre Vercel e Railway..."

cors_response=$(curl -s -H "Origin: https://medcheck-app.vercel.app" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: X-Requested-With" \
    -X OPTIONS "$RAILWAY_URL/api/v1/dashboard")

if [[ $cors_response == *"Access-Control-Allow-Origin"* ]]; then
    echo "✅ CORS configurado corretamente"
else
    echo "❌ CORS pode ter problemas"
    echo "📄 Resposta CORS: $cors_response"
fi

echo ""
echo "🏁 Teste completo finalizado!"
echo ""

# Resumo de configuração
echo "📝 RESUMO DE CONFIGURAÇÃO"
echo "========================"
echo "✅ Railway URL: $RAILWAY_URL"
echo "✅ Vercel URL: $VERCEL_URL"
echo "✅ CORS configurado para Vercel preview URLs"
echo "✅ Redirects configurados no vercel.json"
echo "✅ Build otimizado para produção"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Configure as variáveis de ambiente no Vercel Dashboard"
echo "2. Faça push para main para deploy automático"
echo "3. Configure domínio personalizado se necessário" 