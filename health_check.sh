#!/bin/bash

echo "🏥 Verificação de Saúde do Backend MedCheck"
echo "=========================================="

# Verificar se o backend está rodando
if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend está ONLINE"
    echo "📊 Status:"
    curl -s http://localhost:8000/health | python3 -m json.tool
    
    echo -e "\n🧪 Testando endpoint de token..."
    response=$(curl -s -w "%{http_code}" -X POST "http://localhost:8000/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=6091&password=@Luassis90&uf=AC" \
        -o /tmp/token_response.json)
    
    if [ "$response" = "200" ]; then
        echo "✅ Endpoint de token funcionando"
        echo "🔑 Resposta:"
        cat /tmp/token_response.json | python3 -m json.tool
        rm -f /tmp/token_response.json
    else
        echo "❌ Endpoint de token com problemas (HTTP $response)"
        cat /tmp/token_response.json
        rm -f /tmp/token_response.json
    fi
    
else
    echo "❌ Backend está OFFLINE ou não responde"
    echo "💡 Para iniciar: ./start_backend_fixed.sh"
fi
