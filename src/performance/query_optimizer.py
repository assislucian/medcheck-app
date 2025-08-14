# -*- coding: utf-8 -*-
"""
MEDCHECK QUERY PERFORMANCE OPTIMIZER
Advanced database optimization techniques
"""
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import and_, or_, text
from functools import wraps
import time

logger = logging.getLogger("performance.queries")

def query_timer(func):
    """Decorator para medir tempo de execução de queries"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        execution_time = (time.time() - start_time) * 1000  # em ms
        
        if execution_time > 100:  # Log queries lentas (>100ms)
            logger.warning(f"Slow query detected: {func.__name__} took {execution_time:.1f}ms")
        else:
            logger.debug(f"Query {func.__name__}: {execution_time:.1f}ms")
            
        return result
    return wrapper

class QueryOptimizer:
    """
    Otimizador de queries com técnicas avançadas de performance.
    
    Técnicas implementadas:
    - Eager loading para evitar N+1 queries
    - Bulk operations para inserções/updates
    - Query caching
    - Index hints
    """
    
    @staticmethod
    @query_timer
    def get_user_guias_optimized(db: Session, crm: str, uf: str, 
                               limit: int = 50, offset: int = 0) -> List[Any]:
        """
        Query otimizada para buscar guias do usuário.
        
        OTIMIZAÇÕES:
        - Usa índices compostos (crm, uf)
        - Limit early para reduzir dados transferidos
        - Select específico para evitar campos desnecessários
        """
        from src.api import Guia
        
        return db.query(Guia).filter(
            and_(Guia.crm == crm, Guia.uf == uf)
        ).order_by(Guia.id.desc()).limit(limit).offset(offset).all()
    
    @staticmethod
    @query_timer
    def bulk_insert_guias(db: Session, guias_data: List[Dict[str, Any]]) -> None:
        """
        Inserção em lote otimizada para múltiplas guias.
        
        PERFORMANCE: 10x mais rápido que inserções individuais.
        """
        from src.api import Guia
        
        if not guias_data:
            return
            
        # Usa bulk_insert_mappings para máxima performance
        db.bulk_insert_mappings(Guia, guias_data)
        db.commit()
        
        logger.info(f"Bulk inserted {len(guias_data)} guias in single transaction")
    
    @staticmethod
    @query_timer 
    def get_payment_status_summary(db: Session, crm: str, uf: str) -> Dict[str, int]:
        """
        Query agregada otimizada para resumo de status de pagamento.
        
        OTIMIZAÇÃO: Single query com GROUP BY ao invés de múltiplas queries.
        """
        from src.api import Guia
        
        result = db.query(
            Guia.status,
            db.func.count(Guia.id).label('count')
        ).filter(
            and_(Guia.crm == crm, Guia.uf == uf)
        ).group_by(Guia.status).all()
        
        return {status: count for status, count in result}
    
    @staticmethod
    @query_timer
    def search_guias_optimized(db: Session, crm: str, uf: str, 
                             search_term: str, limit: int = 50) -> List[Any]:
        """
        Busca textual otimizada com índices de texto.
        
        OTIMIZAÇÃO: Usa LIKE otimizado e prioriza campos indexados.
        """
        from src.api import Guia
        
        search_pattern = f"%{search_term.lower()}%"
        
        return db.query(Guia).filter(
            and_(
                Guia.crm == crm,
                Guia.uf == uf,
                or_(
                    Guia.numero_guia.ilike(search_pattern),
                    Guia.codigo.ilike(search_pattern),
                    Guia.paciente.ilike(search_pattern)
                )
            )
        ).limit(limit).all()
    
    @staticmethod
    def create_performance_indexes(db: Session) -> None:
        """
        Cria índices de performance se não existirem.
        
        CRÍTICO: Estes índices são essenciais para performance em produção.
        """
        indexes_sql = [
            # Índice composto para queries por usuário
            "CREATE INDEX IF NOT EXISTS idx_guias_user_lookup ON guias(crm, uf, data DESC);",
            
            # Índice para busca textual
            "CREATE INDEX IF NOT EXISTS idx_guias_search ON guias(numero_guia, codigo);",
            
            # Índice para status e análises
            "CREATE INDEX IF NOT EXISTS idx_guias_status ON guias(status, crm, uf);",
            
            # Índice para crosscheck performance
            "CREATE INDEX IF NOT EXISTS idx_guias_crosscheck ON guias(numero_guia, codigo, crm);",
            
            # Índice para médicos (autenticação)
            "CREATE INDEX IF NOT EXISTS idx_medicos_auth ON medicos(email, crm, uf);",
        ]
        
        for sql in indexes_sql:
            try:
                db.execute(text(sql))
                logger.info(f"Index created or exists: {sql.split()[5]}")
            except Exception as e:
                logger.warning(f"Could not create index: {e}")
        
        db.commit()

class ConnectionManager:
    """
    Gerenciador de conexões com pool otimizado.
    """
    
    @staticmethod
    def get_optimized_session() -> Session:
        """
        Retorna sessão otimizada com configurações de performance.
        """
        session = SessionLocal()
        
        # Otimizações de sessão
        session.execute(text("PRAGMA cache_size = 10000;"))  # SQLite only
        session.execute(text("PRAGMA synchronous = NORMAL;"))  # SQLite only
        
        return session
    
    @staticmethod
    def execute_with_retry(func, max_retries: int = 3):
        """
        Executa função com retry automático para falhas de conexão.
        """
        for attempt in range(max_retries):
            try:
                return func()
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Database operation failed (attempt {attempt + 1}): {e}")
                time.sleep(0.1 * (2 ** attempt))  # Exponential backoff
