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


def migrate_database(engine):
    """Executa migrações necessárias no banco de dados"""
    try:
        from sqlalchemy import inspect

        insp = inspect(engine)

        # Verificar se a tabela medicos existe e tem a estrutura correta
        if not insp.has_table("medicos"):
            logger.info("Table medicos does not exist, creating...")
            from src.api import Base

            Base.metadata.create_all(bind=engine)
            return True

        # Verificar colunas da tabela medicos
        medico_cols = [c["name"] for c in insp.get_columns("medicos")]
        logger.info(f"Current medicos table columns: {medico_cols}")

        # Verificar se a coluna id existe
        if "id" not in medico_cols:
            logger.warning(
                "Column 'id' missing from medicos table, attempting to add..."
            )
            with engine.connect() as conn:
                try:
                    # Para PostgreSQL
                    if "postgresql" in str(engine.url):
                        conn.execute(
                            text("ALTER TABLE medicos ADD COLUMN id SERIAL PRIMARY KEY")
                        )
                    else:
                        # Para SQLite
                        conn.execute(
                            text(
                                "ALTER TABLE medicos ADD COLUMN id INTEGER PRIMARY KEY "
                                "AUTOINCREMENT"
                            )
                        )
                    logger.info("Column id added to medicos table")
                except Exception as e:
                    logger.error(f"Failed to add id column: {e}")
                    # Se falhar, tentar recriar a tabela
                    logger.info("Attempting to recreate medicos table...")
                    conn.execute(text("DROP TABLE IF EXISTS medicos CASCADE"))
                    from src.api import Base

                    Base.metadata.create_all(bind=engine)
                    logger.info("Medicos table recreated successfully")

        # Verificar outras colunas essenciais
        required_columns = ["crm", "uf", "nome", "senha_hash"]
        missing_columns = [col for col in required_columns if col not in medico_cols]

        if missing_columns:
            logger.warning(f"Missing columns in medicos table: {missing_columns}")
            # Recriar a tabela se faltam colunas essenciais
            with engine.connect() as conn:
                conn.execute(text("DROP TABLE IF EXISTS medicos CASCADE"))
                from src.api import Base

                Base.metadata.create_all(bind=engine)
                logger.info("Medicos table recreated with correct structure")

        return True

    except Exception as e:
        logger.error(f"Failed to migrate database: {e}")
        return False


def init_database(engine):
    """Inicializa as tabelas do banco de dados"""
    try:
        # Testa conexão
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("Database connection successful")

        # Executa migrações
        if not migrate_database(engine):
            logger.error("Database migration failed")
            return False

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
