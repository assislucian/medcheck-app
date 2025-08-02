#!/bin/bash

# Script de inicialização corrigido para o backend MedCheck
# Resolve problemas comuns com Python e dependências

echo "🚀 Iniciando Backend MedCheck (Versão Corrigida)"

# Verificar se python3 existe
if ! command -v python3 &> /dev/null; then
    echo "❌ python3 não encontrado!"
    exit 1
fi

# Criar alias se necessário
if ! command -v python &> /dev/null; then
    echo "⚙️  Criando alias temporário: python -> python3"
    alias python=python3
fi

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    echo "🏠 Ativando ambiente virtual: venv"
    source venv/bin/activate
elif [ -d ".venv" ]; then
    echo "🏠 Ativando ambiente virtual: .venv"
    source .venv/bin/activate
fi

# Verificar dependências críticas
echo "🔍 Verificando dependências..."
python3 -c "
import sys
try:
    import fastapi, uvicorn, multipart
    print('✅ Todas as dependências estão OK')
except ImportError as e:
    print(f'❌ Dependência faltando: {e}')
    print('💡 Execute: pip3 install fastapi[standard] uvicorn python-multipart')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Falha na verificação de dependências"
    exit 1
fi

# Iniciar o servidor (usando python3 explicitamente)
echo "🎯 Iniciando servidor na porta 8000..."
python3 -m uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload
