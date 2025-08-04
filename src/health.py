"""
Endpoint de health check para diagnóstico do sistema
"""

from datetime import datetime

from fastapi import APIRouter
from sqlalchemy import inspect, text

from src.database import engine

router = APIRouter()


@router.get("/health")
def health_check():
    """Health check endpoint com verificação do banco de dados"""
    try:
        # Testar conexão com banco de dados
        db_status = "healthy"
        db_error = None

        try:
            with engine.connect() as conn:
                # Testar query simples
                result = conn.execute(text("SELECT 1")).fetchone()
                if result is None:
                    db_status = "error"
                    db_error = "Query test failed"
        except Exception as e:
            db_status = "error"
            db_error = str(e)

        # Verificar estrutura da tabela medicos
        table_status = "healthy"
        table_error = None

        try:
            insp = inspect(engine)
            if insp.has_table("medicos"):
                columns = insp.get_columns("medicos")
                column_names = [col["name"] for col in columns]

                # Verificar colunas essenciais
                required_columns = ["id", "crm", "uf", "nome", "senha_hash"]
                missing_columns = [
                    col for col in required_columns if col not in column_names
                ]

                if missing_columns:
                    table_status = "warning"
                    table_error = f"Missing columns: {missing_columns}"
            else:
                table_status = "error"
                table_error = "Table 'medicos' does not exist"
        except Exception as e:
            table_status = "error"
            table_error = str(e)

        return {
            "status": "healthy" if db_status == "healthy" else "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": "development",
            "database": {"status": db_status, "error": db_error},
            "tables": {"status": table_status, "error": table_error},
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": "development",
            "error": str(e),
        }
