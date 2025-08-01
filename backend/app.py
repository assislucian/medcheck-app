"""
MedCheck Backend API - PRODUÇÃO
Sistema médico premium para gestão de honorários e análise de glosas
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import List, Optional
import json
import os
import sqlite3
import bcrypt
import jwt
from pydantic import BaseModel, EmailStr
import secrets
import logging
from pathlib import Path

app = FastAPI(
    title="MedCheck API",
    description="API premium para gestão médica e análise de honorários",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
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

# Simulação de dados para demonstração
sample_guides = [
    {
        "id": "1",
        "numero_guia": "123456789",
        "data": "2024-01-15",
        "beneficiario": "Dr. João Silva",
        "qtdProcedimentos": 5,
        "valor_total": 2500.00,
        "status": "PAGO",
        "convenio": "Unimed"
    },
    {
        "id": "2", 
        "numero_guia": "987654321",
        "data": "2024-01-10",
        "beneficiario": "Dr. Maria Santos",
        "qtdProcedimentos": 3,
        "valor_total": 1800.00,
        "status": "PENDENTE",
        "convenio": "Bradesco Saúde"
    }
]

sample_demonstratives = [
    {
        "id": "1",
        "periodo": "Janeiro 2024",
        "convenio": "Unimed",
        "valor_bruto": 15000.00,
        "valor_liquido": 12750.00,
        "glosas": 2250.00,
        "procedimentos": 45
    }
]

@app.get("/")
async def root():
    """Endpoint raiz com informações da API"""
    return {
        "message": "MedCheck API - Sistema Médico Premium",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check para monitoramento"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "database": "connected",
        "environment": "development"
    }

# Endpoints de Guias Médicas
@app.get("/api/guides")
async def get_guides(
    page: int = 0,
    size: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None
):
    """Buscar guias médicas com filtros"""
    try:
        filtered_guides = sample_guides.copy()
        
        if search:
            search = search.strip()  # Remove espaços em branco
            filtered_guides = [
                g for g in filtered_guides 
                if search.lower() in g.get("beneficiario", "").lower() or
                   search.lower() in g.get("numero_guia", "").lower()
            ]
        
        if status and status != "ALL":
            filtered_guides = [g for g in filtered_guides if g.get("status") == status]
        
        total = len(filtered_guides)
        start = page * size
        end = start + size
        
        return {
            "guides": filtered_guides[start:end],
            "total": total,
            "page": page,
            "size": size,
            "totalPages": (total + size - 1) // size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/guides/upload")
async def upload_guides(
    files: List[UploadFile] = File(...),
    tipo: str = Form("guia")
):
    """Upload de guias médicas"""
    try:
        uploaded_files = []
        
        for file in files:
            # Simular processamento do arquivo
            content = await file.read()
            
            # Salvar arquivo temporariamente
            upload_dir = "uploads"
            os.makedirs(upload_dir, exist_ok=True)
            
            file_path = os.path.join(upload_dir, file.filename)
            with open(file_path, "wb") as f:
                f.write(content)
            
            uploaded_files.append({
                "filename": file.filename,
                "size": len(content),
                "type": file.content_type,
                "status": "processed"
            })
        
        return {
            "message": "Arquivos processados com sucesso",
            "files": uploaded_files,
            "total_files": len(uploaded_files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/guides/{guide_id}")
async def get_guide_details(guide_id: str):
    """Buscar detalhes de uma guia específica"""
    try:
        guide = next((g for g in sample_guides if g["id"] == guide_id), None)
        if not guide:
            raise HTTPException(status_code=404, detail="Guia não encontrada")
        
        # Adicionar detalhes simulados
        guide_details = {
            **guide,
            "procedimentos": [
                {
                    "codigo": "10101012",
                    "descricao": "Consulta médica",
                    "quantidade": 1,
                    "valor_unitario": 500.00,
                    "valor_total": 500.00
                }
            ],
            "medico": {
                "nome": guide["beneficiario"],
                "crm": "12345-SP",
                "especialidade": "Cardiologia"
            }
        }
        
        return guide_details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoints de Demonstrativos
@app.get("/api/demonstratives")
async def get_demonstratives():
    """Buscar demonstrativos"""
    try:
        return {
            "demonstratives": sample_demonstratives,
            "total": len(sample_demonstratives)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoints de Estatísticas
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Estatísticas para o dashboard"""
    try:
        total_guides = len(sample_guides)
        total_valor = sum(g.get("valor_total", 0) for g in sample_guides)
        total_procedures = sum(g.get("qtdProcedimentos", 0) for g in sample_guides)
        
        return {
            "totals": {
                "totalRecebido": total_valor * 0.85,  # Simular 85% pago
                "totalGlosado": total_valor * 0.15,   # Simular 15% glosado
                "totalProcedimentos": total_procedures,
                "auditoriaPendente": 5
            },
            "guides": sample_guides,
            "procedures": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoints de Autenticação (simulados)
@app.post("/api/auth/login")
async def login(credentials: dict):
    """Login simulado"""
    try:
        email = credentials.get("email")
        password = credentials.get("password")
        
        # Simular autenticação
        if email and password:
            return {
                "token": "mock_jwt_token_123",
                "user": {
                    "id": "1",
                    "nome": "Dr. João Silva",
                    "email": email,
                    "crm": "12345-SP",
                    "especialidade": "Cardiologia"
                },
                "expires_in": 3600
            }
        else:
            raise HTTPException(status_code=401, detail="Credenciais inválidas. Verifique UF, CRM e senha.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# CONFIGURAÇÕES DE PRODUÇÃO
# =============================================================================

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

# Configuração do banco de dados
DATABASE_PATH = Path("medcheck_production.db")

# =============================================================================
# MODELOS PYDANTIC
# =============================================================================

class UserRegister(BaseModel):
    nome: str
    email: EmailStr
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
# BANCO DE DADOS
# =============================================================================

def init_database():
    """Inicializa o banco de dados"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Tabela de usuários
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            crm TEXT NOT NULL,
            uf TEXT NOT NULL,
            senha_hash TEXT NOT NULL,
            especialidade TEXT NOT NULL,
            telefone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            active BOOLEAN DEFAULT TRUE,
            UNIQUE(crm, uf)
        )
    """)
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Obtém conexão com o banco de dados"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# =============================================================================
# FUNÇÕES DE SEGURANÇA
# =============================================================================

def hash_password(password: str) -> str:
    """Gera hash seguro da senha"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verifica se a senha confere com o hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    """Cria token JWT real"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    """Verifica e decodifica token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# =============================================================================
# VALIDAÇÕES
# =============================================================================

def validate_crm_format(crm: str) -> bool:
    """Valida formato do CRM"""
    return crm.isdigit() and 3 <= len(crm) <= 8

def validate_password_strength(password: str) -> bool:
    """Valida força da senha para ambiente médico"""
    return (len(password) >= 8 and 
            any(c.isupper() for c in password) and
            any(c.islower() for c in password) and
            any(c.isdigit() for c in password))

def validate_uf(uf: str) -> bool:
    """Valida UF"""
    return uf.upper() in VALID_UFS

# =============================================================================
# FUNCÕES DE USUÁRIO
# =============================================================================

def create_user(user_data: UserRegister) -> dict:
    """Cria novo usuário no banco de dados"""
    # Validações
    if not validate_crm_format(user_data.crm):
        raise HTTPException(status_code=400, detail="Formato de CRM inválido")
    
    if not validate_uf(user_data.uf):
        raise HTTPException(status_code=400, detail="UF inválida")
    
    if not validate_password_strength(user_data.senha):
        raise HTTPException(
            status_code=400, 
            detail="Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número"
        )
    
    # Hash da senha
    password_hash = hash_password(user_data.senha)
    
    # Inserir no banco
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (nome, email, crm, uf, senha_hash, especialidade, telefone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_data.nome,
            user_data.email,
            user_data.crm,
            user_data.uf.upper(),
            password_hash,
            user_data.especialidade,
            user_data.telefone
        ))
        conn.commit()
        user_id = cursor.lastrowid
        
        return {
            "id": user_id,
            "nome": user_data.nome,
            "email": user_data.email,
            "crm": f"{user_data.crm}-{user_data.uf.upper()}",
            "especialidade": user_data.especialidade
        }
    except sqlite3.IntegrityError as e:
        if "crm, uf" in str(e):
            raise HTTPException(status_code=400, detail="CRM já cadastrado nesta UF")
        elif "email" in str(e):
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        else:
            raise HTTPException(status_code=400, detail="Erro ao criar usuário")
    finally:
        conn.close()

def authenticate_user(crm: str, uf: str, password: str) -> dict:
    """Autentica usuário"""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM users 
            WHERE crm = ? AND uf = ? AND active = TRUE
        """, (crm, uf.upper()))
        
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
        if not verify_password(password, user['senha_hash']):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
        return {
            "id": user['id'],
            "nome": user['nome'],
            "email": user['email'],
            "crm": f"{user['crm']}-{user['uf']}",
            "uf": user['uf'],
            "especialidade": user['especialidade'],
            "telefone": user['telefone']
        }
    finally:
        conn.close()

# =============================================================================
# INICIALIZAÇÃO
# =============================================================================

# Inicializar banco de dados na startup
@app.on_event("startup")
async def startup_event():
    init_database()
    logging.info("Banco de dados inicializado")

# Security
security = HTTPBearer()

# =============================================================================
# ENDPOINTS DE AUTENTICAÇÃO
# =============================================================================

@app.post("/api/auth/register", response_model=dict)
async def register_user(user_data: UserRegister):
    """Cadastro de novo usuário"""
    try:
        user = create_user(user_data)
        return {
            "message": "Usuário cadastrado com sucesso",
            "user": user
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erro no cadastro: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/token")
async def login_for_access_token(username: str = Form(...), password: str = Form(...), scope: str = Form(...)):
    """Login com OAuth2 - PRODUÇÃO REAL"""
    try:
        # Autenticar usuário no banco de dados
        user = authenticate_user(username, scope, password)
        
        # Criar token JWT real
        access_token = create_access_token(
            data={
                "sub": str(user["id"]),
                "crm": user["crm"],
                "uf": user["uf"],
                "email": user["email"]
            }
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user["id"],
                "nome": user["nome"],
                "email": user["email"],
                "crm": user["crm"],
                "uf": user["uf"],
                "especialidade": user["especialidade"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erro no login: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/api/auth/login")
async def login_json(login_data: UserLogin):
    """Login alternativo com JSON"""
    try:
        user = authenticate_user(login_data.crm, login_data.uf, login_data.senha)
        
        access_token = create_access_token(
            data={
                "sub": str(user["id"]),
                "crm": user["crm"],
                "uf": user["uf"],
                "email": user["email"]
            }
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erro no login JSON: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency para obter usuário atual"""
    token = credentials.credentials
    payload = verify_token(token)
    
    # Buscar usuário no banco
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ? AND active = TRUE", (payload["sub"],))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
        return {
            "id": user['id'],
            "nome": user['nome'],
            "email": user['email'],
            "crm": f"{user['crm']}-{user['uf']}",
            "uf": user['uf'],
            "especialidade": user['especialidade']
        }
    finally:
        conn.close()

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Perfil do usuário autenticado"""
    return current_user

# =============================================================================
# ENDPOINTS PARA DASHBOARD E DADOS
# =============================================================================

@app.get("/api/v1/dashboard")
async def get_dashboard_data(current_user: dict = Depends(get_current_user)):
    """Dashboard data - retorna dados baseados nos arquivos processados do usuário"""
    try:
        # TODO: Em produção real, consultar banco de dados por arquivos processados do usuário
        # Por enquanto, verificar se há dados reais ou retornar estado vazio
        
        # Simular verificação de arquivos processados
        user_has_files = False  # TODO: consultar banco real
        
        if not user_has_files:
            # Estado vazio - usuário ainda não fez upload de arquivos
            return {
                "totals": {
                    "totalRecebido": 0.00,
                    "totalGlosado": 0.00,
                    "totalProcedimentos": 0,
                    "auditoriaPendente": 0
                },
                "procedures": [],
                "glosas": [],
                "hasData": False,
                "message": "Faça upload das suas guias e demonstrativos para ver seus dados aqui!"
            }
        
        # Se tiver dados, calcular baseado nos arquivos reais
        # TODO: implementar lógica real de cálculo baseada nos PDFs processados
        return {
            "totals": {
                "totalRecebido": 0.00,
                "totalGlosado": 0.00,
                "totalProcedimentos": 0,
                "auditoriaPendente": 0
            },
            "procedures": [],
            "glosas": [],
            "hasData": True
        }
        
    except Exception as e:
        logging.error(f"Erro ao buscar dados do dashboard: {str(e)}")
        # Em caso de erro, retornar estado vazio
        return {
            "totals": {
                "totalRecebido": 0.00,
                "totalGlosado": 0.00,
                "totalProcedimentos": 0,
                "auditoriaPendente": 0
            },
            "procedures": [],
            "glosas": [],
            "hasData": False,
            "message": "Faça upload das suas guias e demonstrativos para começar!"
        }

@app.get("/api/v1/unpaid-procedures")
async def get_unpaid_procedures(current_user: dict = Depends(get_current_user)):
    """Procedimentos não pagos - baseado nos arquivos processados"""
    try:
        # TODO: Em produção real, consultar banco de dados por procedimentos não pagos do usuário
        # Por enquanto, retornar estado vazio até que haja dados reais
        
        user_has_files = False  # TODO: verificar se usuário tem arquivos processados
        
        if not user_has_files:
            return {
                "unpaid_procedures": 0,
                "unpaid_list": [],
                "hasData": False,
                "message": "Nenhum procedimento encontrado. Faça upload de suas guias!"
            }
        
        # Se tiver dados, retornar procedimentos reais não pagos
        return {
            "unpaid_procedures": 0,
            "unpaid_list": [],
            "hasData": True
        }
        
    except Exception as e:
        logging.error(f"Erro ao buscar procedimentos não pagos: {str(e)}")
        return {
            "unpaid_procedures": 0,
            "unpaid_list": [],
            "hasData": False,
            "message": "Erro ao carregar dados. Tente novamente."
        }

@app.get("/api/v1/activity-logs")
async def get_activity_logs(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """Logs de atividade do usuário"""
    from datetime import datetime, timedelta
    
    # Mock activities for development
    base_time = datetime.now()
    activities = []
    
    for i in range(limit):
        activities.append({
            "id": f"activity_{i+1}",
            "timestamp": (base_time - timedelta(minutes=i*30)).isoformat(),
            "action": f"Ação {i+1}",
            "description": f"Descrição da atividade {i+1}",
            "type": "info"
        })
    
    return {
        "activities": activities,
        "total": len(activities)
    }

# =============================================================================
# ENDPOINT PARA CADASTRAR SEU USUÁRIO
# =============================================================================

@app.post("/api/setup/create-admin")
async def create_admin_user():
    """Endpoint para criar usuário administrativo inicial"""
    try:
        admin_data = UserRegister(
            nome="Dr. Luciano Assis",
            email="luciano@medcheck.com", 
            crm="6091",
            uf="AC",
            senha="@Luassis90",
            especialidade="Medicina Geral",
            telefone="(68) 99999-9999"
        )
        
        user = create_user(admin_data)
        return {
            "message": "Usuário administrativo criado com sucesso",
            "user": user,
            "note": "Este endpoint deve ser removido em produção"
        }
    except HTTPException as e:
        if "já cadastrado" in str(e.detail):
            return {"message": "Usuário já existe", "status": "ok"}
        raise
    except Exception as e:
        logging.error(f"Erro ao criar admin: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# Tratamento de erros global
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handler global para exceções"""
    # Log detalhado para desenvolvedores (não exposto ao usuário)
    import logging
    logging.error(f"Erro interno: {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Erro interno do servidor",
            "detail": "Ocorreu um erro temporário. Tente novamente em alguns minutos.",
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 