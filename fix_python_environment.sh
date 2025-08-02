#!/bin/bash

# 🔧 Script de Correção Completa do Ambiente Python - MedCheck
# Soluciona problemas de Python, dependências e ambiente virtual
# Baseado em pesquisas e best practices para macOS/Linux

echo "🔍 DIAGNÓSTICO COMPLETO DO AMBIENTE PYTHON"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. DIAGNÓSTICO INICIAL
echo -e "\n🔍 1. VERIFICANDO INSTALAÇÕES DO PYTHON"

# Verificar versões do Python
if command -v python3 &> /dev/null; then
    PYTHON3_VERSION=$(python3 --version)
    PYTHON3_PATH=$(which python3)
    log_success "Python3 encontrado: $PYTHON3_VERSION em $PYTHON3_PATH"
else
    log_error "Python3 NÃO encontrado!"
    exit 1
fi

if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    PYTHON_PATH=$(which python)
    log_success "Python encontrado: $PYTHON_VERSION em $PYTHON_PATH"
    PYTHON_EXISTS=true
else
    log_warning "Comando 'python' NÃO encontrado - isso é comum no macOS"
    PYTHON_EXISTS=false
fi

# 2. RESOLVER PROBLEMA DO COMANDO PYTHON
echo -e "\n🔧 2. CORRIGINDO COMANDO PYTHON"

if [ "$PYTHON_EXISTS" = false ]; then
    log_info "Criando alias para 'python' apontar para 'python3'..."
    
    # Criar alias temporário para esta sessão
    alias python=python3
    
    # Adicionar aos arquivos de configuração do shell
    SHELL_CONFIG=""
    if [ -n "$ZSH_VERSION" ]; then
        SHELL_CONFIG="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        SHELL_CONFIG="$HOME/.bashrc"
    fi
    
    if [ -n "$SHELL_CONFIG" ] && [ -f "$SHELL_CONFIG" ]; then
        # Verificar se o alias já existe
        if ! grep -q "alias python=python3" "$SHELL_CONFIG"; then
            echo -e "\n# Alias para Python (adicionado pelo fix_python_environment.sh)" >> "$SHELL_CONFIG"
            echo "alias python=python3" >> "$SHELL_CONFIG"
            log_success "Alias adicionado ao $SHELL_CONFIG"
        else
            log_info "Alias já existe no $SHELL_CONFIG"
        fi
    fi
    
    # Criar symlink como backup (se temos permissões)
    PYTHON3_PATH=$(which python3)
    PYTHON_DIR=$(dirname "$PYTHON3_PATH")
    
    if [ -w "$PYTHON_DIR" ]; then
        if [ ! -f "$PYTHON_DIR/python" ]; then
            ln -s "$PYTHON3_PATH" "$PYTHON_DIR/python"
            log_success "Symlink criado: $PYTHON_DIR/python -> $PYTHON3_PATH"
        fi
    else
        log_warning "Sem permissão para criar symlink em $PYTHON_DIR"
    fi
fi

# 3. VERIFICAR E INSTALAR DEPENDÊNCIAS
echo -e "\n📦 3. VERIFICANDO DEPENDÊNCIAS"

# Verificar pip
if command -v pip3 &> /dev/null; then
    PIP3_VERSION=$(pip3 --version)
    log_success "pip3 encontrado: $PIP3_VERSION"
else
    log_error "pip3 NÃO encontrado!"
    exit 1
fi

# Função para verificar se um pacote está instalado
check_package() {
    local package=$1
    if python3 -c "import $package" 2>/dev/null; then
        local version=$(python3 -c "import $package; print(getattr($package, '__version__', 'unknown'))" 2>/dev/null)
        log_success "$package instalado (versão: $version)"
        return 0
    else
        log_warning "$package NÃO está instalado"
        return 1
    fi
}

# Verificar pacotes essenciais
PACKAGES_TO_CHECK=("fastapi" "uvicorn" "pydantic" "multipart")
MISSING_PACKAGES=()

for package in "${PACKAGES_TO_CHECK[@]}"; do
    # Ajustar nome do pacote para import
    import_name=$package
    if [ "$package" = "multipart" ]; then
        import_name="multipart"
    fi
    
    if ! check_package "$import_name"; then
        MISSING_PACKAGES+=("$package")
    fi
done

# Instalar pacotes em falta
if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo -e "\n📥 4. INSTALANDO DEPENDÊNCIAS FALTANTES"
    
    # Mapear nomes para instalação
    INSTALL_PACKAGES=()
    for package in "${MISSING_PACKAGES[@]}"; do
        case $package in
            "fastapi")
                INSTALL_PACKAGES+=("fastapi[standard]")
                ;;
            "multipart")
                INSTALL_PACKAGES+=("python-multipart")
                ;;
            *)
                INSTALL_PACKAGES+=("$package")
                ;;
        esac
    done
    
    log_info "Instalando: ${INSTALL_PACKAGES[*]}"
    
    # Instalar com pip3
    if pip3 install "${INSTALL_PACKAGES[@]}"; then
        log_success "Dependências instaladas com sucesso!"
    else
        log_error "Falha ao instalar dependências"
        exit 1
    fi
else
    log_success "Todas as dependências já estão instaladas!"
fi

# 5. VERIFICAR AMBIENTE VIRTUAL (OPCIONAL)
echo -e "\n🏠 5. VERIFICANDO AMBIENTE VIRTUAL"

if [ -d "venv" ]; then
    log_info "Ambiente virtual 'venv' encontrado"
    
    # Verificar se está ativado
    if [ -n "$VIRTUAL_ENV" ]; then
        log_success "Ambiente virtual ATIVO: $VIRTUAL_ENV"
    else
        log_warning "Ambiente virtual NÃO está ativo"
        log_info "Para ativar: source venv/bin/activate"
    fi
elif [ -d ".venv" ]; then
    log_info "Ambiente virtual '.venv' encontrado"
    
    if [ -n "$VIRTUAL_ENV" ]; then
        log_success "Ambiente virtual ATIVO: $VIRTUAL_ENV"
    else
        log_warning "Ambiente virtual NÃO está ativo"
        log_info "Para ativar: source .venv/bin/activate"
    fi
else
    log_info "Nenhum ambiente virtual encontrado (usando Python global)"
fi

# 6. TESTAR IMPORTAÇÕES
echo -e "\n🧪 6. TESTANDO IMPORTAÇÕES"

# Teste básico de importação
python3 -c "
import sys
print(f'Python versão: {sys.version}')
print(f'Python executável: {sys.executable}')

try:
    import fastapi
    print('✅ FastAPI: OK')
    print(f'   Versão: {fastapi.__version__}')
except ImportError as e:
    print(f'❌ FastAPI: ERRO - {e}')

try:
    import uvicorn
    print('✅ Uvicorn: OK')
    print(f'   Versão: {uvicorn.__version__}')
except ImportError as e:
    print(f'❌ Uvicorn: ERRO - {e}')

try:
    import multipart
    print('✅ python-multipart: OK')
    print(f'   Versão: {multipart.__version__}')
except ImportError as e:
    print(f'❌ python-multipart: ERRO - {e}')

try:
    from fastapi import Form
    print('✅ FastAPI Form: OK')
except ImportError as e:
    print(f'❌ FastAPI Form: ERRO - {e}')
"

# 7. CRIAR SCRIPT DE INICIALIZAÇÃO CORRIGIDO
echo -e "\n📝 7. CRIANDO SCRIPT DE INICIALIZAÇÃO CORRIGIDO"

cat > start_backend_fixed.sh << 'EOF'
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
EOF

chmod +x start_backend_fixed.sh
log_success "Script de inicialização criado: start_backend_fixed.sh"

# 8. CRIAR SCRIPT DE VERIFICAÇÃO DE SAÚDE
cat > health_check.sh << 'EOF'
#!/bin/bash

echo "🏥 Verificação de Saúde do Backend MedCheck"
echo "=========================================="

# Verificar se o backend está rodando
if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend está ONLINE"
    echo "📊 Status:"
    curl -s http://localhost:8000/health | python3 -m json.tool
    
    echo -e "\n🧪 Testando endpoint de token..."
    response=$(curl -s -w "%{http_code}" -X POST "http://localhost:8000/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=6091&password=@Luassis90&uf=AC" \
        -o /tmp/token_response.json)
    
    if [ "$response" = "200" ]; then
        echo "✅ Endpoint de token funcionando"
        echo "🔑 Resposta:"
        cat /tmp/token_response.json | python3 -m json.tool
        rm -f /tmp/token_response.json
    else
        echo "❌ Endpoint de token com problemas (HTTP $response)"
        cat /tmp/token_response.json
        rm -f /tmp/token_response.json
    fi
    
else
    echo "❌ Backend está OFFLINE ou não responde"
    echo "💡 Para iniciar: ./start_backend_fixed.sh"
fi
EOF

chmod +x health_check.sh
log_success "Script de verificação criado: health_check.sh"

# 9. RELATÓRIO FINAL
echo -e "\n📊 RELATÓRIO FINAL"
echo "=================="

log_success "Diagnóstico completo finalizado!"
echo ""
echo "📋 RESUMO:"
echo "• Python3: $PYTHON3_VERSION"
echo "• Comando 'python': $([ "$PYTHON_EXISTS" = true ] && echo "✅ Disponível" || echo "⚠️  Corrigido com alias")"
echo "• Dependências: $([ ${#MISSING_PACKAGES[@]} -eq 0 ] && echo "✅ Todas OK" || echo "⚠️  Instaladas automaticamente")"
echo ""
echo "🚀 COMO USAR:"
echo "1. Para iniciar o backend: ./start_backend_fixed.sh"
echo "2. Para verificar saúde: ./health_check.sh"
echo "3. Se ainda der erro: source ~/.zshrc (ou ~/.bashrc) e tente novamente"
echo ""
echo "🔗 URLs importantes:"
echo "• Backend: http://localhost:8000"
echo "• Health Check: http://localhost:8000/health"
echo "• Documentação: http://localhost:8000/docs"
echo ""
log_success "Ambiente Python configurado e corrigido! 🎉"
EOF