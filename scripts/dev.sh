#!/bin/bash
# ==============================================================================
# MEDCHECK DEVELOPMENT SCRIPT (SINGLE SOURCE OF TRUTH)
# ==============================================================================
#
# Objetivo: Unificar o ambiente de desenvolvimento local com as configurações
#           do Render para garantir consistência e evitar o erro "module not found".
#
# O que este script faz:
# 1. Ativa o ambiente virtual Python do projeto.
# 2. Cria um arquivo .env se não existir, replicando as variáveis do Render.
# 3. Garante que diretórios essenciais (uploads, results, logs) existam.
# 4. Inicia o backend com Uvicorn, com reload automático.
#
# Como usar:
#   - Do diretório raiz, execute: bash scripts/dev.sh
#
# ==============================================================================

echo "🚀 Iniciando MedCheck em modo de desenvolvimento unificado..."

# 1. Ativar o ambiente virtual
VENV_PATH="medcheck_env_py311/bin/activate"
if [ -f "$VENV_PATH" ]; then
    echo "🐍 Ativando ambiente virtual Python..."
    source "$VENV_PATH"
else
    echo "❌ Erro Crítico: Ambiente virtual não encontrado em '$VENV_PATH'."
    echo "   Por favor, execute o script de setup para criar o ambiente."
    exit 1
fi

# 2. Gerenciar arquivo .env
if [ ! -f .env ]; then
    echo "📝 Arquivo .env não encontrado. Criando um novo com base nas configurações do Render..."
    cat > .env << EOF
# ==============================================================================
# MEDCHECK .ENV - CONFIGURAÇÕES PARA DESENVOLVIMENTO LOCAL
# ==============================================================================
# Este arquivo é a fonte da verdade para variáveis de ambiente locais.
# Ele é projetado para replicar o ambiente de produção do Render.
# NÃO ADICIONE SEGREDOS DIRETAMENTE AQUI. Use placeholders se necessário.
# ==============================================================================

# -- Ambiente --
ENV="development"

# -- Autenticação JWT --
# Substitua por um segredo forte ou carregue de um cofre de segredos.
JWT_SECRET="dummy-secret-for-local-dev-change-me"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="60"

# -- Admin Secret --
# Usado para operações administrativas protegidas.
ADMIN_SECRET="dummy-admin-secret-for-local-dev-change-me"

# -- Configurações de CORS --
# Lista de origens permitidas. Inclui portas comuns de desenvolvimento frontend.
FRONTEND_ORIGINS="http://localhost:5173,http://localhost:3000,https://medcheck-app.vercel.app"

# -- Banco de Dados --
# Usamos SQLite para simplicidade no desenvolvimento local.
DATABASE_URL="sqlite:///./medcheck.db"

# -- Diretórios --
# Caminhos para armazenamento de arquivos.
UPLOAD_DIR="uploads"
RESULTS_DIR="results"
LOG_DIR="logs"

EOF
    echo "✅ Arquivo .env criado com sucesso."
fi

# Carregar variáveis do .env para o ambiente atual
echo "📋 Carregando variáveis de ambiente do .env..."
export $(grep -v '^#' .env | xargs)

# 3. Verificar e criar diretórios essenciais
echo "📁 Verificando a existência dos diretórios necessários..."
mkdir -p "$UPLOAD_DIR" "$RESULTS_DIR" "$LOG_DIR"
echo "✅ Diretórios 'uploads', 'results' e 'logs' garantidos."

# 4. Iniciar o backend com Uvicorn
echo "🎯 Iniciando o servidor backend FastAPI..."
echo "   - Host: 0.0.0.0 (acessível na rede local)"
echo "   - Porta: 8000"
echo "   - Reload: Ativado (o servidor reiniciará ao salvar alterações)"
echo ""
echo "🔗 API disponível em: http://localhost:8000"
echo "📚 Documentação interativa (Swagger): http://localhost:8000/docs"
echo "💡 Para parar o servidor, pressione Ctrl+C."
echo ""

python -m uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload 