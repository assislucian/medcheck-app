#!/bin/bash

# Script para iniciar backend e frontend do MedCheck
# Uso: ./start.sh

echo "🚀 Iniciando MedCheck - Backend e Frontend..."

# Função para cleanup quando o script for interrompido
cleanup() {
    echo ""
    echo "🛑 Parando todos os processos..."
    
    # Mata todos os processos filhos
    jobs -p | xargs -r kill
    
    echo "✅ Processos finalizados!"
    exit 0
}

# Captura Ctrl+C e outros sinais
trap cleanup SIGINT SIGTERM EXIT

# Verificar se estamos na raiz do projeto
if [ ! -f "scripts/dev.sh" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Execute este script da raiz do projeto medcheck-app"
    exit 1
fi

echo "📁 Verificando diretórios..."

# Criar diretórios necessários se não existirem
mkdir -p uploads results logs

echo "🔧 Iniciando Backend..."
# Inicia o backend em background
cd $(pwd) && bash scripts/dev.sh &
BACKEND_PID=$!

echo "⏳ Aguardando backend inicializar..."
sleep 3

echo "🎨 Iniciando Frontend..."
# Inicia o frontend em background
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 MedCheck iniciado com sucesso!"
echo ""
echo "📊 Aplicação disponível em:"
echo "   🌐 Frontend: http://localhost:5173"
echo "   🔗 Backend API: http://localhost:8000"
echo "   📚 Documentação: http://localhost:8000/docs"
echo ""
echo "💡 Para parar: Ctrl+C"
echo ""

# Aguarda pelos processos
wait $BACKEND_PID $FRONTEND_PID