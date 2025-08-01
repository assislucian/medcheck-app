"""
MedCheck Backend API - Versão Simplificada para Render
Sistema médico simplificado para funcionamento no Render
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from typing import List, Optional
import json
import os
import bcrypt
import secrets
import logging
from pydantic import BaseModel

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MedCheck API",
    description="API simplificada para funcionamento no Render",
    version="1.0.0",
)

# Configuração CORS para desenvolvimento e produção
cors_origins = [
    "http://localhost:8080", 
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://medcheck-frontend.onrender.com",
    "https://medcheck-backend.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações de segurança
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 720  # 12 horas

# Lista de UFs válidas do Brasil
VALID_UFS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

# =============================================================================
# MODELOS PYDANTIC
# =============================================================================

class UserRegister(BaseModel):
    nome: str
    email: str
    crm: str
    uf: str
    senha: str
    especialidade: str
    telefone: Optional[str] = None

class UserLogin(BaseModel):
    crm: str
    uf: str
    senha: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# =============================================================================
# ARMAZENAMENTO SIMPLES EM MEMÓRIA (para o Render)
# =============================================================================

# Armazenamento simples em memória (para evitar problemas com bancos no Render)
users_storage = {}

# Usuário padrão para teste
default_user = {
    "6091": {
        "AC": {
            "nome": "Dr. Luciano Assis",
            "email": "luciano@medcheck.com",
            "crm": "6091",
            "uf": "AC",
            "senha_hash": bcrypt.hashpw("@Luassis90".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            "especialidade": "Cardiologia",
            "telefone": "+55119999999",
            "created_at": datetime.now().isoformat(),
            "active": True
        }
    }
}

users_storage.update(default_user)

# =============================================================================
# FUNÇÕES DE SEGURANÇA
# =============================================================================

def hash_password(password: str) -> str:
    """Gera hash seguro da senha"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha está correta"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Cria token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    
    # Usando uma implementação simples sem python-jose
    import base64
    import hmac
    import hashlib
    
    header = {"alg": "HS256", "typ": "JWT"}
    payload = to_encode
    
    header_encoded = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_encoded = base64.urlsafe_b64encode(json.dumps(payload, default=str).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header_encoded}.{payload_encoded}".encode(),
        hashlib.sha256
    ).digest()
    signature_encoded = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_encoded}.{payload_encoded}.{signature_encoded}"

# =============================================================================
# ENDPOINTS PRINCIPAIS
# =============================================================================

@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "MedCheck API - Simplificada para Render",
        "version": "1.0.0",
        "status": "operational",
        "environment": "production",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check para o Render"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": "production",
        "cors_origins": len(cors_origins),
        "users_count": len(users_storage)
    }

@app.get("/debug/info")
async def debug_info():
    """Informações de debug"""
    return {
        "environment": "production",
        "cors_origins": cors_origins,
        "secret_key_length": len(SECRET_KEY),
        "users_stored": len(users_storage),
        "valid_ufs": len(VALID_UFS)
    }

@app.post("/api/v1/register")
async def register_user(user: UserRegister):
    """Registrar novo usuário"""
    try:
        logger.info(f"🔄 Registration attempt: CRM {user.crm} / UF {user.uf}")
        
        # Validações
        if user.uf.upper() not in VALID_UFS:
            raise HTTPException(status_code=422, detail="UF inválida")
        
        if len(user.crm) < 3:
            raise HTTPException(status_code=422, detail="CRM deve ter pelo menos 3 caracteres")
        
        if "@" not in user.email:
            raise HTTPException(status_code=422, detail="Email inválido")
        
        if len(user.senha) < 6:
            raise HTTPException(status_code=422, detail="Senha deve ter pelo menos 6 caracteres")

        # Verificar se já existe
        if user.crm in users_storage and user.uf.upper() in users_storage[user.crm]:
            raise HTTPException(status_code=400, detail="CRM já cadastrado para este estado (UF)")
        
        # Criar usuário
        hashed_password = hash_password(user.senha)
        
        if user.crm not in users_storage:
            users_storage[user.crm] = {}
        
        users_storage[user.crm][user.uf.upper()] = {
            "nome": user.nome,
            "email": user.email,
            "crm": user.crm,
            "uf": user.uf.upper(),
            "senha_hash": hashed_password,
            "especialidade": user.especialidade,
            "telefone": user.telefone,
            "created_at": datetime.now().isoformat(),
            "active": True
        }

        logger.info(f"✅ New user registered: {user.crm} / {user.uf}")
        return {"message": "Cadastro realizado com sucesso!"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno no cadastro")

@app.post("/token")
async def login_for_access_token(uf: str, username: str, password: str):
    """Login e geração de token"""
    try:
        logger.info(f"🔄 Login attempt: CRM {username} / UF {uf}")
        
        if not uf:
            raise HTTPException(status_code=400, detail="UF é obrigatória no login")
        
        if uf.upper() not in VALID_UFS:
            raise HTTPException(status_code=400, detail="UF inválida")
        
        # Verificar se usuário existe
        if username not in users_storage or uf.upper() not in users_storage[username]:
            raise HTTPException(status_code=401, detail="CRM ou senha incorretos")
        
        user_data = users_storage[username][uf.upper()]
        
        # Verificar senha
        if not verify_password(password, user_data["senha_hash"]):
            raise HTTPException(status_code=401, detail="CRM ou senha incorretos")
        
        # Criar token
        access_token = create_access_token(
            data={"sub": username, "uf": uf.upper(), "crm": username},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        logger.info(f"✅ Login successful: {username} / {uf}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"message": "Login realizado com sucesso!"}
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno no login")

@app.get("/api/v1/user/profile")
async def get_user_profile():
    """Obter perfil do usuário (mockado)"""
    return {
        "nome": "Dr. Luciano Assis",
        "email": "luciano@medcheck.com",
        "crm": "6091",
        "uf": "AC",
        "especialidade": "Cardiologia"
    }

@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats():
    """Estatísticas do dashboard (mockado)"""
    return {
        "total_guias": 150,
        "valor_total": 45000.00,
        "glosas": 12,
        "valor_glosas": 3500.00,
        "procedimentos_nao_pagos": 8,
        "taxa_aprovacao": 92.5
    }

@app.get("/api/v1/demonstrativos")
async def get_demonstrativos():
    """Lista de demonstrativos (mockado)"""
    return {
        "demonstrativos": [
            {
                "id": 1,
                "mes": "Janeiro 2025",
                "valor_total": 15000.00,
                "status": "processado"
            },
            {
                "id": 2,
                "mes": "Dezembro 2024",
                "valor_total": 18500.00,
                "status": "finalizado"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)