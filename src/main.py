import logging
import os
import sys

from src.api import app
from src.database import create_database_engine, init_database

# Adiciona o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar database no startup
try:
    engine = create_database_engine()
    init_database(engine)
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")
    # Continua mesmo com erro de DB para permitir health checks


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8080))
    logger.info(f"Starting MedCheck API on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
