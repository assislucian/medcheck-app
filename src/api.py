from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, BackgroundTasks, Form, Body, Request, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from pydantic import BaseModel, Field
from uuid import uuid4
import os
import shutil
import logging
import time
import jwt
from datetime import datetime, timedelta, date
from src.main import parse_demonstrativo, parse_guide_pdf
import pandas as pd
import bcrypt
from sqlalchemy import create_engine, Column, String, Integer, DateTime, desc, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import List
import pdb
import sys
import json
import sqlite3
import tempfile
import zipfile
import io
from fastapi import APIRouter
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import re
from collections import defaultdict

# --- Configurações ---
UPLOAD_DIR = "uploads"
RESULTS_DIR = "results"
CBHPM_VERSION = "2015"
MAX_UPLOAD_SIZE_MB = 10
JWT_SECRET = "supersecret"  # Troque em produção
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 480
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# --- Banco de dados SQLAlchemy (SQLite) ---
DATABASE_URL = "sqlite:///medicos.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
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
    status_part = Column(String, nullable=True)  # Status da participação (ex: Fechada, Pendente)

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
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
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
            raise HTTPException(status_code=401, detail="CRM_LOGADO environment variable is required when SKIP_AUTH=true")
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

# --- FastAPI app ---
app = FastAPI(title="Validador de Demonstrativos e Guias Médicas", version="1.0.0")

# --- SlowAPI Rate Limiter ---
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS para frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Logging estruturado ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
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
    audit_logger.info(json.dumps({
        "timestamp": datetime.utcnow().isoformat(),
        "action": action,
        "user_crm": user_crm,
        "ip": ip,
        "details": details
    }))

def sanitize_text(text):
    import re
    if not text:
        return text
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'script', '', text, flags=re.IGNORECASE)
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

# --- Endpoint de cadastro de médico (persistente) ---
@app.post("/api/v1/register", response_model=RegisterResponse)
@limiter.limit("5/minute")
def register_medico(req: RegisterRequest, request: Request):
    # Sanitizar nome
    req.nome = sanitize_text(req.nome)
    def senha_forte(s):
        if len(s) < 8:
            return False
        if not re.search(r"[A-Za-z]", s):
            return False
        if not re.search(r"[0-9]", s):
            return False
        if not re.search(r"[^A-Za-z0-9]", s):
            return False
        return True
    if not senha_forte(req.senha):
        raise HTTPException(status_code=400, detail="A senha deve ter pelo menos 8 caracteres, incluir letra, número e caractere especial.")
    db = SessionLocal()
    try:
        if db.query(Medico).filter_by(crm=req.crm).first():
            raise HTTPException(status_code=400, detail="CRM já cadastrado")
        if not req.terms_accepted:
            raise HTTPException(status_code=400, detail="É necessário aceitar os Termos de Uso e a Política de Privacidade.")
        senha_hash = bcrypt.hashpw(req.senha.encode(), bcrypt.gensalt()).decode()
        medico = Medico(
            crm=req.crm,
            uf=req.uf,
            nome=req.nome,
            senha_hash=senha_hash,
            terms_accepted=1 if req.terms_accepted else 0,
            terms_accepted_at=datetime.utcnow(),
            terms_version=req.terms_version
        )
        db.add(medico)
        db.commit()
        # Registrar consentimento histórico
        ip = request.client.host if request and request.client else None
        consent = Consentimento(
            crm=req.crm,
            terms_version=req.terms_version,
            accepted_at=datetime.utcnow(),
            ip=ip
        )
        db.add(consent)
        log_audit("register", user_crm=req.crm, ip=ip, details={"uf": req.uf, "nome": req.nome})
        logger.info(f"Novo médico cadastrado: {req.uf}-{req.crm} - {req.nome} (aceite termos v{req.terms_version}, IP {ip})")
        return RegisterResponse(message="Cadastro realizado com sucesso!")
    finally:
        db.close()

# --- Endpoint de login/token (persistente) ---
@app.post("/token", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    crm = form_data.username
    senha = form_data.password
    uf = form_data.scopes[0] if form_data.scopes else None
    ip = request.client.host if request and request.client else None
    key = (crm, ip)
    now = time.time()
    # Checar bloqueio
    if key in BLOCKED_LOGINS and BLOCKED_LOGINS[key] > now:
        raise HTTPException(status_code=429, detail="Muitas tentativas de login. Tente novamente em alguns minutos.")
    # Limpar tentativas antigas
    FAILED_LOGINS[key] = [t for t in FAILED_LOGINS[key] if now - t < WINDOW_SECONDS]
    if not uf:
        raise HTTPException(status_code=400, detail="UF obrigatória para login")
    db = SessionLocal()
    try:
        medico = db.query(Medico).filter_by(crm=crm, uf=uf).first()
        if not medico or not bcrypt.checkpw(senha.encode(), medico.senha_hash.encode()):
            log_audit("login_failed", user_crm=crm, ip=ip, details={"uf": uf})
            FAILED_LOGINS[key].append(now)
            if len(FAILED_LOGINS[key]) >= MAX_FAILED_ATTEMPTS:
                BLOCKED_LOGINS[key] = now + BLOCK_TIME_SECONDS
                FAILED_LOGINS[key] = []
            raise HTTPException(status_code=401, detail="CRM, UF ou senha inválidos")
        # Resetar tentativas após sucesso
        FAILED_LOGINS[key] = []
        if key in BLOCKED_LOGINS:
            del BLOCKED_LOGINS[key]
        medico.last_login_at = datetime.utcnow()
        db.commit()
        log_audit("login_success", user_crm=crm, ip=ip, details={"uf": uf})
        access_token = create_access_token({"crm": crm, "uf": uf, "nome": medico.nome})
        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        db.close()

# --- Processamento real do pipeline ---
def process_validation_job(job_id: str, file_path: str, user: dict):
    logger.info(f"[JOB {job_id}] Iniciando processamento para {file_path} (CRM: {user['crm']})")
    try:
        df = parse_demonstrativo(file_path, user_crm=user['crm'])
        # Calcular agregados
        total_procedimentos = len(df)
        apresentado = df['apresentado'].replace(',', '.', regex=True).astype(float).sum() if 'apresentado' in df else 0.0
        liberado = df['liberado'].replace(',', '.', regex=True).astype(float).sum() if 'liberado' in df else 0.0
        glosa = df['glosa'].replace(',', '.', regex=True).astype(float).sum() if 'glosa' in df else 0.0
        # Salvar agregados no Demonstrativo (se possível identificar periodo/lote)
        # Aqui, para MVP, buscar por nome do arquivo ou metadados
        periodo = None
        lote = None
        if hasattr(df, 'periodo'):
            periodo = df['periodo'][0]
        if hasattr(df, 'lote'):
            lote = df['lote'][0]
        # Atualizar no banco
        db = SessionLocal()
        try:
            demo = db.query(Demonstrativo).filter_by(filename=os.path.basename(file_path)).first()
            if demo:
                demo.total_procedimentos = total_procedimentos
                demo.apresentado = f"R$ {apresentado:,.2f}".replace('.', ',')
                demo.liberado = f"R$ {liberado:,.2f}".replace('.', ',')
                demo.glosa = f"R$ {glosa:,.2f}".replace('.', ',')
                if periodo: demo.periodo = periodo
                if lote: demo.lote = lote
                db.commit()
        finally:
            db.close()
        result_path = os.path.join(RESULTS_DIR, f"{job_id}.json")
        df.to_json(result_path, orient="records", force_ascii=False)
        jobs[job_id] = {"status": "done", "result_path": result_path, "cbhpm_version": CBHPM_VERSION, "crm": user['crm']}
        logger.info(f"[JOB {job_id}] Processamento concluído com sucesso para CRM {user['crm']}")
    except Exception as e:
        jobs[job_id] = {"status": "error", "cbhpm_version": CBHPM_VERSION, "detail": str(e), "crm": user['crm']}
        logger.error(f"[JOB {job_id}] Erro: {e}")

# --- Endpoint de upload/validação ---
@app.post("/api/v1/validate", response_model=ValidateResponse)
@limiter.limit("10/minute")
def validate_file(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
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
    jobs[job_id] = {"status": "processing", "cbhpm_version": CBHPM_VERSION, "crm": user['crm']}
    background_tasks.add_task(process_validation_job, job_id, file_path, user)
    logger.info(f"[API] Upload recebido de CRM {user['crm']} para job {job_id}")
    return ValidateResponse(job_id=job_id, status="processing", cbhpm_version=CBHPM_VERSION)

# --- Endpoint de status/resultados ---
@app.get("/api/v1/status/{job_id}", response_model=StatusResponse)
def get_status(job_id: str, user: dict = Depends(get_current_user)):
    job = jobs.get(job_id)
    if not job or job.get("crm") != user["crm"]:
        raise HTTPException(status_code=404, detail="Job não encontrado para este CRM")
    result_url = None
    if job["status"] == "done":
        result_url = f"/api/v1/result/{job_id}"
    return StatusResponse(job_id=job_id, status=job["status"], result_url=result_url, cbhpm_version=job["cbhpm_version"], detail=job.get("detail", ""))

# --- Endpoint para download do resultado ---
@app.get("/api/v1/result/{job_id}")
def download_result(job_id: str, user: dict = Depends(get_current_user)):
    job = jobs.get(job_id)
    if not job or job["status"] != "done" or job.get("crm") != user["crm"]:
        raise HTTPException(status_code=404, detail="Resultado não disponível para este CRM")
    return FileResponse(job["result_path"], media_type="application/json", filename=f"resultado_{job_id}.json")

# --- Endpoint de cross-check Demonstrativo + Guias ---
@app.post("/api/v1/validate-cross")
def validate_cross(
    demonstrativo: UploadFile = File(...),
    guias: List[UploadFile] = File(...),
    user: dict = Depends(get_current_user)
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
        df_demo = parse_demonstrativo(demo_path, user_crm=user['crm'])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao processar demonstrativo: {e}")

    # Parse guias
    guias_dfs = []
    for guia_path in guias_paths:
        try:
            df_guia = parse_guide_pdf(guia_path, user['crm'])
            guias_dfs.append(df_guia)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erro ao processar guia: {e}")
    if not guias_dfs:
        raise HTTPException(status_code=400, detail="Nenhuma guia válida encontrada.")
    df_guias = pd.concat(guias_dfs, ignore_index=True)

    # Padroniza as chaves de merge
    for col in ['guia', 'codigo', 'crm']:
        if col not in df_demo.columns:
            df_demo[col] = None
        if col not in df_guias.columns:
            df_guias[col] = None
    key_demo = key_guia = ['guia', 'codigo', 'crm']
    # Merge outer e conta divergências
    merged = pd.merge(df_demo, df_guias, left_on=key_demo, right_on=key_guia, how='outer', indicator=True)
    pendentes_demo = merged[merged['_merge'] == 'left_only']
    pendentes_guia = merged[merged['_merge'] == 'right_only']
    divergencias = merged[merged['_merge'] == 'both']

    resumo = {
        'Lançamentos no Demonstrativo': len(df_demo),
        'Procedimentos nas Guias': len(df_guias),
        'No Demo sem Guia correspondente': len(pendentes_demo),
        'Guia sem lançamento no Demo': len(pendentes_guia),
        'Procedimentos cruzados': len(divergencias),
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
    return FileResponse(result_path, media_type="text/csv", filename=f"relatorio_cross_{job_id}.csv")

# --- Endpoint de upload de demonstrativo ---
@app.post("/api/v1/demonstrativos/upload")
def upload_demonstrativo(
    file: UploadFile = File(...),
    periodo: str = Form(None),
    lote: str = Form(None),
    user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        # Processar o PDF para extrair agregados antes de salvar
        job_id = str(uuid4())
        filename = f"{job_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        try:
            from src.parsers.demonstrativo_parser import DemonstrativoParser
            parser = DemonstrativoParser(file_path)
            summary = parser.get_summary()
            total_procedimentos = summary['total_procedures']
            apresentado = summary['total_presented']
            liberado = summary['total_approved']
            glosa = summary['total_glosa']
            periodo = periodo or summary['period']
        except Exception as e:
            total_procedimentos = 0
            apresentado = 0.0
            liberado = 0.0
            glosa = 0.0
        # Sanitizar campos livres
        if 'period' in summary:
            summary['period'] = sanitize_text(summary['period'])
        if 'total_presented' in summary:
            summary['total_presented'] = sanitize_text(str(summary['total_presented']))
        if 'total_approved' in summary:
            summary['total_approved'] = sanitize_text(str(summary['total_approved']))
        if 'total_glosa' in summary:
            summary['total_glosa'] = sanitize_text(str(summary['total_glosa']))
        # Log detalhado do upload
        logger.info(f"[UPLOAD] CRM={user['crm']} | periodo={periodo} | lote={lote or filename} | filename={filename}")
        # Validação obrigatória do período
        if not periodo:
            logger.error(f"[UPLOAD] Falha: demonstrativo sem período extraído! Arquivo: {filename}")
            raise HTTPException(status_code=400, detail="Não foi possível extrair o período do demonstrativo. Verifique o PDF.")
        # Trava de duplicidade: não permitir demonstrativo duplicado para mesmo CRM, período e lote (ou filename se lote não informado)
        unique_lote = lote or filename
        exists = db.query(Demonstrativo).filter_by(crm=user['crm'], periodo=periodo, lote=unique_lote).first()
        if exists:
            logger.warning(f"[UPLOAD] Duplicidade detectada: CRM={user['crm']} | periodo={periodo} | lote={unique_lote}")
            raise HTTPException(status_code=400, detail="Já existe demonstrativo para este período e lote.")
        demonstrativo = Demonstrativo(
            crm=user['crm'],
            periodo=periodo,
            lote=unique_lote,
            filename=filename,
            total_procedimentos=total_procedimentos,
            apresentado=f"R$ {apresentado:,.2f}".replace('.', ','),
            liberado=f"R$ {liberado:,.2f}".replace('.', ','),
            glosa=f"R$ {glosa:,.2f}".replace('.', ',')
        )
        db.add(demonstrativo)
        db.commit()
        return {
            "message": "Upload e processamento realizado com sucesso!",
            "id": demonstrativo.id,
            "periodo": demonstrativo.periodo,
            "lote": demonstrativo.lote,
            "total_procedimentos": demonstrativo.total_procedimentos,
            "apresentado": demonstrativo.apresentado,
            "liberado": demonstrativo.liberado,
            "glosa": demonstrativo.glosa
        }
    finally:
        db.close()

# --- Endpoint para deletar demonstrativo ---
from fastapi import status
@app.delete("/api/v1/demonstrativos/{demo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_demonstrativo(demo_id: int, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        demo = db.query(Demonstrativo).filter_by(id=demo_id, crm=user['crm']).first()
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
    periodo: str = None,
    lote: str = None,
    user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        query = db.query(Demonstrativo).filter_by(crm=user['crm'])
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
                "upload_time": d.upload_time.isoformat()
            } for d in demos
        ]
    finally:
        db.close()

# --- Endpoint de download de demonstrativo ---
@app.get("/api/v1/demonstrativos/{demo_id}/download")
def download_demonstrativo(demo_id: int, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        demo = db.query(Demonstrativo).filter_by(id=demo_id, crm=user['crm']).first()
        if not demo:
            raise HTTPException(status_code=404, detail="Demonstrativo não encontrado")
        file_path = os.path.join(UPLOAD_DIR, demo.filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Arquivo não encontrado")
        return FileResponse(file_path, media_type="application/pdf", filename=demo.filename)
    finally:
        db.close()

# --- Endpoint para obter procedimentos do demonstrativo ---
@app.get("/api/v1/demonstrativos/{demo_id}/procedimentos")
def get_demonstrativo_procedures(demo_id: int, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        demo = db.query(Demonstrativo).filter_by(id=demo_id, crm=user['crm']).first()
        if not demo:
            raise HTTPException(status_code=404, detail="Demonstrativo não encontrado")
        file_path = os.path.join(UPLOAD_DIR, demo.filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Arquivo do demonstrativo não encontrado")
        from src.parsers.demonstrativo_parser import DemonstrativoParser
        parser = DemonstrativoParser(file_path)
        return parser.get_payments()
    finally:
        db.close()

# --- Endpoint de upload de guia TISS ---
@app.post("/api/v1/guias/upload")
def upload_guia(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    """
    Recebe um PDF de guia TISS, extrai os dados, salva no banco e retorna em JSON.
    Exige autenticação e filtra automaticamente por CRM do usuário logado.
    """
    import tempfile
    from src.parsers.guia_parser import parse_guia_pdf
    import json
    import shutil
    import os

    # Valida tipo de arquivo
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são aceitos.")
    
    # Salva arquivo temporário
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    
    try:
        # Extrai procedimentos usando o CRM do usuário autenticado
        crm = str(user.get('crm', ''))
        logger.info(f"Processando guia para CRM {crm}")
        
        # Utiliza a nova função parse_guia_pdf com filtro por CRM
        procedures = parse_guia_pdf(tmp_path, crm_filter=crm)
        
        if not procedures:
            logger.warning(f"Nenhum procedimento encontrado para o CRM {crm} nesta guia")
            return {
                "message": "Guia processada, mas nenhum procedimento encontrado para o seu CRM",
                "crm": crm,
                "procedures": []
            }
        
        # Sanitizar campos livres
        for proc in procedures:
            proc['beneficiario'] = sanitize_text(proc.get('beneficiario', ''))
            proc['descricao'] = sanitize_text(proc.get('descricao', ''))
            proc['prestador'] = sanitize_text(proc.get('prestador', ''))
            for part in proc.get('participacoes', []):
                part['nome'] = sanitize_text(part.get('nome', ''))
        
        # Salva no banco evitando duplicados
        db = SessionLocal()
        guias_adicionadas = 0
        
        try:
            for proc in procedures:
                # Converte para o formato esperado pelo banco
                guia_data = {
                    "numero_guia": proc.get('guia'),
                    "data": proc.get('data_execucao', '').replace('-', '/'),
                    "paciente": proc.get('beneficiario', ''),
                    "codigo": proc.get('codigo', ''),
                    "descricao": proc.get('descricao', ''),
                    "papel": proc.get('papel_exercido', ''),
                    "crm": crm,
                    "qtd": proc.get('quantidade', 1),
                    "status": "Gerado pela execução",
                    "prestador": proc.get('prestador', ''),
                    "nome_medico": next((p.get('nome', '') for p in proc.get('participacoes', []) if p.get('crm') == crm), ''),
                    "dt_inicio": next((p.get('inicio', '') for p in proc.get('participacoes', []) if p.get('crm') == crm), ''),
                    "dt_fim": next((p.get('fim', '') for p in proc.get('participacoes', []) if p.get('crm') == crm), ''),
                    "status_part": next((p.get('status', '') for p in proc.get('participacoes', []) if p.get('crm') == crm), '')
                }
                
                # Verifica se já existe esta guia + código + papel para este usuário
                existing = db.query(Guia).filter_by(
                    numero_guia=guia_data['numero_guia'],
                    codigo=guia_data['codigo'],
                    papel=guia_data['papel'],
                    user_id=crm
                ).first()
                
                # Se não existir, adiciona
                if not existing:
                    guia = Guia(
                        numero_guia=guia_data['numero_guia'],
                        data=guia_data['data'],
                        paciente=guia_data['paciente'],
                        codigo=guia_data['codigo'],
                        descricao=guia_data['descricao'],
                        papel=guia_data['papel'],
                        crm=guia_data['crm'],
                        qtd=guia_data['qtd'],
                        status=guia_data['status'],
                        prestador=guia_data['prestador'],
                        user_id=crm,
                        nome_medico=guia_data['nome_medico'],
                        dt_inicio=guia_data['dt_inicio'],
                        dt_fim=guia_data['dt_fim'],
                        status_part=guia_data['status_part']
                    )
                    db.add(guia)
                    guias_adicionadas += 1
            
            db.commit()
            
            # Adapta para o formato esperado pelo frontend
            formatted_procedures = [
                {
                    "numero_guia": p.get('guia'),
                    "data": p.get('data_execucao', '').replace('-', '/'),
                    "beneficiario": p.get('beneficiario', ''),
                    "codigo": p.get('codigo', ''),
                    "descricao": p.get('descricao', ''),
                    "papel": p.get('papel_exercido', ''),
                    "crm": crm,
                    "qtd": p.get('quantidade', 1),
                    "status": "Gerado pela execução",
                    "prestador": p.get('prestador', ''),
                    "nome_medico": next((part.get('nome', '') for part in p.get('participacoes', []) if part.get('crm') == crm), ''),
                    "dt_inicio": next((part.get('inicio', '') for part in p.get('participacoes', []) if part.get('crm') == crm), ''),
                    "dt_fim": next((part.get('fim', '') for part in p.get('participacoes', []) if part.get('crm') == crm), ''),
                    "status_part": next((part.get('status', '') for part in p.get('participacoes', []) if part.get('crm') == crm), '')
                }
                for p in procedures
            ]
            
            logger.info(f"Guia processada: {len(procedures)} procedimentos encontrados, {guias_adicionadas} novos adicionados")
            return {
                "message": f"Guia processada: {len(procedures)} procedimentos encontrados, {guias_adicionadas} novos adicionados",
                "crm": crm,
                "procedures": formatted_procedures
            }
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Erro ao processar guia: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Erro ao processar guia: {e}")
    finally:
        os.unlink(tmp_path)

# --- Endpoint para salvar guias ---
@app.post("/api/v1/guias/save")
def save_guias(
    procedimentos: list = Body(...),
    user: dict = Depends(get_current_user)
):
    """
    Salva array de procedimentos extraídos de guias no banco, associando ao usuário autenticado.
    """
    # Sanitizar campos livres
    for proc in procedimentos:
        proc['beneficiario'] = sanitize_text(proc.get('beneficiario', ''))
        proc['descricao'] = sanitize_text(proc.get('descricao', ''))
        proc['prestador'] = sanitize_text(proc.get('prestador', ''))
        proc['nome_medico'] = sanitize_text(proc.get('nome_medico', ''))
    db = SessionLocal()
    try:
        for proc in procedimentos:
            guia = Guia(
                numero_guia=proc.get('numero_guia'),
                data=proc.get('data'),
                paciente=proc.get('beneficiario'),
                codigo=proc.get('codigo'),
                descricao=proc.get('descricao'),
                papel=proc.get('papel'),
                crm=proc.get('crm'),
                qtd=proc.get('qtd'),
                status=proc.get('status'),
                prestador=proc.get('prestador'),
                user_id=user['crm'],
                nome_medico=proc.get('nome_medico', ''),
                dt_inicio=proc.get('dt_inicio', ''),
                dt_fim=proc.get('dt_fim', ''),
                status_part=proc.get('status_part', '')
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
    user: dict = Depends(get_current_user)
):
    """
    Retorna todas as guias do usuário autenticado, com paginação e filtros.
    Permite busca por texto, filtro por status e data.
    """
    db = SessionLocal()
    try:
        # Consulta base
        query = db.query(Guia).filter_by(user_id=user['crm'])
        
        # Aplicar filtros se fornecidos
        if search:
            search_term = f"%{search.lower()}%"
            query = query.filter(
                (Guia.numero_guia.like(search_term)) | 
                (Guia.paciente.ilike(search_term)) |
                (Guia.codigo.like(search_term)) |
                (Guia.descricao.ilike(search_term)) |
                (Guia.papel.ilike(search_term)) |
                (Guia.nome_medico.ilike(search_term)) |
                (Guia.prestador.ilike(search_term))
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
                    "status_part": g.status_part
                }
                for g in guias
            ],
            "total": total,
            "page": page,
            "pageSize": pageSize
        }
        return result
    finally:
        db.close()

# --- Endpoint para deletar guia ---
from fastapi import status
@app.delete("/api/v1/guias/{numero_guia}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guia(numero_guia: str, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        deleted = db.query(Guia).filter_by(numero_guia=numero_guia, user_id=user['crm']).delete()
        db.commit()
        if not deleted:
            raise HTTPException(status_code=404, detail="Guia não encontrada.")
        return
    finally:
        db.close()

# --- Endpoint para registrar atividade ---
@app.post("/api/v1/activity-log")
async def log_activity(
    entry: ActivityLogEntry,
    request: Request,
    user: dict = Depends(get_current_user)
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
            guias = db.query(Guia).filter_by(user_id=user['crm']).all()
            demonstrativos = db.query(Demonstrativo).filter_by(crm=user['crm']).all()
            # Simular logs (poderia ser de uma tabela de logs)
            logs = []
            # Montar JSONs
            def to_serializable(obj):
                d = obj.__dict__.copy()
                d.pop('_sa_instance_state', None)
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
            with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
                zf.writestr("guias.json", json.dumps(guias_json, ensure_ascii=False, indent=2, cls=DateTimeEncoder))
                zf.writestr("demonstrativos.json", json.dumps(demonstrativos_json, ensure_ascii=False, indent=2, cls=DateTimeEncoder))
                zf.writestr("logs.json", json.dumps(logs, ensure_ascii=False, indent=2, cls=DateTimeEncoder))
            mem_zip.seek(0)
            logger.info(f"Exportação de dados para CRM {user['crm']}")
            return StreamingResponse(mem_zip, media_type="application/zip", headers={"Content-Disposition": "attachment; filename=medcheck-dados-usuario.zip"})
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
        db.query(Guia).filter_by(user_id=user['crm']).delete()
        # Apagar demonstrativos
        db.query(Demonstrativo).filter_by(crm=user['crm']).delete()
        # Apagar cadastro
        db.query(Medico).filter_by(crm=user['crm']).delete()
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
        consentimentos = db.query(Consentimento).filter_by(crm=user["crm"]).order_by(Consentimento.accepted_at.desc()).all()
        return [
            {
                "terms_version": c.terms_version,
                "accepted_at": c.accepted_at.isoformat(),
                "ip": c.ip
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
                raise HTTPException(status_code=400, detail="A senha deve ter pelo menos 8 caracteres.")
            medico.senha_hash = bcrypt.hashpw(data.senha.encode(), bcrypt.gensalt()).decode()
            updated = True
        if updated:
            log_audit("update_profile", user_crm=user["crm"], ip=None, details={"nome": data.nome, "uf": data.uf})
            db.commit()
            logger.info(f"Perfil atualizado para CRM {user['crm']}: nome={data.nome}, uf={data.uf}, senha={'***' if data.senha else None}")
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
        return AnonimizationResponse(message="Dados anonimizados com sucesso. O acesso à conta foi bloqueado.")
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
            status="open"
        )
        db.add(incident)
        db.commit()
        log_audit("incident_reported", user_crm=data.user_crm, ip=ip, details={"type": data.type, "description": data.description})
        logger.error(f"[INCIDENT] Tipo: {data.type} | Usuário: {data.user_crm} | IP: {ip} | Desc: {data.description}")
        return IncidentResponse(message="Incidente registrado com sucesso.", incident_id=incident.id)
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
                status=i.status
            ) for i in incidents
        ]
    finally:
        db.close()

# --- Endpoint para listar contas inativas há mais de X anos ---
@app.get("/api/v1/inactive-accounts", response_model=list[InactiveAccountItem])
def list_inactive_accounts(years: int = Query(2, ge=1, le=10)):
    # Em produção, proteger este endpoint com autenticação/admin
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=365*years)
        inativos = db.query(Medico).filter(
            (Medico.last_login_at == None) | (Medico.last_login_at < cutoff)
        ).all()
        return [
            InactiveAccountItem(
                crm=m.crm,
                nome=m.nome,
                uf=m.uf,
                last_login_at=m.last_login_at.isoformat() if m.last_login_at else None,
                created_at=m.terms_accepted_at.isoformat() if m.terms_accepted_at else None
            ) for m in inativos
        ]
    finally:
        db.close()

# --- Endpoint para notificar usuários inativos ---
@app.post("/api/v1/notify-inactive", response_model=NotifyInactiveResponse)
def notify_inactive_accounts(years: int = Query(2, ge=1, le=10)):
    # Em produção, proteger este endpoint com autenticação/admin
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=365*years)
        inativos = db.query(Medico).filter(
            (Medico.last_login_at == None) | (Medico.last_login_at < cutoff)
        ).all()
        notified = []
        for m in inativos:
            # Aqui, simular envio de notificação (ex: e-mail)
            logger.info(f"[NOTIFY] Conta inativa: CRM={m.crm}, nome={m.nome}, UF={m.uf}, last_login={m.last_login_at}")
            notified.append(m.crm)
        return NotifyInactiveResponse(message=f"Notificações simuladas para {len(notified)} contas inativas.", notified_crms=notified)
    finally:
        db.close()

# --- Endpoint para deletar contas inativas ---
@app.delete("/api/v1/delete-inactive", response_model=BulkDeleteResponse)
def delete_inactive_accounts(years: int = Query(2, ge=1, le=10)):
    # Em produção, proteger este endpoint com autenticação/admin
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=365*years)
        inativos = db.query(Medico).filter(
            (Medico.last_login_at == None) | (Medico.last_login_at < cutoff)
        ).all()
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
        return BulkDeleteResponse(message=f"{len(deleted)} contas inativas anonimizadas e removidas.", deleted_crms=deleted)
    finally:
        db.close()

# --- Endpoint para listar suboperadores ---
@app.get("/api/v1/suboperadores", response_model=list[SuboperadorItem])
def listar_suboperadores():
    suboperadores = [
        SuboperadorItem(nome="AWS", finalidade="Infraestrutura de nuvem e armazenamento de arquivos", pais="Brasil/EUA"),
        SuboperadorItem(nome="SendGrid", finalidade="Envio de e-mails transacionais", pais="EUA"),
        SuboperadorItem(nome="Supabase", finalidade="Banco de dados e analytics", pais="EUA"),
        SuboperadorItem(nome="Google", finalidade="Analytics e monitoramento", pais="EUA"),
        SuboperadorItem(nome="Vercel", finalidade="Hospedagem e deploy do frontend", pais="EUA")
    ]
    return suboperadores

# --- Endpoint para registrar requisição LGPD ---
@app.post("/api/v1/lgpd-request", response_model=LGPDRequestResponse)
@limiter.limit("3/minute")
def canal_lgpd(data: LGPDRequest, request: Request):
    # Sanitizar mensagem
    mensagem_limpa = sanitize_text(data.mensagem)
    # Salvar log da requisição
    logger.info(f"[LGPD] Nova requisição: tipo={data.tipo}, nome={data.nome}, email={data.email}, crm={data.crm}, mensagem={mensagem_limpa}, ip={request.client.host if request and request.client else None}")
    # (Opcional) Salvar em tabela LGPDRequests no banco para auditoria
    # (Opcional) Enviar e-mail para admin/DPO
    # Simular resposta automática
    return LGPDRequestResponse(message="Sua solicitação foi recebida. Você receberá uma resposta em até 2 dias úteis. Obrigado!")

# --- Observações ---
# - Para produção, troque JWT_SECRET por segredo seguro e use HTTPS
# - Substitua jobs dict por Redis/Celery/DB para escalabilidade real
# - Adapte process_validation_job para rodar o pipeline Python real
# - Para S3/MinIO, troque o salvamento de arquivos/resultados
# - Para Prometheus, adicione instrumentação com prometheus_fastapi_instrumentator
# - Para rate-limiting, use slowapi/starlette-limiter
# - Para logs estruturados, use structlog 