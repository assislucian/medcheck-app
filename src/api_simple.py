from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, Column, Integer, String, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os
import httpx
import logging

# ===== CONFIGURAÇÃO =====
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# ===== LOGGING =====
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== DATABASE =====
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelo básico para teste
class HealthLog(Base):
    __tablename__ = "health_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="healthy")
    environment = Column(String, default=ENVIRONMENT)

# ===== FASTAPI APP =====
app = FastAPI(
    title="MedCheck API",
    description="Sistema de análise de guias médicas - Produção",
    version="1.0.0",
    debug=DEBUG
)

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== DEPENDENCY =====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== STARTUP =====
@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 MedCheck API starting in {ENVIRONMENT} mode")
    try:
        # Criar tabelas se não existirem
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/verified")
    except Exception as e:
        logger.error(f"❌ Database error: {e}")

# ===== ENDPOINTS =====

@app.get("/")
async def root():
    return {
        "message": "MedCheck API",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "environment": ENVIRONMENT
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Testar conexão com banco
        result = db.execute(text("SELECT 1"))
        db_status = "connected"
        
        # Log do health check (opcional)
        if ENVIRONMENT == "production":
            health_log = HealthLog(status="healthy")
            db.add(health_log)
            db.commit()
            
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "disconnected"
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "environment": ENVIRONMENT,
        "database": db_status,
        "version": "1.0.0"
    }

@app.get("/api/info")
async def api_info():
    return {
        "api_name": "MedCheck API",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "endpoints": {
            "health": "/health",
            "upload": "/api/upload",
            "analysis": "/api/analysis/{file_id}",
            "demo": "/api/demo"
        }
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Endpoint para upload de arquivos - implementação básica"""
    
    # Validar tipo de arquivo
    allowed_extensions = ["pdf", "xlsx", "xls", "csv"]
    file_ext = file.filename.split(".")[-1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo de arquivo não permitido. Aceitos: {allowed_extensions}"
        )
    
    # Simular processamento
    file_id = f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    return {
        "message": "Arquivo recebido com sucesso",
        "file_id": file_id,
        "filename": file.filename,
        "size": file.size if hasattr(file, 'size') else "unknown",
        "type": file.content_type,
        "status": "uploaded",
        "next_step": f"/api/analysis/{file_id}"
    }

@app.get("/api/analysis/{file_id}")
async def get_analysis(file_id: str, db: Session = Depends(get_db)):
    """Endpoint para obter análise de arquivo"""
    
    # Simular análise
    analysis_result = {
        "file_id": file_id,
        "status": "completed",
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_procedures": 15,
            "approved": 12,
            "rejected": 2,
            "pending": 1
        },
        "details": {
            "message": "Análise simulada - implementação em desenvolvimento",
            "processing_time": "2.3s"
        }
    }
    
    return analysis_result

@app.get("/api/demo")
async def demo_endpoint(db: Session = Depends(get_db)):
    """Endpoint de demonstração para testar funcionalidades"""
    
    try:
        # Testar banco
        db_test = db.execute(text("SELECT NOW() as current_time")).fetchone()
        
        return {
            "demo": "MedCheck API Demo",
            "timestamp": datetime.now().isoformat(),
            "database_time": str(db_test[0]) if db_test else "N/A",
            "features": [
                "Upload de arquivos",
                "Análise de guias médicas", 
                "Relatórios detalhados",
                "API REST completa"
            ],
            "status": "functional"
        }
        
    except Exception as e:
        logger.error(f"Demo endpoint error: {e}")
        return {
            "demo": "MedCheck API Demo",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "status": "partial"
        }

# ===== ERROR HANDLERS =====
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if DEBUG else "Something went wrong",
            "timestamp": datetime.now().isoformat()
        }
    )

# ===== MAIN =====
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=int(os.getenv("PORT", 8000)),
        log_level="info"
    ) 