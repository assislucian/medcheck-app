# flake8: noqa
import hashlib
import io
import json
import logging
import os
import pdb
import re
import shutil
import sqlite3
import sys
import tempfile
import time
import zipfile
from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import List
from uuid import uuid4

import bcrypt
import jwt
import pandas as pd
import sqlalchemy
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Body,
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    create_engine,
    desc,
    func,
    text,
)
from sqlalchemy.orm import declarative_base, sessionmaker

from src.parsers.cbhpm_parser import CBHPMParser
from src.services.parse import parse_demonstrativo, parse_guide_pdf

# --- Configurações de Segurança ---
UPLOAD_DIR = "uploads"
RESULTS_DIR = "results"
CBHPM_VERSION = "2015"
MAX_UPLOAD_SIZE_MB = 50  # Aumentado de 10MB para suportar arquivos maiores
MAX_UPLOAD_FILES = 10  # Limite de arquivos por upload

# Configurações JWT mais seguras
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(
    os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
)  # Reduzido de 480 para 60 minutos

# Validação do segredo JWT em produção
if (
    os.environ.get("ENV", "development") == "production"
    and JWT_SECRET == "dev-secret-change-me"
):
    raise ValueError("JWT_SECRET deve ser configurado em produção!")

# --- Configuração de logging (precisa ser antes do ADMIN_SECRET) ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("api")

# Configurações de segurança aprimoradas
ADMIN_SECRET = os.environ.get("ADMIN_SECRET")
if not ADMIN_SECRET:
    # Em ambiente Railway, gera um secret temporário se não configurado
    if os.environ.get("RAILWAY_ENVIRONMENT"):
        import secrets

        ADMIN_SECRET = secrets.token_urlsafe(32)
        logger.warning(
            "ADMIN_SECRET not configured in Railway. Generated temporary secret."
        )
    else:
        ADMIN_SECRET = "admin-secret-change-in-production"
    if os.environ.get("ENV", "development") == "production":
        raise ValueError("ADMIN_SECRET deve ser configurado em produção!")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# --- Banco de dados SQLAlchemy (SQLite) ---
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///medicos.db")
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Ajuste: pool_pre_ping=True evita erros de conexão morta, pool_size e max_overflow controlam o pool
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Evita erros de conexão morta
        pool_size=10,  # Ajuste conforme limite do Railway
        max_overflow=20,  # Ajuste conforme necessidade
    )
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Medico(Base):
    __tablename__ = "medicos"
    id = Column(Integer, primary_key=True, autoincrement=True)
    crm = Column(String, nullable=False)
    uf = Column(String, nullable=False)
    nome = Column(String, nullable=False)
    senha_hash = Column(String, nullable=False)
    terms_accepted = Column(Integer, nullable=False, default=0)  # 0 = False, 1 = True
    terms_accepted_at = Column(DateTime, nullable=True)
    terms_version = Column(String, nullable=True)
    last_login_at = Column(DateTime, nullable=True)
    __table_args__ = (UniqueConstraint("crm", "uf", name="uix_crm_uf"),)


class Demonstrativo(Base):
    __tablename__ = "demonstrativos"
    id = Column(Integer, primary_key=True, index=True)
    crm = Column(String, nullable=False, index=True)
    uf = Column(
        String, nullable=False, index=True
    )  # CRÍTICO: adicionar UF para isolamento
    periodo = Column(String, nullable=True, index=True)
    lote = Column(String, nullable=True)
    filename = Column(String, nullable=False)
    # Hash SHA-256 do conteúdo do arquivo para detectar duplicações mesmo com nomes diferentes
    file_hash = Column(String(64), nullable=True, index=True)
    total_procedimentos = Column(Integer, nullable=False, default=0)
    apresentado = Column(String, nullable=False, default="R$ 0,00")
    liberado = Column(String, nullable=False, default="R$ 0,00")
    glosa = Column(String, nullable=False, default="R$ 0,00")
    upload_time = Column(DateTime, default=datetime.utcnow)


class Guia(Base):
    __tablename__ = "guias"
    id = Column(Integer, primary_key=True, index=True)
    numero_guia = Column(String, nullable=False, index=True)
    data = Column(String, nullable=False)
    paciente = Column(String, nullable=True)
    codigo = Column(String, nullable=False)
    descricao = Column(String, nullable=False)
    papel = Column(String, nullable=False)
    crm = Column(String, nullable=False)
    uf = Column(
        String, nullable=False, index=True
    )  # CRÍTICO: adicionar UF para isolamento
    qtd = Column(Integer, nullable=False)
    status = Column(String, nullable=True)
    prestador = Column(String, nullable=True)
    user_id = Column(String, nullable=False, index=True)  # CRM do médico
    nome_medico = Column(String, nullable=True)  # Nome do médico participante
    dt_inicio = Column(String, nullable=True)  # Data/hora de início do procedimento
    dt_fim = Column(String, nullable=True)  # Data/hora de fim do procedimento
    status_part = Column(
        String, nullable=True
    )  # Status da participação (ex: Fechada, Pendente)
    # Hash SHA-256 do conteúdo do arquivo para detectar duplicações mesmo com nomes diferentes
    file_hash = Column(String(64), nullable=True, index=True)
    filename = Column(String, nullable=True)  # Nome original do arquivo


class Consentimento(Base):
    __tablename__ = "consentimentos"
    id = Column(Integer, primary_key=True, index=True)
    crm = Column(String, ForeignKey("medicos.crm"), nullable=False, index=True)
    terms_version = Column(String, nullable=False)
    accepted_at = Column(DateTime, nullable=False)
    ip = Column(String, nullable=True)


class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    occurred_at = Column(DateTime, nullable=False)
    user_crm = Column(String, nullable=True)
    ip = Column(String, nullable=True)
    status = Column(String, nullable=False, default="open")


class IncidentListItem(BaseModel):
    id: int
    type: str
    description: str
    occurred_at: str
    user_crm: str = None
    ip: str = None
    status: str


class SuboperadorItem(BaseModel):
    nome: str
    finalidade: str
    pais: str


class LGPDRequest(BaseModel):
    nome: str
    email: str
    crm: str = None
    tipo: str  # acesso, portabilidade, exclusao, revogacao, duvida
    mensagem: str


class LGPDRequestResponse(BaseModel):
    message: str


# Inicializar tabelas com tratamento de erro
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")
    # Continua mesmo com erro de DB para permitir health checks


# Migração leve: garantir colunas uf e file_hash nas tabelas
def _ensure_uf_and_file_hash_columns():
    try:
        insp = sqlalchemy.inspect(engine)

        # Verificar e adicionar coluna uf na tabela demonstrativos
        demo_cols = [c["name"] for c in insp.get_columns("demonstrativos")]
        if "uf" not in demo_cols:
            with engine.connect() as conn:
                conn.execute(
                    sqlalchemy.text(
                        "ALTER TABLE demonstrativos ADD COLUMN uf VARCHAR(10) DEFAULT 'AC'"
                    )
                )
                conn.execute(
                    sqlalchemy.text(
                        "CREATE INDEX IF NOT EXISTS ix_demonstrativos_uf ON demonstrativos(uf)"
                    )
                )
            logger.info("Column uf added to demonstrativos table")

        # Verificar e adicionar coluna file_hash na tabela demonstrativos
        if "file_hash" not in demo_cols:
            with engine.connect() as conn:
                conn.execute(
                    sqlalchemy.text(
                        "ALTER TABLE demonstrativos ADD COLUMN file_hash VARCHAR(64)"
                    )
                )
                conn.execute(
                    sqlalchemy.text(
                        "CREATE INDEX IF NOT EXISTS ix_demonstrativos_file_hash ON demonstrativos(file_hash)"
                    )
                )
            logger.info("Column file_hash added to demonstrativos table")

        # Verificar e adicionar coluna uf na tabela guias
        guia_cols = [c["name"] for c in insp.get_columns("guias")]
        if "uf" not in guia_cols:
            with engine.connect() as conn:
                conn.execute(
                    sqlalchemy.text(
                        "ALTER TABLE guias ADD COLUMN uf VARCHAR(10) DEFAULT 'AC'"
                    )
                )
                conn.execute(
                    sqlalchemy.text(
                        "CREATE INDEX IF NOT EXISTS ix_guias_uf ON guias(uf)"
                    )
                )
            logger.info("Column uf added to guias table")

        # Verificar e adicionar coluna file_hash na tabela guias
        if "file_hash" not in guia_cols:
            with engine.connect() as conn:
                conn.execute(
                    sqlalchemy.text(
                        "ALTER TABLE guias ADD COLUMN file_hash VARCHAR(64)"
                    )
                )
                conn.execute(
                    sqlalchemy.text(
                        "CREATE INDEX IF NOT EXISTS ix_guias_file_hash ON guias(file_hash)"
                    )
                )
            logger.info("Column file_hash added to guias table")

    except Exception as exc:
        logger.error(f"Failed to ensure uf and file_hash columns: {exc}")


_ensure_uf_and_file_hash_columns()

# --- Autenticação JWT real (MVP) ---
# Quando SKIP_AUTH é true, precisamos deixar o token opcional
skip_auth = os.environ.get("SKIP_AUTH", "").lower() == "true"
if skip_auth:
    # Use our custom Bearer class that doesn't require authentication
    class OptionalOAuth2PasswordBearer(OAuth2PasswordBearer):
        async def __call__(self, request: Request = None):
            try:
                return await super().__call__(request)
            except HTTPException:
                return None

    oauth2_scheme = OptionalOAuth2PasswordBearer(tokenUrl="token")
else:
    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")


def get_current_user(token: str = Depends(oauth2_scheme)):
    # Check if authentication should be skipped (for development/testing)
    skip_auth = os.environ.get("SKIP_AUTH", "").lower() == "true"
    if skip_auth:
        # Use CRM_LOGADO environment variable to simulate a logged-in user
        crm_logado = os.environ.get("CRM_LOGADO")
        uf_logado = os.environ.get("UF_LOGADO")
        if not crm_logado or not uf_logado:
            logger.warning("SKIP_AUTH is true but CRM_LOGADO or UF_LOGADO is not set!")
            raise HTTPException(
                status_code=401,
                detail="CRM_LOGADO or UF_LOGADO environment variable is required when SKIP_AUTH=true",
            )
        db = SessionLocal()
        try:
            # Try to find medico in database to get the nome
            medico = db.query(Medico).filter_by(crm=crm_logado, uf=uf_logado).first()
            nome = medico.nome if medico else "Médico Teste"
            logger.info(f"Autenticação ignorada. Usando CRM {crm_logado} ({nome})")
            return {"crm": crm_logado, "uf": uf_logado, "nome": nome}
        finally:
            db.close()

    # If token is None and auth is not skipped, raise error
    if token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Normal authentication flow
    payload = decode_jwt(token)
    return {
        "crm": payload.get("crm"),
        "uf": payload.get("uf"),
        "nome": payload.get("nome"),
    }


# --- FastAPI app com configurações de segurança ---
app = FastAPI(
    title="MedCheck - Validador de Demonstrativos e Guias Médicas",
    version="1.0.0",
    docs_url="/docs" if os.environ.get("ENV", "development") == "development" else None,
    redoc_url=(
        "/redoc" if os.environ.get("ENV", "development") == "development" else None
    ),
)


# --- Middleware de Segurança ---
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)

    # Cabeçalhos de segurança
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    # Content Security Policy
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' https:; "
        "connect-src 'self' https:; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
    response.headers["Content-Security-Policy"] = csp

    # Strict Transport Security (HTTPS only)
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

    return response


# --- Rate Limiting aprimorado ---
if os.environ.get("ENV", "production") == "development":
    limiter = Limiter(key_func=get_remote_address, default_limits=["100 per minute"])
else:
    limiter = Limiter(key_func=get_remote_address, default_limits=["10 per minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS seguro ---
# Lê a variável FRONTEND_ORIGINS (separada por vírgula) e aplica no middleware CORS.
# Isso garante que apenas os domínios autorizados possam acessar a API.
FRONTEND_ORIGINS = os.environ.get("FRONTEND_ORIGINS")
# Novo: padrão regex para permitir subdomínios dinâmicos do Vercel (ex.: *.vercel.app)
FRONTEND_ORIGIN_REGEX = os.environ.get("FRONTEND_ORIGIN_REGEX")

if FRONTEND_ORIGINS:
    allowed_origins = [o.strip() for o in FRONTEND_ORIGINS.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:8080",  # Frontend local
        "http://localhost:8081",
        "http://localhost:8082",  # Porta adicional para desenvolvimento
        "http://localhost:8083",  # Porta adicional para desenvolvimento
        "http://localhost:8084",  # Porta adicional para desenvolvimento
        "http://localhost:8085",  # Porta adicional para desenvolvimento
        "http://localhost:3000",  # Create React App padrão
        "http://localhost:3001",  # Porta adicional React
        "http://localhost:5173",  # Vite padrão
        "http://localhost:5174",  # Vite porta adicional
        "https://medcheck.app",  # Produção (ajuste para seu domínio real)
        "https://medcheck-app.vercel.app",  # Vercel produção
        "https://www.medcheck-app.vercel.app",  # Vercel produção com www
        "https://medcheck-app-assislucians-projects.vercel.app",
    ]

# Garantir que endereços locais comuns estejam sempre presentes
for local_origin in [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
]:
    if local_origin not in allowed_origins:
        allowed_origins.append(local_origin)

# Se nenhum regex for definido mas queremos permitir *.vercel.app por padrão
if not FRONTEND_ORIGIN_REGEX:
    # Permite qualquer subdomínio do Vercel no seu namespace (preview deployments)
    # Ex.: https://medcheck-app-xxxxx-assislucians-projects.vercel.app
    # Ex.: https://medcheck-prddbw64p-assislucians-projects.vercel.app
    FRONTEND_ORIGIN_REGEX = (
        r"https://medcheck-[a-z0-9-]+-assislucians-projects\.vercel\.app"
    )

logging.info(
    f"CORS: allowed_origins = {allowed_origins} | allowed_origin_regex = {FRONTEND_ORIGIN_REGEX}"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=FRONTEND_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Importa e registra o router de glosas (Knowledge Base) ---
# Comentado temporariamente para debug do Railway
# from backend.knowledge_base.glosas_api import router as glosas_router
# app.include_router(glosas_router, prefix="/api/v1")

# --- Logging estruturado ---
# --- Logging estruturado para auditoria ---
AUDIT_LOG_PATH = os.path.join("logs", "medcheck_audit.log")
os.makedirs("logs", exist_ok=True)
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)
if not audit_logger.handlers:
    handler = logging.FileHandler(AUDIT_LOG_PATH)
    handler.setLevel(logging.INFO)
    audit_logger.addHandler(handler)


def log_audit(action, user_crm=None, ip=None, details=None):
    audit_logger.info(
        json.dumps(
            {
                "timestamp": datetime.utcnow().isoformat(),
                "action": action,
                "user_crm": user_crm,
                "ip": ip,
                "details": details,
            }
        )
    )


def sanitize_text(text):
    import re

    if not text:
        return text
    text = re.sub(r"<.*?>", "", text)
    text = re.sub(r"script", "", text, flags=re.IGNORECASE)
    return text.strip()


# --- Models ---
class RegisterRequest(BaseModel):
    uf: str
    crm: str
    nome: str
    senha: str
    terms_accepted: bool
    terms_version: str


class RegisterResponse(BaseModel):
    message: str


class ValidateResponse(BaseModel):
    job_id: str
    status: str
    cbhpm_version: str
    detail: str = ""


class StatusResponse(BaseModel):
    job_id: str
    status: str
    result_url: str = None
    cbhpm_version: str
    detail: str = ""


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class ActivityLogEntry(BaseModel):
    action: str
    target: dict = None
    result: str = None
    details: str = None


class UpdateProfileRequest(BaseModel):
    nome: str = Field(None, description="Nome completo")
    uf: str = Field(None, description="UF do CRM")
    senha: str = Field(None, description="Nova senha (opcional)")
    email: str | None = Field(None, description="E-mail de contato")
    specialty: str | None = Field(None, description="Especialidade médica")
    hospital: str | None = Field(None, description="Hospital/Clínica principal")
    phone: str | None = Field(None, description="Telefone de contato")
    bio: str | None = Field(None, description="Biografia/Descrição")
    avatar_url: str | None = Field(
        None, description="URL da foto do médico (base64 compactada)"
    )


class UpdateProfileResponse(BaseModel):
    message: str


class AnonimizationResponse(BaseModel):
    message: str


class IncidentRequest(BaseModel):
    type: str
    description: str
    user_crm: str = None
    ip: str = None


class IncidentResponse(BaseModel):
    message: str
    incident_id: int


class InactiveAccountItem(BaseModel):
    crm: str
    nome: str
    uf: str
    last_login_at: str = None
    created_at: str = None


class NotifyInactiveResponse(BaseModel):
    message: str
    notified_crms: list[str]


class BulkDeleteResponse(BaseModel):
    message: str
    deleted_crms: list[str]


# --- Simulação de fila de jobs (substitua por Celery/RQ em produção) ---
jobs = {}

# --- Brute force protection ---
FAILED_LOGINS = defaultdict(list)  # (crm, ip) -> [timestamps]
BLOCKED_LOGINS = {}  # (crm, ip) -> unblock_timestamp
MAX_FAILED_ATTEMPTS = 5
BLOCK_TIME_SECONDS = 600  # 10 minutos
WINDOW_SECONDS = 600  # 10 minutos


# --- Endpoint de cadastro com validação aprimorada ---
@app.post("/api/v1/register", response_model=RegisterResponse)
@limiter.limit("3/minute")  # Limite mais restritivo para cadastros
def register_medico(req: RegisterRequest, request: Request):
    # Validação de entrada
    if not validate_crm(req.crm):
        raise HTTPException(
            status_code=400, detail="CRM deve conter apenas números (4-6 dígitos)"
        )

    if not validate_uf(req.uf):
        raise HTTPException(status_code=400, detail="UF inválida")

    # Sanitizar dados
    req.nome = sanitize_text(req.nome, max_length=200)
    req.crm = sanitize_text(req.crm, max_length=10)
    req.uf = req.uf.upper().strip()

    # Validação de senha forte
    def senha_forte(s):
        if len(s) < 8:
            return False, "A senha deve ter pelo menos 8 caracteres"
        if not re.search(r"[A-Z]", s):
            return False, "A senha deve conter pelo menos uma letra maiúscula"
        if not re.search(r"[a-z]", s):
            return False, "A senha deve conter pelo menos uma letra minúscula"
        if not re.search(r"[0-9]", s):
            return False, "A senha deve conter pelo menos um número"
        if not re.search(r"[^A-Za-z0-9]", s):
            return False, "A senha deve conter pelo menos um caractere especial"
        # Verificar sequências comuns
        if any(seq in s.lower() for seq in ["123", "abc", "qwe", "asd"]):
            return False, "A senha não pode conter sequências comuns"
        return True, ""

    is_strong, msg = senha_forte(req.senha)
    if not is_strong:
        raise HTTPException(status_code=400, detail=msg)

    db = SessionLocal()
    try:
        if db.query(Medico).filter_by(crm=req.crm, uf=req.uf).first():
            raise HTTPException(
                status_code=400, detail="CRM já cadastrado para este estado (UF)"
            )
        if not req.terms_accepted:
            raise HTTPException(
                status_code=400,
                detail="É necessário aceitar os Termos de Uso e a Política de Privacidade.",
            )
        senha_hash = bcrypt.hashpw(req.senha.encode(), bcrypt.gensalt()).decode()
        medico = Medico(
            crm=req.crm,
            uf=req.uf,
            nome=req.nome,
            senha_hash=senha_hash,
            terms_accepted=1 if req.terms_accepted else 0,
            terms_accepted_at=datetime.utcnow(),
            terms_version=req.terms_version,
        )
        db.add(medico)
        db.commit()
        # Registrar consentimento histórico
        ip = request.client.host if request and request.client else None
        consent = Consentimento(
            crm=req.crm,
            terms_version=req.terms_version,
            accepted_at=datetime.utcnow(),
            ip=ip,
        )
        db.add(consent)
        log_audit(
            "register",
            user_crm=req.crm,
            ip=ip,
            details={"uf": req.uf, "nome": req.nome},
        )
        logger.info(
            f"Novo médico cadastrado: {req.uf}-{req.crm} - {req.nome} (aceite termos v{req.terms_version}, IP {ip})"
        )
        return RegisterResponse(message="Cadastro realizado com sucesso!")
    finally:
        db.close()


# --- Endpoint de login/token (persistente) ---
@app.post("/token", response_model=TokenResponse)
@limiter.limit("3/minute")  # Limite mais restritivo para login
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    crm = form_data.username
    senha = form_data.password
    uf = form_data.scopes[0] if form_data.scopes else None
    ip = request.client.host if request and request.client else "unknown"

    # Validação de entrada
    if not crm or not senha:
        raise HTTPException(status_code=400, detail="CRM e senha são obrigatórios")

    if not validate_crm(crm):
        raise HTTPException(status_code=400, detail="Formato de CRM inválido")

    if not validate_uf(uf) if uf else False:
        raise HTTPException(status_code=400, detail="UF inválida")

    # Sanitizar inputs
    crm = sanitize_text(crm, max_length=10)
    if uf:
        uf = uf.upper().strip()

    # Rate limiting por IP + CRM
    key = (crm, ip)
    now = time.time()

    # Checar bloqueio
    if key in BLOCKED_LOGINS and BLOCKED_LOGINS[key] > now:
        raise HTTPException(
            status_code=429,
            detail="Muitas tentativas de login. Tente novamente em alguns minutos.",
        )

    # Limpar tentativas antigas
    FAILED_LOGINS[key] = [t for t in FAILED_LOGINS[key] if now - t < WINDOW_SECONDS]

    if not uf:
        raise HTTPException(status_code=400, detail="UF obrigatória para login")

    db = SessionLocal()
    try:
        medico = db.query(Medico).filter_by(crm=crm, uf=uf).first()
        if not medico or not bcrypt.checkpw(senha.encode(), medico.senha_hash.encode()):
            log_audit(
                "login_failed",
                user_crm=crm,
                ip=ip,
                details={"uf": uf, "reason": "invalid_credentials"},
            )
            FAILED_LOGINS[key].append(now)
            if len(FAILED_LOGINS[key]) >= MAX_FAILED_ATTEMPTS:
                BLOCKED_LOGINS[key] = now + BLOCK_TIME_SECONDS
                FAILED_LOGINS[key] = []
                log_audit(
                    "login_blocked",
                    user_crm=crm,
                    ip=ip,
                    details={"uf": uf, "duration": BLOCK_TIME_SECONDS},
                )
            raise HTTPException(status_code=401, detail="CRM, UF ou senha inválidos")

        # Resetar tentativas após sucesso
        FAILED_LOGINS[key] = []
        if key in BLOCKED_LOGINS:
            del BLOCKED_LOGINS[key]

        # Atualizar último login
        medico.last_login_at = datetime.utcnow()
        db.commit()

        # Criar token com expiração mais curta
        access_token = create_access_token(
            {"crm": crm, "uf": uf, "nome": medico.nome},
            expires_delta=timedelta(minutes=JWT_EXPIRE_MINUTES),
        )

        log_audit("login_success", user_crm=crm, ip=ip, details={"uf": uf})

        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        db.close()


# --- Processamento real do pipeline ---
def process_validation_job(job_id: str, file_path: str, user: dict):
    logger.info(
        f"[JOB {job_id}] Iniciando processamento para {file_path} (CRM: {user['crm']})"
    )
    try:
        df = parse_demonstrativo(file_path, user_crm=user["crm"])
        # Calcular agregados
        total_procedimentos = len(df)
        apresentado = (
            df["apresentado"].replace(",", ".", regex=True).astype(float).sum()
            if "apresentado" in df
            else 0.0
        )
        liberado = (
            df["liberado"].replace(",", ".", regex=True).astype(float).sum()
            if "liberado" in df
            else 0.0
        )
        glosa = (
            df["glosa"].replace(",", ".", regex=True).astype(float).sum()
            if "glosa" in df
            else 0.0
        )
        # Salvar agregados no Demonstrativo (se possível identificar periodo/lote)
        # Aqui, para MVP, buscar por nome do arquivo ou metadados
        periodo = None
        lote = None
        if hasattr(df, "periodo"):
            periodo = df["periodo"][0]
        if hasattr(df, "lote"):
            lote = df["lote"][0]
        # Atualizar no banco
        db = SessionLocal()
        try:
            demo = (
                db.query(Demonstrativo)
                .filter_by(filename=os.path.basename(file_path))
                .first()
            )
            if demo:
                demo.total_procedimentos = total_procedimentos
                demo.apresentado = f"R$ {apresentado:,.2f}".replace(".", ",")
                demo.liberado = f"R$ {liberado:,.2f}".replace(".", ",")
                demo.glosa = f"R$ {glosa:,.2f}".replace(".", ",")
                if periodo:
                    demo.periodo = periodo
                if lote:
                    demo.lote = lote
                db.commit()
        finally:
            db.close()
        result_path = os.path.join(RESULTS_DIR, f"{job_id}.json")
        df.to_json(result_path, orient="records", force_ascii=False)
        jobs[job_id] = {
            "status": "done",
            "result_path": result_path,
            "cbhpm_version": CBHPM_VERSION,
            "crm": user["crm"],
        }
        logger.info(
            f"[JOB {job_id}] Processamento concluído com sucesso para CRM {user['crm']}"
        )
    except Exception as e:
        jobs[job_id] = {
            "status": "error",
            "cbhpm_version": CBHPM_VERSION,
            "detail": str(e),
            "crm": user["crm"],
        }
        logger.error(f"[JOB {job_id}] Erro: {e}")


# --- Endpoint de upload/validação ---
@app.post("/api/v1/validate", response_model=ValidateResponse)
@limiter.limit("10/minute")
def validate_file(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    # Limite de tamanho (leitura manual do arquivo)
    contents = file.file.read()
    if len(contents) > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Arquivo muito grande")
    # Salva arquivo temporário
    job_id = str(uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    # Cria job assíncrono
    jobs[job_id] = {
        "status": "processing",
        "cbhpm_version": CBHPM_VERSION,
        "crm": user["crm"],
    }
    background_tasks.add_task(process_validation_job, job_id, file_path, user)
    logger.info(f"[API] Upload recebido de CRM {user['crm']} para job {job_id}")
    return ValidateResponse(
        job_id=job_id, status="processing", cbhpm_version=CBHPM_VERSION
    )


# --- Endpoint de status/resultados ---
@app.get("/api/v1/status/{job_id}", response_model=StatusResponse)
def get_status(job_id: str, user: dict = Depends(get_current_user)):
    job = jobs.get(job_id)
    if not job or job.get("crm") != user["crm"]:
        raise HTTPException(status_code=404, detail="Job não encontrado para este CRM")
    result_url = None
    if job["status"] == "done":
        result_url = f"/api/v1/result/{job_id}"
    return StatusResponse(
        job_id=job_id,
        status=job["status"],
        result_url=result_url,
        cbhpm_version=job["cbhpm_version"],
        detail=job.get("detail", ""),
    )


# --- Endpoint para download do resultado ---
@app.get("/api/v1/result/{job_id}")
def download_result(job_id: str, user: dict = Depends(get_current_user)):
    job = jobs.get(job_id)
    if not job or job["status"] != "done" or job.get("crm") != user["crm"]:
        raise HTTPException(
            status_code=404, detail="Resultado não disponível para este CRM"
        )
    return FileResponse(
        job["result_path"],
        media_type="application/json",
        filename=f"resultado_{job_id}.json",
    )


# --- Endpoint de cross-check Demonstrativo + Guias ---
@app.post("/api/v1/validate-cross")
def validate_cross(
    demonstrativo: UploadFile = File(...),
    guias: List[UploadFile] = File(...),
    user: dict = Depends(get_current_user),
):
    # Salva arquivos temporários
    job_id = str(uuid4())
    demo_path = os.path.join(UPLOAD_DIR, f"{job_id}_demonstrativo.pdf")
    with open(demo_path, "wb") as f:
        shutil.copyfileobj(demonstrativo.file, f)
    guias_paths = []
    for idx, guia in enumerate(guias):
        guia_path = os.path.join(UPLOAD_DIR, f"{job_id}_guia_{idx}.pdf")
        with open(guia_path, "wb") as f:
            shutil.copyfileobj(guia.file, f)
        guias_paths.append(guia_path)

    # Parse demonstrativo
    try:
        df_demo = parse_demonstrativo(demo_path, user_crm=user["crm"])
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Erro ao processar demonstrativo: {e}"
        )

    # Parse guias
    guias_dfs = []
    for guia_path in guias_paths:
        try:
            df_guia = parse_guide_pdf(guia_path, user["crm"])
            guias_dfs.append(df_guia)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erro ao processar guia: {e}")
    if not guias_dfs:
        raise HTTPException(status_code=400, detail="Nenhuma guia válida encontrada.")
    df_guias = pd.concat(guias_dfs, ignore_index=True)

    # Padroniza as chaves de merge
    for col in ["guia", "codigo", "crm"]:
        if col not in df_demo.columns:
            df_demo[col] = None
        if col not in df_guias.columns:
            df_guias[col] = None
    key_demo = key_guia = ["guia", "codigo", "crm"]
    # Merge outer e conta divergências
    merged = pd.merge(
        df_demo,
        df_guias,
        left_on=key_demo,
        right_on=key_guia,
        how="outer",
        indicator=True,
    )
    pendentes_demo = merged[merged["_merge"] == "left_only"]
    pendentes_guia = merged[merged["_merge"] == "right_only"]
    divergencias = merged[merged["_merge"] == "both"]

    resumo = {
        "Lançamentos no Demonstrativo": len(df_demo),
        "Procedimentos nas Guias": len(df_guias),
        "No Demo sem Guia correspondente": len(pendentes_demo),
        "Guia sem lançamento no Demo": len(pendentes_guia),
        "Procedimentos cruzados": len(divergencias),
    }

    # Salva relatório detalhado
    result_path = os.path.join(RESULTS_DIR, f"{job_id}_relatorio.csv")
    merged.to_csv(result_path, index=False)
    report_url = f"/api/v1/result-cross/{job_id}"

    return {"summary": resumo, "report_url": report_url}


# --- Endpoint para download do relatório cross-check ---
@app.get("/api/v1/result-cross/{job_id}")
def download_cross_report(job_id: str, user: dict = Depends(get_current_user)):
    result_path = os.path.join(RESULTS_DIR, f"{job_id}_relatorio.csv")
    if not os.path.exists(result_path):
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    return FileResponse(
        result_path, media_type="text/csv", filename=f"relatorio_cross_{job_id}.csv"
    )


# --- Validação de arquivos aprimorada ---
def validate_upload_file(file: UploadFile) -> tuple[bool, str]:
    """Valida arquivo de upload."""
    # Verificar se o arquivo existe
    if not file or not file.filename:
        return False, "Arquivo não fornecido"

    # Verificar tamanho do arquivo
    file.file.seek(0, 2)  # Ir para o final
    file_size = file.file.tell()
    file.file.seek(0)  # Voltar ao início

    if file_size > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        return False, f"Arquivo muito grande. Máximo: {MAX_UPLOAD_SIZE_MB}MB"

    if file_size == 0:
        return False, "Arquivo vazio"

    # Verificar extensão
    allowed_extensions = {".pdf", ".xlsx", ".xls", ".csv"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        return (
            False,
            f"Tipo de arquivo não permitido. Permitidos: {', '.join(allowed_extensions)}",
        )

    # Verificar tipo MIME
    allowed_mimes = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "application/csv",
    }
    if file.content_type not in allowed_mimes:
        return False, f"Tipo MIME não permitido: {file.content_type}"

    # Verificar nome do arquivo contra path traversal
    if ".." in file.filename or "/" in file.filename or "\\" in file.filename:
        return False, "Nome de arquivo inválido"

    return True, ""


# --- Upload de arquivos com validação aprimorada ---
@app.post("/api/v1/demonstrativos/upload")
def upload_demonstrativos(
    files: List[UploadFile] = File(...),
    periodo: str = Form(None),
    lote: str = Form(None),
    user: dict = Depends(get_current_user),
):
    # Validar número de arquivos
    if len(files) > MAX_UPLOAD_FILES:
        raise HTTPException(
            status_code=400, detail=f"Muitos arquivos. Máximo: {MAX_UPLOAD_FILES}"
        )

    # Sanitizar inputs
    if periodo:
        periodo = sanitize_text(periodo, max_length=50)
    if lote:
        lote = sanitize_text(lote, max_length=50)

    # Validar cada arquivo
    for file in files:
        is_valid, error_msg = validate_upload_file(file)
        if not is_valid:
            raise HTTPException(
                status_code=400, detail=f"Arquivo '{file.filename}': {error_msg}"
            )

    db = SessionLocal()
    results = []
    try:
        for file in files:
            try:
                job_id = str(uuid4())
                filename = f"{job_id}_{file.filename}"
                file_path = os.path.join(UPLOAD_DIR, filename)
                with open(file_path, "wb") as f:
                    shutil.copyfileobj(file.file, f)

                # Calcular hash SHA-256 do conteúdo para detectar duplicações
                import hashlib

                sha256 = hashlib.sha256()
                with open(file_path, "rb") as fh:
                    for chunk in iter(lambda: fh.read(8192), b""):
                        sha256.update(chunk)
                file_hash = sha256.hexdigest()

                # Checar duplicidade por hash (mesmo CRM e UF)
                exists_hash = (
                    db.query(Demonstrativo)
                    .filter_by(crm=user["crm"], uf=user["uf"], file_hash=file_hash)
                    .first()
                )
                if exists_hash:
                    logger.warning(
                        f"[UPLOAD] Duplicidade por hash detectada: CRM={user['crm']} UF={user['uf']} | hash={file_hash}"
                    )
                    results.append(
                        {
                            "filename": file.filename,
                            "success": False,
                            "error": "Este demonstrativo já foi enviado anteriormente.",
                        }
                    )
                    # Remover arquivo salvo para evitar acúmulo de duplicatas
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass
                    continue

                try:
                    from src.parsers.demonstrativo_parser import DemonstrativoParser

                    parser = DemonstrativoParser(file_path)
                    summary = parser.get_summary()

                    # Validação dos dados extraídos
                    if not summary:
                        raise Exception("Parser retornou summary vazio")

                    total_procedimentos = summary.get("total_procedures", 0)
                    apresentado = summary.get("total_presented", 0.0)
                    liberado = summary.get("total_approved", 0.0)
                    glosa = summary.get("total_glosa", 0.0)

                    # Sempre priorizar o período extraído do parser
                    periodo_extracted = summary.get("period") or periodo

                    logger.info(
                        f"[UPLOAD] Parser executado com sucesso para {file.filename} (CRM={user['crm']} UF={user['uf']}): {total_procedimentos} procedimentos, R$ {apresentado:,.2f} apresentado"
                    )

                    # Sanitizar campos livres apenas se summary existir
                    if summary and "period" in summary:
                        summary["period"] = sanitize_text(summary["period"])
                    if summary and "total_presented" in summary:
                        summary["total_presented"] = sanitize_text(
                            str(summary["total_presented"])
                        )
                    if summary and "total_approved" in summary:
                        summary["total_approved"] = sanitize_text(
                            str(summary["total_approved"])
                        )
                    if summary and "total_glosa" in summary:
                        summary["total_glosa"] = sanitize_text(
                            str(summary["total_glosa"])
                        )

                except Exception as e:
                    logger.error(
                        f"[UPLOAD] Erro ao processar demonstrativo {file.filename} (CRM={user['crm']} UF={user['uf']}): {e}"
                    )
                    logger.error(f"[UPLOAD] Stack trace completo: ", exc_info=True)
                    total_procedimentos = 0
                    apresentado = 0.0
                    liberado = 0.0
                    glosa = 0.0
                    periodo_extracted = periodo
                # Log detalhado do upload
                logger.info(
                    f"[UPLOAD] CRM={user['crm']} UF={user['uf']} | periodo={periodo_extracted} | lote={lote or filename} | filename={filename}"
                )
                # Validação obrigatória do período
                if not periodo_extracted:
                    logger.error(
                        f"[UPLOAD] Não foi possível extrair o período do demonstrativo: {file.filename} (CRM={user['crm']} UF={user['uf']})"
                    )
                    # Tentar extrair período do nome do arquivo como fallback
                    filename_lower = file.filename.lower()
                    if "outubro" in filename_lower:
                        periodo_extracted = "outubro de 2024"
                    elif "novembro" in filename_lower:
                        periodo_extracted = "novembro de 2024"
                    elif "dezembro" in filename_lower:
                        periodo_extracted = "dezembro de 2024"
                    elif "janeiro" in filename_lower:
                        periodo_extracted = "janeiro de 2025"
                    elif "fevereiro" in filename_lower:
                        periodo_extracted = "fevereiro de 2025"
                    elif "março" in filename_lower or "marco" in filename_lower:
                        periodo_extracted = "março de 2025"
                    elif "abril" in filename_lower:
                        periodo_extracted = "abril de 2025"
                    elif "maio" in filename_lower:
                        periodo_extracted = "maio de 2025"
                    elif "junho" in filename_lower:
                        periodo_extracted = "junho de 2025"
                    elif "julho" in filename_lower:
                        periodo_extracted = "julho de 2025"
                    elif "agosto" in filename_lower:
                        periodo_extracted = "agosto de 2025"
                    elif "setembro" in filename_lower:
                        periodo_extracted = "setembro de 2025"
                    else:
                        results.append(
                            {
                                "filename": file.filename,
                                "success": False,
                                "error": "Não foi possível extrair o período do demonstrativo. Verifique o PDF.",
                            }
                        )
                        continue
                # Trava de duplicidade: não permitir demonstrativo duplicado para mesmo CRM, UF, período e lote (ou filename se lote não informado)
                unique_lote = lote or filename
                exists = (
                    db.query(Demonstrativo)
                    .filter_by(
                        crm=user["crm"],
                        uf=user["uf"],
                        periodo=periodo_extracted,
                        lote=unique_lote,
                    )
                    .first()
                )
                if exists:
                    logger.warning(
                        f"[UPLOAD] Duplicidade detectada: CRM={user['crm']} UF={user['uf']} | periodo={periodo_extracted} | lote={unique_lote}"
                    )
                    results.append(
                        {
                            "filename": file.filename,
                            "success": False,
                            "error": "Já existe demonstrativo para este período e lote.",
                        }
                    )
                    continue
                # Validação final antes de salvar
                if not periodo_extracted:
                    raise Exception("Período não pode ser vazio")

                demonstrativo = Demonstrativo(
                    crm=user["crm"],
                    uf=user["uf"],  # CRÍTICO: incluir UF
                    periodo=periodo_extracted,
                    lote=unique_lote,
                    filename=filename,
                    file_hash=file_hash,
                    total_procedimentos=total_procedimentos,
                    apresentado=f"R$ {apresentado:,.2f}".replace(".", ","),
                    liberado=f"R$ {liberado:,.2f}".replace(".", ","),
                    glosa=f"R$ {glosa:,.2f}".replace(".", ","),
                )

                try:
                    db.add(demonstrativo)
                    db.commit()
                    logger.info(
                        f"[UPLOAD] Demonstrativo salvo com sucesso: ID={demonstrativo.id}, CRM={user['crm']}, UF={user['uf']}"
                    )
                except Exception as db_error:
                    logger.error(f"[UPLOAD] Erro ao salvar no banco: {db_error}")
                    db.rollback()
                    raise db_error
                # Log de upload bem-sucedido
                log_audit(
                    "upload_demonstrativo",
                    user_crm=user["crm"],
                    details={
                        "filename": filename,
                        "periodo": demonstrativo.periodo,
                        "lote": demonstrativo.lote,
                        "total_procedimentos": demonstrativo.total_procedimentos,
                        "result": "success",
                    },
                )
                results.append(
                    {
                        "filename": file.filename,
                        "success": True,
                        "id": demonstrativo.id,
                        "periodo": demonstrativo.periodo,
                        "lote": demonstrativo.lote,
                        "total_procedimentos": demonstrativo.total_procedimentos,
                        "apresentado": demonstrativo.apresentado,
                        "liberado": demonstrativo.liberado,
                        "glosa": demonstrativo.glosa,
                    }
                )
            except Exception as e:
                logger.error(f"[UPLOAD] Erro ao processar arquivo {file.filename}: {e}")
                # Log de erro de upload
                log_audit(
                    "upload_demonstrativo",
                    user_crm=user["crm"],
                    details={
                        "filename": file.filename,
                        "result": "error",
                        "error": str(e),
                    },
                )
                results.append(
                    {"filename": file.filename, "success": False, "error": str(e)}
                )
        return {"results": results}
    finally:
        db.close()


# --- Endpoint de teste para demonstrativos ---
@app.post("/api/v1/demonstrativos/test")
def test_demonstrativo_upload(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Endpoint de teste para verificar se o parser de demonstrativos está funcionando"""
    try:
        # Salvar arquivo temporário
        job_id = str(uuid4())
        filename = f"{job_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Testar parser
        from src.parsers.demonstrativo_parser import DemonstrativoParser

        parser = DemonstrativoParser(file_path)
        summary = parser.get_summary()
        payments = parser.get_payments()

        # Limpar arquivo temporário
        try:
            os.remove(file_path)
        except:
            pass

        return {
            "success": True,
            "summary": summary,
            "total_payments": len(payments),
            "sample_payments": payments[:3] if payments else [],
        }
    except Exception as e:
        logger.error(f"[TEST] Erro no teste de demonstrativo: {e}")
        return {"success": False, "error": str(e)}


# --- Endpoint para deletar demonstrativo ---
@app.delete("/api/v1/demonstrativos/{demo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_demonstrativo(demo_id: int, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        demo = (
            db.query(Demonstrativo)
            .filter_by(id=demo_id, crm=user["crm"], uf=user["uf"])
            .first()
        )
        if not demo:
            raise HTTPException(status_code=404, detail="Demonstrativo não encontrado.")
        filename = demo.filename
        db.delete(demo)
        db.commit()
        # Log de remoção
        log_audit(
            "delete_demonstrativo",
            user_crm=user["crm"],
            details={"filename": filename, "result": "success"},
        )
        return
    finally:
        db.close()


# --- Endpoint de listagem de demonstrativos ---
@app.get("/api/v1/demonstrativos")
def list_demonstrativos(user: dict = Depends(get_current_user)):
    """Retorna todos os demonstrativos do usuário autenticado."""
    db = SessionLocal()
    crm = user.get("crm")
    uf = user.get("uf")
    if not crm or not uf:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")

    try:
        # CRÍTICO: filtrar por crm E uf para garantir isolamento
        demonstrativos = (
            db.query(Demonstrativo)
            .filter_by(crm=crm, uf=uf)
            .order_by(Demonstrativo.upload_time.desc())
            .all()
        )
        return [
            {
                "id": d.id,
                "periodo": d.periodo,
                "lote": d.lote,
                "filename": d.filename,
                "total_procedimentos": d.total_procedimentos,
                "apresentado": d.apresentado,
                "liberado": d.liberado,
                "glosa": d.glosa,
                "upload_time": d.upload_time.isoformat() if d.upload_time else None,
            }
            for d in demonstrativos
        ]
    finally:
        db.close()


# --- Endpoint de download de demonstrativo ---
@app.get("/api/v1/demonstrativos/{demo_id}/download")
def download_demonstrativo(demo_id: int, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        demo = (
            db.query(Demonstrativo)
            .filter_by(id=demo_id, crm=user["crm"], uf=user["uf"])
            .first()
        )
        if not demo:
            raise HTTPException(status_code=404, detail="Demonstrativo não encontrado")
        file_path = os.path.join(UPLOAD_DIR, demo.filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Arquivo não encontrado")
        return FileResponse(
            file_path, media_type="application/pdf", filename=demo.filename
        )
    finally:
        db.close()


# --- Endpoint para obter procedimentos do demonstrativo ---
@app.get("/api/v1/demonstrativos/{demo_id}/procedimentos")
def get_demonstrativo_procedures(demo_id: int, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        demo = (
            db.query(Demonstrativo)
            .filter_by(id=demo_id, crm=user["crm"], uf=user["uf"])
            .first()
        )
        if not demo:
            raise HTTPException(status_code=404, detail="Demonstrativo não encontrado")
        file_path = os.path.join(UPLOAD_DIR, demo.filename)
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404, detail="Arquivo do demonstrativo não encontrado"
            )
        from src.parsers.demonstrativo_parser import DemonstrativoParser

        parser = DemonstrativoParser(file_path)
        payments = parser.get_payments()

        # --- Associação de participações médicas ---
        # Busca todas as guias do usuário (PDFs no UPLOAD_DIR com CRM do usuário)
        from src.parsers.guia_parser import parse_guia_pdf

        participacoes_map = {}
        for fname in os.listdir(UPLOAD_DIR):
            if not fname.lower().endswith(".pdf"):
                continue
            if "guia" not in fname.lower():
                continue
            guia_path = os.path.join(UPLOAD_DIR, fname)
            try:
                procedimentos_guia = parse_guia_pdf(guia_path, user["crm"])
                for proc in procedimentos_guia:
                    key = (proc["guia"], proc["codigo"])
                    participacoes_map[key] = proc.get("participacoes", [])
            except Exception as e:
                continue  # Ignora guias inválidas

        # Para cada procedimento do demonstrativo, associa participações se houver
        for p in payments:
            key = (p.get("guia"), p.get("code") or p.get("codigo"))
            participacoes = participacoes_map.get(key, [])
            p["participacoes"] = participacoes
            # Se houver participações do usuário, define papel_exercido
            papel_exercido = None
            for part in participacoes:
                if str(part.get("crm")) == str(user["crm"]):
                    papel_exercido = part.get("papel")
                    break
            p["papel_exercido"] = papel_exercido or ""
        return payments
    finally:
        db.close()


# --- Endpoint de upload de guia TISS ---
@app.post("/api/v1/guias/upload")
def upload_guias(
    files: List[UploadFile] = File(...), user: dict = Depends(get_current_user)
):
    """
    Upload de guias TISS em PDF.
    Processa múltiplos arquivos e retorna resultado por arquivo.
    """
    crm = user.get("crm")
    uf = user.get("uf")
    if not crm or not uf:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")

    results = []
    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            results.append(
                {
                    "filename": file.filename,
                    "success": False,
                    "error": "Apenas arquivos PDF são aceitos.",
                }
            )
            continue

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            try:
                shutil.copyfileobj(file.file, tmp)
                tmp_path = tmp.name

                # Calcula o hash do arquivo para verificar duplicatas
                file_hash = calculate_file_hash(tmp_path)

                # Verifica se já existe uma guia com o mesmo hash para este CRM E UF
                db = SessionLocal()
                try:
                    existing_hash = (
                        db.query(Guia)
                        .filter_by(file_hash=file_hash, crm=crm, uf=uf)
                        .first()
                    )

                    if existing_hash:
                        results.append(
                            {
                                "filename": file.filename,
                                "success": False,
                                "error": f"Arquivo duplicado detectado. Esta guia já foi processada anteriormente (arquivo: {existing_hash.filename or 'N/A'}).",
                                "duplicate": True,
                                "existing_filename": existing_hash.filename,
                            }
                        )
                        continue
                finally:
                    db.close()

                # Processar o PDF
                from src.parsers.guia_parser import parse_guia_pdf

                procedures = parse_guia_pdf(tmp_path, crm)

                if not procedures:
                    results.append(
                        {
                            "filename": file.filename,
                            "success": False,
                            "error": "Não foi possível extrair procedimentos do PDF.",
                        }
                    )
                    continue

                # Sanitizar dados
                for proc in procedures:
                    proc["beneficiario"] = sanitize_text(proc.get("beneficiario", ""))
                    proc["descricao"] = sanitize_text(proc.get("descricao", ""))
                    proc["prestador"] = sanitize_text(proc.get("prestador", ""))
                    proc["nome"] = sanitize_text(proc.get("nome", ""))

                db = SessionLocal()
                guias_adicionadas = 0
                try:
                    for proc in procedures:
                        guia_data = {
                            "numero_guia": proc.get("guia"),
                            "data": proc.get("data_execucao", "").replace("-", "/"),
                            "paciente": proc.get("beneficiario", ""),
                            "codigo": proc.get("codigo", ""),
                            "descricao": proc.get("descricao", ""),
                            "papel": proc.get("papel_exercido", ""),
                            "crm": crm,
                            "uf": uf,  # CRÍTICO: incluir UF
                            "qtd": proc.get("quantidade", 1),
                            "status": "Gerado pela execução",
                            "prestador": proc.get("prestador", ""),
                            "nome_medico": next(
                                (
                                    p.get("nome", "")
                                    for p in proc.get("participacoes", [])
                                    if p.get("crm") == crm
                                ),
                                "",
                            ),
                            "dt_inicio": next(
                                (
                                    p.get("inicio", "")
                                    for p in proc.get("participacoes", [])
                                    if p.get("crm") == crm
                                ),
                                "",
                            ),
                            "dt_fim": next(
                                (
                                    p.get("fim", "")
                                    for p in proc.get("participacoes", [])
                                    if p.get("crm") == crm
                                ),
                                "",
                            ),
                            "status_part": next(
                                (
                                    p.get("status", "")
                                    for p in proc.get("participacoes", [])
                                    if p.get("crm") == crm
                                ),
                                "",
                            ),
                            "file_hash": file_hash,
                            "filename": file.filename,
                        }

                        # Verificação de duplicata baseada em conteúdo + dados específicos
                        existing = (
                            db.query(Guia)
                            .filter_by(
                                numero_guia=guia_data["numero_guia"],
                                codigo=guia_data["codigo"],
                                papel=guia_data["papel"],
                                crm=crm,
                                uf=uf,  # CRÍTICO: incluir UF na verificação
                            )
                            .first()
                        )

                        if not existing:
                            guia = Guia(
                                numero_guia=guia_data["numero_guia"],
                                data=guia_data["data"],
                                paciente=guia_data["paciente"],
                                codigo=guia_data["codigo"],
                                descricao=guia_data["descricao"],
                                papel=guia_data["papel"],
                                crm=guia_data["crm"],
                                uf=guia_data["uf"],  # CRÍTICO: incluir UF
                                qtd=guia_data["qtd"],
                                status=guia_data["status"],
                                prestador=guia_data["prestador"],
                                user_id=crm,
                                nome_medico=guia_data["nome_medico"],
                                dt_inicio=guia_data["dt_inicio"],
                                dt_fim=guia_data["dt_fim"],
                                status_part=guia_data["status_part"],
                                file_hash=file_hash,
                                filename=file.filename,
                            )
                            db.add(guia)
                            guias_adicionadas += 1

                    db.commit()
                    formatted_procedures = [
                        {
                            "numero_guia": p.get("guia"),
                            "data": p.get("data_execucao", "").replace("-", "/"),
                            "beneficiario": p.get("beneficiario", ""),
                            "codigo": p.get("codigo", ""),
                            "descricao": p.get("descricao", ""),
                            "papel": p.get("papel_exercido", ""),
                            "crm": crm,
                            "qtd": p.get("quantidade", 1),
                            "status": "Gerado pela execução",
                            "prestador": p.get("prestador", ""),
                            "nome_medico": next(
                                (
                                    part.get("nome", "")
                                    for part in p.get("participacoes", [])
                                    if part.get("crm") == crm
                                ),
                                "",
                            ),
                            "dt_inicio": next(
                                (
                                    part.get("inicio", "")
                                    for part in p.get("participacoes", [])
                                    if part.get("crm") == crm
                                ),
                                "",
                            ),
                            "dt_fim": next(
                                (
                                    part.get("fim", "")
                                    for part in p.get("participacoes", [])
                                    if part.get("crm") == crm
                                ),
                                "",
                            ),
                            "status_part": next(
                                (
                                    part.get("status", "")
                                    for part in p.get("participacoes", [])
                                    if part.get("crm") == crm
                                ),
                                "",
                            ),
                        }
                        for p in procedures
                    ]

                    logger.info(f"Processando guia para CRM {crm} UF {uf}")
                    logger.info(
                        f"Guia processada: {len(procedures)} procedimentos encontrados, {guias_adicionadas} novos adicionados"
                    )

                    results.append(
                        {
                            "filename": file.filename,
                            "success": True,
                            "procedures": formatted_procedures,
                            "guias_adicionadas": guias_adicionadas,
                        }
                    )

                    # Log de auditoria
                    log_audit(
                        "upload_guia",
                        user_crm=crm,
                        ip=None,
                        details={
                            "filename": file.filename,
                            "procedures_count": len(procedures),
                            "guias_adicionadas": guias_adicionadas,
                            "uf": uf,
                        },
                    )

                except Exception as e:
                    db.rollback()
                    logger.error(f"Erro ao processar guia {file.filename}: {e}")
                    results.append(
                        {
                            "filename": file.filename,
                            "success": False,
                            "error": f"Erro interno: {str(e)}",
                        }
                    )
                finally:
                    db.close()

            except Exception as e:
                logger.error(f"Erro ao processar arquivo {file.filename}: {e}")
                results.append(
                    {
                        "filename": file.filename,
                        "success": False,
                        "error": f"Erro ao processar arquivo: {str(e)}",
                    }
                )
            finally:
                try:
                    os.unlink(tmp_path)
                except:
                    pass

    return {"results": results}


# --- Endpoint para salvar guias ---
@app.post("/api/v1/guias/save")
def save_guias(procedimentos: list = Body(...), user: dict = Depends(get_current_user)):
    """
    Salva array de procedimentos extraídos de guias no banco, associando ao usuário autenticado.
    """
    # Sanitizar campos livres
    for proc in procedimentos:
        proc["beneficiario"] = sanitize_text(proc.get("beneficiario", ""))
        proc["descricao"] = sanitize_text(proc.get("descricao", ""))
        proc["prestador"] = sanitize_text(proc.get("prestador", ""))
        proc["nome_medico"] = sanitize_text(proc.get("nome_medico", ""))
    db = SessionLocal()
    try:
        for proc in procedimentos:
            guia = Guia(
                numero_guia=proc.get("numero_guia"),
                data=proc.get("data"),
                paciente=proc.get("beneficiario"),
                codigo=proc.get("codigo"),
                descricao=proc.get("descricao"),
                papel=proc.get("papel"),
                crm=proc.get("crm"),
                qtd=proc.get("qtd"),
                status=proc.get("status"),
                prestador=proc.get("prestador"),
                user_id=user["crm"],
                nome_medico=proc.get("nome_medico", ""),
                dt_inicio=proc.get("dt_inicio", ""),
                dt_fim=proc.get("dt_fim", ""),
                status_part=proc.get("status_part", ""),
            )
            db.add(guia)
        db.commit()
        return {"message": f"{len(procedimentos)} guias salvas com sucesso"}
    finally:
        db.close()


# --- Endpoint para listar guias ---
@app.get("/api/v1/guias")
def list_guias(
    page: int = 1,
    pageSize: int = 10,
    search: str = None,
    status: str = None,
    data: str = None,
    user: dict = Depends(get_current_user),
):
    """
    Retorna todas as guias do usuário autenticado, com paginação e filtros.
    Permite busca por texto, filtro por status e data.
    """
    db = SessionLocal()
    crm = user.get("crm")
    uf = user.get("uf")
    if not crm or not uf:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")

    try:
        # Consulta base (CRÍTICO: filtrar por crm E uf)
        query = db.query(Guia).filter_by(crm=crm, uf=uf)

        # Aplicar filtros se fornecidos
        if search:
            search_term = f"%{search.lower()}%"
            query = query.filter(
                (Guia.numero_guia.like(search_term))
                | (Guia.paciente.ilike(search_term))
                | (Guia.codigo.like(search_term))
                | (Guia.descricao.ilike(search_term))
                | (Guia.papel.ilike(search_term))
                | (Guia.nome_medico.ilike(search_term))
                | (Guia.prestador.ilike(search_term))
            )

        if status:
            query = query.filter(Guia.status == status)

        if data:
            query = query.filter(Guia.data == data)

        # Contagem total para paginação
        total = query.count()

        # **CORREÇÃO**: Preserva ordem original de inserção (ID crescente)
        # Não ordenar por data para manter a sequência cronológica correta do PDF
        query = query.order_by(Guia.id)
        if page and pageSize:
            offset = (page - 1) * pageSize
            query = query.offset(offset).limit(pageSize)

        guias = query.all()

        # Retornar no formato esperado pelo frontend
        result = {
            "procedures": [
                {
                    "numero_guia": g.numero_guia,
                    "data": g.data,
                    "beneficiario": g.paciente,
                    "codigo": g.codigo,
                    "descricao": g.descricao,
                    "papel": g.papel,
                    "crm": g.crm,
                    "qtd": g.qtd,
                    "status": g.status,
                    "prestador": g.prestador,
                    "nome_medico": g.nome_medico,
                    "dt_inicio": g.dt_inicio,
                    "dt_fim": g.dt_fim,
                    "status_part": g.status_part,
                }
                for g in guias
            ],
            "total": total,
            "page": page,
            "pageSize": pageSize,
        }
        return result
    finally:
        db.close()


# --- Endpoint para deletar guia ---
@app.delete("/api/v1/guias/{numero_guia}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guia(numero_guia: str, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        deleted = (
            db.query(Guia)
            .filter_by(numero_guia=numero_guia, crm=user["crm"], uf=user["uf"])
            .delete()
        )
        db.commit()
        # Log de remoção
        log_audit(
            "delete_guia",
            user_crm=user["crm"],
            details={
                "numero_guia": numero_guia,
                "result": "success" if deleted else "not_found",
            },
        )
        if not deleted:
            raise HTTPException(status_code=404, detail="Guia não encontrada.")
        return
    finally:
        db.close()


# --- Endpoint para registrar atividade ---
@app.post("/api/v1/activity-log")
async def log_activity(
    entry: ActivityLogEntry, request: Request, user: dict = Depends(get_current_user)
):
    log_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "user_crm": user.get("crm"),
        "user_nome": user.get("nome"),
        "action": entry.action,
        "target": entry.target,
        "result": entry.result,
        "details": entry.details,
        "ip": request.client.host,
        "user_agent": request.headers.get("user-agent"),
    }

    # Salvar no log de auditoria
    log_audit(
        action=entry.action,
        user_crm=user.get("crm"),
        ip=request.client.host,
        details={
            "target": entry.target,
            "result": entry.result,
            "details": entry.details,
            "user_agent": request.headers.get("user-agent"),
        },
    )

    return {"ok": True}


# --- Endpoint para listar activity logs do usuário ---
@app.get("/api/v1/activity-logs")
def get_activity_logs(
    limit: int = Query(50, ge=1, le=100),
    user: dict = Depends(get_current_user),
    start_date: str = Query(None, description="Data inicial (YYYY-MM-DD)"),
    end_date: str = Query(None, description="Data final (YYYY-MM-DD)"),
    action_type: str = Query(None, description="Tipo de ação"),
    status: str = Query(None, description="Status da atividade"),
    include_metrics: bool = Query(True, description="Incluir métricas"),
    include_timeline: bool = Query(True, description="Incluir timeline"),
    search: str = Query(None, description="Busca por texto"),
):
    """Retorna logs de atividade premium com métricas avançadas e contexto rico"""
    import os
    import re
    from datetime import datetime, timedelta

    activities = []
    log_path = os.path.join("logs", "medcheck_audit.log")
    crm = user["crm"]

    try:
        if os.path.exists(log_path):
            with open(log_path, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line.strip())
                        # Filtra apenas logs do usuário logado
                        if entry.get("user_crm") != crm:
                            continue

                        # Filtros avançados
                        timestamp_str = entry.get("timestamp", "")
                        if timestamp_str:
                            try:
                                entry_date = datetime.fromisoformat(
                                    timestamp_str.replace("Z", "+00:00")
                                )
                                if start_date:
                                    start_dt = datetime.fromisoformat(start_date)
                                    if entry_date.date() < start_dt.date():
                                        continue
                                if end_date:
                                    end_dt = datetime.fromisoformat(end_date)
                                    if entry_date.date() > end_dt.date():
                                        continue
                            except:
                                pass

                        action = entry.get("action", "")
                        details = entry.get("details", {})

                        # Busca por texto
                        if search:
                            search_lower = search.lower()
                            searchable_text = f"{action} {str(details)}".lower()
                            if search_lower not in searchable_text:
                                continue

                        # Categorização inteligente premium
                        (
                            activity_type,
                            status,
                            description,
                            entity,
                            value,
                            priority,
                            category,
                        ) = categorize_activity_premium(action, details, crm)

                        # Contexto rico e detalhado
                        context = build_activity_context(action, details, entry)

                        # Monta objeto premium para o frontend
                        activity_obj = {
                            "id": entry.get("timestamp", "") + action,
                            "type": activity_type,
                            "action": description,
                            "description": description,
                            "timestamp": entry.get(
                                "timestamp", datetime.utcnow().isoformat()
                            ),
                            "status": status,
                            "entity": entity,
                            "details": str(details),
                            "value": value,
                            "priority": priority,
                            "category": category,
                            "context": context,
                            "duration": calculate_activity_duration(action, details),
                            "impact_score": calculate_impact_score(action, details),
                            "related_entities": extract_related_entities(
                                action, details
                            ),
                            "user_agent": entry.get("details", {}).get("user_agent"),
                            "ip_address": entry.get("details", {}).get("ip"),
                            "session_id": entry.get("details", {}).get("session_id"),
                            "tags": generate_activity_tags(action, details),
                            "risk_level": assess_risk_level(action, details),
                            "compliance_flags": check_compliance_flags(action, details),
                        }

                        # Filtros por tipo e status
                        if action_type and activity_type != action_type:
                            continue
                        if status and activity_obj["status"] != status:
                            continue

                        activities.append(activity_obj)

                    except Exception as e:
                        continue

        # Ordenação premium por prioridade e timestamp
        activities.sort(
            key=lambda x: (x.get("priority", 0), x["timestamp"]), reverse=True
        )
        activities = activities[:limit]

        # Métricas avançadas
        metrics = {}
        if include_metrics:
            metrics = calculate_premium_metrics(activities, crm)

        # Timeline de atividades
        timeline = {}
        if include_timeline:
            timeline = build_activity_timeline(activities)

        return {
            "activities": activities,
            "total": len(activities),
            "user_crm": crm,
            "generated_at": datetime.utcnow().isoformat(),
            "metrics": metrics,
            "timeline": timeline,
            "filters_applied": {
                "start_date": start_date,
                "end_date": end_date,
                "action_type": action_type,
                "status": status,
                "search": search,
            },
        }

    except Exception as e:
        logger.error(f"Erro ao buscar activity logs premium: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao buscar logs premium: {e}")


def categorize_activity_premium(action: str, details: dict, crm: str) -> tuple:
    """Categorização inteligente premium com contexto rico"""

    # Mapeamento avançado de ações
    action_mapping = {
        # Login e Autenticação
        "login_success": (
            "login",
            "success",
            "Login realizado com sucesso",
            f"CRM {crm}",
            None,
            1,
            "security",
        ),
        "login_failed": (
            "login",
            "error",
            "Tentativa de login falhou",
            f"CRM {crm}",
            None,
            3,
            "security",
        ),
        "logout": (
            "login",
            "info",
            "Logout realizado",
            f"CRM {crm}",
            None,
            1,
            "security",
        ),
        # Uploads
        "upload_guias": (
            "upload",
            "success",
            "Guia médica carregada",
            details.get("filename", "arquivo"),
            details.get("procedures", 0),
            2,
            "data",
        ),
        "upload_demonstrativo": (
            "upload",
            "success",
            "Demonstrativo carregado",
            details.get("filename", "arquivo"),
            details.get("total_procedimentos", 0),
            2,
            "data",
        ),
        "upload_guides": (
            "upload",
            "success",
            "Guias carregadas",
            details.get("filename", "arquivo"),
            details.get("procedures", 0),
            2,
            "data",
        ),
        # Exclusões
        "delete_guia": (
            "delete",
            "warning",
            "Guia removida",
            f"Guia {details.get('numero_guia', 'N/A')}",
            None,
            2,
            "data",
        ),
        "delete_demonstrativo": (
            "delete",
            "warning",
            "Demonstrativo removido",
            details.get("filename", "arquivo"),
            None,
            2,
            "data",
        ),
        # Exportações
        "export_data": (
            "export",
            "success",
            "Exportação de dados realizada",
            "Dados do usuário",
            None,
            1,
            "data",
        ),
        "export_report": (
            "export",
            "success",
            "Relatório exportado",
            details.get("report_type", "relatório"),
            None,
            1,
            "data",
        ),
        # Análises
        "analysis_started": (
            "analysis",
            "info",
            "Análise iniciada",
            details.get("analysis_type", "análise"),
            None,
            2,
            "analysis",
        ),
        "analysis_completed": (
            "analysis",
            "success",
            "Análise concluída",
            details.get("analysis_type", "análise"),
            details.get("results_count", 0),
            2,
            "analysis",
        ),
        "analysis_failed": (
            "analysis",
            "error",
            "Análise falhou",
            details.get("analysis_type", "análise"),
            None,
            3,
            "analysis",
        ),
        # Incidentes
        "incident_reported": (
            "incident",
            "warning",
            "Incidente reportado",
            details.get("type", "sistema"),
            None,
            3,
            "system",
        ),
        "error_occurred": (
            "error",
            "error",
            "Erro do sistema",
            details.get("error_type", "sistema"),
            None,
            4,
            "system",
        ),
        # Perfil e Configurações
        "update_profile": (
            "profile",
            "success",
            "Perfil atualizado",
            "Configurações",
            None,
            1,
            "user",
        ),
        "change_password": (
            "security",
            "success",
            "Senha alterada",
            "Segurança",
            None,
            2,
            "security",
        ),
        "delete_account": (
            "security",
            "warning",
            "Conta excluída",
            "Sistema",
            None,
            4,
            "security",
        ),
        # Pagamentos e Financeiro
        "payment_processed": (
            "payment",
            "success",
            "Pagamento processado",
            details.get("amount", "valor"),
            details.get("amount", 0),
            2,
            "financial",
        ),
        "payment_failed": (
            "payment",
            "error",
            "Pagamento falhou",
            details.get("amount", "valor"),
            None,
            3,
            "financial",
        ),
        # Glosas e Auditoria
        "gloss_analysis": (
            "gloss",
            "info",
            "Análise de glosa",
            details.get("gloss_type", "glosa"),
            details.get("gloss_amount", 0),
            2,
            "audit",
        ),
        "audit_report": (
            "audit",
            "success",
            "Relatório de auditoria",
            details.get("report_type", "auditoria"),
            None,
            2,
            "audit",
        ),
    }

    # Busca no mapeamento ou usa padrão
    if action in action_mapping:
        return action_mapping[action]
    else:
        # Categorização inteligente baseada em palavras-chave
        action_lower = action.lower()
        if any(word in action_lower for word in ["upload", "carregar", "import"]):
            return (
                "upload",
                "success",
                action.replace("_", " ").title(),
                "Arquivo",
                None,
                2,
                "data",
            )
        elif any(word in action_lower for word in ["delete", "remove", "excluir"]):
            return (
                "delete",
                "warning",
                action.replace("_", " ").title(),
                "Item",
                None,
                2,
                "data",
            )
        elif any(word in action_lower for word in ["export", "download", "baixar"]):
            return (
                "export",
                "success",
                action.replace("_", " ").title(),
                "Dados",
                None,
                1,
                "data",
            )
        elif any(word in action_lower for word in ["error", "fail", "falha"]):
            return (
                "error",
                "error",
                action.replace("_", " ").title(),
                "Sistema",
                None,
                3,
                "system",
            )
        else:
            return (
                "system",
                "info",
                action.replace("_", " ").title(),
                "Sistema",
                None,
                1,
                "system",
            )


def build_activity_context(action: str, details: dict, entry: dict) -> dict:
    """Constrói contexto rico para a atividade"""
    context = {
        "session_info": {
            "user_agent": entry.get("details", {}).get("user_agent"),
            "ip_address": entry.get("details", {}).get("ip"),
            "timestamp": entry.get("timestamp"),
        },
        "performance_metrics": {},
        "security_flags": [],
        "compliance_notes": [],
        "related_data": {},
    }

    # Métricas de performance
    if "duration" in details:
        context["performance_metrics"]["duration_ms"] = details["duration"]

    # Flags de segurança
    if action in ["login_failed", "delete_account", "incident_reported"]:
        context["security_flags"].append("high_priority")

    # Notas de compliance
    if action in ["export_data", "delete_account"]:
        context["compliance_notes"].append("audit_trail_required")

    # Dados relacionados
    if "filename" in details:
        context["related_data"]["file_info"] = {
            "name": details["filename"],
            "size": details.get("file_size"),
            "type": details.get("file_type"),
        }

    return context


def calculate_activity_duration(action: str, details: dict) -> int:
    """Calcula duração da atividade em milissegundos"""
    if "duration" in details:
        return details["duration"]

    # Estimativas baseadas no tipo de ação
    duration_estimates = {
        "upload_guias": 2000,
        "upload_demonstrativo": 3000,
        "analysis_completed": 5000,
        "export_data": 1500,
        "login_success": 500,
    }

    return duration_estimates.get(action, 1000)


def calculate_impact_score(action: str, details: dict) -> int:
    """Calcula score de impacto da atividade (1-10)"""
    impact_scores = {
        "delete_account": 10,
        "incident_reported": 8,
        "error_occurred": 7,
        "delete_guia": 6,
        "delete_demonstrativo": 6,
        "upload_demonstrativo": 5,
        "upload_guias": 4,
        "export_data": 3,
        "login_failed": 2,
        "login_success": 1,
    }

    return impact_scores.get(action, 3)


def extract_related_entities(action: str, details: dict) -> list:
    """Extrai entidades relacionadas à atividade"""
    entities = []

    if "filename" in details:
        entities.append({"type": "file", "name": details["filename"]})

    if "numero_guia" in details:
        entities.append({"type": "guia", "number": details["numero_guia"]})

    if "periodo" in details:
        entities.append({"type": "period", "value": details["periodo"]})

    return entities


def generate_activity_tags(action: str, details: dict) -> list:
    """Gera tags inteligentes para a atividade"""
    tags = []

    # Tags baseadas na ação
    if "upload" in action:
        tags.extend(["upload", "data_import"])
    elif "delete" in action:
        tags.extend(["delete", "data_removal"])
    elif "export" in action:
        tags.extend(["export", "data_export"])
    elif "login" in action:
        tags.extend(["authentication", "security"])

    # Tags baseadas nos detalhes
    if "filename" in details:
        tags.append("file_operation")

    if "procedures" in details:
        tags.append("medical_procedures")

    if "periodo" in details:
        tags.append("period_analysis")

    return tags


def assess_risk_level(action: str, details: dict) -> str:
    """Avalia nível de risco da atividade"""
    high_risk_actions = ["delete_account", "incident_reported", "error_occurred"]
    medium_risk_actions = ["delete_guia", "delete_demonstrativo", "login_failed"]

    if action in high_risk_actions:
        return "high"
    elif action in medium_risk_actions:
        return "medium"
    else:
        return "low"


def check_compliance_flags(action: str, details: dict) -> list:
    """Verifica flags de compliance"""
    flags = []

    if action in ["export_data", "delete_account"]:
        flags.append("audit_required")

    if action in ["delete_guia", "delete_demonstrativo"]:
        flags.append("data_retention_check")

    if "medical_data" in str(details).lower():
        flags.append("hipaa_compliance")

    return flags


def calculate_premium_metrics(activities: list, crm: str) -> dict:
    """Calcula métricas premium avançadas"""
    if not activities:
        return {}

    # Estatísticas básicas
    total_activities = len(activities)
    success_count = len([a for a in activities if a["status"] == "success"])
    error_count = len([a for a in activities if a["status"] == "error"])
    warning_count = len([a for a in activities if a["status"] == "warning"])

    # Análise por categoria
    categories = {}
    for activity in activities:
        category = activity.get("category", "unknown")
        categories[category] = categories.get(category, 0) + 1

    # Análise por tipo
    types = {}
    for activity in activities:
        activity_type = activity.get("type", "unknown")
        types[activity_type] = types.get(activity_type, 0) + 1

    # Métricas de performance
    durations = [a.get("duration", 0) for a in activities if a.get("duration")]
    avg_duration = sum(durations) / len(durations) if durations else 0

    # Impacto total
    impact_scores = [a.get("impact_score", 0) for a in activities]
    total_impact = sum(impact_scores)
    avg_impact = total_impact / len(impact_scores) if impact_scores else 0

    # Atividade recente (últimas 24h)
    now = datetime.utcnow()
    recent_activities = []
    for activity in activities:
        try:
            activity_time = datetime.fromisoformat(
                activity["timestamp"].replace("Z", "+00:00")
            )
            if (now - activity_time).total_seconds() < 86400:  # 24 horas
                recent_activities.append(activity)
        except:
            pass

    return {
        "summary": {
            "total_activities": total_activities,
            "success_rate": (
                (success_count / total_activities * 100) if total_activities > 0 else 0
            ),
            "error_rate": (
                (error_count / total_activities * 100) if total_activities > 0 else 0
            ),
            "recent_activities_24h": len(recent_activities),
        },
        "categories": categories,
        "types": types,
        "performance": {
            "average_duration_ms": avg_duration,
            "total_impact_score": total_impact,
            "average_impact_score": avg_impact,
        },
        "trends": {
            "success_trend": "stable",
            "activity_trend": (
                "increasing"
                if len(recent_activities) > total_activities * 0.3
                else "stable"
            ),
        },
    }


def build_activity_timeline(activities: list) -> dict:
    """Constrói timeline de atividades"""
    timeline = {"hourly": {}, "daily": {}, "weekly": {}}

    for activity in activities:
        try:
            activity_time = datetime.fromisoformat(
                activity["timestamp"].replace("Z", "+00:00")
            )
            hour_key = activity_time.strftime("%Y-%m-%d %H:00")
            day_key = activity_time.strftime("%Y-%m-%d")
            week_key = activity_time.strftime("%Y-W%U")

            # Timeline por hora
            if hour_key not in timeline["hourly"]:
                timeline["hourly"][hour_key] = []
            timeline["hourly"][hour_key].append(activity["type"])

            # Timeline por dia
            if day_key not in timeline["daily"]:
                timeline["daily"][day_key] = []
            timeline["daily"][day_key].append(activity["type"])

            # Timeline por semana
            if week_key not in timeline["weekly"]:
                timeline["weekly"][week_key] = []
            timeline["weekly"][week_key].append(activity["type"])

        except:
            continue

    return timeline


# --- Endpoint para exportar dados do usuário ---
@app.get("/api/v1/export-data")
def export_user_data(user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        log_audit("export_data", user_crm=user["crm"], ip=None, details=None)
        try:
            # Coletar dados do usuário
            guias = db.query(Guia).filter_by(user_id=user["crm"]).all()
            demonstrativos = db.query(Demonstrativo).filter_by(crm=user["crm"]).all()
            # Simular logs (poderia ser de uma tabela de logs)
            logs = []

            # Montar JSONs
            def to_serializable(obj):
                d = obj.__dict__.copy()
                d.pop("_sa_instance_state", None)
                for k, v in d.items():
                    if isinstance(v, (datetime, date)):
                        d[k] = v.isoformat()
                return d

            guias_json = [to_serializable(g) for g in guias]
            demonstrativos_json = [to_serializable(d) for d in demonstrativos]

            # Encoder customizado para garantir serialização de qualquer datetime
            class DateTimeEncoder(json.JSONEncoder):
                def default(self, o):
                    if isinstance(o, (datetime, date)):
                        return o.isoformat()
                    return super().default(o)

            # Criar ZIP em memória
            mem_zip = io.BytesIO()
            with zipfile.ZipFile(
                mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED
            ) as zf:
                zf.writestr(
                    "guias.json",
                    json.dumps(
                        guias_json, ensure_ascii=False, indent=2, cls=DateTimeEncoder
                    ),
                )
                zf.writestr(
                    "demonstrativos.json",
                    json.dumps(
                        demonstrativos_json,
                        ensure_ascii=False,
                        indent=2,
                        cls=DateTimeEncoder,
                    ),
                )
                zf.writestr(
                    "logs.json",
                    json.dumps(logs, ensure_ascii=False, indent=2, cls=DateTimeEncoder),
                )
            mem_zip.seek(0)
            logger.info(f"Exportação de dados para CRM {user['crm']}")
            return StreamingResponse(
                mem_zip,
                media_type="application/zip",
                headers={
                    "Content-Disposition": "attachment; filename=medcheck-dados-usuario.zip"
                },
            )
        except Exception as e:
            logger.error(f"Erro ao exportar dados do usuário: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Erro ao exportar dados: {e}")
    finally:
        db.close()


# --- Endpoint para deletar conta do usuário ---
@app.delete("/api/v1/delete-account")
def delete_account(user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        log_audit("delete_account", user_crm=user["crm"], ip=None, details=None)
        # Apagar guias
        db.query(Guia).filter_by(user_id=user["crm"]).delete()
        # Apagar demonstrativos
        db.query(Demonstrativo).filter_by(crm=user["crm"]).delete()
        # Apagar cadastro
        db.query(Medico).filter_by(crm=user["crm"]).delete()
        db.commit()
        logger.info(f"Conta e dados excluídos para CRM {user['crm']}")
        return {"message": "Conta e dados excluídos com sucesso."}
    finally:
        db.close()


# --- Endpoint para consultar histórico de consentimentos ---
@app.get("/api/v1/consentimentos")
def listar_consentimentos(user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        consentimentos = (
            db.query(Consentimento)
            .filter_by(crm=user["crm"])
            .order_by(Consentimento.accepted_at.desc())
            .all()
        )
        return [
            {
                "terms_version": c.terms_version,
                "accepted_at": c.accepted_at.isoformat(),
                "ip": c.ip,
            }
            for c in consentimentos
        ]
    finally:
        db.close()


# --- Endpoint para atualizar perfil do usuário ---
@app.patch("/api/v1/profile", response_model=UpdateProfileResponse)
def update_profile(data: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    # Sanitizar nome
    if data.nome:
        data.nome = sanitize_text(data.nome)
    db = SessionLocal()
    try:
        medico = db.query(Medico).filter_by(crm=user["crm"]).first()
        if not medico:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        updated = False
        if data.uf:
            medico.uf = data.uf
            updated = True
        if data.senha:
            if len(data.senha) < 8:
                raise HTTPException(
                    status_code=400, detail="A senha deve ter pelo menos 8 caracteres."
                )
            medico.senha_hash = bcrypt.hashpw(
                data.senha.encode(), bcrypt.gensalt()
            ).decode()
            updated = True
        if updated:
            log_audit(
                "update_profile",
                user_crm=user["crm"],
                ip=None,
                details={"nome": data.nome, "uf": data.uf},
            )
            db.commit()
            logger.info(
                f"Perfil atualizado para CRM {user['crm']}: nome={data.nome}, uf={data.uf}, senha={'***' if data.senha else None}"
            )
            return UpdateProfileResponse(message="Perfil atualizado com sucesso.")
        else:
            return UpdateProfileResponse(message="Nenhuma alteração realizada.")
    finally:
        db.close()


# --- Endpoint para anonimizar dados do usuário ---
@app.post("/api/v1/request-anonimization", response_model=AnonimizationResponse)
def request_anonimization(user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        log_audit("anonimization", user_crm=user["crm"], ip=None, details=None)
        medico = db.query(Medico).filter_by(crm=user["crm"]).first()
        if not medico:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        # Anonimizar dados do médico
        medico.nome = "ANONIMIZADO"
        medico.senha_hash = "ANONIMIZADO"
        # Anonimizar dados de guias
        guias = db.query(Guia).filter_by(user_id=user["crm"]).all()
        for g in guias:
            g.paciente = "ANONIMIZADO"
            g.nome_medico = "ANONIMIZADO"
        # Anonimizar dados de demonstrativos
        demonstrativos = db.query(Demonstrativo).filter_by(crm=user["crm"]).all()
        for d in demonstrativos:
            d.lote = "ANONIMIZADO"
        db.commit()
        logger.info(f"Dados anonimizados para CRM {user['crm']}")
        return AnonimizationResponse(
            message="Dados anonimizados com sucesso. O acesso à conta foi bloqueado."
        )
    finally:
        db.close()


# --- Endpoint para registrar incidente ---
@app.post("/api/v1/incidents", response_model=IncidentResponse)
def report_incident(data: IncidentRequest, request: Request):
    db = SessionLocal()
    try:
        ip = data.ip or (request.client.host if request and request.client else None)
        incident = Incident(
            type=data.type,
            description=data.description,
            occurred_at=datetime.utcnow(),
            user_crm=data.user_crm,
            ip=ip,
            status="open",
        )
        db.add(incident)
        db.commit()
        log_audit(
            "incident_reported",
            user_crm=data.user_crm,
            ip=ip,
            details={"type": data.type, "description": data.description},
        )
        logger.error(
            f"[INCIDENT] Tipo: {data.type} | Usuário: {data.user_crm} | IP: {ip} | Desc: {data.description}"
        )
        return IncidentResponse(
            message="Incidente registrado com sucesso.", incident_id=incident.id
        )
    finally:
        db.close()


# --- Endpoint para listar suboperadores ---


# --- Endpoint para listar suboperadores ---
@app.get("/api/v1/suboperadores", response_model=list[SuboperadorItem])
def listar_suboperadores():
    suboperadores = [
        SuboperadorItem(
            nome="AWS",
            finalidade="Infraestrutura de nuvem e armazenamento de arquivos",
            pais="Brasil/EUA",
        ),
        SuboperadorItem(
            nome="SendGrid", finalidade="Envio de e-mails transacionais", pais="EUA"
        ),
        SuboperadorItem(
            nome="Supabase", finalidade="Banco de dados e analytics", pais="EUA"
        ),
        SuboperadorItem(
            nome="Google", finalidade="Analytics e monitoramento", pais="EUA"
        ),
        SuboperadorItem(
            nome="Vercel", finalidade="Hospedagem e deploy do frontend", pais="EUA"
        ),
    ]
    return suboperadores


# --- Endpoint para registrar requisição LGPD ---
@app.post("/api/v1/lgpd-request", response_model=LGPDRequestResponse)
@limiter.limit("3/minute")
def canal_lgpd(data: LGPDRequest, request: Request):
    # Sanitizar mensagem
    mensagem_limpa = sanitize_text(data.mensagem)
    # Salvar log da requisição
    logger.info(
        f"[LGPD] Nova requisição: tipo={data.tipo}, nome={data.nome}, email={data.email}, crm={data.crm}, mensagem={mensagem_limpa}, ip={request.client.host if request and request.client else None}"
    )
    # (Opcional) Salvar em tabela LGPDRequests no banco para auditoria
    # (Opcional) Enviar e-mail para admin/DPO
    # Simular resposta automática
    return LGPDRequestResponse(
        message="Sua solicitação foi recebida. Você receberá uma resposta em até 2 dias úteis. Obrigado!"
    )


# --- Endpoint detalhado de demonstrativo com cruzamento de participação ---
@app.get("/api/v1/demonstrativos/{demo_id}/detalhes")
def get_demonstrativo_detalhes(demo_id: int, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        demo = db.query(Demonstrativo).filter_by(id=demo_id, crm=user["crm"]).first()
        if not demo:
            raise HTTPException(status_code=404, detail="Demonstrativo não encontrado")
        file_path = os.path.join(UPLOAD_DIR, demo.filename)
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404, detail="Arquivo do demonstrativo não encontrado"
            )
        from src.parsers.cbhpm_parser import CBHPMParser
        from src.parsers.demonstrativo_parser import DemonstrativoParser
        from src.services.participacao import papel_do_procedimento

        cbhpm_parser = CBHPMParser("data/cbhpm/CBHPM2015_v1.xlsx")
        parser = DemonstrativoParser(file_path)
        payments = parser.get_payments()
        print(
            f"[DEBUG] Total de procedimentos extraídos do demonstrativo {demo_id}: {len(payments)}"
        )
        detalhes = []
        for item in payments:
            papel = (
                papel_do_procedimento(
                    db,
                    guia=item.get("guia"),
                    codigo=item.get("code") or item.get("codigo"),
                    data=item.get("date") or item.get("data_execucao"),
                    crm=user["crm"],
                )
                or item.get("papel")
                or "--"
            )
            # Padronizar papel
            papel_norm = str(papel).strip().lower()
            if papel_norm in (
                "",
                "--",
                "não identificado",
                "nao identificado",
                "none",
                "null",
            ):
                papel_key = None
            elif "cirurgiao" in papel_norm:
                papel_key = "cirurgiao"
            elif "primeiro auxiliar" in papel_norm or "1º auxiliar" in papel_norm:
                papel_key = "primeiro_auxiliar"
            elif "anestesista" in papel_norm:
                papel_key = "anestesista"
            else:
                papel_key = None  # Não identificado
            code_str = str(item.get("code") or "").strip()
            cbhpm_valor = None
            proc = cbhpm_parser.get_procedure(code_str)
            if proc and papel_key:
                if papel_key == "cirurgiao":
                    cbhpm_valor = proc.get("surgeon_value")
                elif papel_key == "primeiro_auxiliar":
                    cbhpm_valor = proc.get("first_assistant_value")
                elif papel_key == "anesthesiologist":
                    cbhpm_valor = proc.get("anesthesiologist_value")
            # Busca motivo/código detalhado se não vier direto do item
            codigo_glosa = item.get("codigo_glosa")
            motivo_glosa = item.get("motivo_glosa")
            if (not codigo_glosa or not motivo_glosa) and hasattr(
                parser, "get_glosa_detalhada"
            ):
                key = (item.get("guia"), item.get("code"), item.get("date"))
                detalhada = parser.get_glosa_detalhada(*key)
                if detalhada:
                    codigo_glosa = detalhada.get("codigo_glosa")
                    motivo_glosa = detalhada.get("motivo_glosa")
            detalhes.append(
                {
                    "guia": item.get("guia"),
                    "data": item.get("date"),
                    "paciente": item.get("patient"),
                    "codigo": item.get("code"),
                    "descricao": item.get("description"),
                    "participacao": papel,
                    "qtd": item.get("quantity"),
                    "cbhpm": cbhpm_valor,
                    "liberado": item.get("financial", {}).get("approved_value"),
                    "apresentado": item.get("financial", {}).get("presented_value"),
                    "glosa": item.get("financial", {}).get("glosa"),
                    "pro_rata": item.get("financial", {}).get("pro_rata"),
                    "codigo_glosa": codigo_glosa,
                    "motivo_glosa": motivo_glosa,
                    "beneficiario": item.get("patient") or item.get("beneficiario"),
                    "hospital": item.get("prestador") or item.get("hospital"),
                }
            )
        return detalhes
    finally:
        db.close()


# --- Endpoint para obter resumo do dashboard ---
@app.get("/api/v1/dashboard")
def dashboard_summary(user: dict = Depends(get_current_user)):
    db = SessionLocal()
    crm = user.get("crm")
    uf = user.get("uf")
    if not crm or not uf:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")
    # Últimos 30 dias
    data_limite = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    # Totais
    total_recebido = 0.0
    total_glosado = 0.0
    total_procedimentos = 0
    auditoria_pendente = 0
    # Procedimentos
    procedures = []
    glosas = []
    # Buscar demonstrativos do usuário (CRÍTICO: filtrar por crm E uf)
    demos = (
        db.query(Demonstrativo)
        .filter(
            Demonstrativo.crm == crm,
            Demonstrativo.uf == uf,
            Demonstrativo.upload_time >= data_limite,
        )
        .all()
    )
    for demo in demos:
        try:
            # Conversão robusta considerando formato brasileiro (milhar com ponto, decimal com vírgula)
            valor_recebido = brl_to_float(demo.liberado)
            valor_glosado = brl_to_float(demo.glosa)
        except Exception:
            valor_recebido = 0.0
            valor_glosado = 0.0
        total_recebido += valor_recebido
        total_glosado += valor_glosado
        try:
            total_procedimentos += int(demo.total_procedimentos)
        except Exception:
            pass
    # Auditorias pendentes: demonstrativos sem liberação (CRÍTICO: filtrar por crm E uf)
    auditoria_pendente = (
        db.query(Demonstrativo)
        .filter(
            Demonstrativo.crm == crm,
            Demonstrativo.uf == uf,
            Demonstrativo.liberado == "R$ 0,00",
        )
        .count()
    )
    # Buscar guias do usuário (CRÍTICO: filtrar por crm E uf)
    guias = (
        db.query(Guia)
        .filter(Guia.crm == crm, Guia.uf == uf, Guia.data >= data_limite)
        .all()
    )
    for guia in guias:
        procedures.append(
            {
                "numero_guia": guia.numero_guia,
                "data": guia.data,
                "beneficiario": guia.paciente,
                "codigo": guia.codigo,
                "descricao": guia.descricao,
                "papel": guia.papel,
                "crm": guia.crm,
                "qtd": guia.qtd,
                "status": guia.status,
                "prestador": guia.prestador,
                "nome_medico": guia.nome_medico,
                "dt_inicio": guia.dt_inicio,
                "dt_fim": guia.dt_fim,
                "status_part": guia.status_part,
            }
        )
    # Calcular totais
    total_apresentado = sum(brl_to_float(demo.apresentado) for demo in demos)
    return {
        "total_recebido": total_recebido,
        "total_glosado": total_glosado,
        "total_apresentado": total_apresentado,
        "total_procedimentos": total_procedimentos,
        "auditoria_pendente": auditoria_pendente,
        "procedures": procedures,
        "glosas": glosas,
        "user_crm": crm,
        "user_uf": uf,
    }


# --- Endpoint para deletar conta do usuário ---
@app.delete("/api/v1/admin/purge-users")
def purge_all_users(secret: str = Query(...)):
    # Proteção simples: só executa se o secret for igual ao valor esperado
    ADMIN_SECRET = os.environ.get("ADMIN_PURGE_SECRET", "super-secret-purge")
    if secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Not authorized")
    db = SessionLocal()
    try:
        # Apaga dados relacionados primeiro (ordem importa por FK)
        db.query(Guia).delete()
        db.query(Demonstrativo).delete()
        db.query(Consentimento).delete()
        db.query(Medico).delete()
        db.commit()
        logger.warning(
            "Todos os usuários e dados relacionados foram apagados por comando administrativo!"
        )
        return {"message": "Todos os usuários e dados relacionados foram apagados."}
    finally:
        db.close()


# --- Observações ---
# - Para produção, troque JWT_SECRET por segredo seguro e use HTTPS
# - Substitua jobs dict por Redis/Celery/DB para escalabilidade real
# - Adapte process_validation_job para rodar o pipeline Python real
# - Para S3/MinIO, troque o salvamento de arquivos/resultados
# - Para Prometheus, adicione instrumentação com prometheus_fastapi_instrumentator
# - Para rate-limiting, use slowapi/starlette-limiter
# - Para logs estruturados, use structlog


# --- Utilitário para conversão de valores monetários BRL em float ---
def brl_to_float(value: str | float | int) -> float:
    """Converte uma string no formato 'R$ 5.539,90' para float 5539.90.

    A função é resiliente a variações (com ou sem símbolo, separador de milhar
    com ponto ou espaço) e falhas de parse, sempre retornando *0.0* em caso de
    erro.
    """
    try:
        # Se já for numérico, devolve como float
        if isinstance(value, (int, float)):
            return float(value)
        if not value:
            return 0.0
        # Remove tudo que não seja dígito, vírgula ou ponto
        cleaned = re.sub(r"[^0-9,\.]", "", str(value))

        # Existem PDFs/rotinas que geram formato com vírgula duplicada, ex.:
        #   5,372,22   (milhar + decimal)
        # A regra abaixo converte para 5372.22 antes do cast para float.
        if cleaned.count(",") > 1:
            # As vírgulas da esquerda representam milhares, a última é o separador decimal
            parts = cleaned.split(",")
            cleaned = "".join(parts[:-1]) + "." + parts[-1]
        else:
            # Primeiro elimina separador de milhar (ponto). Ex.: 5.539,90 -> 5539,90
            cleaned = cleaned.replace(".", "")
            # Agora trocamos vírgula por ponto para obter notação decimal padrão
            cleaned = cleaned.replace(",", ".")

        return float(cleaned) if cleaned else 0.0
    except Exception:
        return 0.0


# --- Endpoint para obter perfil do usuário ---
class ProfileResponse(BaseModel):
    crm: str
    uf: str
    nome: str
    email: str | None = None
    specialty: str | None = None
    hospital: str | None = None
    phone: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


@app.get("/api/v1/profile", response_model=ProfileResponse)
def get_profile(user: dict = Depends(get_current_user)):
    """Retorna os dados do médico autenticado."""
    db = SessionLocal()
    try:
        medico = db.query(Medico).filter_by(crm=user["crm"], uf=user["uf"]).first()
        if not medico:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        # Tenta obter detalhes adicionais de perfil
        perfil = db.query(PerfilMedico).filter_by(crm=user["crm"]).first()

        return ProfileResponse(
            crm=medico.crm,
            uf=medico.uf,
            nome=medico.nome,
            email=perfil.email if perfil else None,
            specialty=perfil.specialty if perfil else None,
            hospital=perfil.hospital if perfil else None,
            phone=perfil.phone if perfil else None,
            bio=perfil.bio if perfil else None,
            avatar_url=perfil.avatar_url if perfil else None,
        )
    finally:
        db.close()


# --- Novo: detalhes estendidos de perfil ---
class PerfilMedico(Base):
    """Tabela separada para dados adicionais do perfil que podem mudar com mais frequência.
    Mantemos separado de `medicos` para evitar migrações de colunas sensíveis (senha, consentimentos).
    """

    __tablename__ = "perfis_medico"
    crm = Column(String, ForeignKey("medicos.crm"), primary_key=True)
    email = Column(String, nullable=True)
    specialty = Column(String, nullable=True)
    hospital = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    avatar_url = Column(
        String, nullable=True
    )  # URL da foto do médico (base64 compactada)


# Garante que a nova tabela seja criada em bancos já existentes sem rodar migração
Base.metadata.create_all(bind=engine)


# --- Autenticação administrativa segura ---
def verify_admin_secret(secret: str) -> bool:
    """Verifica se o segredo administrativo está correto."""
    if not secret or not ADMIN_SECRET:
        return False
    # Comparação segura contra timing attacks
    return hmac.compare_digest(secret.encode(), ADMIN_SECRET.encode())


def get_admin_user(secret: str = Query(...)) -> dict:
    """Dependência para endpoints administrativos."""
    if not verify_admin_secret(secret):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Credenciais administrativas inválidas.",
        )
    return {"role": "admin"}


# --- Sanitização de inputs melhorada ---
def sanitize_text(text, max_length: int = 1000):
    """Sanitiza texto removendo scripts e limitando tamanho."""
    import html
    import re

    if not text:
        return text

    # Limitar tamanho
    text = str(text)[:max_length]

    # Escapar HTML
    text = html.escape(text)

    # Remover tags HTML restantes
    text = re.sub(r"<.*?>", "", text)

    # Remover scripts
    text = re.sub(r"script", "", text, flags=re.IGNORECASE)
    text = re.sub(r"javascript:", "", text, flags=re.IGNORECASE)
    text = re.sub(r"on\w+\s*=", "", text, flags=re.IGNORECASE)

    return text.strip()


def validate_crm(crm: str) -> bool:
    """Valida formato do CRM."""
    if not crm:
        return False
    # CRM deve ser numérico com 4-6 dígitos
    return re.match(r"^\d{4,6}$", crm) is not None


def validate_uf(uf: str) -> bool:
    """Valida UF brasileira."""
    ufs_validas = {
        "AC",
        "AL",
        "AP",
        "AM",
        "BA",
        "CE",
        "DF",
        "ES",
        "GO",
        "MA",
        "MT",
        "MS",
        "MG",
        "PA",
        "PB",
        "PR",
        "PE",
        "PI",
        "RJ",
        "RN",
        "RS",
        "RO",
        "RR",
        "SC",
        "SP",
        "SE",
        "TO",
    }
    return uf and uf.upper() in ufs_validas


import hmac

# --- Endpoints administrativos PROTEGIDOS ---


@app.get("/api/v1/incidents", response_model=list[IncidentListItem])
def list_incidents(admin: dict = Depends(get_admin_user)):
    """Lista incidentes - REQUER AUTENTICAÇÃO ADMINISTRATIVA."""
    db = SessionLocal()
    try:
        incidents = db.query(Incident).order_by(Incident.occurred_at.desc()).all()
        return [
            IncidentListItem(
                id=i.id,
                type=i.type,
                description=i.description,
                occurred_at=i.occurred_at.isoformat(),
                user_crm=i.user_crm,
                ip=i.ip,
                status=i.status,
            )
            for i in incidents
        ]
    finally:
        db.close()


@app.get("/api/v1/inactive-accounts", response_model=list[InactiveAccountItem])
def list_inactive_accounts(
    years: int = Query(2, ge=1, le=10), admin: dict = Depends(get_admin_user)
):
    """Lista contas inativas - REQUER AUTENTICAÇÃO ADMINISTRATIVA."""
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=365 * years)
        inativos = (
            db.query(Medico)
            .filter((Medico.last_login_at == None) | (Medico.last_login_at < cutoff))
            .all()
        )
        return [
            InactiveAccountItem(
                crm=m.crm,
                nome=m.nome,
                uf=m.uf,
                last_login_at=m.last_login_at.isoformat() if m.last_login_at else None,
                created_at=(
                    m.terms_accepted_at.isoformat() if m.terms_accepted_at else None
                ),
            )
            for m in inativos
        ]
    finally:
        db.close()


@app.post("/api/v1/notify-inactive", response_model=NotifyInactiveResponse)
def notify_inactive_accounts(
    years: int = Query(2, ge=1, le=10), admin: dict = Depends(get_admin_user)
):
    """Notifica usuários inativos - REQUER AUTENTICAÇÃO ADMINISTRATIVA."""
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=365 * years)
        inativos = (
            db.query(Medico)
            .filter((Medico.last_login_at == None) | (Medico.last_login_at < cutoff))
            .all()
        )
        notified = []
        for m in inativos:
            logger.info(
                f"[NOTIFY] Conta inativa: CRM={m.crm}, nome={m.nome}, UF={m.uf}, last_login={m.last_login_at}"
            )
            notified.append(m.crm)

        # Log da ação administrativa
        log_audit(
            "admin_notify_inactive",
            user_crm="ADMIN",
            ip=None,
            details={"years": years, "count": len(notified)},
        )

        return NotifyInactiveResponse(
            message=f"Notificações simuladas para {len(notified)} contas inativas.",
            notified_crms=notified,
        )
    finally:
        db.close()


@app.delete("/api/v1/delete-inactive", response_model=BulkDeleteResponse)
def delete_inactive_accounts(
    years: int = Query(2, ge=1, le=10), admin: dict = Depends(get_admin_user)
):
    """Deleta contas inativas - REQUER AUTENTICAÇÃO ADMINISTRATIVA."""
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=365 * years)
        inativos = (
            db.query(Medico)
            .filter((Medico.last_login_at == None) | (Medico.last_login_at < cutoff))
            .all()
        )
        deleted = []
        for m in inativos:
            # Anonimizar antes de deletar (boa prática LGPD)
            m.nome = "ANONIMIZADO"
            m.senha_hash = "ANONIMIZADO"
            # Anonimizar guias
            guias = db.query(Guia).filter_by(user_id=m.crm).all()
            for g in guias:
                g.paciente = "ANONIMIZADO"
                g.nome_medico = "ANONIMIZADO"
            # Anonimizar demonstrativos
            demonstrativos = db.query(Demonstrativo).filter_by(crm=m.crm).all()
            for d in demonstrativos:
                d.lote = "ANONIMIZADO"
            deleted.append(m.crm)
            # Opcional: deletar o médico após anonimização
            db.delete(m)
        db.commit()

        # Log crítico da ação administrativa
        log_audit(
            "admin_delete_inactive",
            user_crm="ADMIN",
            ip=None,
            details={
                "years": years,
                "deleted_count": len(deleted),
                "deleted_crms": deleted,
            },
        )
        logger.warning(
            f"ADMIN: {len(deleted)} contas inativas foram anonimizadas e removidas."
        )

        return BulkDeleteResponse(
            message=f"{len(deleted)} contas inativas anonimizadas e removidas.",
            deleted_crms=deleted,
        )
    finally:
        db.close()


@app.delete("/api/v1/admin/purge-users")
def purge_all_users(admin: dict = Depends(get_admin_user)):
    """OPERAÇÃO EXTREMAMENTE PERIGOSA - REQUER AUTENTICAÇÃO ADMINISTRATIVA."""
    db = SessionLocal()
    try:
        # Log crítico antes da operação
        log_audit(
            "admin_purge_all_users",
            user_crm="ADMIN",
            ip=None,
            details={"warning": "ALL_DATA_WILL_BE_DELETED"},
        )

        # Contar registros antes da exclusão
        count_guias = db.query(Guia).count()
        count_demos = db.query(Demonstrativo).count()
        count_medicos = db.query(Medico).count()

        # Apaga dados relacionados primeiro (ordem importa por FK)
        db.query(Guia).delete()
        db.query(Demonstrativo).delete()
        db.query(Consentimento).delete()
        db.query(Medico).delete()
        db.commit()

        logger.critical(
            f"ADMIN PURGE: Todos os dados foram apagados! "
            f"Removidos: {count_medicos} médicos, {count_demos} demonstrativos, {count_guias} guias"
        )

        return {
            "message": "Todos os usuários e dados relacionados foram apagados.",
            "deleted": {
                "medicos": count_medicos,
                "demonstrativos": count_demos,
                "guias": count_guias,
            },
        }
    finally:
        db.close()


# --- Endpoint para analytics avançado ---
@app.get("/api/v1/analytics")
def advanced_analytics(
    user: dict = Depends(get_current_user), period: str = Query("6m")
):
    """
    Endpoint de analytics avançado que gera insights estratégicos profundos
    para o médico baseado em todo o histórico de dados disponível.
    """
    db = SessionLocal()
    crm = user.get("crm")
    if not crm:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")

    try:
        import calendar
        from collections import Counter, defaultdict
        from datetime import datetime, timedelta

        # Buscar TODOS os dados históricos (não apenas 30 dias)
        all_demos = db.query(Demonstrativo).filter(Demonstrativo.crm == crm).all()
        all_guias = db.query(Guia).filter(Guia.crm == crm).all()

        # === 1. ANALYTICS TEMPORAIS AVANÇADOS ===
        monthly_performance = defaultdict(
            lambda: {
                "recebido": 0,
                "glosado": 0,
                "apresentado": 0,
                "procedimentos": 0,
                "demos": 0,
                "taxa_glosa": 0,
            }
        )

        quarterly_trends = defaultdict(
            lambda: {"recebido": 0, "glosado": 0, "procedimentos": 0}
        )
        yearly_summary = defaultdict(
            lambda: {"recebido": 0, "glosado": 0, "procedimentos": 0}
        )

        for demo in all_demos:
            if demo.upload_time:
                month_key = demo.upload_time.strftime("%Y-%m")
                quarter_key = (
                    f"{demo.upload_time.year}-Q{(demo.upload_time.month-1)//3 + 1}"
                )
                year_key = str(demo.upload_time.year)

                recebido = brl_to_float(demo.liberado)
                glosado = brl_to_float(demo.glosa)
                apresentado = brl_to_float(demo.apresentado)
                procedimentos = int(demo.total_procedimentos or 0)

                # Monthly
                monthly_performance[month_key]["recebido"] += recebido
                monthly_performance[month_key]["glosado"] += glosado
                monthly_performance[month_key]["apresentado"] += apresentado
                monthly_performance[month_key]["procedimentos"] += procedimentos
                monthly_performance[month_key]["demos"] += 1

                # Quarterly
                quarterly_trends[quarter_key]["recebido"] += recebido
                quarterly_trends[quarter_key]["glosado"] += glosado
                quarterly_trends[quarter_key]["procedimentos"] += procedimentos

                # Yearly
                yearly_summary[year_key]["recebido"] += recebido
                yearly_summary[year_key]["glosado"] += glosado
                yearly_summary[year_key]["procedimentos"] += procedimentos

        # Calcular taxas de glosa mensais
        for month_key in monthly_performance:
            data = monthly_performance[month_key]
            total_apresentado = data["recebido"] + data["glosado"]
            data["taxa_glosa"] = (
                round((data["glosado"] / total_apresentado * 100), 2)
                if total_apresentado > 0
                else 0
            )

        # === 2. ANALYTICS DE PERFORMANCE POR CATEGORIA ===

        # Performance por Procedimento
        procedure_stats = defaultdict(
            lambda: {
                "count": 0,
                "recebido_total": 0,
                "glosado_total": 0,
                "hospitais": set(),
                "roles": set(),
                "descricao": "",
            }
        )

        # Performance por Hospital/Prestador
        hospital_stats = defaultdict(
            lambda: {
                "procedimentos": 0,
                "recebido": 0,
                "glosado": 0,
                "demos": 0,
                "codigos_unicos": set(),
            }
        )

        # Performance por Papel/Função
        role_performance = defaultdict(
            lambda: {"procedimentos": 0, "recebido_estimado": 0, "hospitais": set()}
        )

        # Processar guias para analytics de performance
        for guia in all_guias:
            codigo = guia.codigo
            hospital = guia.prestador or "Não identificado"
            papel = guia.papel or "Não identificado"

            procedure_stats[codigo]["count"] += guia.qtd or 1
            procedure_stats[codigo]["hospitais"].add(hospital)
            procedure_stats[codigo]["roles"].add(papel)
            procedure_stats[codigo]["descricao"] = guia.descricao or ""

            hospital_stats[hospital]["procedimentos"] += guia.qtd or 1
            hospital_stats[hospital]["codigos_unicos"].add(codigo)

            role_performance[papel]["procedimentos"] += guia.qtd or 1
            role_performance[papel]["hospitais"].add(hospital)

        # Enriquecer com dados financeiros dos demonstrativos
        for demo in all_demos:
            if demo.periodo:
                # Aproximação: distribuir valores proporcionalmente
                total_proc = demo.total_procedimentos or 1
                recebido_por_proc = brl_to_float(demo.liberado) / total_proc
                glosado_por_proc = brl_to_float(demo.glosa) / total_proc

                # Tentar vincular aos procedimentos do mesmo período
                periodo_guias = [
                    g
                    for g in all_guias
                    if demo.periodo.lower() in (g.data or "").lower()
                ]
                for guia in periodo_guias:
                    qtd = guia.qtd or 1
                    procedure_stats[guia.codigo]["recebido_total"] += (
                        recebido_por_proc * qtd
                    )
                    procedure_stats[guia.codigo]["glosado_total"] += (
                        glosado_por_proc * qtd
                    )

        # === 3. INSIGHTS FINANCEIROS AVANÇADOS ===

        total_recebido_historico = sum(brl_to_float(d.liberado) for d in all_demos)
        total_glosado_historico = sum(brl_to_float(d.glosa) for d in all_demos)
        total_apresentado_historico = total_recebido_historico + total_glosado_historico

        # Taxa de recuperação média
        taxa_recuperacao_media = (
            round((total_recebido_historico / total_apresentado_historico * 100), 2)
            if total_apresentado_historico > 0
            else 0
        )

        # Projeção anual baseada nos últimos 3 meses
        ultimos_3_meses = [
            d
            for d in all_demos
            if d.upload_time and d.upload_time >= datetime.now() - timedelta(days=90)
        ]
        recebido_3m = sum(brl_to_float(d.liberado) for d in ultimos_3_meses)
        projecao_anual = recebido_3m * 4 if ultimos_3_meses else 0

        # Valor médio por procedimento
        total_procedimentos_historico = sum(
            int(d.total_procedimentos or 0) for d in all_demos
        )
        valor_medio_procedimento = (
            round(total_recebido_historico / total_procedimentos_historico, 2)
            if total_procedimentos_historico > 0
            else 0
        )

        # === 4. IDENTIFICAÇÃO DE PADRÕES E ANOMALIAS ===

        # Mês de melhor performance
        melhor_mes = (
            max(monthly_performance.items(), key=lambda x: x[1]["recebido"])
            if monthly_performance
            else None
        )

        # Procedimento mais lucrativo
        procedimento_top = (
            max(procedure_stats.items(), key=lambda x: x[1]["recebido_total"])
            if procedure_stats
            else None
        )

        # Hospital com melhor eficiência (menor taxa de glosa)
        hospital_eficiente = None
        if hospital_stats:
            for hospital, stats in hospital_stats.items():
                if stats["procedimentos"] >= 5:  # Mínimo para ser relevante
                    # Buscar demos relacionadas a este hospital
                    demos_hospital = [
                        d
                        for d in all_demos
                        if hospital.lower() in (d.filename or "").lower()
                    ]
                    if demos_hospital:
                        total_rec = sum(
                            brl_to_float(d.liberado) for d in demos_hospital
                        )
                        total_glo = sum(brl_to_float(d.glosa) for d in demos_hospital)
                        taxa_glosa = (
                            (total_glo / (total_rec + total_glo) * 100)
                            if (total_rec + total_glo) > 0
                            else 100
                        )
                        stats["taxa_glosa"] = round(taxa_glosa, 2)

            hospital_eficiente = min(
                [h for h in hospital_stats.items() if h[1].get("taxa_glosa", 100) < 50],
                key=lambda x: x[1].get("taxa_glosa", 100),
                default=None,
            )

        # === 5. ALERTAS E RECOMENDAÇÕES INTELIGENTES ===

        alerts = []
        recommendations = []

        # Alerta: Taxa de glosa muito alta
        if monthly_performance:
            ultimos_meses = sorted(monthly_performance.items(), key=lambda x: x[0])[-3:]
            taxa_media_recente = sum(m[1]["taxa_glosa"] for m in ultimos_meses) / len(
                ultimos_meses
            )
            if taxa_media_recente > 15:
                alerts.append(
                    {
                        "type": "warning",
                        "title": "Taxa de Glosa Elevada",
                        "message": f"Sua taxa de glosa média dos últimos meses é {taxa_media_recente:.1f}%. Considere revisar os procedimentos mais glosados.",
                        "action": "Ver Análise de Glosas",
                    }
                )

        # Recomendação: Foco em procedimento lucrativo
        if procedimento_top and procedimento_top[1]["recebido_total"] > 1000:
            recommendations.append(
                {
                    "type": "growth",
                    "title": "Oportunidade de Crescimento",
                    "message": f'O procedimento {procedimento_top[0]} ({procedimento_top[1]["descricao"][:50]}) tem ótima performance. Considere expandi-lo.',
                    "metric": f'R$ {procedimento_top[1]["recebido_total"]:.2f} recebidos',
                }
            )

        # Recomendação: Hospital eficiente
        if hospital_eficiente:
            recommendations.append(
                {
                    "type": "efficiency",
                    "title": "Hospital Eficiente Identificado",
                    "message": f'O hospital {hospital_eficiente[0]} tem baixa taxa de glosa ({hospital_eficiente[1].get("taxa_glosa", 0):.1f}%). Considere aumentar o volume lá.',
                    "metric": f'{hospital_eficiente[1]["procedimentos"]} procedimentos',
                }
            )

        # === 6. BENCHMARKS E COMPARAÇÕES ===

        # Benchmark interno: comparar com própria média
        if len(monthly_performance) >= 6:  # Pelo menos 6 meses de dados
            meses_sorted = sorted(monthly_performance.items(), key=lambda x: x[0])
            primeiros_6m = meses_sorted[:6]
            ultimos_6m = meses_sorted[-6:]

            media_inicial = sum(m[1]["recebido"] for m in primeiros_6m) / len(
                primeiros_6m
            )
            media_recente = sum(m[1]["recebido"] for m in ultimos_6m) / len(ultimos_6m)

            crescimento_percentual = (
                round(((media_recente - media_inicial) / media_inicial * 100), 2)
                if media_inicial > 0
                else 0
            )
        else:
            crescimento_percentual = 0

        # === 7. FORMATAÇÃO DOS DADOS PARA RESPOSTA ===

        # Top 5 procedimentos por valor
        top_procedures = sorted(
            procedure_stats.items(), key=lambda x: x[1]["recebido_total"], reverse=True
        )[:5]
        top_procedures_formatted = [
            {
                "codigo": proc[0],
                "descricao": (
                    proc[1]["descricao"][:60] + "..."
                    if len(proc[1]["descricao"]) > 60
                    else proc[1]["descricao"]
                ),
                "count": proc[1]["count"],
                "recebido_total": round(proc[1]["recebido_total"], 2),
                "taxa_sucesso": (
                    round(
                        (
                            proc[1]["recebido_total"]
                            / (proc[1]["recebido_total"] + proc[1]["glosado_total"])
                            * 100
                        ),
                        2,
                    )
                    if (proc[1]["recebido_total"] + proc[1]["glosado_total"]) > 0
                    else 0
                ),
                "hospitais_count": len(proc[1]["hospitais"]),
            }
            for proc in top_procedures
        ]

        # Dados mensais para gráficos (últimos 12 meses)
        monthly_chart_data = []
        if monthly_performance:
            sorted_months = sorted(monthly_performance.items(), key=lambda x: x[0])[
                -12:
            ]
            for month_key, data in sorted_months:
                try:
                    year, month = map(int, month_key.split("-"))
                    month_name = calendar.month_name[month][:3]
                    monthly_chart_data.append(
                        {
                            "name": f"{month_name}/{year}",
                            "recebido": round(data["recebido"], 2),
                            "glosado": round(data["glosado"], 2),
                            "taxa_glosa": data["taxa_glosa"],
                            "procedimentos": data["procedimentos"],
                        }
                    )
                except:
                    continue

        # Performance por papel (roles)
        roles_formatted = []
        for role, data in role_performance.items():
            if data["procedimentos"] > 0:
                roles_formatted.append(
                    {
                        "papel": role,
                        "procedimentos": data["procedimentos"],
                        "hospitais_count": len(data["hospitais"]),
                        "recebido_estimado": round(data["recebido_estimado"], 2),
                    }
                )

        return {
            "summary": {
                "total_recebido_historico": round(total_recebido_historico, 2),
                "total_glosado_historico": round(total_glosado_historico, 2),
                "taxa_recuperacao_media": taxa_recuperacao_media,
                "projecao_anual": round(projecao_anual, 2),
                "valor_medio_procedimento": valor_medio_procedimento,
                "total_procedimentos_historico": total_procedimentos_historico,
                "crescimento_percentual": crescimento_percentual,
                "demonstrativos_processados": len(all_demos),
                "periodo_analise": f"{len(monthly_performance)} meses",
            },
            "temporal_analytics": {
                "monthly_performance": monthly_chart_data,
                "melhor_mes": {
                    "mes": melhor_mes[0] if melhor_mes else None,
                    "recebido": (
                        round(melhor_mes[1]["recebido"], 2) if melhor_mes else 0
                    ),
                },
            },
            "performance_analytics": {
                "top_procedures": top_procedures_formatted,
                "role_performance": roles_formatted,
                "hospital_stats": [
                    {
                        "nome": hospital,
                        "procedimentos": stats["procedimentos"],
                        "codigos_unicos": len(stats["codigos_unicos"]),
                        "taxa_glosa": stats.get("taxa_glosa", 0),
                    }
                    for hospital, stats in sorted(
                        hospital_stats.items(),
                        key=lambda x: x[1]["procedimentos"],
                        reverse=True,
                    )[:10]
                ],
            },
            "insights": {
                "alerts": alerts,
                "recommendations": recommendations,
                "key_insights": [
                    f"Você processou {len(all_demos)} demonstrativos até agora",
                    f"Sua taxa de recuperação média é {taxa_recuperacao_media}%",
                    f"Valor médio por procedimento: R$ {valor_medio_procedimento}",
                    f"Projeção anual baseada no trimestre: R$ {projecao_anual:.2f}",
                ],
            },
        }

    except Exception as e:
        # Log do erro para debug
        print(f"Erro no analytics: {str(e)}")
        return {
            "error": "Erro ao processar analytics",
            "summary": {"total_recebido_historico": 0},
            "temporal_analytics": {"monthly_performance": []},
            "performance_analytics": {"top_procedures": []},
            "insights": {"alerts": [], "recommendations": [], "key_insights": []},
        }
    finally:
        db.close()


# --- Health Check Endpoint ---
@app.get("/healthz")
@app.get("/health")
def health_check():
    """Endpoint de verificação de saúde da aplicação"""
    try:
        # Testa conexão com banco de dados
        db = SessionLocal()
        try:
            result = db.execute(text("SELECT 1")).fetchone()
            database_status = "connected" if result else "error"
        except Exception as db_error:
            logger.error(f"Database error in health check: {str(db_error)}")
            database_status = "disconnected"
        finally:
            db.close()

        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "database": database_status,
            "service": "medcheck-api",
            "environment": os.environ.get("ENV", "development"),
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        # Retorna 200 mas com status unhealthy para compatibilidade com Railway
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "database": "disconnected",
            "error": str(e),
            "service": "medcheck-api",
            "environment": os.environ.get("ENV", "development"),
        }


# --- Root endpoint ---
@app.get("/")
def root():
    """Endpoint raiz da API"""
    return {
        "message": "MedCheck API",
        "version": "1.0.0",
        "docs": (
            "/docs" if os.environ.get("ENV", "development") == "development" else None
        ),
        "status": "running",
    }


def calculate_file_hash(file_path: str) -> str:
    """Calcula o hash SHA-256 do arquivo"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()


def _ensure_file_hash_column():
    """Garante que as colunas file_hash e filename existem na tabela guias"""
    try:
        with engine.connect() as conn:
            # Verifica se a coluna existe
            result = conn.execute(text("PRAGMA table_info(guias)"))
            columns = [row[1] for row in result.fetchall()]

            if "file_hash" not in columns:
                conn.execute(text("ALTER TABLE guias ADD COLUMN file_hash VARCHAR(64)"))
                conn.execute(
                    text(
                        "CREATE INDEX IF NOT EXISTS idx_guias_file_hash ON guias(file_hash)"
                    )
                )
                conn.commit()
                logger.info("Coluna file_hash adicionada à tabela guias")

            if "filename" not in columns:
                conn.execute(text("ALTER TABLE guias ADD COLUMN filename VARCHAR(255)"))
                conn.commit()
                logger.info("Coluna filename adicionada à tabela guias")
    except Exception as e:
        logger.error(f"Erro ao verificar/criar coluna file_hash: {e}")


# Garantir que as colunas existem
_ensure_file_hash_column()


# --- Função para extrair data do período ---
def extract_date_from_period(periodo: str) -> datetime:
    """
    Extrai data do período em formato brasileiro (ex: 'outubro de 2024')
    Retorna datetime para ordenação inteligente
    """
    if not periodo:
        return datetime.min

    # Mapeamento de meses em português
    meses = {
        "janeiro": 1,
        "fevereiro": 2,
        "março": 3,
        "abril": 4,
        "maio": 5,
        "junho": 6,
        "julho": 7,
        "agosto": 8,
        "setembro": 9,
        "outubro": 10,
        "novembro": 11,
        "dezembro": 12,
    }

    try:
        # Padronizar texto
        periodo_lower = periodo.lower().strip()

        # Padrão: "outubro de 2024" ou "outubro 2024"
        for mes_nome, mes_num in meses.items():
            if mes_nome in periodo_lower:
                # Extrair ano
                import re

                ano_match = re.search(r"(\d{4})", periodo_lower)
                if ano_match:
                    ano = int(ano_match.group(1))
                    return datetime(ano, mes_num, 1)

        # Se não conseguir extrair, tentar outros padrões
        # Padrão: "2024-10" ou "10/2024"
        date_patterns = [
            r"(\d{4})-(\d{1,2})",  # 2024-10
            r"(\d{1,2})/(\d{4})",  # 10/2024
            r"(\d{4})/(\d{1,2})",  # 2024/10
        ]

        for pattern in date_patterns:
            match = re.search(pattern, periodo_lower)
            if match:
                if len(match.groups()) == 2:
                    if len(match.group(1)) == 4:  # ano primeiro
                        ano = int(match.group(1))
                        mes = int(match.group(2))
                    else:  # mês primeiro
                        mes = int(match.group(1))
                        ano = int(match.group(2))
                    return datetime(ano, mes, 1)

        # Se nada funcionar, retornar data mínima
        return datetime.min

    except Exception:
        return datetime.min
