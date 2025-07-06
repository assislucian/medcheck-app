#!/bin/bash

# Script de teste rápido após correções
export TESTING=true
export DISABLE_RATE_LIMIT=true
export SKIP_AUTH=true
export CRM_LOGADO=6091
export UF_LOGADO=RN

echo "🧪 Executando testes unitários..."
python -m pytest tests/unit/ -v --tb=short -x

echo -e "\n🔗 Executando testes de integração..."
python -m pytest tests/integration/ -v --tb=short -x

echo -e "\n🎭 Executando verificação do sistema..."
python verify-production-readiness.py

echo -e "\n✅ Testes concluídos!"
