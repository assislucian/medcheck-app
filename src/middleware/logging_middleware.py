"""
Middleware para logging estruturado de requests
"""
import time
import json
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("medcheck.api")

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para log estruturado de todas as requests"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Capturar informações da request
        method = request.method
        path = request.url.path
        user_agent = request.headers.get("user-agent", "")
        client_ip = request.client.host if request.client else "unknown"
        
        # Processar request
        response = await call_next(request)
        
        # Calcular tempo de resposta
        process_time = (time.time() - start_time) * 1000
        
        # Log estruturado
        log_data = {
            "event_type": "api_request",
            "method": method,
            "path": path,
            "status_code": response.status_code,
            "response_time_ms": round(process_time, 2),
            "client_ip": client_ip,
            "user_agent": user_agent[:100]  # Truncar user agent
        }
        
        # Adicionar user_id se disponível no request state
        if hasattr(request.state, "user_id"):
            log_data["user_id"] = request.state.user_id
        
        # Log level baseado no status code
        if response.status_code >= 500:
            logger.error(json.dumps(log_data))
        elif response.status_code >= 400:
            logger.warning(json.dumps(log_data))
        else:
            logger.info(json.dumps(log_data))
        
        return response
