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
from typing import List, Optional

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status, Form
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
    UniqueConstraint,
    create_engine,
    text,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker
from starlette.responses import JSONResponse

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

# Cria engine de forma segura para SQLite e PostgreSQL
if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=3,
        max_overflow=7,
        pool_timeout=30,
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ===== MODELS =====
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    crm = Column(String, unique=False, index=True)
    uf = Column(String, index=True)
    nome = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    terms_accepted = Column(Boolean, default=False)
    terms_version = Column(String, nullable=True)

    __table_args__ = (UniqueConstraint("crm", "uf", name="uix_crm_uf"),)


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
    uf: str
    crm: str
    nome: str
    email: str
    password: str
    terms_accepted: bool
    terms_version: str


class UserResponse(BaseModel):
    message: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class PasswordRecoveryRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


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
# Configuração dinâmica de CORS baseada em variáveis de ambiente
CORS_ORIGINS_ENV = os.getenv("CORS_ORIGINS", "")
DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "https://medcheck-frontend.onrender.com",
    "https://medcheck-backend.onrender.com",
]

# Combinar origens padrão com as definidas no ambiente
cors_origins = DEFAULT_ORIGINS
if CORS_ORIGINS_ENV:
    cors_origins.extend([origin.strip() for origin in CORS_ORIGINS_ENV.split(",")])

# Remover duplicatas mantendo ordem
cors_origins = list(dict.fromkeys(cors_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log das origens CORS para debug
logger.info(f"🌐 CORS Origins configured: {cors_origins}")


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
        crm: str = payload.get("sub")
        uf: Optional[str] = payload.get("uf")
        if crm is None or uf is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # ⚠️ Importante: buscar por CRM + UF para não confundir usuários com mesmo CRM
    user = db.query(User).filter(User.crm == crm, User.uf == uf).first()
    if user is None:
        raise credentials_exception
    return user


# ===== CUSTOM FORM COM UF (para /token) =====
class OAuth2PasswordRequestFormWithUF(OAuth2PasswordRequestForm):
    def __init__(
        self,
        grant_type: str = Form(None),
        username: str = Form(...),
        password: str = Form(...),
        scope: str = Form(""),
        client_id: Optional[str] = Form(None),
        client_secret: Optional[str] = Form(None),
        uf: Optional[str] = Form(None),  # <-- UF enviada pelo frontend
    ):
        super().__init__(
            grant_type=grant_type,
            username=username,
            password=password,
            scope=scope,
            client_id=client_id,
            client_secret=client_secret,
        )
        self.uf = uf


# ===== STARTUP =====
@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 MedCheck API starting - Environment: {ENVIRONMENT}")
    logger.info(f"🔧 Database URL: {DATABASE_URL[:50]}...")
    logger.info(f"🔐 Secret Key configured: {'***' if SECRET_KEY else 'NO'}")
    try:
        # Criar tabelas
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/verified")

        # Testar conexão
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info(f"✅ Database connection successful: {result.fetchone()}")

        logger.info("🎯 Startup completed successfully")

    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        import traceback
        logger.error(f"❌ Traceback: {traceback.format_exc()}")
        raise


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
    try:
        # Testar conexão com banco
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "database": db_status,
        "cors_origins": len(cors_origins),
        "secret_key_configured": bool(SECRET_KEY),
    }

@app.get("/debug/info")
async def debug_info():
    """Informações de debug para diagnóstico (remover em produção)"""
    return {
        "environment": ENVIRONMENT,
        "database_url_prefix": DATABASE_URL[:20] + "..." if DATABASE_URL else "None",
        "cors_origins_count": len(cors_origins),
        "cors_origins": cors_origins[:3],  # Apenas primeiras 3 para segurança
        "secret_key_length": len(SECRET_KEY) if SECRET_KEY else 0,
        "python_version": os.environ.get("PYTHON_VERSION", "unknown"),
        "port": os.environ.get("PORT", "not_set"),
    }


@app.post("/api/v1/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Registrar novo usuário"""
    db_user_by_email = db.query(User).filter(User.email == user.email).first()
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    db_user_by_crm = (
        db.query(User).filter(User.crm == user.crm, User.uf == user.uf).first()
    )
    if db_user_by_crm:
        raise HTTPException(
            status_code=400, detail="CRM já cadastrado para este estado (UF)"
        )

    if not user.terms_accepted:
        raise HTTPException(
            status_code=400,
            detail="É necessário aceitar os Termos de Uso e a Política de Privacidade.",
        )

    hashed_password = get_password_hash(user.password)
    db_user = User(
        crm=user.crm,
        uf=user.uf,
        nome=user.nome,
        email=user.email,
        hashed_password=hashed_password,
        terms_accepted=user.terms_accepted,
        terms_version=user.terms_version,
        created_at=datetime.utcnow(),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    logger.info(f"✅ New user registered: {user.crm} / {user.uf}")
    return UserResponse(message="Cadastro realizado com sucesso!")


@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestFormWithUF = Depends(),
    db: Session = Depends(get_db),
):
    """Login e geração de token (valida UF)."""
    if not form_data.uf:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="UF é obrigatória no login",
        )

    user = db.query(User).filter(User.crm == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="CRM ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verificar UF enviada contra UF do usuário
    if user.uf and form_data.uf.upper() != user.uf.upper():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UF inválida para este usuário",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.crm, "uf": user.uf, "crm": user.crm},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(message="Login realizado com sucesso!"),
    }


@app.post("/api/auth/password-recovery")
async def password_recovery(
    request: PasswordRecoveryRequest, db: Session = Depends(get_db)
):
    """Solicitar recuperação de senha"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Resposta genérica para não revelar se o e-mail existe
        return JSONResponse(
            status_code=200,
            content={
                "message": (
                    "Se um usuário com este e-mail existir, "
                    "um link de recuperação será enviado."
                )
            },
        )

    # Gerar token de reset (curta duração)
    reset_token = create_access_token(
        data={"sub": user.crm, "uf": user.uf, "type": "password_reset"},
        expires_delta=timedelta(minutes=15),
    )

    # **Simulação de envio de e-mail**
    logger.info(f"🔑 Token de reset gerado para {user.email}: {reset_token}")

    return {
        "message": "Link de recuperação enviado (simulado).",
        "reset_token": reset_token,  # Apenas para fins de teste
    }


@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Redefinir a senha com um token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "password_reset":
            raise credentials_exception

        crm: str = payload.get("sub")
        uf: Optional[str] = payload.get("uf")
        if crm is None or uf is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.crm == crm, User.uf == uf).first()
    if not user:
        raise credentials_exception

    # Atualizar senha
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()

    return {"message": "Senha redefinida com sucesso!"}


# ===== ALIASES p/ compatibilidade do frontend (evitar 404) =====
@app.get("/api/profile")
@app.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Perfil do usuário logado"""
    return {
        "crm": current_user.crm,
        "uf": current_user.uf,
        "nome": current_user.nome,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "is_active": current_user.is_active,
    }


@app.get("/api/dashboard/stats")
@app.get("/api/dashboard")
@app.get("/dashboard")
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


@app.get("/api/unpaid-procedures")
@app.get("/unpaid-procedures")
async def unpaid_procedures(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Procedimentos/Guias pendentes do usuário (simples)"""
    pendentes = (
        db.query(GuiaMedica)
        .filter(GuiaMedica.crm == current_user.crm, GuiaMedica.status == "PENDENTE")
        .all()
    )
    items = []
    for g in pendentes:
        try:
            procs = json.loads(g.procedimentos or "[]")
        except Exception:
            procs = []
        items.append(
            {
                "numero_guia": g.numero_guia,
                "data": g.data_atendimento.isoformat() if g.data_atendimento else None,
                "valor_total": g.valor_total,
                "convenio": g.convenio,
                "procedimentos": procs,
            }
        )
    return {"items": items, "count": len(items)}


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
