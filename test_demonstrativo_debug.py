#!/usr/bin/env python3
"""
Script de teste para debugar o parser de demonstrativos
"""

import re

import pdfplumber

from src.parsers.demonstrativo_parser import DemonstrativoParser

if __name__ == "__main__":
    file_path = "data/demonstrativos/Demonstrativo-outubro_2024.pdf"
    print(f"Abrindo arquivo: {file_path}")
    try:
        with pdfplumber.open(file_path) as pdf:
            print(f"Total de páginas: {len(pdf.pages)}")
            text = pdf.pages[0].extract_text()
            print("\n--- TEXTO DA PRIMEIRA PÁGINA ---")
            print(text)
            print("\n--- FIM DO TEXTO ---")
            period_match = re.search(r"Período:\s*([^\n]+)", text)
            if period_match:
                print(f"Período extraído: {period_match.group(1).strip()}")
            else:
                print("❌ Não encontrou o período usando o padrão principal.")
    except Exception as e:
        print(f"Erro ao abrir ou ler o PDF: {e}")
        import traceback

        traceback.print_exc()
    print("\nTestando parser completo...")
    try:
        parser = DemonstrativoParser(file_path)
        summary = parser.get_summary()
        print(f"Resumo extraído: {summary}")
    except Exception as e:
        print(f"Erro no parser: {e}")
        import traceback

        traceback.print_exc()
