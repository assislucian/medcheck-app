# -*- coding: utf-8 -*-
"""
Database models using SQLAlchemy
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nome = Column(String, nullable=False)
    crm = Column(String, unique=True, index=True, nullable=False)
    especialidade = Column(String)
    senha_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', crm='{self.crm}')>"