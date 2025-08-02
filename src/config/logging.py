"""
Configuração de logging estruturado para MedCheck
"""
import logging.config
import os
from pythonjsonlogger import jsonlogger

LOGGING_CONFIG = {
  "version": 1,
  "disable_existing_loggers": false,
  "formatters": {
    "structured": {
      "format": "%(asctime)s %(levelname)s [%(name)s] %(message)s",
      "datefmt": "%Y-%m-%dT%H:%M:%S"
    },
    "json": {
      "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
      "format": "%(asctime)s %(name)s %(levelname)s %(message)s"
    }
  },
  "handlers": {
    "console": {
      "class": "logging.StreamHandler",
      "level": "INFO",
      "formatter": "structured",
      "stream": "ext://sys.stdout"
    }
  },
  "loggers": {
    "": {
      "level": "INFO",
      "handlers": [
        "console"
      ]
    },
    "uvicorn.access": {
      "level": "WARNING",
      "handlers": [
        "console"
      ],
      "propagate": false
    },
    "uvicorn.error": {
      "level": "INFO",
      "handlers": [
        "console"
      ],
      "propagate": false
    }
  }
}

def setup_logging():
    """Configura logging estruturado"""
    # Em produção, usar JSON para melhor parsing
    if os.getenv("ENVIRONMENT") == "production":
        LOGGING_CONFIG["handlers"]["console"]["formatter"] = "json"
    
    logging.config.dictConfig(LOGGING_CONFIG)
    
    # Logger principal da aplicação
    logger = logging.getLogger("medcheck")
    logger.info("Logging configurado com sucesso")
    
    return logger

# Helper para logs estruturados
def log_user_action(logger, user_id, action, **kwargs):
    """Log estruturado para ações de usuário"""
    log_data = {
        "event_type": "user_action",
        "user_id": user_id,
        "action": action,
        **kwargs
    }
    logger.info(json.dumps(log_data))

def log_api_request(logger, method, path, status_code, response_time, **kwargs):
    """Log estruturado para requests de API"""
    log_data = {
        "event_type": "api_request",
        "method": method,
        "path": path,
        "status_code": status_code,
        "response_time_ms": response_time,
        **kwargs
    }
    logger.info(json.dumps(log_data))

def log_error(logger, error, context=None, **kwargs):
    """Log estruturado para erros"""
    log_data = {
        "event_type": "error",
        "error_type": type(error).__name__,
        "error_message": str(error),
        "context": context,
        **kwargs
    }
    logger.error(json.dumps(log_data))
