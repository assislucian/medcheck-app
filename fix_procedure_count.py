#!/usr/bin/env python3
"""
Script para corrigir a contagem de procedimentos nos demonstrativos existentes
"""

import sys
import os

# Adicionar o projeto ao PYTHONPATH
sys.path.insert(0, '/Users/luciandeassis/medcheck-app')

from src.api import SessionLocal, Demonstrativo
from src.parsers.demonstrativo_parser import DemonstrativoParser

def fix_procedure_count():
    """Corrige a contagem de procedimentos nos demonstrativos existentes"""
    
    db = SessionLocal()
    try:
        # Buscar demonstrativos com discrepâncias
        demonstrativos = db.query(Demonstrativo).all()
        
        print("🔧 CORRIGINDO CONTAGEM DE PROCEDIMENTOS")
        print("=" * 50)
        
        for demo in demonstrativos:
            file_path = f"uploads/{demo.filename}"
            if not os.path.exists(file_path):
                print(f"❌ Arquivo não encontrado: {file_path}")
                continue
            
            try:
                # Re-processar para obter contagem correta
                parser = DemonstrativoParser(file_path)
                payments = parser.get_payments()
                summary = parser.get_summary()  # Agora retorna contagem correta
                
                total_correto = len(payments)
                total_atual = demo.total_procedimentos
                
                print(f"📊 {demo.periodo} (ID: {demo.id})")
                print(f"   Atual: {total_atual} → Correto: {total_correto}")
                
                if total_atual != total_correto:
                    # Atualizar no banco
                    demo.total_procedimentos = total_correto
                    db.add(demo)
                    print(f"   ✅ Atualizado de {total_atual} para {total_correto}")
                else:
                    print(f"   ✅ Já está correto")
                    
            except Exception as e:
                print(f"   ❌ Erro ao processar: {e}")
        
        # Salvar todas as mudanças
        db.commit()
        print("\n✅ Todas as correções foram salvas no banco!")
        
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_procedure_count()