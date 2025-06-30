#!/bin/bash

echo "🔍 Verificando status do Vercel Deploy..."
echo "================================================"

# Verificar se o site está acessível
echo "1. Testando acesso ao site principal:"
curl -s -I https://medcheck-app.vercel.app/ | grep -E "(HTTP|last-modified|etag|x-vercel)"
echo ""

# Verificar diferentes URLs do Vercel
echo "2. Testando URLs alternativos:"
echo "   - medcheck-app-git-main-assislucians-projects.vercel.app:"
curl -s -I https://medcheck-app-git-main-assislucians-projects.vercel.app/ | grep -E "(HTTP|last-modified)" || echo "     ❌ Não acessível"
echo ""

echo "   - medcheck-app-assislucians-projects.vercel.app:"
curl -s -I https://medcheck-app-assislucians-projects.vercel.app/ | grep -E "(HTTP|last-modified)" || echo "     ❌ Não acessível"
echo ""

# Verificar logs git recentes
echo "3. Últimos commits no repositório:"
git log --oneline -5
echo ""

# Verificar status do repositório
echo "4. Status do repositório:"
git status --porcelain
echo ""

# Verificar se há webhooks configurados
echo "5. Verificando configuração do projeto:"
if [ -f "vercel.json" ]; then
    echo "   ✅ vercel.json encontrado na raiz"
    cat vercel.json
else
    echo "   ❌ vercel.json não encontrado na raiz"
fi
echo ""

if [ -f "frontend/vercel.json" ]; then
    echo "   ✅ frontend/vercel.json encontrado"
    echo "   Build Command: $(cat frontend/vercel.json | grep -o '"buildCommand":[^,]*' | cut -d'"' -f4)"
    echo "   Output Directory: $(cat frontend/vercel.json | grep -o '"outputDirectory":[^,]*' | cut -d'"' -f4)"
else
    echo "   ❌ frontend/vercel.json não encontrado"
fi
echo ""

echo "6. Possíveis problemas:"
echo "   - Vercel pode estar configurado para deployment automático apenas do branch main"
echo "   - Pode haver rate limiting no Vercel"
echo "   - Configuração do projeto pode estar apontando para pasta errada"
echo "   - Webhooks do GitHub podem estar desabilitados"
echo ""

echo "🔧 Soluções recomendadas:"
echo "   1. Verificar configurações no dashboard do Vercel"
echo "   2. Tentar fazer deploy manual via CLI: vercel --prod"
echo "   3. Verificar se o repositório GitHub está conectado corretamente"
echo "   4. Verificar se há algum erro nos logs de build do Vercel" 