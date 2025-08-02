# Arquitetura Backend MedCheck

## ✅ BACKEND ÚNICO E OFICIAL

**Arquivo Principal:** `src/api.py`
- **5164 linhas** de código completo
- **Lógica real** de processamento
- **Banco de dados** SQLite/PostgreSQL  
- **Autenticação JWT** robusta
- **Rate limiting** e segurança
- **Processamento de PDFs** reais
- **Sistema de auditoria**

## ❌ ARQUIVOS REMOVIDOS (NÃO RECRIAR!)

- `backend/app.py` - **DADOS MOCKADOS** ❌
- `src/api_production.py` - duplicata ❌  
- `src/api_simple.py` - versão simplificada ❌
- `src/api_enhanced_unpaid.py` - versão específica ❌
- `src/api_render_production.py` - **USADA PELO RENDER** ❌
- `backend/main.py` - obsoleto ❌

## 🚀 COMANDOS DE EXECUÇÃO

### Desenvolvimento Local:
```bash
python -m uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload
```

### Produção (Render/Docker):
```bash
uvicorn src.api:app --host 0.0.0.0 --port $PORT
```

## 📁 CONFIGURAÇÕES DE DEPLOY

### ✅ Corretas (todas apontam para `src.api:app`):
- `Procfile` ✅
- `Dockerfile` ✅ 
- `deploy_render_auto.sh` ✅
- `scripts/migrate_to_render.sh` ✅
- `scripts/dev.sh` ✅
- `start_local_backend.sh` ✅

## 🔧 DEPENDÊNCIAS COMPLETAS

O `requirements.txt` foi atualizado com **todas** as dependências necessárias:
- FastAPI + Uvicorn
- SQLAlchemy + PostgreSQL
- Pandas para processamento
- JWT + bcrypt para segurança
- SlowAPI para rate limiting
- PyMuPDF + Pillow para PDFs
- E mais...

## ⚠️ REGRAS CRÍTICAS

1. **NUNCA** recriar backends duplicados
2. **SEMPRE** usar `src.api:app` 
3. **NUNCA** usar dados mockados em produção
4. **SEMPRE** testar localmente antes do deploy
5. **MANTER** esta documentação atualizada

## 🎯 RESULTADO

- ✅ **Uma única fonte da verdade**: `src/api.py`
- ✅ **Deploy unificado** para todos os ambientes
- ✅ **Sem confusão** entre backends
- ✅ **Render usa dados reais**, não mockados
- ✅ **Arquitetura limpa** e maintível

---
**Data da limpeza:** 02/08/2025  
**Responsável:** Assistente AI Senior  
**Status:** ✅ CONCLUÍDO E TESTADO