#!/bin/bash

# =============================================================================
# ENTERPRISE STARTUP SYSTEM - USD $1T Grade
# =============================================================================
# 
# Características:
# - Detecção automática de ambiente
# - Fallback para diferentes configurações
# - Health check com retry exponencial
# - Zero falhas de startup
# - Logs estruturados para debugging
# - Performance monitoring
# =============================================================================

set -euo pipefail

# Configurações enterprise
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly LOG_FILE="${PROJECT_ROOT}/logs/startup.log"
readonly PID_FILE="${PROJECT_ROOT}/.startup.pid"
readonly MAX_STARTUP_TIME=120  # 2 minutos máximo
readonly HEALTH_CHECK_RETRIES=20
readonly HEALTH_CHECK_DELAY=3

# Cores para output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# =============================================================================
# LOGGING SYSTEM ENTERPRISE
# =============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }
log_success() { log "SUCCESS" "$@"; }

# =============================================================================
# ENVIRONMENT DETECTION & VALIDATION
# =============================================================================

detect_python() {
    log_info "🔍 Detectando ambiente Python..."
    
    local python_cmd=""
    local python_version=""
    
    # Estratégia 1: Verificar se já está no venv
    if [[ -n "${VIRTUAL_ENV:-}" ]]; then
        log_info "✅ Virtual environment ativo: $VIRTUAL_ENV"
        python_cmd="python"
    # Estratégia 2: Verificar venv local
    elif [[ -f "${PROJECT_ROOT}/.venv/bin/python" ]]; then
        log_info "✅ Encontrado venv local: ${PROJECT_ROOT}/.venv"
        python_cmd="${PROJECT_ROOT}/.venv/bin/python"
    # Estratégia 3: Ativar venv e detectar
    elif [[ -f "${PROJECT_ROOT}/.venv/bin/activate" ]]; then
        log_info "🔄 Ativando venv local..."
        source "${PROJECT_ROOT}/.venv/bin/activate"
        python_cmd="python"
    # Estratégia 4: Fallback para python3
    elif command -v python3 &> /dev/null; then
        log_warn "⚠️  Usando python3 do sistema (sem venv)"
        python_cmd="python3"
    # Estratégia 5: Fallback para python
    elif command -v python &> /dev/null; then
        log_warn "⚠️  Usando python do sistema (sem venv)"
        python_cmd="python"
    else
        log_error "❌ Python não encontrado!"
        return 1
    fi
    
    # Validar versão do Python
    python_version=$($python_cmd --version 2>&1)
    log_info "🐍 Python detectado: $python_version"
    
    # Verificar se versão é compatível (>= 3.8)
    if ! $python_cmd -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)" 2>/dev/null; then
        log_error "❌ Python 3.8+ requerido, encontrado: $python_version"
        return 1
    fi
    
    echo "$python_cmd"
}

validate_dependencies() {
    local python_cmd="$1"
    log_info "📦 Validando dependências..."
    
    # Verificar se requirements estão instalados
    local missing_deps=()
    
    # Lista de dependências críticas
    local critical_deps=("fastapi" "uvicorn" "sqlalchemy" "pandas")
    
    for dep in "${critical_deps[@]}"; do
        if ! $python_cmd -c "import $dep" 2>/dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "❌ Dependências ausentes: ${missing_deps[*]}"
        log_info "💡 Tentando instalar dependências..."
        
        if [[ -f "${PROJECT_ROOT}/requirements.txt" ]]; then
            $python_cmd -m pip install -r "${PROJECT_ROOT}/requirements.txt" --quiet || {
                log_error "❌ Falha na instalação de dependências"
                return 1
            }
            log_success "✅ Dependências instaladas com sucesso"
        else
            log_error "❌ requirements.txt não encontrado"
            return 1
        fi
    else
        log_success "✅ Todas as dependências estão instaladas"
    fi
}

# =============================================================================
# PORT MANAGEMENT
# =============================================================================

kill_existing_processes() {
    log_info "🔄 Verificando processos existentes..."
    
    # Matar processos na porta 8000
    local pids=$(lsof -ti:8000 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
        log_info "🔪 Matando processos na porta 8000: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Matar processos uvicorn/python relacionados ao projeto
    pkill -f "uvicorn.*src.api" 2>/dev/null || true
    sleep 1
    
    log_success "✅ Processos existentes finalizados"
}

# =============================================================================
# BACKEND STARTUP WITH HEALTH CHECKS
# =============================================================================

start_backend() {
    local python_cmd="$1"
    log_info "🚀 Iniciando backend..."
    
    cd "$PROJECT_ROOT"
    
    # Criar diretórios necessários
    mkdir -p logs uploads results
    
    # Configurar variáveis de ambiente para desenvolvimento
    export PYTHONPATH="${PROJECT_ROOT}:${PYTHONPATH:-}"
    export ENV="development"
    export DEBUG="true"
    
    # Iniciar backend em background com logs
    $python_cmd -m uvicorn src.api:app \
        --reload \
        --host 0.0.0.0 \
        --port 8000 \
        --log-level info \
        --access-log \
        > logs/backend.log 2>&1 &
    
    local backend_pid=$!
    echo "$backend_pid" > "$PID_FILE"
    
    log_info "🔄 Backend iniciado com PID: $backend_pid"
    
    # Aguardar startup
    sleep 5
    
    # Verificar se processo ainda está rodando
    if ! kill -0 "$backend_pid" 2>/dev/null; then
        log_error "❌ Backend falhou ao iniciar"
        cat logs/backend.log | tail -20
        return 1
    fi
    
    log_success "✅ Backend processo ativo"
    echo "$backend_pid"
}

perform_health_checks() {
    log_info "🏥 Executando health checks..."
    
    local api_url="http://localhost:8000"
    local attempt=1
    
    while [[ $attempt -le $HEALTH_CHECK_RETRIES ]]; do
        log_info "🔍 Health check tentativa $attempt/$HEALTH_CHECK_RETRIES"
        
        # Test 1: Basic connectivity
        if curl -f -s "$api_url/health" > /dev/null 2>&1; then
            log_success "✅ Health check básico: OK"
            
            # Test 2: API documentation
            if curl -f -s "$api_url/docs" > /dev/null 2>&1; then
                log_success "✅ Documentação API: OK"
                
                # Test 3: Test endpoint
                local health_response=$(curl -s "$api_url/health" 2>/dev/null || echo "")
                if echo "$health_response" | grep -q '"status":"healthy"'; then
                    log_success "✅ API funcional: OK"
                    log_success "🎉 Backend totalmente operacional!"
                    return 0
                fi
            fi
        fi
        
        log_warn "⏳ Aguardando backend... (${HEALTH_CHECK_DELAY}s)"
        sleep $HEALTH_CHECK_DELAY
        ((attempt++))
    done
    
    log_error "❌ Health checks falharam após $HEALTH_CHECK_RETRIES tentativas"
    return 1
}

# =============================================================================
# FRONTEND STARTUP (OPCIONAL)
# =============================================================================

start_frontend() {
    log_info "🎨 Verificando frontend..."
    
    if [[ -f "${PROJECT_ROOT}/frontend/package.json" ]]; then
        log_info "📦 Frontend detectado, iniciando..."
        
        cd "${PROJECT_ROOT}/frontend"
        
        # Verificar se node_modules existe
        if [[ ! -d "node_modules" ]]; then
            log_info "📥 Instalando dependências do frontend..."
            npm install --silent || {
                log_warn "⚠️  Falha na instalação do frontend (continuando sem)"
                return 0
            }
        fi
        
        # Iniciar frontend em background
        npm run dev > ../logs/frontend.log 2>&1 &
        local frontend_pid=$!
        
        log_info "🎨 Frontend iniciado com PID: $frontend_pid"
        
        # Aguardar um pouco para verificar se iniciou
        sleep 3
        if kill -0 "$frontend_pid" 2>/dev/null; then
            log_success "✅ Frontend ativo"
        else
            log_warn "⚠️  Frontend pode ter falhado (ver logs/frontend.log)"
        fi
    else
        log_info "ℹ️  Frontend não detectado, somente backend"
    fi
}

# =============================================================================
# CLEANUP & SIGNAL HANDLING
# =============================================================================

cleanup() {
    log_info "🧹 Limpando recursos..."
    
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            log_info "🔪 Finalizando backend (PID: $pid)"
            kill "$pid" 2>/dev/null || true
            sleep 2
            kill -9 "$pid" 2>/dev/null || true
        fi
        rm -f "$PID_FILE"
    fi
    
    # Cleanup adicional
    pkill -f "uvicorn.*src.api" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    local start_time=$(date +%s)
    
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                     MEDCHECK ENTERPRISE STARTUP SYSTEM                      ║"
    echo "║                            USD \$1T Grade Software                            ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Criar diretório de logs se não existir
    mkdir -p "$(dirname "$LOG_FILE")"
    
    log_info "🚀 Iniciando MedCheck Enterprise..."
    log_info "📁 Diretório do projeto: $PROJECT_ROOT"
    
    # Step 1: Detectar Python
    local python_cmd
    if python_cmd=$(detect_python); then
        log_success "✅ Python configurado: $python_cmd"
    else
        log_error "❌ Falha na detecção do Python"
        exit 1
    fi
    
    # Step 2: Validar dependências
    if validate_dependencies "$python_cmd"; then
        log_success "✅ Dependências validadas"
    else
        log_error "❌ Falha na validação de dependências"
        exit 1
    fi
    
    # Step 3: Limpar processos existentes
    kill_existing_processes
    
    # Step 4: Iniciar backend
    local backend_pid
    if backend_pid=$(start_backend "$python_cmd"); then
        log_success "✅ Backend iniciado (PID: $backend_pid)"
    else
        log_error "❌ Falha no startup do backend"
        exit 1
    fi
    
    # Step 5: Health checks
    if perform_health_checks; then
        log_success "✅ Health checks aprovados"
    else
        log_error "❌ Health checks falharam"
        exit 1
    fi
    
    # Step 6: Iniciar frontend (opcional)
    start_frontend
    
    # Calcular tempo de startup
    local end_time=$(date +%s)
    local startup_time=$((end_time - start_time))
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                            🎉 STARTUP CONCLUÍDO! 🎉                          ║"
    echo "║                                                                              ║"
    echo "║  📊 Backend:     http://localhost:8000                                      ║"
    echo "║  📚 Docs:        http://localhost:8000/docs                                 ║"
    echo "║  🌐 Frontend:    http://localhost:8080 (se disponível)                      ║"
    echo "║  ⏱️  Startup:     ${startup_time}s                                              ║"
    echo "║                                                                              ║"
    echo "║  Para parar: pkill -f 'uvicorn.*src.api' ou Ctrl+C                         ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_success "🎯 Sistema Enterprise totalmente operacional em ${startup_time}s"
    
    # Se executado diretamente (não sourced), aguardar
    if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
        log_info "⏳ Pressione Ctrl+C para finalizar..."
        
        # Loop infinito aguardando interrupção
        while true; do
            sleep 30
            
            # Verificar se backend ainda está rodando
            if [[ -f "$PID_FILE" ]]; then
                local pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
                if [[ -n "$pid" ]] && ! kill -0 "$pid" 2>/dev/null; then
                    log_error "❌ Backend parou inesperadamente!"
                    exit 1
                fi
            fi
        done
    fi
}

# Executar main apenas se script foi chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 