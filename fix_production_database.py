#!/usr/bin/env python3
"""
Script para diagnosticar e corrigir problemas de banco de dados em produção.
Foca em identificar inconsistências que impedem o crosscheck de funcionar.
"""

import requests

# Configurações
BASE_URL_PROD = "https://medcheck-backend.onrender.com"
TEST_USER = {"uf": "AC", "crm": "6091", "nome": "MOISES", "senha": "@Luassis90"}


def get_auth_token():
    """Obter token de autenticação para produção"""
    print("🔐 Fazendo login na produção...")

    login_data = {
        "username": TEST_USER["crm"],
        "password": TEST_USER["senha"],
        "scope": TEST_USER["uf"],
    }

    response = requests.post(f"{BASE_URL_PROD}/token", data=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✅ Login bem-sucedido!")
        return token
    else:
        print(f"❌ Erro no login: {response.text}")
        return None


def check_database_health():
    """Verificar saúde geral do banco"""
    print("\n🏥 VERIFICANDO SAÚDE DO BANCO DE DADOS")
    print("-" * 40)

    token = get_auth_token()
    if not token:
        return False

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Verificar demonstrativos
    print("📊 Verificando demonstrativos...")
    demos_response = requests.get(
        f"{BASE_URL_PROD}/api/v1/demonstrativos", headers=headers
    )

    if demos_response.status_code != 200:
        print(f"❌ Erro ao acessar demonstrativos: {demos_response.text}")
        return False

    demonstrativos = demos_response.json()
    print(f"   📈 Total demonstrativos: {len(demonstrativos)}")

    # Analisar cada demonstrativo
    for i, demo in enumerate(demonstrativos, 1):
        print(f"\n   Demo {i}: ID {demo['id']}")
        print(f"   📅 Data: {demo.get('data_competencia', 'N/A')}")
        print(f"   📄 Arquivo: {demo.get('nome_arquivo', 'NULL/FALTANDO')}")

        # Verificar se arquivo existe
        if not demo.get("nome_arquivo"):
            print("   ⚠️  PROBLEMA: nome_arquivo é NULL - demonstrativo órfão!")

    # 2. Verificar guias
    print("\n📋 Verificando guias...")
    guias_response = requests.get(f"{BASE_URL_PROD}/api/v1/guias", headers=headers)

    if guias_response.status_code != 200:
        print(f"❌ Erro ao acessar guias: {guias_response.text}")
        return False

    guias = guias_response.json()
    print(f"   📈 Total guias: {len(guias)}")

    # 3. Testar crosscheck em demonstrativo
    if demonstrativos:
        print(f"\n🔍 TESTANDO CROSSCHECK NO DEMO {demonstrativos[0]['id']}")
        demo_id = demonstrativos[0]["id"]

        detalhes_response = requests.get(
            f"{BASE_URL_PROD}/api/v1/demonstrativos/{demo_id}/detalhes", headers=headers
        )

        if detalhes_response.status_code != 200:
            print(f"❌ Erro nos detalhes: {detalhes_response.text}")
            return False

        detalhes = detalhes_response.json()

        if isinstance(detalhes, dict) and "detail" in detalhes:
            print(f"❌ Erro retornado: {detalhes['detail']}")
            return False

        # Análise do crosscheck
        total_proc = len(detalhes)
        com_participacao = len([p for p in detalhes if p.get("participacoes", [])])
        participacoes_total = sum(len(p.get("participacoes", [])) for p in detalhes)

        print(f"   📊 Total procedimentos: {total_proc}")
        print(f"   ✅ Com participação: {com_participacao}")
        print(f"   🎯 Total participações: {participacoes_total}")

        if participacoes_total == 0:
            print("   ❌ PROBLEMA: Zero participações encontradas!")
            print("   💡 Possíveis causas:")
            print("      - Guias não registradas para este usuário")
            print("      - Problemas na lógica de crosscheck")
            print("      - Dados de teste insuficientes")
        else:
            print("   ✅ Crosscheck funcionando!")

    return True


def cleanup_orphaned_records():
    """Limpar registros órfãos (demonstrativos sem arquivo)"""
    print("\n🧹 LIMPEZA DE REGISTROS ÓRFÃOS")
    print("-" * 40)

    token = get_auth_token()
    if not token:
        return False

    headers = {"Authorization": f"Bearer {token}"}

    # Listar demonstrativos
    demos_response = requests.get(
        f"{BASE_URL_PROD}/api/v1/demonstrativos", headers=headers
    )
    if demos_response.status_code != 200:
        print(f"❌ Erro ao listar demonstrativos: {demos_response.text}")
        return False

    demonstrativos = demos_response.json()
    orfaos = [d for d in demonstrativos if not d.get("nome_arquivo")]

    if orfaos:
        print(f"🗑️  Encontrados {len(orfaos)} demonstrativos órfãos")
        for orfao in orfaos:
            print(f"   - ID {orfao['id']}: {orfao.get('data_competencia', 'sem data')}")

        confirm = input("\n❓ Deletar demonstrativos órfãos? (s/N): ")
        if confirm.lower() == "s":
            for orfao in orfaos:
                delete_response = requests.delete(
                    f"{BASE_URL_PROD}/api/v1/demonstrativos/{orfao['id']}",
                    headers=headers,
                )
                if delete_response.status_code == 200:
                    print(f"   ✅ Deletado ID {orfao['id']}")
                else:
                    print(
                        f"   ❌ Erro ao deletar ID {orfao['id']}: {delete_response.text}"
                    )
        else:
            print("   ⏭️  Pulando limpeza...")
    else:
        print("✅ Nenhum demonstrativo órfão encontrado!")

    return True


def main():
    print("🔧 DIAGNÓSTICO E CORREÇÃO DO BANCO DE PRODUÇÃO")
    print("=" * 50)

    # 1. Verificar saúde geral
    health_ok = check_database_health()

    if not health_ok:
        print("\n❌ Problemas críticos encontrados no banco!")
        return

    # 2. Opção de limpeza
    print("\n" + "=" * 50)
    cleanup_orphaned_records()

    print("\n📋 DIAGNÓSTICO COMPLETO!")
    print(
        "💡 Para sincronizar dados funcionais, execute: python sync_production_data.py"
    )


if __name__ == "__main__":
    main()
