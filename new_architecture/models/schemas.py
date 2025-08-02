# -*- coding: utf-8 -*-
"""
Pydantic schemas for API requests/responses
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Fallback for EmailStr if email-validator not available
try:
    from pydantic import EmailStr
except ImportError:
    EmailStr = str  # Fallback to str if email-validator not available

class RegisterRequest(BaseModel):
    """User registration request"""
    email: str  # Using str instead of EmailStr to avoid dependency issues
    password: str
    nome: str
    crm: str
    especialidade: Optional[str] = None

class RegisterResponse(BaseModel):
    """User registration response"""
    success: bool
    message: str
    user_id: Optional[int] = None

class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: dict

class PasswordRecoveryRequest(BaseModel):
    """Password recovery request"""
    email: str  # Using str instead of EmailStr to avoid dependency issues

class ResetPasswordRequest(BaseModel):
    """Password reset request"""
    token: str
    new_password: str

class UserInfo(BaseModel):
    """User information"""
    id: int
    email: str
    nome: str
    crm: str
    especialidade: Optional[str] = None
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True