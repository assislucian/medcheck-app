# flake8: noqa
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
    create_engine,
    desc,
    func,
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

# Configurações de segurança aprimoradas
ADMIN_SECRET = os.environ.get("ADMIN_SECRET")
if not ADMIN_SECRET:
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
    crm = Column(String, primary_key=True, index=True)
    uf = Column(String, nullable=False)
    nome = Column(String, nullable=False)
    senha_hash = Column(String, nullable=False)
    terms_accepted = Column(Integer, nullable=False, default=0)  # 0 = False, 1 = True
    terms_accepted_at = Column(DateTime, nullable=True)
    terms_version = Column(String, nullable=True)
    last_login_at = Column(DateTime, nullable=True)


class Demonstrativo(Base):
    __tablename__ = "demonstrativos"
    id = Column(Integer, primary_key=True, index=True)
    crm = Column(String, nullable=False, index=True)
    periodo = Column(String, nullable=True, index=True)
    lote = Column(String, nullable=True)
    filename = Column(String, nullable=False)
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


Base.metadata.create_all(bind=engine)

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
        if not crm_logado:
            logger.warning("SKIP_AUTH is true but CRM_LOGADO is not set!")
            raise HTTPException(
                status_code=401,
                detail="CRM_LOGADO environment variable is required when SKIP_AUTH=true",
            )
        db = SessionLocal()
        try:
            # Try to find medico in database to get the nome
            medico = db.query(Medico).filter_by(crm=crm_logado).first()
            nome = medico.nome if medico else "Médico Teste"
            logger.info(f"Autenticação ignorada. Usando CRM {crm_logado} ({nome})")
            return {"crm": crm_logado, "nome": nome}
        finally:
            db.close()

    # If token is None and auth is not skipped, raise error
    if token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Normal authentication flow
    payload = decode_jwt(token)
    return {"crm": payload.get("crm"), "nome": payload.get("nome")}


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
        "http://localhost:3000",
        "https://medcheck.app",  # Produção (ajuste para seu domínio real)
    ]

# Se nenhum regex for definido mas queremos permitir *.vercel.app por padrão
if not FRONTEND_ORIGIN_REGEX:
    # Permite qualquer subdomínio do Vercel no seu namespace (preview deployments)
    # Ex.: https://medcheck-xxxxx-assislucians-projects.vercel.app
    FRONTEND_ORIGIN_REGEX = r"https:\/\/medcheck-[a-z0-9-]+\.vercel\.app"

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
from backend.knowledge_base.glosas_api import router as glosas_router

app.include_router(glosas_router, prefix="/api/v1")

# --- Logging estruturado ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("api")

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
        if db.query(Medico).filter_by(crm=req.crm).first():
            raise HTTPException(status_code=400, detail="CRM já cadastrado")
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
                try:
                    from src.parsers.demonstrativo_parser import DemonstrativoParser

                    parser = DemonstrativoParser(file_path)
                    summary = parser.get_summary()
                    total_procedimentos = summary["total_procedures"]
                    apresentado = summary["total_presented"]
                    liberado = summary["total_approved"]
                    glosa = summary["total_glosa"]
                    periodo_extracted = periodo or summary["period"]
                except Exception as e:
                    total_procedimentos = 0
                    apresentado = 0.0
                    liberado = 0.0
                    glosa = 0.0
                    periodo_extracted = periodo
                # Sanitizar campos livres
                if "period" in summary:
                    summary["period"] = sanitize_text(summary["period"])
                if "total_presented" in summary:
                    summary["total_presented"] = sanitize_text(
                        str(summary["total_presented"])
                    )
                if "total_approved" in summary:
                    summary["total_approved"] = sanitize_text(
                        str(summary["total_approved"])
                    )
                if "total_glosa" in summary:
                    summary["total_glosa"] = sanitize_text(str(summary["total_glosa"]))
                # Log detalhado do upload
                logger.info(
                    f"[UPLOAD] CRM={user['crm']} | periodo={periodo_extracted} | lote={lote or filename} | filename={filename}"
                )
                # Validação obrigatória do período
                if not periodo_extracted:
                    logger.error(
                        f"[UPLOAD] Falha: demonstrativo sem período extraído! Arquivo: {filename}"
                    )
                    results.append(
                        {
                            "filename": file.filename,
                            "success": False,
                            "error": "Não foi possível extrair o período do demonstrativo. Verifique o PDF.",
                        }
                    )
                    continue
                # Trava de duplicidade: não permitir demonstrativo duplicado para mesmo CRM, período e lote (ou filename se lote não informado)
                unique_lote = lote or filename
                exists = (
                    db.query(Demonstrativo)
                    .filter_by(
                        crm=user["crm"], periodo=periodo_extracted, lote=unique_lote
                    )
                    .first()
                )
                if exists:
                    logger.warning(
                        f"[UPLOAD] Duplicidade detectada: CRM={user['crm']} | periodo={periodo_extracted} | lote={unique_lote}"
                    )
                    results.append(
                        {
                            "filename": file.filename,
                            "success": False,
                            "error": "Já existe demonstrativo para este período e lote.",
                        }
                    )
                    continue
                demonstrativo = Demonstrativo(
                    crm=user["crm"],
                    periodo=periodo_extracted,
                    lote=unique_lote,
                    filename=filename,
                    total_procedimentos=total_procedimentos,
                    apresentado=f"R$ {apresentado:,.2f}".replace(".", ","),
                    liberado=f"R$ {liberado:,.2f}".replace(".", ","),
                    glosa=f"R$ {glosa:,.2f}".replace(".", ","),
                )
                db.add(demonstrativo)
                db.commit()
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
                results.append(
                    {"filename": file.filename, "success": False, "error": str(e)}
                )
        return {"results": results}
    finally:
        db.close()


# --- Endpoint para deletar demonstrativo ---
@app.delete("/api/v1/demonstrativos/{demo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_demonstrativo(demo_id: int, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        demo = db.query(Demonstrativo).filter_by(id=demo_id, crm=user["crm"]).first()
        if not demo:
            raise HTTPException(status_code=404, detail="Demonstrativo não encontrado.")
        db.delete(demo)
        db.commit()
        return
    finally:
        db.close()


# --- Endpoint de listagem de demonstrativos ---
@app.get("/api/v1/demonstrativos")
def list_demonstrativos(
    periodo: str = None, lote: str = None, user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        query = db.query(Demonstrativo).filter_by(crm=user["crm"])
        if periodo:
            query = query.filter_by(periodo=periodo)
        if lote:
            query = query.filter_by(lote=lote)
        demos = query.order_by(Demonstrativo.upload_time.desc()).all()
        return [
            {
                "id": d.id,
                "periodo": d.periodo,
                "lote": d.lote,
                "total_procedimentos": d.total_procedimentos,
                "apresentado": d.apresentado,
                "liberado": d.liberado,
                "glosa": d.glosa,
                "filename": d.filename,
                "upload_time": d.upload_time.isoformat(),
            }
            for d in demos
        ]
    finally:
        db.close()


# --- Endpoint de download de demonstrativo ---
@app.get("/api/v1/demonstrativos/{demo_id}/download")
def download_demonstrativo(demo_id: int, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        demo = db.query(Demonstrativo).filter_by(id=demo_id, crm=user["crm"]).first()
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
        demo = db.query(Demonstrativo).filter_by(id=demo_id, crm=user["crm"]).first()
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
    Recebe múltiplos PDFs de guias TISS, processa cada um individualmente,
    salva no banco e retorna uma lista de resultados por arquivo.
    Exige autenticação e filtra automaticamente por CRM do usuário logado.
    """
    import tempfile

    from src.parsers.guia_parser import parse_guia_pdf

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
                crm = str(user.get("crm", ""))
                logger.info(f"Processando guia para CRM {crm}")
                procedures = parse_guia_pdf(tmp_path, crm_filter=crm)
                if not procedures:
                    logger.warning(
                        f"Nenhum procedimento encontrado para o CRM {crm} nesta guia"
                    )
                    results.append(
                        {
                            "filename": file.filename,
                            "success": True,
                            "message": "Guia processada, mas nenhum procedimento encontrado para o seu CRM",
                            "crm": crm,
                            "procedures": [],
                        }
                    )
                    continue
                # Sanitizar campos livres
                for proc in procedures:
                    proc["beneficiario"] = sanitize_text(proc.get("beneficiario", ""))
                    proc["descricao"] = sanitize_text(proc.get("descricao", ""))
                    proc["prestador"] = sanitize_text(proc.get("prestador", ""))
                    for part in proc.get("participacoes", []):
                        part["nome"] = sanitize_text(part.get("nome", ""))
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
                        }
                        existing = (
                            db.query(Guia)
                            .filter_by(
                                numero_guia=guia_data["numero_guia"],
                                codigo=guia_data["codigo"],
                                papel=guia_data["papel"],
                                user_id=crm,
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
                                qtd=guia_data["qtd"],
                                status=guia_data["status"],
                                prestador=guia_data["prestador"],
                                user_id=crm,
                                nome_medico=guia_data["nome_medico"],
                                dt_inicio=guia_data["dt_inicio"],
                                dt_fim=guia_data["dt_fim"],
                                status_part=guia_data["status_part"],
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
                    logger.info(
                        f"Guia processada: {len(procedures)} procedimentos encontrados, {guias_adicionadas} novos adicionados"
                    )
                    results.append(
                        {
                            "filename": file.filename,
                            "success": True,
                            "message": f"Guia processada: {len(procedures)} procedimentos encontrados, {guias_adicionadas} novos adicionados",
                            "crm": crm,
                            "procedures": formatted_procedures,
                            "novos_adicionados": guias_adicionadas,
                        }
                    )
                finally:
                    db.close()
            except Exception as e:
                logger.error(
                    f"Erro ao processar guia {file.filename}: {e}", exc_info=True
                )
                results.append(
                    {"filename": file.filename, "success": False, "error": str(e)}
                )
            finally:
                os.unlink(tmp_path)
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
    try:
        # Consulta base
        query = db.query(Guia).filter_by(user_id=user["crm"])

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

        # Aplicar ordenação e paginação
        query = query.order_by(desc(Guia.data), desc(Guia.id))
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
            .filter_by(numero_guia=numero_guia, user_id=user["crm"])
            .delete()
        )
        db.commit()
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
    print("LOG DE ATIVIDADE:", log_data)  # Troque por insert no banco se desejar
    return {"ok": True}


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


# --- Endpoint para listar incidentes ---
@app.get("/api/v1/incidents", response_model=list[IncidentListItem])
def list_incidents(admin: bool = False):
    # Em produção, proteger este endpoint com autenticação/admin
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


# --- Endpoint para listar contas inativas há mais de X anos ---
@app.get("/api/v1/inactive-accounts", response_model=list[InactiveAccountItem])
def list_inactive_accounts(years: int = Query(2, ge=1, le=10)):
    # Em produção, proteger este endpoint com autenticação/admin
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


# --- Endpoint para notificar usuários inativos ---
@app.post("/api/v1/notify-inactive", response_model=NotifyInactiveResponse)
def notify_inactive_accounts(years: int = Query(2, ge=1, le=10)):
    # Em produção, proteger este endpoint com autenticação/admin
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
            # Aqui, simular envio de notificação (ex: e-mail)
            logger.info(
                f"[NOTIFY] Conta inativa: CRM={m.crm}, nome={m.nome}, UF={m.uf}, last_login={m.last_login_at}"
            )
            notified.append(m.crm)
        return NotifyInactiveResponse(
            message=f"Notificações simuladas para {len(notified)} contas inativas.",
            notified_crms=notified,
        )
    finally:
        db.close()


# --- Endpoint para deletar contas inativas ---
@app.delete("/api/v1/delete-inactive", response_model=BulkDeleteResponse)
def delete_inactive_accounts(years: int = Query(2, ge=1, le=10)):
    # Em produção, proteger este endpoint com autenticação/admin
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
        return BulkDeleteResponse(
            message=f"{len(deleted)} contas inativas anonimizadas e removidas.",
            deleted_crms=deleted,
        )
    finally:
        db.close()


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
        detalhes = []
        for item in parser.get_payments():
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
    if not crm:
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
    # Buscar demonstrativos do usuário
    demos = (
        db.query(Demonstrativo)
        .filter(Demonstrativo.crm == crm, Demonstrativo.upload_time >= data_limite)
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
    # Auditorias pendentes: demonstrativos sem liberação
    auditoria_pendente = (
        db.query(Demonstrativo)
        .filter(Demonstrativo.crm == crm, Demonstrativo.liberado == "R$ 0,00")
        .count()
    )
    # Procedimentos detalhados (últimos 30 dias)
    guias = db.query(Guia).filter(Guia.crm == crm, Guia.data >= data_limite).all()
    for guia in guias:
        procedures.append(
            {
                "id": guia.id,
                "codigo": guia.codigo,
                "descricao": guia.descricao,
                "funcao": guia.papel,
                "pago": guia.status == "Pago",
                "valorPago": None,  # Pode ser enriquecido se necessário
                "valorTabela2015": None,
                "diferenca": None,
                "guia": guia.numero_guia,
                "beneficiario": guia.paciente,
            }
        )
    # Glosas (mock: pegar guias não pagas ou status glosado)
    for guia in guias:
        if guia.status and "glosa" in guia.status.lower():
            glosas.append(
                {
                    "id": guia.id,
                    "codigo": guia.codigo,
                    "descricao": guia.descricao,
                    "motivo": guia.status,
                    "valorGlosa": None,
                }
            )
    return {
        "totals": {
            "totalRecebido": round(total_recebido, 2),
            "totalGlosado": round(total_glosado, 2),
            "totalProcedimentos": total_procedimentos,
            "auditoriaPendente": auditoria_pendente,
        },
        "procedures": procedures,
        "glosas": glosas,
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


@app.get("/api/v1/profile", response_model=ProfileResponse)
def get_profile(user: dict = Depends(get_current_user)):
    """Retorna os dados do médico autenticado."""
    db = SessionLocal()
    try:
        medico = db.query(Medico).filter_by(crm=user["crm"]).first()
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

        # Cria ou recupera registro de detalhes de perfil
        perfil = db.query(PerfilMedico).filter_by(crm=user["crm"]).first()
        if not perfil:
            perfil = PerfilMedico(crm=user["crm"])
            db.add(perfil)

        updated = False

        # Campos na tabela Medico
        if data.uf:
            medico.uf = data.uf
            updated = True
        if data.nome:
            medico.nome = data.nome
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

        # Campos na tabela PerfilMedico
        if data.email is not None:
            perfil.email = data.email
            updated = True
        if data.specialty is not None:
            perfil.specialty = data.specialty
            updated = True
        if data.hospital is not None:
            perfil.hospital = data.hospital
            updated = True
        if data.phone is not None:
            perfil.phone = data.phone
            updated = True
        if data.bio is not None:
            perfil.bio = data.bio
            updated = True

        if updated:
            log_audit(
                "update_profile",
                user_crm=user["crm"],
                ip=None,
                details=data.dict(exclude_unset=True),
            )
            db.commit()
            logger.info(f"Perfil atualizado para CRM {user['crm']}")
            return UpdateProfileResponse(message="Perfil atualizado com sucesso.")
        else:
            return UpdateProfileResponse(message="Nenhuma alteração realizada.")
    finally:
        db.close()


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
