# -*- coding: utf-8 -*-
"""
Configuration management
Centralized settings with environment support
"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    """
    Application settings with environment variable support
    """
    # App settings
    APP_NAME: str = "MedCheck API"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    ENV: str = os.getenv("ENV", "development")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///medicos.db")
    
    # File upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 50
    MAX_UPLOAD_FILES: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".png", ".jpg", ".jpeg"]
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://medcheck-frontend.onrender.com"
    ]
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 100
    
    # Admin
    ENABLE_ADMIN: bool = True
    ADMIN_SECRET: Optional[str] = os.getenv("ADMIN_SECRET")
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Performance
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    
    # Features
    ENABLE_AUDIT: bool = True
    ENABLE_MONITORING: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    """
    return Settings()

# Validation for production
def validate_production_settings():
    """
    Validate critical settings for production environment
    """
    settings = get_settings()
    
    if settings.ENV == "production":
        if settings.JWT_SECRET == "dev-secret-change-me":
            raise ValueError("JWT_SECRET must be set in production!")
        
        if not settings.ADMIN_SECRET:
            raise ValueError("ADMIN_SECRET must be set in production!")
        
        if settings.DEBUG:
            raise ValueError("DEBUG must be False in production!")

# Auto-validate on import
if get_settings().ENV == "production":
    validate_production_settings()