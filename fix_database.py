#!/usr/bin/env python3
"""
Script para corrigir a estrutura da tabela medicos no banco de dados Render
"""

import os

import psycopg2
from psycopg2 import sql

# Configurações do banco de dados (substitua pelos valores reais)
DB_CONFIG = {
    "host": os.getenv(
        "DB_HOST", "dpg-cp8qj8i1hbls73f8j8q0-a.oregon-postgres.render.com"
    ),
    "database": os.getenv("DB_NAME", "medcheck_database"),
    "user": os.getenv("DB_USER", "medcheck_database_user"),
    "password": os.getenv("DB_PASSWORD", "sua_senha_aqui"),
    "port": os.getenv("DB_PORT", "5432"),
    "sslmode": "require",
}


def fix_medicos_table():
    """Corrige a estrutura da tabela medicos"""
    try:
        # Conecta ao banco de dados
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        print("Conectado ao banco de dados com sucesso!")

        # Verifica se a coluna id já existe
        cursor.execute(
            """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'medicos' AND column_name = 'id'
        """
        )

        if cursor.fetchone():
            print("Coluna 'id' já existe na tabela medicos")
        else:
            # Adiciona a coluna id como PRIMARY KEY
            print("Adicionando coluna 'id' como PRIMARY KEY...")
            cursor.execute("ALTER TABLE medicos ADD COLUMN id SERIAL PRIMARY KEY;")
            print("✓ Coluna 'id' adicionada com sucesso!")

        # Remove a constraint de PRIMARY KEY do crm se existir
        cursor.execute(
            """
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'medicos' AND constraint_type = 'PRIMARY KEY' AND constraint_name != 'medicos_pkey'
        """
        )

        primary_key_constraints = cursor.fetchall()
        for constraint in primary_key_constraints:
            constraint_name = constraint[0]
            print(f"Removendo constraint PRIMARY KEY: {constraint_name}")
            cursor.execute(f"ALTER TABLE medicos DROP CONSTRAINT {constraint_name};")

        # Adiciona constraint UNIQUE para crm e uf
        print("Adicionando constraint UNIQUE para crm e uf...")
        cursor.execute(
            "ALTER TABLE medicos ADD CONSTRAINT medicos_crm_uf_unique UNIQUE (crm, uf);"
        )
        print("✓ Constraint UNIQUE adicionada com sucesso!")

        # Commit das alterações
        conn.commit()
        print("✓ Todas as alterações foram aplicadas com sucesso!")

        # Verifica a estrutura final
        cursor.execute(
            """
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'medicos' 
            ORDER BY ordinal_position
        """
        )

        print("\nEstrutura final da tabela medicos:")
        print("Column Name | Data Type | Nullable | Default")
        print("-" * 50)
        for row in cursor.fetchall():
            print(f"{row[0]:<12} | {row[1]:<10} | {row[2]:<8} | {row[3] or 'NULL'}")

        cursor.close()
        conn.close()
        print("\n✓ Script executado com sucesso!")

    except Exception as e:
        print(f"Erro ao executar o script: {e}")
        if "conn" in locals():
            conn.rollback()
            conn.close()


if __name__ == "__main__":
    fix_medicos_table()
