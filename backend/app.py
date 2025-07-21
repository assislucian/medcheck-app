"""
MedCheck Backend API
Sistema médico premium para gestão de honorários e análise de glosas
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List, Optional
import json
import os

app = FastAPI(
    title="MedCheck API",
    description="API premium para gestão médica e análise de honorários",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuração CORS para desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
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
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/profile")
async def get_user_profile():
    """Perfil do usuário (simulado)"""
    return {
        "id": "1",
        "nome": "Dr. João Silva",
        "email": "joao.silva@medcheck.com",
        "crm": "12345-SP",
        "especialidade": "Cardiologia",
        "telefone": "(11) 99999-9999",
        "created_at": "2024-01-01T00:00:00Z"
    }

# Tratamento de erros global
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handler global para exceções"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Erro interno do servidor",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 