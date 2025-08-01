#!/usr/bin/env python3
"""
Script para debugar a lógica de procedimentos não pagos
Analisa discrepâncias entre guias e demonstrativos
"""

import os
import sys
sys.path.append('.')

from src.database import SessionLocal
from src.models import Guia, Demonstrativo
from sqlalchemy import func
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def debug_unpaid_logic():
    """Debug da lógica de procedimentos não pagos"""
    
    db = SessionLocal()
    try:
        # Buscar estatísticas básicas
        total_guias = db.query(Guia).count()
        total_demos = db.query(Demonstrativo).count()
        
        logger.info(f"=== ESTATÍSTICAS GERAIS ===")
        logger.info(f"Total de guias no banco: {total_guias}")
        logger.info(f"Total de demonstrativos no banco: {total_demos}")
        
        # Buscar guias por mês/ano
        guias_por_mes = db.query(
            func.substr(Guia.data, 4, 7).label('mes_ano'),
            func.count('*').label('total')
        ).group_by(func.substr(Guia.data, 4, 7)).all()
        
        logger.info(f"\n=== GUIAS POR MÊS/ANO ===")
        for mes_ano, total in guias_por_mes:
            logger.info(f"{mes_ano}: {total} guias")
        
        # Buscar demonstrativos por mês
        demos_info = db.query(
            Demonstrativo.filename,
            Demonstrativo.upload_time
        ).all()
        
        logger.info(f"\n=== DEMONSTRATIVOS DISPONÍVEIS ===")
        for demo in demos_info:
            logger.info(f"Arquivo: {demo.filename} - Upload: {demo.upload_time}")
        
        # Analisar códigos mais comuns
        codigos_comuns = db.query(
            Guia.codigo,
            func.count('*').label('total')
        ).group_by(Guia.codigo).order_by(func.count('*').desc()).limit(10).all()
        
        logger.info(f"\n=== CÓDIGOS MAIS COMUNS (TOP 10) ===")
        for codigo, total in codigos_comuns:
            logger.info(f"Código {codigo}: {total} procedimentos")
        
        # Analisar padrões de número de guia
        guias_pattern = db.query(
            Guia.numero_guia,
            Guia.data,
            func.count('*').label('total')
        ).group_by(Guia.numero_guia, Guia.data).having(func.count('*') > 1).all()
        
        logger.info(f"\n=== GUIAS COM MÚLTIPLOS PROCEDIMENTOS ===")
        for guia, data, total in guias_pattern[:10]:
            logger.info(f"Guia {guia} ({data}): {total} procedimentos")
        
        # Simular a lógica de paid_procedures
        logger.info(f"\n=== SIMULANDO LÓGICA DE COMPARAÇÃO ===")
        
        # Pegar uma amostra de guias
        sample_guias = db.query(Guia).limit(5).all()
        
        for guia in sample_guias:
            logger.info(f"\nAnalisando guia {guia.numero_guia}:")
            logger.info(f"  - Código: {guia.codigo}")
            logger.info(f"  - Data: {guia.data}")
            logger.info(f"  - Paciente: {guia.paciente}")
            logger.info(f"  - Chave de comparação: ({guia.codigo}, {guia.numero_guia})")
            
            # Verificar se essa chave existiria nos demonstrativos
            # (aqui seria necessário implementar a lógica de parsing dos demonstrativos)
            
        logger.info(f"\n=== RECOMENDAÇÕES ===")
        logger.info("1. Verificar se os números de guia nos demonstrativos correspondem exatamente aos das guias")
        logger.info("2. Verificar se os códigos CBHPM são idênticos (sem espaços ou formatação diferente)")
        logger.info("3. Verificar se a data do demonstrativo corresponde ao período das guias")
        logger.info("4. Implementar logs detalhados na função get_unpaid_procedures")
        
    except Exception as e:
        logger.error(f"Erro durante debug: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_unpaid_logic()