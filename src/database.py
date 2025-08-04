"""
Módulo de inicialização e configuração do banco de dados.
Centraliza a criação do engine e a definição da Base para evitar importações circulares.
"""
import logging
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

# --- Configuração Centralizada do Banco de Dados ---
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///medicos.db")

# Criação do Engine (ponto único de verdade)
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Configurações otimizadas para PostgreSQL no Railway/Produção
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=3600,
    )

# Criação da Base (ponto único de verdade)
Base = declarative_base()

# Criação da SessionLocal (ponto único de verdade)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency para obter uma sessão do banco de dados de forma segura."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_database():
    """
    Inicializa as tabelas do banco de dados usando a Base centralizada.
    Esta função agora é segura para ser chamada no startup.
    """
    try:
        logger.info("Verifying database tables...")
        # Os modelos são importados aqui para garantir que Base já tenha sido populada
        # quando as classes são declaradas em api.py
        from src.api import Medico, Demonstrativo, Guia, Consentimento, Incident
        
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified successfully.")
        return True
    except Exception as e:
        logger.error(f"FATAL: Failed to initialize database tables: {e}", exc_info=True)
        return False
