#!/usr/bin/env python3
"""
Script para debugar a contagem de procedimentos e identificar discrepâncias
entre o total salvo no banco vs o número real de procedimentos processados.
"""

import sys
import os

# Adicionar o projeto ao PYTHONPATH
sys.path.insert(0, '/Users/luciandeassis/medcheck-app')

from src.api import SessionLocal, Demonstrativo
from src.parsers.demonstrativo_parser import DemonstrativoParser

def debug_procedure_count():
    """Analisa todos os demonstrativos para encontrar discrepâncias na contagem"""
    
    db = SessionLocal()
    try:
        # Buscar todos os demonstrativos
        demonstrativos = db.query(Demonstrativo).all()
        
        print("🔍 AUDITORIA DE CONTAGEM DE PROCEDIMENTOS")
        print("=" * 60)
        
        discrepancias = []
        
        for demo in demonstrativos:
            print(f"\n📊 Demonstrativo: {demo.periodo} (ID: {demo.id})")
            print(f"   📁 Arquivo: {demo.filename}")
            print(f"   💾 Total salvo no banco: {demo.total_procedimentos}")
            
            # Verificar se o arquivo existe
            file_path = f"uploads/{demo.filename}"
            if not os.path.exists(file_path):
                print(f"   ❌ Arquivo não encontrado: {file_path}")
                continue
            
            try:
                # Re-processar o arquivo para ver quantos procedimentos realmente tem
                parser = DemonstrativoParser(file_path)
                payments = parser.get_payments()
                summary = parser.get_summary()
                
                total_real = len(payments)
                total_pdf = summary.get("total_procedures", 0)
                
                print(f"   🔢 Procedimentos processados agora: {total_real}")
                print(f"   📄 Total extraído do PDF: {total_pdf}")
                
                # Verificar discrepâncias
                if demo.total_procedimentos != total_real:
                    discrepancia = {
                        'demo_id': demo.id,
                        'periodo': demo.periodo,
                        'banco': demo.total_procedimentos,
                        'real': total_real,
                        'pdf': total_pdf,
                        'diferenca': abs(demo.total_procedimentos - total_real)
                    }
                    discrepancias.append(discrepancia)
                    print(f"   ⚠️  DISCREPÂNCIA ENCONTRADA!")
                    print(f"       Banco: {demo.total_procedimentos} vs Real: {total_real}")
                
                if total_pdf != total_real:
                    print(f"   ⚠️  PDF vs Processado: {total_pdf} vs {total_real}")
                
                # Debug dos totais do parser
                if hasattr(parser, 'totals') and parser.totals:
                    print(f"   📝 Totais extraídos do PDF: {parser.totals}")
                else:
                    print(f"   📝 Nenhum total extraído do PDF - usando contagem de procedimentos")
                    
            except Exception as e:
                print(f"   ❌ Erro ao processar: {e}")
        
        print("\n" + "=" * 60)
        print("📋 RESUMO DE DISCREPÂNCIAS")
        print("=" * 60)
        
        if discrepancias:
            print(f"⚠️  Encontradas {len(discrepancias)} discrepâncias:")
            for d in discrepancias:
                print(f"   • {d['periodo']}: Banco={d['banco']}, Real={d['real']} (diff: {d['diferenca']})")
        else:
            print("✅ Nenhuma discrepância encontrada - todas as contagens estão corretas!")
            
    finally:
        db.close()

if __name__ == "__main__":
    debug_procedure_count()