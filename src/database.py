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

# Criação do Engine (ponto único de verdade) - OTIMIZADO PARA PERFORMANCE
if DATABASE_URL.startswith("sqlite"):
    # SQLite otimizado para desenvolvimento
    engine = create_engine(
        DATABASE_URL, 
        connect_args={
            "check_same_thread": False,
            "timeout": 20,  # Timeout para evitar locks longos
        },
        pool_pre_ping=True,  # Verifica conexões antes do uso
        pool_recycle=3600,   # Recicla conexões a cada hora
        echo=False           # Disable SQL logging em produção
    )
else:
    # PostgreSQL otimizado para produção - CONFIGURAÇÕES HARVARD-LEVEL + RENDER
    # Usa variáveis de ambiente do Render para configuração dinâmica
    pool_size = int(os.environ.get("DB_POOL_SIZE", "10"))
    max_overflow = int(os.environ.get("DB_MAX_OVERFLOW", "20"))
    pool_timeout = int(os.environ.get("DB_POOL_TIMEOUT", "30"))
    pool_recycle = int(os.environ.get("DB_POOL_RECYCLE", "1800"))
    
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,        # Detecta conexões mortas
        pool_size=pool_size,       # Configurável via env vars
        max_overflow=max_overflow, # Configurável via env vars  
        pool_timeout=pool_timeout, # Configurável via env vars
        pool_recycle=pool_recycle, # Configurável via env vars
        connect_args={
            "connect_timeout": 10,
            "application_name": "medcheck_api",
            "options": "-c statement_timeout=30000",  # 30s timeout para queries
            "keepalives_idle": 600,    # Keep connections alive
            "keepalives_interval": 30, # Check every 30s
            "keepalives_count": 3      # Max 3 failed checks
        },
        echo=False,                # Performance: disable SQL logging
        future=True,               # Use SQLAlchemy 2.0 style
        # Render-specific optimizations
        pool_reset_on_return='commit',  # Reset on return for consistency
        isolation_level="READ_COMMITTED"  # Better performance for read-heavy workloads
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
