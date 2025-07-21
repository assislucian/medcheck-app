# 🚀 Sistema de Gerenciamento MedCheck

**SOLUÇÃO DEFINITIVA - Zero Perda de Tempo**

## 📋 Comandos Essenciais

### ⚡ ULTRA RÁPIDO (Recomendado)

```bash
# APENAS 1 COMANDO PARA TUDO:
./quick.sh s      # ← Inicia backend + frontend
./quick.sh k      # ← Para tudo  
./quick.sh r      # ← Restart completo
./quick.sh st     # ← Status + erros
```

### 🔧 COMPLETO

```bash
./manage.sh start    # Iniciar com detalhes
./manage.sh stop     # Parar todos serviços
./manage.sh restart  # Reiniciar completo
./manage.sh status   # Status + diagnóstico
./manage.sh logs     # Ver logs
./manage.sh monitor  # Monitoramento contínuo
./manage.sh health   # Verificação de saúde
```

## 🎯 Setup de Aliases (Uma vez só)

```bash
./alias_setup.sh
source ~/.zshrc    # ou ~/.bashrc
```

**Depois disso, DE QUALQUER LUGAR:**
```bash
meds      # Inicia MedCheck
medk      # Para MedCheck  
medr      # Restart MedCheck
medst     # Status MedCheck
```

## 🔍 Monitoramento de Erros

O sistema **AUTOMATICAMENTE**:
- ✅ Detecta erros nos logs
- ✅ Sugere soluções específicas
- ✅ Mostra status em tempo real
- ✅ Restart inteligente

### Exemplos de Diagnóstico:

```bash
./quick.sh st
```

**Saída:**
```
✓ Backend: RODANDO (PID: 12345, Porta: 8000)
✓ Frontend: RODANDO (PID: 12346, Porta: 8080)
✓ Nenhum erro detectado nos logs recentes
```

**Se houver erro:**
```
✗ ERROS DETECTADOS:
command not found: python
⚠ SOLUÇÃO: Use 'python3' ao invés de 'python'
```

## 📊 URLs do Sistema

Após `./quick.sh s`:

- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:8000  
- **API Docs:** http://localhost:8000/docs
- **Health:** http://localhost:8000/health

## 🔄 Fluxo de Trabalho Típico

### Início do Dia:
```bash
./quick.sh s    # 1 comando, tudo funcionando
```

### Durante Desenvolvimento:
```bash
./quick.sh st   # Ver se tudo ok
./quick.sh r    # Restart se necessário
```

### Fim do Dia:
```bash
./quick.sh k    # Para tudo
```

## 🚨 Solução de Problemas

### Problema: "command not found: python"
```bash
# O sistema detecta e sugere automaticamente:
⚠ SOLUÇÃO: Use 'python3' ao invés de 'python'
```

### Problema: Porta ocupada
```bash
./quick.sh k    # Para tudo primeiro
./quick.sh s    # Inicia limpo
```

### Problema: Logs lotados
```bash
./quick.sh logs backend  # Ver apenas backend
./quick.sh logs frontend # Ver apenas frontend
```

## 📁 Estrutura de Logs

```
logs/
├── backend.log    # Logs do Python/FastAPI
└── frontend.log   # Logs do Vite/React
```

## 🎛️ Monitoramento Contínuo

```bash
./quick.sh m
```

Atualiza a cada 5 segundos:
- Status dos serviços
- Erros detectados
- Sugestões de correção

Pressione `Ctrl+C` para sair.

## ⚙️ Configurações

**Portas padrão:**
- Backend: 8000
- Frontend: 8080

**Arquivos de controle:**
- `.backend.pid` - PID do backend
- `.frontend.pid` - PID do frontend

## 🏆 Vantagens Deste Sistema

1. **Zero Configuração** - Funciona imediatamente
2. **Auto-Diagnóstico** - Detecta e corrige problemas
3. **Logs Centralizados** - Tudo em um lugar
4. **Restart Inteligente** - Para e inicia corretamente
5. **Comandos Curtos** - Máxima eficiência
6. **Multiplataforma** - Funciona em Mac, Linux

## 💡 Dicas Avançadas

### Iniciar apenas 1 serviço:
```bash
# Edite manage.sh e comente start_frontend() ou start_backend()
```

### Ver logs em tempo real:
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

### Backup automático de configurações:
```bash
# O alias_setup.sh faz backup automático do seu .zshrc/.bashrc
```

---

## 🔥 TL;DR - Para Pressa Total

```bash
# Setup uma vez:
./alias_setup.sh && source ~/.zshrc

# Uso diário:
meds    # Liga tudo
medk    # Desliga tudo  
medr    # Restart tudo
medst   # Status tudo
```

**FIM! Sistema 100% eficiente. Zero perda de tempo. Máxima produtividade.** 