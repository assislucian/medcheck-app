# -*- coding: utf-8 -*-
"""
Authentication endpoints
Login, register, password recovery
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from models.schemas import (
    RegisterRequest, 
    RegisterResponse,
    TokenResponse,
    PasswordRecoveryRequest,
    ResetPasswordRequest
)
from services.auth_service import AuthService
from core.database import get_db_session
from core.security import get_current_user
from utils.validators.auth_validator import validate_registration_data

router = APIRouter()

@router.post("/register", response_model=RegisterResponse)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db_session),
    auth_service: AuthService = Depends()
):
    """
    Registra novo médico no sistema
    
    - Valida dados de entrada
    - Verifica duplicatas (email, CRM+UF)
    - Cria hash seguro da senha
    - Salva no banco de dados
    """
    try:
        # Validação de entrada
        validate_registration_data(request)
        
        # Registro via service
        result = await auth_service.register_user(request, db)
        
        return RegisterResponse(
            message="Cadastro realizado com sucesso. Você já pode fazer login."
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/token", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db_session),
    auth_service: AuthService = Depends()
):
    """
    Autentica usuário e retorna JWT token
    
    - Valida credenciais (CRM+UF+senha)
    - Verifica rate limiting
    - Atualiza last_login_at
    - Retorna JWT token
    """
    try:
        # Parse form data (username = CRM, password inclui UF)
        uf = form_data.client_id or getattr(form_data, 'uf', None)
        if not uf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="UF é obrigatório"
            )
        
        # Autenticação via service
        token = await auth_service.authenticate_user(
            crm=form_data.username,
            uf=uf,
            password=form_data.password,
            db=db
        )
        
        return TokenResponse(
            access_token=token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/password-recovery")
async def password_recovery(
    request: PasswordRecoveryRequest,
    db: Session = Depends(get_db_session),
    auth_service: AuthService = Depends()
):
    """
    Inicia processo de recuperação de senha
    
    - Valida se email existe
    - Gera token de recuperação
    - Envia email (ou simula)
    """
    try:
        result = await auth_service.initiate_password_recovery(request.email, db)
        
        return {
            "message": "Se o e-mail estiver cadastrado, um link de recuperação foi enviado.",
            "reset_token": result.get("token") if result else None  # Apenas para teste
        }
        
    except Exception as e:
        # Sempre retorna sucesso para evitar enumeração de usuários
        return {
            "message": "Se o e-mail estiver cadastrado, um link de recuperação foi enviado."
        }

@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db_session),
    auth_service: AuthService = Depends()
):
    """
    Reseta senha usando token de recuperação
    
    - Valida token
    - Valida força da nova senha
    - Atualiza senha no banco
    """
    try:
        await auth_service.reset_password(request.token, request.new_password, db)
        
        return {"message": "Senha alterada com sucesso."}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/me")
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    auth_service: AuthService = Depends()
):
    """
    Retorna informações do usuário logado
    """
    try:
        user_info = await auth_service.get_user_info(current_user["crm"], current_user["uf"], db)
        return user_info
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar informações do usuário"
        )

@router.post("/refresh")
async def refresh_token(
    current_user: dict = Depends(get_current_user),
    auth_service: AuthService = Depends()
):
    """
    Renova token de acesso
    """
    try:
        new_token = await auth_service.refresh_user_token(current_user)
        
        return TokenResponse(
            access_token=new_token,
            token_type="bearer"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao renovar token"
        )