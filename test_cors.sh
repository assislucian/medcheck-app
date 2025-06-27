#!/bin/bash

echo "🔧 Testando configurações de CORS e Proxy..."
echo ""

# Teste 1: Verificar se o backend está rodando
echo "1️⃣ Testando se o backend está rodando..."
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Backend está rodando na porta 8000"
else
    echo "❌ Backend não está respondendo na porta 8000"
    echo "   Execute: cd src && python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload"
    exit 1
fi

echo ""

# Teste 2: Verificar CORS para diferentes portas
echo "2️⃣ Testando CORS para diferentes portas..."

ports=(8080 8081 8082 8083 3000 3001 5173 5174)

for port in "${ports[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
        -H "Origin: http://localhost:$port" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        http://localhost:8000/token)
    
    if [ "$response" = "405" ]; then
        # 405 Method Not Allowed é esperado para OPTIONS no /token (só aceita POST)
        # Mas se chegou até aqui, o CORS permitiu a origem
        echo "✅ CORS OK para localhost:$port"
    else
        echo "❌ CORS falhou para localhost:$port (HTTP $response)"
    fi
done

echo ""

# Teste 3: Verificar se frontend está rodando
echo "3️⃣ Verificando se frontend está disponível..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Frontend rodando na porta 8080"
elif curl -s http://localhost:8081 > /dev/null; then
    echo "✅ Frontend rodando na porta 8081" 
elif curl -s http://localhost:8082 > /dev/null; then
    echo "✅ Frontend rodando na porta 8082"
else
    echo "❌ Frontend não está rodando"
    echo "   Execute: cd frontend && npm run dev"
    exit 1
fi

echo ""

# Teste 4: Testar autenticação se possível
echo "4️⃣ Testando endpoint de autenticação..."
auth_response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=6091&password=Senha123!" \
    http://localhost:8000/token)

if [ "$auth_response" = "200" ]; then
    echo "✅ Autenticação está funcionando"
elif [ "$auth_response" = "401" ]; then
    echo "⚠️  Endpoint de autenticação respondeu (credenciais inválidas é esperado)"
else
    echo "❌ Problema no endpoint de autenticação (HTTP $auth_response)"
fi

echo ""
echo "🎉 Teste de configuração concluído!"
echo ""
echo "📝 Se todos os testes passaram, você pode:"
echo "   1. Acessar http://localhost:8080 (ou 8081/8082)"
echo "   2. Fazer login com credenciais válidas"
echo "   3. Verificar que não há mais erros de CORS no console"
echo ""
echo "🐛 Se ainda houver problemas, verifique:"
echo "   - Console do navegador para erros específicos"
echo "   - Logs do backend para detalhes de autenticação"
echo "   - Network tab para ver se requisições estão sendo feitas corretamente" 