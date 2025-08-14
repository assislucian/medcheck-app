# 🔧 Correção do Erro de psutil no Render

## Problema
O deploy no Render estava falhando com o erro:
```
ModuleNotFoundError: No module named 'psutil'
```

## Causa
O módulo `psutil` estava sendo usado para monitoramento de performance (memória e CPU), mas não estava listado no `requirements.txt`. Como o psutil requer compilação de código C, pode ser problemático em ambientes de produção limitados como o free tier do Render.

## Solução Implementada
Tornamos o psutil **opcional** ao invés de obrigatório:

### 1. **Performance Middleware** (`src/performance/middleware.py`)
- Adicionado tratamento de importação opcional
- Verifica se psutil está disponível antes de usar
- Continua funcionando sem métricas de sistema quando psutil não está presente

### 2. **Endpoint /metrics** (`src/api.py`)
- Modificado para funcionar sem psutil
- Retorna valores padrão (0) quando psutil não está disponível
- Adiciona flag `psutil_available` para indicar se as métricas estão completas

## Benefícios
1. ✅ **Deploy funciona** sem necessidade de instalar psutil
2. ✅ **Performance otimizada** - não carrega biblioteca desnecessária em produção
3. ✅ **Flexível** - pode adicionar psutil depois se necessário
4. ✅ **Sem quebrar funcionalidade** - app continua funcionando normalmente

## Como Habilitar Monitoramento Completo
Se quiser métricas completas de sistema no futuro:
```bash
# Adicione ao requirements.txt:
psutil==5.9.8
```

## Verificação
Para verificar se psutil está disponível, acesse:
```
GET /metrics
```

Procure pelo campo: `"psutil_available": false/true`

## Lições Aprendidas
1. Sempre torne dependências de monitoramento opcionais em produção
2. Use try/except para importações não críticas
3. Forneça valores padrão sensatos quando métricas não estão disponíveis
4. Documente claramente o que está/não está disponível

---
**Data da correção**: 14/08/2025
**Commits relacionados**: 
- fix: corrige comando uvicorn no Render
- fix: torna psutil opcional para compatibilidade com Render
