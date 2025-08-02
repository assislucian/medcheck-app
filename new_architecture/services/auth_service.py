# -*- coding: utf-8 -*-
"""
Authentication service
Business logic for user authentication and management
"""
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.database import Medico
from models.schemas import RegisterRequest
from core.security import create_access_token, decode_jwt
from utils.validators.auth_validator import validate_password_strength
from utils.helpers.audit_helper import log_audit

class AuthService:
    """
    Service layer for authentication operations
    Handles business logic without direct API concerns
    """
    
    async def register_user(self, request: RegisterRequest, db: Session) -> Dict:
        """
        Register new user in the system
        
        Args:
            request: Registration data
            db: Database session
            
        Returns:
            Registration result
            
        Raises:
            ValueError: If validation fails
            HTTPException: If user already exists
        """
        # Validate password strength
        is_strong, msg = validate_password_strength(request.senha)
        if not is_strong:
            raise ValueError(msg)
        
        # Check for existing email
        existing_email = db.query(Medico).filter_by(email=request.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="E-mail já cadastrado"
            )
        
        # Check for existing CRM+UF
        existing_crm = db.query(Medico).filter_by(
            crm=request.crm, 
            uf=request.uf.upper()
        ).first()
        if existing_crm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CRM já cadastrado para este estado (UF)"
            )
        
        # Validate terms acceptance
        if not request.terms_accepted:
            raise ValueError(
                "É necessário aceitar os Termos de Uso e a Política de Privacidade."
            )
        
        # Create password hash
        password_hash = bcrypt.hashpw(
            request.senha.encode(), 
            bcrypt.gensalt()
        ).decode()
        
        # Create new user
        new_user = Medico(
            crm=request.crm,
            uf=request.uf.upper(),
            nome=request.nome,
            email=request.email,
            senha_hash=password_hash,
            terms_accepted=1,
            terms_accepted_at=datetime.utcnow(),
            terms_version=request.terms_version
        )
        
        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            # Log successful registration
            log_audit(
                action="user_registered",
                user_crm=request.crm,
                details={
                    "uf": request.uf,
                    "email": request.email,
                    "terms_version": request.terms_version
                }
            )
            
            return {
                "user_id": new_user.id,
                "message": "Usuário registrado com sucesso"
            }
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao salvar usuário no banco de dados"
            )
    
    async def authenticate_user(
        self, 
        crm: str, 
        uf: str, 
        password: str, 
        db: Session
    ) -> str:
        """
        Authenticate user and return JWT token
        
        Args:
            crm: Medical license number
            uf: State abbreviation  
            password: User password
            db: Database session
            
        Returns:
            JWT access token
            
        Raises:
            HTTPException: If authentication fails
        """
        # Find user
        user = db.query(Medico).filter_by(
            crm=crm, 
            uf=uf.upper()
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas"
            )
        
        # Verify password
        if not bcrypt.checkpw(password.encode(), user.senha_hash.encode()):
            # Log failed attempt
            log_audit(
                action="login_failed",
                user_crm=crm,
                details={"uf": uf, "reason": "invalid_password"}
            )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas"
            )
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        db.commit()
        
        # Create JWT token
        token_data = {
            "crm": user.crm,
            "uf": user.uf,
            "user_id": user.id,
            "email": user.email
        }
        
        access_token = create_access_token(data=token_data)
        
        # Log successful login
        log_audit(
            action="login_success",
            user_crm=crm,
            details={"uf": uf}
        )
        
        return access_token
    
    async def initiate_password_recovery(self, email: str, db: Session) -> Optional[Dict]:
        """
        Initiate password recovery process
        
        Args:
            email: User email
            db: Database session
            
        Returns:
            Recovery token info (for testing) or None
        """
        user = db.query(Medico).filter_by(email=email).first()
        if not user:
            return None  # Don't reveal if email exists
        
        # Generate recovery token
        token_data = {
            "crm": user.crm,
            "uf": user.uf,
            "type": "password_reset",
            "exp": datetime.utcnow() + timedelta(minutes=15)
        }
        
        recovery_token = create_access_token(
            data=token_data,
            expires_delta=timedelta(minutes=15)
        )
        
        # Log recovery attempt
        log_audit(
            action="password_recovery_requested",
            user_crm=user.crm,
            details={"email": email}
        )
        
        # TODO: Send email with recovery link
        # email_service.send_recovery_email(email, recovery_token)
        
        return {"token": recovery_token}  # Only for testing
    
    async def reset_password(self, token: str, new_password: str, db: Session):
        """
        Reset user password using recovery token
        
        Args:
            token: Recovery token
            new_password: New password
            db: Database session
            
        Raises:
            ValueError: If token is invalid or password is weak
        """
        try:
            # Decode token
            payload = decode_jwt(token)
            
            if payload.get("type") != "password_reset":
                raise ValueError("Token inválido para reset de senha")
            
            crm = payload.get("crm")
            uf = payload.get("uf")
            
            # Find user
            user = db.query(Medico).filter_by(crm=crm, uf=uf).first()
            if not user:
                raise ValueError("Usuário não encontrado")
            
            # Validate new password
            is_strong, msg = validate_password_strength(new_password)
            if not is_strong:
                raise ValueError(msg)
            
            # Update password
            user.senha_hash = bcrypt.hashpw(
                new_password.encode(), 
                bcrypt.gensalt()
            ).decode()
            
            db.commit()
            
            # Log password reset
            log_audit(
                action="password_reset_completed",
                user_crm=crm,
                details={"uf": uf}
            )
            
        except Exception as e:
            if isinstance(e, ValueError):
                raise
            raise ValueError("Token inválido ou expirado")
    
    async def get_user_info(self, crm: str, uf: str, db: Session) -> Dict:
        """
        Get user information
        
        Args:
            crm: Medical license number
            uf: State abbreviation
            db: Database session
            
        Returns:
            User information dict
        """
        user = db.query(Medico).filter_by(crm=crm, uf=uf).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        return {
            "crm": user.crm,
            "uf": user.uf,
            "nome": user.nome,
            "email": user.email,
            "terms_version": user.terms_version,
            "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None
        }
    
    async def refresh_user_token(self, current_user: Dict) -> str:
        """
        Refresh user access token
        
        Args:
            current_user: Current user data from JWT
            
        Returns:
            New access token
        """
        # Create new token with same data
        new_token = create_access_token(data={
            "crm": current_user["crm"],
            "uf": current_user["uf"],
            "user_id": current_user["user_id"],
            "email": current_user["email"]
        })
        
        return new_token