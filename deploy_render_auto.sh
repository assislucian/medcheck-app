#!/bin/bash

echo "🚀 SCRIPT AUTOMÁTICO PARA DEPLOY NO RENDER"
echo ""
echo "✅ CÓDIGO: No GitHub (https://github.com/assislucian/medcheck-app)"
echo "✅ BLUEPRINT: render.yaml configurado"
echo ""
echo "🔗 EXECUTANDO DEPLOY AUTOMÁTICO..."
echo ""

# Criar arquivo temporário com configuração
cat > render_deploy_info.json << 'EOL'
{
  "repository": "https://github.com/assislucian/medcheck-app",
  "branch": "main", 
  "blueprint": "render.yaml",
  "services": [
    {
      "name": "medcheck-database",
      "type": "postgresql",
      "plan": "free",
      "region": "frankfurt"
    },
    {
      "name": "medcheck-backend", 
      "type": "web",
      "runtime": "python",
      "buildCommand": "pip install -r requirements.txt",
      "startCommand": "uvicorn src.api_render_production:app --host 0.0.0.0 --port $PORT",
      "plan": "free",
      "region": "frankfurt"
    },
    {
      "name": "medcheck-frontend",
      "type": "web", 
      "runtime": "node",
      "rootDir": "frontend",
      "buildCommand": "npm ci && npm run build",
      "startCommand": "npm run preview -- --host 0.0.0.0 --port $PORT",
      "plan": "free",
      "region": "frankfurt"
    }
  ]
}
EOL

echo "📊 CONFIGURAÇÃO GERADA EM: render_deploy_info.json"
echo ""
echo "🎯 PRÓXIMO PASSO: ACESSE O LINK ABAIXO PARA FAZER DEPLOY:"
echo ""
echo "   https://dashboard.render.com/create?type=blueprint"
echo ""
echo "🔧 INSTRUÇÕES:"
echo "1. Cole o URL do repositório: https://github.com/assislucian/medcheck-app"
echo "2. Selecione branch: main"
echo "3. Clique em 'Apply' - O Render detectará automaticamente o render.yaml"
echo ""
echo "⏱️  TEMPO ESTIMADO: 10-15 minutos"
echo ""
echo "🎊 URLS FINAIS (após deploy):"
echo "   Frontend: https://medcheck-frontend.onrender.com"
echo "   Backend:  https://medcheck-backend.onrender.com"
echo "   API Docs: https://medcheck-backend.onrender.com/docs"

