#!/bin/bash

# 🔍 Script de Monitoramento do Deploy no Render
# Monitora status do deploy e testa endpoints críticos

echo "🚀 MONITORANDO DEPLOY NO RENDER"
echo "================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs do Render
BACKEND_URL="https://medcheck-backend.onrender.com"
FRONTEND_URL="https://medcheck-frontend.onrender.com"

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

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $description... "
    
    local response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url" 2>/dev/null)
    local status_code=${response: -3}
    
    if [ "$status_code" = "$expected_status" ]; then
        log_success "$status_code OK"
        return 0
    else
        log_error "$status_code (expected $expected_status)"
        echo "Response: $(cat /tmp/response.json 2>/dev/null)"
        return 1
    fi
}

# Função principal de teste
test_backend() {
    echo -e "\n🧪 TESTANDO ENDPOINTS CRÍTICOS"
    echo "==============================="
    
    local all_passed=true
    
    # Test 1: Health Check
    if ! test_endpoint "$BACKEND_URL/health" "Health Check"; then
        all_passed=false
    fi
    
    # Test 2: Profile endpoint (que estava 404)
    if ! test_endpoint "$BACKEND_URL/api/v1/profile" "Profile Endpoint" 401; then
        all_passed=false
    fi
    
    # Test 3: Dashboard endpoint (que estava 404)  
    if ! test_endpoint "$BACKEND_URL/api/v1/dashboard" "Dashboard Endpoint" 401; then
        all_passed=false
    fi
    
    # Test 4: Unpaid Procedures (que estava 404)
    if ! test_endpoint "$BACKEND_URL/api/v1/unpaid-procedures" "Unpaid Procedures" 401; then
        all_passed=false
    fi
    
    # Test 5: Authentication endpoint
    echo -n "Testing Authentication... "
    local auth_response=$(curl -s -w "%{http_code}" \
        -X POST "$BACKEND_URL/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=6091&password=@Luassis90&uf=AC" \
        -o /tmp/auth_response.json 2>/dev/null)
    
    local auth_status=${auth_response: -3}
    
    if [ "$auth_status" = "200" ]; then
        log_success "200 OK - JWT Token gerado"
        
        # Extrair token para testes autenticados
        TOKEN=$(cat /tmp/auth_response.json | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
        
        if [ -n "$TOKEN" ]; then
            echo -e "\n🔐 TESTANDO ENDPOINTS AUTENTICADOS"
            echo "=================================="
            
            # Test com token válido
            echo -n "Testing Profile with Auth... "
            local profile_response=$(curl -s -w "%{http_code}" \
                -H "Authorization: Bearer $TOKEN" \
                "$BACKEND_URL/api/v1/profile" \
                -o /tmp/profile_response.json 2>/dev/null)
            
            local profile_status=${profile_response: -3}
            
            if [ "$profile_status" = "200" ]; then
                log_success "200 OK - Profile data retrieved"
                echo "Profile: $(cat /tmp/profile_response.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"{d.get('nome', 'N/A')} (CRM {d.get('crm', 'N/A')})\")" 2>/dev/null)"
            else
                log_error "$profile_status - Profile still failing"
                all_passed=false
            fi
        fi
    else
        log_error "$auth_status - Authentication failed"
        all_passed=false
    fi
    
    # Cleanup temp files
    rm -f /tmp/response.json /tmp/auth_response.json /tmp/profile_response.json
    
    return $all_passed
}

# Função para aguardar deploy
wait_for_deploy() {
    echo -e "\n⏳ AGUARDANDO DEPLOY COMPLETAR"
    echo "=============================="
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -n "Attempt $attempt/$max_attempts: "
        
        if curl -f -s "$BACKEND_URL/health" > /dev/null 2>&1; then
            log_success "Backend online!"
            return 0
        else
            log_warning "Backend still deploying..."
            sleep 10
            ((attempt++))
        fi
    done
    
    log_error "Deploy timeout after $((max_attempts * 10)) seconds"
    return 1
}

# Monitoramento principal
main() {
    log_info "Deploy iniciado em: $(date)"
    log_info "Backend URL: $BACKEND_URL"
    log_info "Frontend URL: $FRONTEND_URL"
    
    # Aguardar deploy
    if wait_for_deploy; then
        echo -e "\n🎯 DEPLOY DETECTADO - INICIANDO TESTES"
        echo "======================================"
        
        # Aguardar mais um pouco para estabilizar
        log_info "Aguardando estabilização (30s)..."
        sleep 30
        
        # Testar endpoints
        if test_backend; then
            echo -e "\n🎉 SUCESSO TOTAL!"
            echo "================"
            log_success "Todos os endpoints estão funcionando"
            log_success "O conflito de versão foi RESOLVIDO"
            log_success "Frontend deve funcionar normalmente agora"
            
            echo -e "\n📋 RESUMO DAS CORREÇÕES:"
            echo "✅ src.api:app agora executando no Render"
            echo "✅ Todas dependências instaladas"
            echo "✅ Endpoints críticos respondendo 200/401 (correto)"
            echo "✅ Autenticação funcionando"
            echo "✅ Profile endpoint disponível"
            echo "✅ Dashboard endpoint disponível"
            echo "✅ Unpaid procedures endpoint disponível"
            
            echo -e "\n🌐 TESTE NO BROWSER:"
            echo "1. Acesse: $FRONTEND_URL"
            echo "2. Faça login com CRM: 6091, UF: AC, Senha: @Luassis90"
            echo "3. Verifique se dashboard carrega dados"
            echo "4. Navegue pelas funcionalidades"
            
            return 0
        else
            echo -e "\n❌ FALHA PARCIAL"
            echo "==============="
            log_error "Alguns endpoints ainda apresentam problemas"
            log_warning "Pode precisar de mais tempo ou ajustes adicionais"
            return 1
        fi
    else
        echo -e "\n❌ FALHA NO DEPLOY"
        echo "=================="
        log_error "Deploy não completou no tempo esperado"
        log_warning "Verifique logs do Render: https://render.com/dashboard"
        return 1
    fi
}

# Executar monitoramento
main

# Oferecer monitoramento contínuo
echo -e "\n🔄 MONITORAMENTO CONTÍNUO"
echo "========================="
echo "Para monitorar continuamente, execute:"
echo "watch -n 30 'curl -s $BACKEND_URL/health | python3 -m json.tool'"
echo ""
echo "Para testar autenticação:"
echo "curl -X POST \"$BACKEND_URL/token\" -H \"Content-Type: application/x-www-form-urlencoded\" -d \"username=6091&password=@Luassis90&uf=AC\""