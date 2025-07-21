# 🔧 Gerenciamento de Serviços - MedCheck

## 📋 Visão Geral

Este documento descreve como gerenciar os serviços do MedCheck (backend e frontend) de forma robusta e estável.

## 🚀 Script de Gerenciamento

### Uso do `manage_services.sh`

```bash
# Iniciar ambos os serviços
./manage_services.sh start

# Verificar status
./manage_services.sh status

# Parar serviços
./manage_services.sh stop

# Reiniciar serviços
./manage_services.sh restart

# Ver logs
./manage_services.sh logs
```

## 🔍 Solução de Problemas Resolvidos

### ❌ Problema Principal (RESOLVIDO)
**Sintoma**: Frontend rodando em portas dinâmicas (8081, 8082, 8083...) mas backend só permitia CORS para porta 8080.

**Causa**: Configuração de CORS no backend limitada às portas 8080, 5173, 3000.

**Solução**: 
1. ✅ Atualizado CORS para suportar portas 8080-8090
2. ✅ Criado script de gerenciamento robusto
3. ✅ Implementado monitoramento automático de saúde

### 🔧 Correções Implementadas

#### 1. **CORS Expandido** (`src/api.py`)
```python
# Suporte para portas dinâmicas do Vite (8080-8090)
allowed_origins = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:8082", 
    "http://localhost:8083",
    # ... até 8090
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    # ... até 8090
]
```

#### 2. **Script de Gerenciamento Robusto** (`manage_services.sh`)
- ✅ Limpeza automática de processos duplicados
- ✅ Detecção inteligente de portas livres
- ✅ Monitoramento de saúde dos serviços
- ✅ Logs centralizados
- ✅ Recuperação automática de falhas

#### 3. **Monitoramento de Saúde**
- Backend: `curl -s http://localhost:8000/health`
- Frontend: Detecção automática em portas 8080-8090

## 📊 Status dos Serviços

### ✅ Backend (FastAPI)
- **URL**: http://localhost:8000
- **Documentação**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Logs**: `tail -f backend.log`

### ✅ Frontend (React + Vite)
- **URL**: http://localhost:8080 (ou próxima porta disponível)
- **Hot Reload**: ✅ Habilitado
- **Logs**: `tail -f frontend.log`

## 🔄 Fluxo de Inicialização

1. **Limpeza**: Remove processos existentes
2. **Backend**: Inicia na porta 8000, aguarda health check
3. **Frontend**: Encontra porta livre (8080-8090), inicia Vite
4. **Validação**: Verifica se ambos respondem corretamente
5. **Monitoramento**: Logs em tempo real disponíveis

## 🛡️ Prevenção de Problemas

### ✅ Agora Funcionando Corretamente
- Múltiplas instâncias do frontend não causam mais problemas
- CORS configurado para todas as portas necessárias
- Processo de inicialização limpo e confiável
- Monitoramento automático de falhas

### 💡 Boas Práticas
1. **Sempre usar `./manage_services.sh`** em vez de comandos manuais
2. **Verificar status** com `./manage_services.sh status` após mudanças
3. **Consultar logs** em caso de problemas: `./manage_services.sh logs`
4. **Reiniciar** se houver problemas: `./manage_services.sh restart`

## 🔧 Comandos de Debug

```bash
# Verificar processos ativos
ps aux | grep -E "(uvicorn|vite|npm)" | grep -v grep

# Verificar portas ocupadas
lsof -i :8000 -i :8080 -i :8081 -i :8082 -i :8083

# Testar conectividade
curl -s http://localhost:8000/health
curl -s http://localhost:8080/

# Limpar processos manualmente (emergência)
pkill -f "uvicorn src.api:app"
pkill -f "vite"
pkill -f "npm run dev"
```

## 📈 Melhorias Implementadas

### 🔄 Auto-Recovery
- Detecção automática de portas livres
- Limpeza de processos órfãos
- Health checks com timeout
- Logs estruturados

### 🎯 Robustez
- Script à prova de falhas
- Suporte a múltiplas portas
- Configuração flexível de CORS
- Monitoramento contínuo

### 🚀 Performance
- Inicialização rápida
- Detecção inteligente de conflitos
- Logs otimizados
- Processo limpo de shutdown

## ✅ Resultado Final

**Antes**: ❌ Erros de CORS, múltiplas instâncias, instabilidade
**Depois**: ✅ Sistema robusto, auto-recuperação, monitoramento completo

O sistema agora funciona de forma estável e confiável, independentemente da porta onde o frontend decidir rodar.

---

## 🆘 Suporte

Se houver problemas:
1. Execute: `./manage_services.sh restart`
2. Verifique: `./manage_services.sh status`
3. Consulte logs: `./manage_services.sh logs`
4. Se persistir, verifique este documento para comandos de debug 