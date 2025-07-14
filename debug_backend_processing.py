#!/usr/bin/env python3
"""
Debug do Processamento Interno do Backend
=========================================

Este script vai diretamente ao problema: simular exatamente o que o backend faz
no endpoint /api/v1/demonstrativos/{id}/detalhes e comparar com nossa lógica manual.
"""

import json
import os
import sys
from pathlib import Path

# Adicionar src ao path para importar módulos
sys.path.append("src")

from parsers.demonstrativo_parser import DemonstrativoParser

# Importar o parser que o backend usa
from parsers.guia_parser import parse_guia_pdf


def debug_backend_logic():
    """Simula exatamente o que o backend faz"""
    print("🔧 SIMULANDO PROCESSAMENTO INTERNO DO BACKEND")
    print("=" * 80)

    user_crm = "6091"

    # 1. Simular busca no banco - usar dados que encontramos no diagnóstico
    guias_registradas = [
        {"numero_guia": "10467538", "filename": "thayse borges.pdf"},
        {"numero_guia": "10507705", "filename": "rodrigo bernardo.pdf"},
        {"numero_guia": "10696456", "filename": "noivana.pdf"},
        {"numero_guia": "10714706", "filename": "nubia_katia.pdf"},
    ]

    print(f"📋 Guias registradas simuladas: {len(guias_registradas)}")

    # 2. Criar mapa de participações (como o backend faz)
    participacoes_map = {}

    for guia_registro in guias_registradas:
        numero_guia = guia_registro["numero_guia"]
        filename = guia_registro["filename"]

        # Simular caminho do arquivo
        guia_path = f"data/guias/{filename}"

        if not os.path.exists(guia_path):
            print(f"❌ Arquivo não encontrado: {guia_path}")
            continue

        print(f"\n🔍 Processando: {filename} (guia {numero_guia})")

        try:
            # Usar exatamente o mesmo parser que o backend usa
            procedimentos_guia = parse_guia_pdf(guia_path, user_crm)
            print(f"   📊 Parser extraiu: {len(procedimentos_guia)} procedimentos")

            for i, proc in enumerate(procedimentos_guia):
                guia_do_proc = proc.get("guia")
                codigo = proc.get("codigo")
                participacoes = proc.get("participacoes", [])

                print(f"   └── [{i+1}] Guia: {guia_do_proc}, Código: {codigo}")
                print(f"       └── Participações: {len(participacoes)}")

                # Mostrar detalhes das participações
                for j, part in enumerate(participacoes):
                    papel = part.get("papel")
                    crm = part.get("crm")
                    nome = part.get("nome")
                    print(f"          [{j+1}] {papel} - CRM {crm} - {nome}")

                # Adicionar ao mapa (exatamente como o backend)
                key = (guia_do_proc, codigo)
                if key not in participacoes_map:
                    participacoes_map[key] = []

                participacoes_map[key].extend(participacoes)
                print(
                    f"       └── [MAPA] Chave ({guia_do_proc}, {codigo}) → {len(participacoes_map[key])} participações"
                )

        except Exception as e:
            print(f"   ❌ Erro ao processar: {e}")

    print(f"\n🗺️ MAPA FINAL DE PARTICIPAÇÕES:")
    print(f"   📊 Total de chaves: {len(participacoes_map)}")

    for key, participacoes in participacoes_map.items():
        guia_num, codigo = key
        print(f"   🔑 ({guia_num}, {codigo}) → {len(participacoes)} participações")
        for part in participacoes:
            crm = part.get("crm")
            papel = part.get("papel")
            print(f"      └── CRM {crm}: {papel}")

    # 3. Testar com demonstrativo real
    print(f"\n💰 TESTANDO COM DEMONSTRATIVO REAL:")

    demo_path = "uploads"  # Vamos listar e ver qual demonstrativo usar
    if os.path.exists(demo_path):
        demo_files = [f for f in os.listdir(demo_path) if f.endswith(".pdf")]
        print(f"   📄 Arquivos disponíveis: {demo_files}")

        # Vamos usar o demonstrativo de outubro se existir
        outubro_files = [f for f in demo_files if "outubro" in f.lower()]
        if outubro_files:
            demo_file = outubro_files[0]
            demo_full_path = os.path.join(demo_path, demo_file)

            print(f"   🔍 Usando demonstrativo: {demo_file}")

            try:
                parser = DemonstrativoParser(demo_full_path)
                payments = parser.get_payments()

                print(f"   📊 Demonstrativo tem: {len(payments)} procedimentos")

                # Testar matching para primeiros 5 procedimentos
                for i, payment in enumerate(payments[:5]):
                    codigo = payment.get("code") or payment.get("codigo")
                    guia = payment.get("guia")

                    print(f"\n   🧪 [{i+1}] Testando: Guia {guia}, Código {codigo}")

                    # Buscar no mapa (exatamente como backend)
                    key = (guia, codigo)
                    participacoes = participacoes_map.get(key, [])

                    print(f"       🔍 Chave de busca: {key}")
                    print(f"       📊 Participações encontradas: {len(participacoes)}")

                    if participacoes:
                        print(f"       ✅ MATCH ENCONTRADO!")
                        for part in participacoes:
                            crm = part.get("crm")
                            papel = part.get("papel")
                            print(f"          └── CRM {crm}: {papel}")

                        # Verificar papel do usuário
                        papel_exercido = None
                        for part in participacoes:
                            if str(part.get("crm")) == str(user_crm):
                                papel_exercido = part.get("papel")
                                break

                        print(
                            f"       👤 Papel exercido pelo usuário: {papel_exercido or 'NENHUM'}"
                        )

                    else:
                        print(f"       ❌ NENHUM MATCH ENCONTRADO")
                        print(f"       🔍 Chaves disponíveis no mapa:")
                        for map_key in list(participacoes_map.keys())[:5]:
                            print(f"          - {map_key}")

            except Exception as e:
                print(f"   ❌ Erro ao processar demonstrativo: {e}")

    print(f"\n🎯 DIAGNÓSTICO CONCLUÍDO")
    print("=" * 80)


if __name__ == "__main__":
    debug_backend_logic()
