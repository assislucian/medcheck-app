#!/usr/bin/env python3
"""
Script para verificar configuração do banco de dados
"""

import logging
import os
import sqlite3
from urllib.parse import urlparse

import requests

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_database_config():
    """Verifica configuração do banco na aplicação"""
    print("🔍 Verificando configuração do banco de dados...\n")

    # Verificar variável de ambiente local
    database_url = os.environ.get("DATABASE_URL", "sqlite:///medicos.db")
    print(f"📁 DATABASE_URL local: {database_url}")

    # Parse da URL
    parsed = urlparse(database_url)
    db_type = parsed.scheme

    if db_type == "sqlite":
        print("⚠️  Tipo: SQLite (arquivo local)")
        print("🔄 Recomendação: Configurar PostgreSQL no Render")
    elif db_type == "postgresql":
        print("✅ Tipo: PostgreSQL")
        print(f"🏠 Host: {parsed.hostname}")
        print(f"🔌 Porta: {parsed.port}")
        print(f"📋 Database: {parsed.path[1:]}")  # Remove o /
    else:
        print(f"❓ Tipo desconhecido: {db_type}")

    print()


def check_render_health():
    """Verifica health check do Render"""
    print("🌐 Verificando health check do Render...")

    try:
        response = requests.get(
            "https://medcheck-backend.onrender.com/health", timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data.get('status')}")
            print(f"📊 Database: {data.get('database')}")
            print(f"🏷️  Version: {data.get('version')}")
            print(f"🌍 Environment: {data.get('environment')}")
        else:
            print(f"❌ Erro HTTP: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")

    print()


def check_render_database_connection():
    """Tenta endpoints que usam banco para verificar funcionamento"""
    print("🧪 Testando endpoints que usam banco...")

    # Teste do token endpoint (deve retornar 422, não 500)
    try:
        response = requests.post(
            "https://medcheck-backend.onrender.com/token",
            json={"username": "test", "password": "test"},
            timeout=10,
        )

        if response.status_code == 422:
            print("✅ Token endpoint: Funcionando (422 - validation error)")
        elif response.status_code == 500:
            print("❌ Token endpoint: Erro de servidor (possível problema no banco)")
        else:
            print(f"⚠️  Token endpoint: Status {response.status_code}")

    except Exception as e:
        print(f"❌ Erro no teste: {e}")


def check_database():
    """Verifica a integridade e estrutura do banco de dados."""
    db_path = os.path.join(os.path.dirname(__file__), "..", "demonstrativos.db")

    if not os.path.exists(db_path):
        logger.error(f"Banco de dados não encontrado: {db_path}")
        return False

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Verificar tabelas principais
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        )
        tables = cursor.fetchall()

        logger.info("Tabelas encontradas:")
        for table in tables:
            logger.info(f"  - {table[0]}")

        # Verificar estrutura da tabela perfis_medico
        if any("perfis_medico" in table for table in tables):
            cursor.execute("PRAGMA table_info(perfis_medico)")
            columns = cursor.fetchall()
            logger.info("Estrutura da tabela perfis_medico:")
            for col in columns:
                logger.info(f"  {col[1]} {col[2]}")

        conn.close()
        logger.info("Verificação do banco de dados concluída com sucesso!")
        return True

    except Exception as e:
        logger.error(f"Erro ao verificar banco de dados: {e}")
        return False


def main():
    print("=" * 60)
    print("🔍 DIAGNÓSTICO DO BANCO DE DADOS - MedCheck")
    print("=" * 60)
    print()

    check_database_config()
    check_render_health()
    check_render_database_connection()

    print("=" * 60)
    print("📋 PRÓXIMOS PASSOS:")
    print("1. Se usando SQLite: Configurar PostgreSQL no Render")
    print("2. Seguir guia: RENDER_DATABASE_SETUP.md")
    print("3. Verificar se DATABASE_URL está configurada no Render")
    print("=" * 60)


if __name__ == "__main__":
    main()
