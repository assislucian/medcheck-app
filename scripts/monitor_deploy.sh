#!/bin/bash

echo "🔍 Monitorando deploy da Railway..."
echo "URL: https://medcheck-app-medcheck.up.railway.app/health"
echo "Testando a cada 30 segundos..."
echo ""

COUNTER=1
MAX_ATTEMPTS=20

while [ $COUNTER -le $MAX_ATTEMPTS ]; do
    echo "[$COUNTER/$MAX_ATTEMPTS] Tentativa $(date '+%H:%M:%S')..."
    
    # Testar health endpoint
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://medcheck-app-medcheck.up.railway.app/health)
    
    if [ "$RESPONSE" = "200" ]; then
        echo "✅ SUCCESS! Railway está funcionando!"
        echo ""
        echo "🧪 Testando endpoint /token..."
        
        # Testar endpoint de token
        TOKEN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://medcheck-app-medcheck.up.railway.app/token \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "username=test&password=test")
        
        if [ "$TOKEN_RESPONSE" = "401" ] || [ "$TOKEN_RESPONSE" = "422" ]; then
            echo "✅ Token endpoint respondendo corretamente (${TOKEN_RESPONSE})"
            echo ""
            echo "🎉 DEPLOY COMPLETO E FUNCIONANDO!"
            echo "🌐 Frontend pode agora conectar sem erros CORS"
            exit 0
        else
            echo "⚠️  Token endpoint retornou: $TOKEN_RESPONSE"
        fi
        
        break
    else
        echo "❌ Health check falhou: HTTP $RESPONSE"
    fi
    
    if [ $COUNTER -eq $MAX_ATTEMPTS ]; then
        echo ""
        echo "💥 TIMEOUT: Deploy não ficou saudável em 10 minutos"
        echo "📋 Próximos passos:"
        echo "   1. Verifique logs: railway logs --service medcheck-app"
        echo "   2. Verifique painel: https://railway.app/dashboard"
        exit 1
    fi
    
    echo "⏳ Aguardando 30s..."
    echo ""
    sleep 30
    COUNTER=$((COUNTER + 1))
done 