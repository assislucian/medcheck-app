"""
Módulo de inicialização do banco de dados
"""

import logging
import os

from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)


def create_database_engine():
    """Cria engine do banco de dados com configurações otimizadas"""
    DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///medicos.db")

    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        # PostgreSQL para Railway
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,  # Evita erros de conexão morta
            pool_size=5,  # Reduzido para Railway
            max_overflow=10,  # Reduzido para Railway
            pool_timeout=30,  # Timeout para conexões
            pool_recycle=3600,  # Recicla conexões a cada hora
        )

    return engine


def init_database(engine):
    """Inicializa as tabelas do banco de dados"""
    try:
        # Testa conexão
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("Database connection successful")

        # Importa Base após confirmar conexão
        from src.api import Base

        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        return False


def test_database_connection(engine):
    """Testa a conexão com o banco de dados"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).fetchone()
            return result is not None
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False
