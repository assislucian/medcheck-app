# 🏗️ PROPOSTA DE ARQUITETURA MODULAR - MedCheck API

## 🎯 **PROBLEMA ATUAL**
- **5351 linhas** em um único arquivo `api.py`
- Modelos, endpoints, lógica de negócio misturados
- Difícil manutenção, teste e evolução
- Violação dos princípios SOLID

## ✨ **ARQUITETURA PROPOSTA**

### 📁 **ESTRUTURA DE PASTAS**
```
src/
├── app/
│   ├── __init__.py
│   └── main.py                 # ~50 linhas - Entry point
│
├── api/
│   ├── __init__.py
│   ├── dependencies.py         # Dependências comuns
│   └── routers/
│       ├── __init__.py
│       ├── auth.py             # ~200 linhas - Login/Register
│       ├── demonstrativos.py   # ~250 linhas - Upload/Parse demos
│       ├── guias.py            # ~250 linhas - Upload/Parse guias
│       ├── reports.py          # ~200 linhas - Relatórios
│       ├── crosscheck.py       # ~150 linhas - Comparações
│       ├── admin.py            # ~100 linhas - Endpoints admin
│       └── health.py           # ~50 linhas - Health/Debug
│
├── core/
│   ├── __init__.py
│   ├── config.py               # ~100 linhas - Configurações
│   ├── database.py             # ~80 linhas - DB connection
│   ├── security.py             # ~120 linhas - JWT/Auth
│   └── middleware.py           # ~100 linhas - CORS/Rate limiting
│
├── models/
│   ├── __init__.py
│   ├── database.py             # ~200 linhas - SQLAlchemy models
│   └── schemas.py              # ~300 linhas - Pydantic schemas
│
├── services/
│   ├── __init__.py
│   ├── auth_service.py         # ~150 linhas - Lógica de auth
│   ├── demo_service.py         # ~200 linhas - Lógica demonstrativos
│   ├── guia_service.py         # ~200 linhas - Lógica guias
│   ├── crosscheck_service.py   # ~250 linhas - Comparações
│   ├── report_service.py       # ~180 linhas - Relatórios
│   └── audit_service.py        # ~100 linhas - Auditoria
│
├── utils/
│   ├── __init__.py
│   ├── parsers/
│   │   ├── demonstrativo_parser.py
│   │   ├── guia_parser.py
│   │   └── cbhpm_parser.py
│   ├── validators/
│   │   ├── file_validator.py
│   │   └── data_validator.py
│   └── helpers/
│       ├── file_utils.py
│       ├── date_utils.py
│       └── format_utils.py
│
└── tests/                      # Estrutura espelhada
    ├── unit/
    ├── integration/
    └── e2e/
```

## 🔥 **BENEFÍCIOS DA REFATORAÇÃO**

### **1. Manutenibilidade** 
- Cada arquivo com **responsabilidade única**
- Fácil localizar e corrigir bugs
- Onboarding de novos devs mais rápido

### **2. Testabilidade**
- Testes unitários por módulo
- Mocking mais simples
- Coverage granular

### **3. Escalabilidade**
- Adicionar features sem impactar outros módulos
- Deploy independente de módulos
- Performance otimizada por área

### **4. Colaboração**
- Múltiplos devs podem trabalhar em paralelo
- Menor conflito de merge
- Code review focado

## 🚀 **PRINCIPAIS ARQUIVOS**

### **app/main.py** (~50 linhas)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, demonstrativos, guias, reports, health
from core.config import get_settings
from core.middleware import setup_middleware
from core.database import init_db

settings = get_settings()

def create_app() -> FastAPI:
    app = FastAPI(
        title="MedCheck API",
        version="2.0.0",
        docs_url="/docs" if settings.DEBUG else None
    )
    
    # Setup middleware
    setup_middleware(app)
    
    # Include routers
    app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
    app.include_router(demonstrativos.router, prefix="/api/v1", tags=["demonstrativos"])
    app.include_router(guias.router, prefix="/api/v1", tags=["guias"])
    app.include_router(reports.router, prefix="/api/v1", tags=["reports"])
    app.include_router(health.router, prefix="/api/v1", tags=["health"])
    
    return app

app = create_app()

@app.on_event("startup")
async def startup():
    await init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
```

### **api/routers/auth.py** (~200 linhas)
```python
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from models.schemas import RegisterRequest, TokenResponse
from services.auth_service import AuthService
from core.security import create_access_token

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(
    request: RegisterRequest,
    auth_service: AuthService = Depends()
):
    """Registra novo médico no sistema"""
    return await auth_service.register_user(request)

@router.post("/token", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends()
):
    """Autentica usuário e retorna JWT token"""
    return await auth_service.authenticate_user(form_data)

@router.post("/refresh-token")
async def refresh_token(
    current_user: dict = Depends(get_current_user)
):
    """Renova token de acesso"""
    return {"access_token": create_access_token(current_user)}
```

### **services/demo_service.py** (~200 linhas)
```python
from typing import List
from fastapi import UploadFile

from models.database import Demonstrativo
from utils.parsers.demonstrativo_parser import DemonstrativoParser
from utils.validators.file_validator import validate_pdf
from core.database import get_db_session

class DemonstrativoService:
    def __init__(self, db_session=Depends(get_db_session)):
        self.db = db_session
        
    async def upload_demonstrativo(
        self, 
        file: UploadFile, 
        crm: str, 
        uf: str
    ) -> dict:
        """
        Processa upload de demonstrativo
        """
        # Validação
        validate_pdf(file)
        
        # Parse
        parser = DemonstrativoParser(file)
        procedures = parser.extract_procedures()
        
        # Salvar no banco
        demo = Demonstrativo(
            crm=crm,
            uf=uf,
            filename=file.filename,
            procedures=procedures
        )
        self.db.add(demo)
        self.db.commit()
        
        return {
            "success": True,
            "demo_id": demo.id,
            "procedures_count": len(procedures)
        }
    
    async def get_user_demonstrativos(self, crm: str, uf: str) -> List[dict]:
        """Retorna demonstrativos do usuário"""
        demos = self.db.query(Demonstrativo).filter_by(crm=crm, uf=uf).all()
        return [demo.to_dict() for demo in demos]
```

## 📊 **COMPARAÇÃO DE LINHAS**

| Aspecto | ATUAL | PROPOSTA | Redução |
|---------|-------|----------|---------|
| **Arquivo Principal** | 5351 linhas | 50 linhas | **-99%** |
| **Maior Módulo** | 5351 linhas | ~300 linhas | **-94%** |
| **Média por Arquivo** | 5351 linhas | ~150 linhas | **-97%** |
| **Total de Arquivos** | 1 arquivo | ~20 arquivos | Modular |

## 🎯 **PLANO DE MIGRAÇÃO**

### **FASE 1: Base (1-2 dias)**
1. ✅ Criar estrutura de pastas
2. ✅ Mover configurações para `core/`
3. ✅ Extrair models para `models/`
4. ✅ Criar `main.py` minimalista

### **FASE 2: Routers (2-3 dias)**
1. ✅ Extrair endpoints de auth
2. ✅ Extrair endpoints de demonstrativos
3. ✅ Extrair endpoints de guias
4. ✅ Extrair endpoints de reports

### **FASE 3: Services (2-3 dias)**
1. ✅ Criar services com lógica de negócio
2. ✅ Mover parsing logic para utils
3. ✅ Implementar dependency injection

### **FASE 4: Testes & Deploy (1-2 dias)**
1. ✅ Adaptar testes existentes
2. ✅ Verificar compatibilidade
3. ✅ Deploy gradual

## 💡 **VANTAGENS IMEDIATAS**

1. **🔍 Debug mais fácil** - Erro isolado por módulo
2. **⚡ Performance** - Imports otimizados
3. **🧪 Testes** - Coverage granular
4. **👥 Colaboração** - Trabalho paralelo
5. **📚 Documentação** - Módulos auto-documentados

## 🎬 **PRÓXIMO PASSO**

Quer que eu **comece a implementação**? Posso:

1. **🚀 Criar a estrutura base** (15 min)
2. **📦 Migrar um módulo específico** (auth, demos, etc)
3. **🔧 Manter compatibilidade** durante transição

**Escolha o módulo para começar!** 🎯