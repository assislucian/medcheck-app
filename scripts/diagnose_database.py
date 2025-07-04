#!/usr/bin/env python3
"""
Script de diagnóstico do banco de dados
"""

import logging
import os
import sys
from urllib.parse import urlparse

# Adicionar o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importações após ajuste do path - necessário para scripts
from sqlalchemy import create_engine, inspect, text  # noqa: E402

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def diagnose_database():
    """Diagnostica o estado do banco de dados"""
    print("🔍 DIAGNÓSTICO DO BANCO DE DADOS")
    print("=" * 50)

    # Verificar configuração
    database_url = os.environ.get("DATABASE_URL", "sqlite:///medicos.db")
    print(f"📁 DATABASE_URL: {database_url}")

    parsed = urlparse(database_url)
    db_type = "PostgreSQL" if "postgresql" in parsed.scheme else "SQLite"
    print(f"🗄️  Tipo: {db_type}")

    try:
        # Criar engine
        if database_url.startswith("sqlite"):
            engine = create_engine(
                database_url, connect_args={"check_same_thread": False}
            )
        else:
            engine = create_engine(
                database_url,
                pool_pre_ping=True,
                pool_size=5,
                max_overflow=10,
            )

        # Testar conexão
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).fetchone()
            print("✅ Conexão com banco de dados: OK")

        # Verificar tabelas
        insp = inspect(engine)
        tables = insp.get_table_names()
        print(f"\n📋 Tabelas encontradas: {tables}")

        # Verificar estrutura da tabela medicos
        if "medicos" in tables:
            print("\n👨‍⚕️  Estrutura da tabela 'medicos':")
            columns = insp.get_columns("medicos")
            for col in columns:
                print(f"  - {col['name']}: {col['type']}")

            # Verificar se tem coluna id
            column_names = [col["name"] for col in columns]
            if "id" not in column_names:
                print("❌ PROBLEMA: Coluna 'id' não encontrada na tabela medicos!")
                print("💡 Solução: Executar migração do banco de dados")
            else:
                print("✅ Coluna 'id' encontrada")

            # Verificar colunas essenciais
            required_columns = ["crm", "uf", "nome", "senha_hash"]
            missing_columns = [
                col for col in required_columns if col not in column_names
            ]
            if missing_columns:
                print(f"❌ PROBLEMA: Colunas faltando: {missing_columns}")
            else:
                print("✅ Todas as colunas essenciais presentes")
        else:
            print("❌ PROBLEMA: Tabela 'medicos' não encontrada!")
            print("💡 Solução: Executar migração do banco de dados")

        # Verificar outras tabelas importantes
        important_tables = ["demonstrativos", "guias", "consentimentos", "incidents"]
        for table in important_tables:
            if table in tables:
                print(f"✅ Tabela '{table}': OK")
            else:
                print(f"⚠️  Tabela '{table}': Não encontrada")

        # Testar query simples
        try:
            with engine.connect() as conn:
                if "medicos" in tables:
                    result = conn.execute(
                        text("SELECT COUNT(*) FROM medicos")
                    ).fetchone()
                    print(f"\n📊 Total de médicos cadastrados: {result[0]}")
                else:
                    print("\n📊 Não é possível contar médicos - tabela não existe")
        except Exception as e:
            print(f"❌ Erro ao executar query: {e}")

    except Exception as e:
        print(f"❌ Erro ao conectar com banco de dados: {e}")
        return False

    return True


def suggest_fixes():
    """Sugere correções para problemas encontrados"""
    print("\n🔧 SUGESTÕES DE CORREÇÃO:")
    print("=" * 50)

    database_url = os.environ.get("DATABASE_URL", "sqlite:///medicos.db")

    if "postgresql" in database_url:
        print("1. Para PostgreSQL no Render:")
        print("   - Verificar se DATABASE_URL está configurada corretamente")
        print("   - Executar migração automática na inicialização")
        print("   - Se necessário, recriar tabelas")
    else:
        print("1. Para SQLite local:")
        print("   - Verificar se o arquivo do banco existe")
        print("   - Executar migração automática")

    print("\n2. Comandos para resolver:")
    print("   - Reiniciar a aplicação (deploy no Render)")
    print("   - Verificar logs para erros de migração")
    print("   - Se persistir, recriar banco de dados")


def main():
    print("🔍 DIAGNÓSTICO DO BANCO DE DADOS - MedCheck")
    print("=" * 60)

    success = diagnose_database()

    if not success:
        print("\n❌ DIAGNÓSTICO FALHOU")
        print("Verifique a configuração do DATABASE_URL")
    else:
        print("\n✅ DIAGNÓSTICO CONCLUÍDO")

    suggest_fixes()

    print("\n" + "=" * 60)
    print("📋 PRÓXIMOS PASSOS:")
    print("1. Se houver problemas, reiniciar a aplicação")
    print("2. Verificar logs do Render para detalhes")
    print("3. Se necessário, recriar banco de dados")
    print("=" * 60)


if __name__ == "__main__":
    main()
