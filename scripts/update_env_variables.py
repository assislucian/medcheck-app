#!/usr/bin/env python3
"""
Script para atualizar as variáveis de ambiente do backend com as novas credenciais do banco
"""

import json
import os

import requests

# Novas credenciais do banco recriado
NEW_DB_CONFIG = {
    "host": "dpg-d1k5ap95pdvs73adjb80-a.oregon-postgres.render.com",
    "database": "medcheck_database_2wxz",
    "user": "medcheck_database_user",
    "port": "5432",
}

# Você precisará da nova senha do painel do Render
# Substitua 'NOVA_SENHA_AQUI' pela senha real do novo banco
NEW_PASSWORD = "be2mZ7rfrHFVHDMh3CG48IMWd9M6wdXG"  # Substitua pela senha real


def generate_new_env_variables():
    """Gera as novas variáveis de ambiente"""

    # Nova string de conexão
    new_database_url = f"postgresql://{NEW_DB_CONFIG['user']}:{NEW_PASSWORD}@{NEW_DB_CONFIG['host']}/{NEW_DB_CONFIG['database']}"

    env_variables = {
        "DB_HOST": NEW_DB_CONFIG["host"],
        "DB_PORT": NEW_DB_CONFIG["port"],
        "DB_NAME": NEW_DB_CONFIG["database"],
        "DB_USER": NEW_DB_CONFIG["user"],
        "DB_PASSWORD": NEW_PASSWORD,
        "DATABASE_URL": new_database_url,
    }

    print("=== NOVAS VARIÁVEIS DE AMBIENTE ===")
    print("Copie estas variáveis para o painel do Render (Environment Variables):")
    print()

    for key, value in env_variables.items():
        print(f"{key}={value}")

    print()
    print("=== COMANDO PSQL PARA ACESSO MANUAL ===")
    print(
        f"PGPASSWORD={NEW_PASSWORD} psql -h {NEW_DB_CONFIG['host']} -U {NEW_DB_CONFIG['user']} {NEW_DB_CONFIG['database']}"
    )

    return env_variables


def create_env_file():
    """Cria arquivo .env com as novas variáveis"""

    env_variables = generate_new_env_variables()

    with open(".env.new", "w") as f:
        f.write("# Novas variáveis de ambiente para o banco recriado\n")
        f.write("# Copie estas variáveis para o painel do Render\n\n")

        for key, value in env_variables.items():
            f.write(f"{key}={value}\n")

    print("\n=== ARQUIVO .env.new CRIADO ===")
    print("Arquivo .env.new foi criado com as novas variáveis.")
    print("Copie as variáveis do arquivo para o painel do Render.")


if __name__ == "__main__":
    print("=== ATUALIZAÇÃO DE VARIÁVEIS DE AMBIENTE ===")
    print(
        "1. Acesse o painel do Render: https://dashboard.render.com/d/dpg-d1k5ap95pdvs73adjb80-a"
    )
    print("2. Copie a senha do novo banco de dados")
    print("3. Substitua 'NOVA_SENHA_AQUI' pela senha real no script")
    print("4. Execute este script novamente")
    print()

    if NEW_PASSWORD == "be2mZ7rfrHFVHDMh3CG48IMWd9M6wdXG":
        generate_new_env_variables()
        create_env_file()
    else:
        generate_new_env_variables()
        create_env_file()
