#!/usr/bin/env python3
"""
Script para Configurar Dados de Teste - Crosscheck MedCheck
=========================================================

Este script popula o banco de dados local com dados necessários 
para testar o crosscheck entre guias e demonstrativos.

Autor: MedCheck AI Assistant
Data: 2025-01-27
"""

import hashlib
import logging
import os
import shutil
from pathlib import Path

from src.api import Base, Demonstrativo, Guia, SessionLocal, engine
from src.parsers.guia_parser import parse_guia_pdf

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def calculate_file_hash(file_path: str) -> str:
    """Calcula hash SHA-256 do arquivo"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def setup_database():
    """Cria tabelas no banco de dados"""
    print("🗃️ Configurando banco de dados...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas/verificadas com sucesso")
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False
    return True


def upload_guia_to_database(file_path: str, crm: str, uf: str) -> bool:
    """Processa uma guia e adiciona ao banco de dados"""
    try:
        print(f"\n📋 Processando guia: {Path(file_path).name}")

        # Verificar se arquivo existe
        if not os.path.exists(file_path):
            print(f"❌ Arquivo não encontrado: {file_path}")
            return False

        # Calcular hash do arquivo
        file_hash = calculate_file_hash(file_path)

        # Parse da guia
        procedures = parse_guia_pdf(file_path, crm)

        if not procedures:
            print("❌ Nenhum procedimento extraído")
            return False

        print(f"📊 Encontrados {len(procedures)} procedimentos")

        # Adicionar ao banco
        db = SessionLocal()
        guias_adicionadas = 0

        try:
            for proc in procedures:
                # Verificar se já existe
                existing = (
                    db.query(Guia)
                    .filter_by(
                        numero_guia=proc.get("guia"),
                        codigo=proc.get("codigo"),
                        papel=proc.get("papel_exercido"),
                        crm=crm,
                        uf=uf,
                    )
                    .first()
                )

                if not existing:
                    guia = Guia(
                        numero_guia=proc.get("guia"),
                        data=proc.get("data_execucao", "").replace("-", "/"),
                        paciente=proc.get("beneficiario", ""),
                        codigo=proc.get("codigo", ""),
                        descricao=proc.get("descricao", ""),
                        papel=proc.get("papel_exercido", ""),
                        crm=crm,
                        uf=uf,
                        qtd=proc.get("quantidade", 1),
                        status="Gerado pela execução",
                        prestador=proc.get("prestador", ""),
                        user_id=crm,
                        nome_medico=next(
                            (
                                p.get("nome", "")
                                for p in proc.get("participacoes", [])
                                if p.get("crm") == crm
                            ),
                            "",
                        ),
                        dt_inicio=next(
                            (
                                p.get("inicio", "")
                                for p in proc.get("participacoes", [])
                                if p.get("crm") == crm
                            ),
                            "",
                        ),
                        dt_fim=next(
                            (
                                p.get("fim", "")
                                for p in proc.get("participacoes", [])
                                if p.get("crm") == crm
                            ),
                            "",
                        ),
                        status_part=next(
                            (
                                p.get("status", "")
                                for p in proc.get("participacoes", [])
                                if p.get("crm") == crm
                            ),
                            "",
                        ),
                        file_hash=file_hash,
                        filename=Path(file_path).name,
                    )
                    db.add(guia)
                    guias_adicionadas += 1

            db.commit()
            print(f"✅ Adicionadas {guias_adicionadas} guias ao banco")

            # Copiar arquivo para diretório de uploads se não existir
            upload_dir = Path("uploads")
            upload_dir.mkdir(exist_ok=True)

            upload_file = upload_dir / Path(file_path).name
            if not upload_file.exists():
                shutil.copy2(file_path, upload_file)
                print(f"📁 Arquivo copiado para uploads: {upload_file.name}")

            return True

        finally:
            db.close()

    except Exception as e:
        print(f"❌ Erro ao processar guia: {e}")
        return False


def setup_test_data():
    """Configura dados de teste completos"""
    print("🚀 CONFIGURANDO DADOS DE TESTE PARA CROSSCHECK")
    print("=" * 60)

    # Dados do usuário de teste
    TEST_CRM = "6091"
    TEST_UF = "AC"

    # 1. Configurar banco
    if not setup_database():
        return False

    # 2. Listar guias de teste disponíveis
    test_files = [
        "data/guias/thayse borges.pdf",
        "data/guias/rodrigo bernardo.pdf",
        "data/guias/noivana.pdf",
        "data/guias/nubia_katia.pdf",
        "uploads/thayse borges.pdf",
        "uploads/rodrigo bernardo.pdf",
        "uploads/noivana.pdf",
        "uploads/nubia_katia.pdf",
        "src/uploads/thayse borges.pdf",
        "src/uploads/rodrigo bernardo.pdf",
        "src/uploads/noivana.pdf",
        "src/uploads/nubia_katia.pdf",
    ]

    # 3. Processar guias encontradas
    guias_processadas = 0
    for file_path in test_files:
        if os.path.exists(file_path):
            if upload_guia_to_database(file_path, TEST_CRM, TEST_UF):
                guias_processadas += 1

    # 4. Verificar resultado final
    db = SessionLocal()
    try:
        total_guias = db.query(Guia).filter_by(crm=TEST_CRM, uf=TEST_UF).count()
        guias_unicas = (
            db.query(Guia.numero_guia)
            .filter_by(crm=TEST_CRM, uf=TEST_UF)
            .distinct()
            .count()
        )

        print(f"\n📊 RESULTADO FINAL:")
        print(f"   Guias processadas: {guias_processadas}")
        print(f"   Total entradas no banco: {total_guias}")
        print(f"   Guias únicas: {guias_unicas}")

        # Listar guias
        guias = (
            db.query(Guia.numero_guia, Guia.codigo, Guia.descricao)
            .filter_by(crm=TEST_CRM, uf=TEST_UF)
            .distinct()
            .all()
        )
        print(f"\n📋 GUIAS REGISTRADAS:")
        for guia in guias:
            print(f"   🏥 {guia.numero_guia} - {guia.codigo} - {guia.descricao}")

        if total_guias > 0:
            print(f"\n✅ SUCESSO! Banco configurado para crosscheck")
            print(f"   Agora execute: python diagnostic_crosscheck_production.py")
        else:
            print(f"\n❌ FALHA! Nenhuma guia foi adicionada")
            print(f"   Verifique se os arquivos de guias existem")

    finally:
        db.close()


def list_available_files():
    """Lista arquivos de guias disponíveis"""
    print("\n🔍 PROCURANDO ARQUIVOS DE GUIAS...")

    search_paths = [
        "data/guias/",
        "uploads/",
        "src/uploads/",
        "backend/uploads/",
        "./",
    ]

    found_files = []
    for search_path in search_paths:
        if os.path.exists(search_path):
            for file in Path(search_path).glob("*.pdf"):
                if any(
                    name in file.name.lower()
                    for name in ["thayse", "rodrigo", "noivana", "nubia"]
                ):
                    found_files.append(str(file))

    if found_files:
        print(f"📁 Arquivos encontrados:")
        for file in found_files:
            print(f"   📄 {file}")
    else:
        print(f"❌ Nenhum arquivo de guia encontrado")
        print(f"   Certifique-se de que os PDFs estão em uma das pastas:")
        for path in search_paths:
            print(f"   📁 {path}")


def main():
    """Função principal"""
    try:
        setup_test_data()
    except KeyboardInterrupt:
        print("\n\n⏹️  Configuração interrompida pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante configuração: {e}")
        import traceback

        traceback.print_exc()

        # Se falhar, mostrar arquivos disponíveis
        list_available_files()


if __name__ == "__main__":
    main()
