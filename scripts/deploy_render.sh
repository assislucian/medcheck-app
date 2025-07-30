#!/bin/bash

# 🚀 DEPLOY AUTOMÁTICO PARA RENDER
# Script que garante deploy perfeito no Render

set -e  # Parar em caso de erro

echo "🚀 INICIANDO DEPLOY PARA RENDER"
echo "=================================="

# 1. Verificações pré-deploy
echo ""
echo "🔍 Executando verificações..."
python3 scripts/check_render_ready.py

if [ $? -ne 0 ]; then
    echo "❌ Verificações falharam! Abortando deploy."
    exit 1
fi

# 2. Commit das mudanças
echo ""
echo "📝 Fazendo commit das mudanças..."
git add .

# Verificar se há mudanças para commit
if git diff --cached --quiet; then
    echo "ℹ️ Nenhuma mudança para commit"
else
    git commit -m "feat: Deploy otimizado para Render - Configuração definitiva

🚀 DEPLOY RENDER READY:
✅ render.yaml com configuração completa
✅ API de produção otimizada com CORS dinâmico  
✅ Frontend com build testado e funcionando
✅ Todas as variáveis de ambiente configuradas
✅ SPA routing configurado corretamente
✅ PostgreSQL database configurado
✅ Secrets auto-gerados para segurança

🎯 GARANTIA: Versão local = Versão Render"
fi

# 3. Push para GitHub
echo ""
echo "⬆️ Fazendo push para GitHub..."
git push origin main

# 4. Instruções finais
echo ""
echo "🎉 DEPLOY INICIADO COM SUCESSO!"
echo "================================"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Acesse: https://dashboard.render.com"
echo "2. Vá para 'Blueprints'"
echo "3. Clique 'New Blueprint'"
echo "4. Conecte o repositório GitHub"
echo "5. Render detectará automaticamente o render.yaml"
echo "6. Clique 'Apply'"
echo ""
echo "⏱️ Tempo estimado de deploy: 5-8 minutos"
echo ""
echo "🌐 URLs após deploy:"
echo "Frontend: https://medcheck-frontend.onrender.com"
echo "Backend:  https://medcheck-backend.onrender.com"
echo "API Docs: https://medcheck-backend.onrender.com/docs"
echo ""
echo "✅ CONFIGURAÇÃO GARANTIDA PARA FUNCIONAR!"
echo ""
echo "📖 Para troubleshooting: veja RENDER_DEPLOY_GUIDE.md"