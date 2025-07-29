"""
MedCheck API - Versão Produção Render
Otimizada para máxima compatibilidade e deploy estável
Python 3.12 + dependências testadas
"""

import json
import logging
import os
import uuid
from datetime import datetime, timedelta
from typing import List

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    create_engine,
    text,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# ===== CONFIGURAÇÃO =====
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medcheck.db")
SECRET_KEY = os.getenv("SECRET_KEY", "medcheck-secret-production-render-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# ===== LOGGING =====
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ===== SECURITY =====
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ===== DATABASE =====
# Fix para Render - PostgreSQL URL
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    # Configurações otimizadas para Render
    **(
        {"check_same_thread": False}
        if "sqlite" in DATABASE_URL
        else {"pool_size": 3, "max_overflow": 7, "pool_timeout": 30}
    ),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ===== MODELS =====
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    crm = Column(String, unique=True, index=True)
    nome = Column(String)
    email = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class GuiaMedica(Base):
    __tablename__ = "guias_medicas"

    id = Column(Integer, primary_key=True, index=True)
    numero_guia = Column(String, index=True)
    crm = Column(String, index=True)
    data_atendimento = Column(DateTime)
    valor_total = Column(Float)
    status = Column(String, default="PENDENTE")
    convenio = Column(String)
    procedimentos = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)


class Demonstrativo(Base):
    __tablename__ = "demonstrativos"

    id = Column(Integer, primary_key=True, index=True)
    crm = Column(String, index=True)
    periodo = Column(String)
    convenio = Column(String)
    valor_bruto = Column(Float)
    valor_liquido = Column(Float)
    total_glosas = Column(Float)
    total_procedimentos = Column(Integer)
    arquivo_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


# ===== PYDANTIC MODELS =====
class UserCreate(BaseModel):
    crm: str
    nome: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    crm: str
    nome: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class GuiaResponse(BaseModel):
    id: int
    numero_guia: str
    data_atendimento: datetime
    valor_total: float
    status: str
    convenio: str

    class Config:
        from_attributes = True


# ===== FASTAPI APP =====
app = FastAPI(
    title="MedCheck API - Produção",
    description="Sistema de análise de guias médicas - Render Production",
    version="1.0.0",
    debug=DEBUG,
)

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.onrender.com",
        "https://medcheck-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== DEPENDENCIES =====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.crm == username).first()
    if user is None:
        raise credentials_exception
    return user


# ===== STARTUP =====
@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 MedCheck API starting - Environment: {ENVIRONMENT}")
    try:
        # Criar tabelas
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/verified")

        # Testar conexão
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("✅ Database connection successful")

    except Exception as e:
        logger.error(f"❌ Startup error: {e}")


# ===== ENDPOINTS =====
@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "MedCheck API - Produção Render",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "docs": "/docs",
        "status": "operational",
    }


@app.get("/health")
async def health_check():
    """Health check simplificado para Render"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": ENVIRONMENT,
    }


@app.post("/api/v1/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Registrar novo usuário"""
    # Verificar se CRM já existe
    db_user = db.query(User).filter(User.crm == user.crm).first()
    if db_user:
        raise HTTPException(status_code=400, detail="CRM já cadastrado")

    # Criar usuário
    hashed_password = get_password_hash(user.password)
    db_user = User(
        crm=user.crm,
        nome=user.nome,
        email=user.email,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    logger.info(f"✅ New user registered: {user.crm}")
    return db_user


@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Login e geração de token"""
    user = db.query(User).filter(User.crm == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="CRM ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.crm})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@app.get("/api/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Estatísticas do dashboard"""
    try:
        # Buscar guias do usuário
        guias = db.query(GuiaMedica).filter(GuiaMedica.crm == current_user.crm).all()

        # Calcular estatísticas
        total_guias = len(guias)
        guias_pagas = [g for g in guias if g.status == "PAGO"]
        guias_pendentes = [g for g in guias if g.status == "PENDENTE"]

        return {
            "totals": {
                "totalGuias": total_guias,
                "totalRecebido": sum(g.valor_total or 0 for g in guias_pagas),
                "totalPendente": sum(g.valor_total or 0 for g in guias_pendentes),
                "totalProcedimentos": total_guias * 3,  # Estimativa
            },
            "guias": [
                {
                    "numero_guia": g.numero_guia,
                    "valor_total": g.valor_total,
                    "status": g.status,
                    "convenio": g.convenio,
                    "data": (
                        g.data_atendimento.isoformat() if g.data_atendimento else None
                    ),
                }
                for g in guias[:10]  # Limitar para performance
            ],
        }
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return {
            "totals": {
                "totalGuias": 0,
                "totalRecebido": 0.0,
                "totalPendente": 0.0,
                "totalProcedimentos": 0,
            },
            "guias": [],
        }


@app.get("/api/guides")
async def get_guides(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = 0,
    size: int = 10,
):
    """Listar guias médicas"""
    try:
        offset = page * size
        guias = (
            db.query(GuiaMedica)
            .filter(GuiaMedica.crm == current_user.crm)
            .offset(offset)
            .limit(size)
            .all()
        )

        total = db.query(GuiaMedica).filter(GuiaMedica.crm == current_user.crm).count()

        return {
            "guides": [
                {
                    "id": str(g.id),
                    "numero_guia": g.numero_guia,
                    "valor_total": g.valor_total,
                    "status": g.status,
                    "convenio": g.convenio,
                    "data": (
                        g.data_atendimento.isoformat() if g.data_atendimento else None
                    ),
                    "qtdProcedimentos": 3,  # Estimativa
                }
                for g in guias
            ],
            "total": total,
            "page": page,
            "size": size,
            "totalPages": (total + size - 1) // size,
        }
    except Exception as e:
        logger.error(f"Error getting guides: {e}")
        return {"guides": [], "total": 0, "page": page, "size": size, "totalPages": 0}


@app.post("/api/guides/upload")
async def upload_guides(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload de arquivos (simulado)"""
    try:
        uploaded_files = []
        for file in files:
            # Simular processamento
            file_info = {
                "filename": file.filename,
                "size": 0,
                "type": file.content_type,
                "status": "processed",
                "guias_found": 1,
            }
            uploaded_files.append(file_info)

            # Criar guia de exemplo
            guia_exemplo = GuiaMedica(
                numero_guia=f"G{uuid.uuid4().hex[:8].upper()}",
                crm=current_user.crm,
                data_atendimento=datetime.utcnow(),
                valor_total=1500.00,
                status="PENDENTE",
                convenio="Unimed",
                procedimentos=json.dumps(
                    [{"codigo": "10101012", "descricao": "Consulta"}]
                ),
            )
            db.add(guia_exemplo)

        db.commit()
        logger.info(f"✅ Files uploaded by user {current_user.crm}")

        return {
            "message": "Arquivos processados com sucesso",
            "files": uploaded_files,
            "total_files": len(uploaded_files),
        }
    except Exception as e:
        logger.error(f"Error uploading files: {e}")
        raise HTTPException(status_code=500, detail="Erro no upload")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
