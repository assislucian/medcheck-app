# Exemplos de Logging Estruturado

## Configuração Inicial

```python
from src.config.logging import setup_logging, log_user_action, log_api_request, log_error

# No início da aplicação
logger = setup_logging()
```

## Exemplos de Uso

### 1. Log de Ação do Usuário

```python
# Upload de demonstrativo
log_user_action(
    logger,
    user_id=user.id,
    action="demonstrativo_upload",
    filename=file.filename,
    file_size=len(file.file.read()),
    processing_time_ms=elapsed_time
)
```

### 2. Log de Erro com Contexto

```python
try:
    result = process_demonstrativo(file)
except Exception as e:
    log_error(
        logger,
        error=e,
        context="demonstrativo_processing",
        user_id=user.id,
        filename=file.filename
    )
    raise
```

### 3. Log de Performance

```python
start_time = time.time()
result = expensive_database_query()
elapsed = (time.time() - start_time) * 1000

logger.info(json.dumps({
    "event_type": "database_query",
    "query_type": "demonstrativos_summary",
    "execution_time_ms": round(elapsed, 2),
    "result_count": len(result)
}))
```

### 4. Log de Integração Externa

```python
# Chamada para API externa (ex: CBHPM)
logger.info(json.dumps({
    "event_type": "external_api_call",
    "api_name": "cbhpm_lookup",
    "procedure_code": codigo,
    "response_time_ms": response_time,
    "success": True
}))
```

## Queries Úteis no Better Stack

### Encontrar Erros por Usuário
```
event_type:error AND user_id:123
```

### Performance de Endpoints
```
event_type:api_request AND response_time_ms:>2000
```

### Atividade de Upload
```
action:demonstrativo_upload
```

### Erros de Database
```
event_type:error AND context:database
```
