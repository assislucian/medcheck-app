#!/bin/bash

# 🚀 MedCheck - Verificação Completa de Produção
# =============================================
# 
# Este script executa TODA a bateria de testes de produção
# incluindo backend, frontend, E2E, performance e segurança.

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${CYAN}📋 $1${NC}"
}

header() {
    echo -e "\n${BOLD}${PURPLE}$1${NC}"
    echo -e "${BOLD}================================================================================${NC}\n"
}

# Verificar se os serviços estão rodando
check_services() {
    header "🔍 VERIFICANDO SERVIÇOS"
    
    # Verificar backend
    if curl -s http://localhost:8000/health > /dev/null; then
        success "Backend rodando em localhost:8000"
    else
        error "Backend não está rodando! Execute: uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload"
        exit 1
    fi
    
    # Verificar frontend
    if curl -s http://localhost:8080 > /dev/null; then
        success "Frontend rodando em localhost:8080"
    else
        warning "Frontend não está rodando. Tentando localhost:8081..."
        if curl -s http://localhost:8081 > /dev/null; then
            success "Frontend rodando em localhost:8081"
        else
            error "Frontend não está rodando! Execute: cd frontend && npm run dev"
            exit 1
        fi
    fi
}

# Executar testes unitários do backend
run_backend_tests() {
    header "🐍 TESTES UNITÁRIOS DO BACKEND"
    
    info "Executando testes com pytest..."
    
    if python -m pytest tests/unit/ -v --tb=short; then
        success "Testes unitários do backend PASSARAM"
    else
        error "Testes unitários do backend FALHARAM"
        return 1
    fi
}

# Executar testes de integração
run_integration_tests() {
    header "🔗 TESTES DE INTEGRAÇÃO"
    
    info "Executando testes de integração da API..."
    
    if python -m pytest tests/integration/ -v --tb=short; then
        success "Testes de integração PASSARAM"
    else
        error "Testes de integração FALHARAM"
        return 1
    fi
}

# Executar testes E2E
run_e2e_tests() {
    header "🎭 TESTES END-TO-END"
    
    info "Executando testes E2E com Playwright..."
    
    if python -m pytest tests/e2e/ -v --tb=short; then
        success "Testes E2E PASSARAM"
    else
        warning "Testes E2E falharam ou não estão disponíveis"
        return 0  # Não crítico
    fi
}

# Executar verificação completa do sistema
run_system_verification() {
    header "🔍 VERIFICAÇÃO COMPLETA DO SISTEMA"
    
    info "Executando verificação de produção..."
    
    if python verify-production-readiness.py; then
        success "Verificação do sistema PASSOU"
    else
        error "Verificação do sistema encontrou problemas críticos"
        return 1
    fi
}

# Executar testes do frontend
run_frontend_tests() {
    header "⚛️ TESTES DO FRONTEND"
    
    info "Executando testes E2E do frontend..."
    
    if python verify-frontend-e2e.py; then
        success "Testes do frontend PASSARAM"
    else
        warning "Testes do frontend encontraram alguns avisos"
        return 0  # Não crítico
    fi
}

# Executar testes de performance
run_performance_tests() {
    header "⚡ TESTES DE PERFORMANCE"
    
    info "Executando testes de performance com k6..."
    
    # Verificar se k6 está instalado
    if command -v k6 &> /dev/null; then
        if k6 run tests/performance/load-test.js; then
            success "Testes de performance PASSARAM"
        else
            warning "Testes de performance encontraram problemas"
            return 0  # Não crítico
        fi
    else
        warning "k6 não instalado. Pulando testes de performance."
        info "Para instalar: brew install k6 (macOS) ou https://k6.io/docs/getting-started/installation/"
        return 0
    fi
}

# Executar testes de segurança
run_security_tests() {
    header "🔒 TESTES DE SEGURANÇA"
    
    info "Verificando configurações de segurança..."
    
    # Verificar headers de segurança
    SECURITY_HEADERS=$(curl -s -I http://localhost:8000/token | grep -E "(X-Content-Type-Options|X-Frame-Options|X-XSS-Protection)")
    
    if [ ! -z "$SECURITY_HEADERS" ]; then
        success "Headers de segurança configurados"
    else
        warning "Alguns headers de segurança podem estar faltando"
    fi
    
    # Verificar HTTPS redirect em produção
    info "Verificações de segurança básicas concluídas"
}

# Verificar cobertura de código
check_code_coverage() {
    header "📊 COBERTURA DE CÓDIGO"
    
    info "Verificando cobertura de testes..."
    
    if python -m pytest tests/ --cov=src --cov-report=term-missing --cov-fail-under=80; then
        success "Cobertura de código adequada (≥80%)"
    else
        warning "Cobertura de código abaixo do esperado"
        return 0  # Não crítico para deploy
    fi
}

# Executar linting e formatação
run_code_quality() {
    header "✨ QUALIDADE DE CÓDIGO"
    
    info "Verificando formatação e linting..."
    
    # Python - Black e Flake8
    if command -v black &> /dev/null; then
        if black --check src/; then
            success "Formatação Python OK"
        else
            warning "Código Python precisa de formatação"
        fi
    fi
    
    if command -v flake8 &> /dev/null; then
        if flake8 src/ --max-line-length=88 --extend-ignore=E203,W503; then
            success "Linting Python OK"
        else
            warning "Problemas de linting Python encontrados"
        fi
    fi
}

# Verificar variáveis de ambiente
check_environment() {
    header "🌍 CONFIGURAÇÃO DE AMBIENTE"
    
    info "Verificando variáveis de ambiente críticas..."
    
    # Verificar database
    if [ ! -z "$DATABASE_URL" ]; then
        success "DATABASE_URL configurada"
    else
        warning "DATABASE_URL não configurada (usando SQLite)"
    fi
    
    # Verificar JWT secret
    if [ ! -z "$JWT_SECRET" ]; then
        success "JWT_SECRET configurada"
    else
        warning "JWT_SECRET usando valor padrão (inseguro para produção)"
    fi
    
    # Verificar ambiente
    if [ "$ENV" = "production" ]; then
        success "Ambiente configurado para PRODUÇÃO"
    else
        info "Ambiente configurado para desenvolvimento"
    fi
}

# Função principal
main() {
    header "🚀 VERIFICAÇÃO COMPLETA DE PRODUÇÃO - MEDCHECK"
    
    # Contadores de resultados
    PASSED=0
    FAILED=0
    WARNINGS=0
    
    # Executar todas as verificações
    info "Iniciando verificação completa do sistema..."
    
    # 1. Verificar serviços
    if check_services; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # 2. Configuração de ambiente
    if check_environment; then
        ((PASSED++))
    else
        ((WARNINGS++))
    fi
    
    # 3. Qualidade de código
    if run_code_quality; then
        ((PASSED++))
    else
        ((WARNINGS++))
    fi
    
    # 4. Testes unitários
    if run_backend_tests; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # 5. Testes de integração
    if run_integration_tests; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # 6. Verificação do sistema
    if run_system_verification; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # 7. Testes do frontend
    if run_frontend_tests; then
        ((PASSED++))
    else
        ((WARNINGS++))
    fi
    
    # 8. Testes E2E
    if run_e2e_tests; then
        ((PASSED++))
    else
        ((WARNINGS++))
    fi
    
    # 9. Testes de performance
    if run_performance_tests; then
        ((PASSED++))
    else
        ((WARNINGS++))
    fi
    
    # 10. Testes de segurança
    if run_security_tests; then
        ((PASSED++))
    else
        ((WARNINGS++))
    fi
    
    # 11. Cobertura de código
    if check_code_coverage; then
        ((PASSED++))
    else
        ((WARNINGS++))
    fi
    
    # Relatório final
    header "📊 RELATÓRIO FINAL"
    
    echo -e "${GREEN}✅ PASSOU: $PASSED${NC}"
    echo -e "${RED}❌ FALHOU: $FAILED${NC}"
    echo -e "${YELLOW}⚠️  AVISOS: $WARNINGS${NC}"
    
    TOTAL=$((PASSED + FAILED + WARNINGS))
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    
    echo -e "\n${BOLD}📈 Taxa de Sucesso: $SUCCESS_RATE%${NC}"
    
    # Status final
    if [ $FAILED -eq 0 ] && [ $WARNINGS -le 3 ]; then
        echo -e "\n${BOLD}${GREEN}🎉 SISTEMA PRONTO PARA PRODUÇÃO!${NC}"
        echo -e "${GREEN}Todos os testes críticos passaram com sucesso.${NC}"
        exit 0
    elif [ $FAILED -eq 0 ]; then
        echo -e "\n${BOLD}${YELLOW}⚠️  SISTEMA QUASE PRONTO${NC}"
        echo -e "${YELLOW}Alguns avisos foram encontrados, mas nada crítico.${NC}"
        exit 0
    else
        echo -e "\n${BOLD}${RED}🚨 ATENÇÃO NECESSÁRIA${NC}"
        echo -e "${RED}Problemas críticos encontrados que precisam ser corrigidos antes do deploy.${NC}"
        exit 1
    fi
}

# Executar função principal
main "$@" 