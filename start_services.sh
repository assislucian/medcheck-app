#!/bin/bash
set -e

echo "🚀 Iniciando serviços do MedCheck..."

# Ativar ambiente virtual
source .venv/bin/activate

# Matar processos existentes
pkill -f "uvicorn\|vite" 2>/dev/null || true
sleep 2

# Iniciar backend
echo "🔧 Iniciando backend..."
python -m uvicorn src.api:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Aguardar backend inicializar
sleep 5

# Testar backend
echo "🔍 Testando backend..."
if curl -f -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend funcionando na porta 8000"
else
    echo "❌ Backend não está respondendo"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Iniciar frontend
echo "🎨 Iniciando frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "🎉 Serviços iniciados!"
echo "📊 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:8080 (ou próxima porta disponível)"
echo "📚 Docs: http://localhost:8000/docs"
echo ""
echo "Para parar os serviços: pkill -f 'uvicorn|vite'"
echo ""
echo "Pressione Ctrl+C para finalizar..."

# Aguardar interrupção
trap "echo 'Finalizando serviços...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" INT
wait 