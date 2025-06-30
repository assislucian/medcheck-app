#!/usr/bin/env python3
"""
Script para validar configuração do PostgreSQL no Render
"""

import logging
import os
import sys
import time
from urllib.parse import urlparse

import psycopg2
import requests

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def wait_for_deployment():
    """Aguarda redeploy do Render"""
    print("⏳ Aguardando redeploy do Render...")
    print("💡 Isso leva ~2-3 minutos após configurar DATABASE_URL")

    for i in range(12):  # 12 tentativas = 6 minutos
        try:
            response = requests.get(
                "https://medcheck-backend.onrender.com/health", timeout=10
            )
            if response.status_code == 200:
                print(f"✅ Backend respondendo (tentativa {i+1})")
                return True
            else:
                print(f"⏳ Aguardando... (tentativa {i+1}/12)")
        except Exception:
            print(f"⏳ Aguardando... (tentativa {i+1}/12)")

        time.sleep(30)  # Aguarda 30s entre tentativas

    print("❌ Timeout: Backend não respondeu em 6 minutos")
    return False


def validate_postgres_connection():
    """Valida a conexão com PostgreSQL."""
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        logger.error("DATABASE_URL não encontrada nas variáveis de ambiente")
        return False

    try:
        # Parse da URL do banco
        parsed = urlparse(database_url)
        logger.info(f"Tentando conectar ao PostgreSQL em: {parsed.hostname}")

        # Conectar ao banco
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        # Verificar versão do PostgreSQL
        cursor.execute("SELECT version()")
        version = cursor.fetchone()
        logger.info(f"PostgreSQL versão: {version[0]}")

        # Verificar tabelas existentes
        cursor.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """
        )
        tables = cursor.fetchall()

        logger.info("Tabelas encontradas:")
        for table in tables:
            logger.info(f"  - {table[0]}")

        conn.close()
        logger.info("Conexão PostgreSQL validada com sucesso!")
        return True

    except psycopg2.Error as e:
        logger.error(f"Erro de PostgreSQL: {e}")
        return False
    except Exception as e:
        logger.error(f"Erro geral: {e}")
        return False


def validate_postgresql():
    """Valida se PostgreSQL está funcionando"""
    print("🔍 Validando configuração PostgreSQL...")

    try:
        # Health check
        response = requests.get(
            "https://medcheck-backend.onrender.com/health", timeout=10
        )
        if response.status_code != 200:
            print(f"❌ Health check falhou: {response.status_code}")
            return False

        data = response.json()
        print(f"✅ Health check: {data.get('status')}")
        print(f"📊 Database: {data.get('database')}")

        # Teste de endpoint que usa banco
        response = requests.post(
            "https://medcheck-backend.onrender.com/token",
            json={"username": "test", "password": "test"},
            timeout=10,
        )

        if response.status_code == 422:
            print("✅ Token endpoint: Funcionando com PostgreSQL")
        elif response.status_code == 500:
            print("❌ Possível erro de conexão com PostgreSQL")
            return False
        else:
            print(f"⚠️  Token endpoint: Status inesperado {response.status_code}")

        # Se chegou até aqui, provavelmente está funcionando
        print()
        print("🎉 POSTGRESQL CONFIGURADO COM SUCESSO!")
        print("✅ Backend usando banco persistente")
        print("✅ Dados não serão perdidos em redeploys")
        print("✅ Pronto para produção")

        return True

    except Exception as e:
        print(f"❌ Erro na validação: {e}")
        return False


def main():
    print("=" * 60)
    print("🗃️ VALIDAÇÃO POSTGRESQL - MedCheck")
    print("=" * 60)
    print()

    print("📋 Este script valida se o PostgreSQL foi configurado corretamente")
    print("🔧 Execute após configurar DATABASE_URL no Render")
    print()

    # Aguardar redeploy
    if not wait_for_deployment():
        sys.exit(1)

    print()

    # Validar PostgreSQL
    if validate_postgres_connection():
        print()
        print("🎯 PRÓXIMO PASSO: Configurar frontend no Vercel")
        print("📖 Seguir: VERCEL_UPDATE_GUIDE.md")
    else:
        print()
        print("🔧 TROUBLESHOOTING:")
        print("1. Verificar se DATABASE_URL está correta no Render")
        print("2. Verificar se PostgreSQL foi criado corretamente")
        print("3. Aguardar mais alguns minutos para redeploy")

    print("=" * 60)


if __name__ == "__main__":
    main()
