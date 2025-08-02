# -*- coding: utf-8 -*-
"""
Database connection and session management
"""
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from contextlib import contextmanager
from typing import Generator
import os

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medcheck.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL logging
    pool_pre_ping=True
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db_session() -> Generator[Session, None, None]:
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context():
    """
    Context manager for database session
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def create_tables():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all tables"""
    Base.metadata.drop_all(bind=engine)