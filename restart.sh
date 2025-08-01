#!/bin/bash

# Script para reiniciar o MedCheck (backend e frontend)
# Uso: ./restart.sh

echo "🔄 Reiniciando MedCheck..."

# Função para matar processos do MedCheck
kill_medcheck() {
    echo "🛑 Parando processos existentes..."
    
    # Mata processos do uvicorn (backend)
    pkill -f "uvicorn.*api:app" 2>/dev/null
    pkill -f "python.*api" 2>/dev/null
    
    # Mata processos do Vite (frontend)  
    pkill -f "vite" 2>/dev/null
    pkill -f "node.*vite" 2>/dev/null
    
    # Mata processos do Node.js na porta 5173
    lsof -ti:5173 | xargs -r kill 2>/dev/null
    
    # Mata processos do Python na porta 8000
    lsof -ti:8000 | xargs -r kill 2>/dev/null
    
    sleep 2
    echo "✅ Processos anteriores finalizados!"
}

# Para processos existentes
kill_medcheck

echo ""
echo "🚀 Iniciando novamente..."
echo ""

# Inicia novamente
./start.sh