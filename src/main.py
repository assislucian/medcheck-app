import logging
import os
import sys
import signal
import threading
import time

from src.api import app
from src.database import create_database_engine, init_database

# Adiciona o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def init_database_background():
    """Inicializa o banco em background para não bloquear o startup"""
    try:
        logger.info("Starting background database initialization...")
        engine = create_database_engine()
        init_database(engine)
        logger.info("Database initialized successfully in background")
    except Exception as e:
        logger.error(f"Failed to initialize database in background: {e}")

# Inicializar database em background para não bloquear startup
db_thread = threading.Thread(target=init_database_background, daemon=True)
db_thread.start()
logger.info("Database initialization started in background")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8080))
    logger.info(f"Starting MedCheck API on port {port}")
    
    # Aguardar um momento para garantir que o app está pronto
    time.sleep(1)
    
    # Configuração otimizada para produção no Railway
    logger.info("Starting uvicorn server...")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="info",
        access_log=True,
        # Configurações de performance para Railway
        workers=1,
        loop="uvloop",
        http="httptools"
    )
