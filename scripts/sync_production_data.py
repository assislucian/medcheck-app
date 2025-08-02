#!/usr/bin/env python3
"""
Script para sincronizar dados de teste entre ambiente local e produção.
Garante que a produção tenha os mesmos dados funcionais do local.
"""

from pathlib import Path

import requests

# Configurações
BASE_URL_PROD = "https://medcheck-backend.onrender.com"
BASE_URL_LOCAL = "http://localhost:8000"

# Dados de teste
TEST_USER = {"uf": "AC", "crm": "6091", "nome": "MOISES", "senha": "@Luassis90"}


def get_auth_token(base_url, user):
    """Obter token de autenticação"""
    print(f"🔐 Fazendo login em {base_url}...")

    login_data = {
        "username": user["crm"],
        "password": user["senha"],
        "scope": user["uf"],
    }

    response = requests.post(f"{base_url}/token", data=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✅ Login bem-sucedido!")
        return token
    else:
        print(f"❌ Erro no login: {response.text}")
        return None


def upload_demonstrativo(base_url, token, file_path):
    """Upload de demonstrativo"""
    print(f"📤 Fazendo upload de {file_path}...")

    headers = {"Authorization": f"Bearer {token}"}
    files = {"files": open(file_path, "rb")}

    response = requests.post(
        f"{base_url}/api/v1/demonstrativos/upload", headers=headers, files=files
    )

    files["files"].close()

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Upload concluído: {result}")
        return result
    else:
        print(f"❌ Erro no upload: {response.text}")
        return None


def upload_guia(base_url, token, file_path):
    """Upload de guia"""
    print(f"📤 Fazendo upload de guia {file_path}...")

    headers = {"Authorization": f"Bearer {token}"}
    files = {"files": open(file_path, "rb")}

    response = requests.post(
        f"{base_url}/api/v1/guias/upload", headers=headers, files=files
    )

    files["files"].close()

    if response.status_code == 200:
        result = response.json()
        print("✅ Upload de guia concluído")
        return result
    else:
        print(f"❌ Erro no upload da guia: {response.text}")
        return None


def test_crosscheck(base_url, token):
    """Testar crosscheck"""
    print(f"🧪 Testando crosscheck em {base_url}...")

    headers = {"Authorization": f"Bearer {token}"}

    # Listar demonstrativos
    demos = requests.get(f"{base_url}/api/v1/demonstrativos", headers=headers)
    if demos.status_code != 200:
        print(f"❌ Erro ao listar demonstrativos: {demos.text}")
        return False

    demonstrativos = demos.json()
    if not demonstrativos:
        print("❌ Nenhum demonstrativo encontrado")
        return False

    demo_id = demonstrativos[0]["id"]
    print(f"📊 Testando demonstrativo ID: {demo_id}")

    # Testar detalhes
    detalhes = requests.get(
        f"{base_url}/api/v1/demonstrativos/{demo_id}/detalhes", headers=headers
    )

    if detalhes.status_code != 200:
        print(f"❌ Erro nos detalhes: {detalhes.text}")
        return False

    data = detalhes.json()
    if isinstance(data, dict) and "detail" in data:
        print(f"❌ Erro: {data['detail']}")
        return False

    # Verificar crosscheck
    total_procedimentos = len(data)
    com_participacao = len([p for p in data if p.get("participacoes", [])])

    print("📈 Resultados:")
    print(f"   Total procedimentos: {total_procedimentos}")
    print(f"   Com participação: {com_participacao}")
    print(f"   Taxa crosscheck: {(com_participacao/total_procedimentos)*100:.1f}%")

    if com_participacao > 0:
        print("✅ Crosscheck funcionando!")
        return True
    else:
        print("❌ Crosscheck não funcionando - nenhuma participação encontrada")
        return False


def main():
    print("🚀 SINCRONIZAÇÃO PRODUÇÃO - GARANTIR FUNCIONALIDADE IGUAL LOCAL")
    print("=" * 60)

    # 1. Testar produção
    print("\n1️⃣ TESTANDO PRODUÇÃO ATUAL")
    token_prod = get_auth_token(BASE_URL_PROD, TEST_USER)
    if not token_prod:
        return

    prod_working = test_crosscheck(BASE_URL_PROD, token_prod)

    # 2. Se produção não funciona, sincronizar arquivos
    if not prod_working:
        print("\n2️⃣ SINCRONIZANDO ARQUIVOS PARA PRODUÇÃO")

        # Upload demonstrativo de teste
        demo_files = ["uploads/Demonstrativo-outubro_2024.pdf"]

        for demo_file in demo_files:
            if Path(demo_file).exists():
                upload_demonstrativo(BASE_URL_PROD, token_prod, demo_file)
            else:
                print(f"⚠️  Arquivo não encontrado: {demo_file}")

        # Upload guias de teste
        guia_files = [
            "uploads/thayse borges.pdf",
            "uploads/rodrigo bernardo.pdf",
            "uploads/noivana.pdf",
        ]

        for guia_file in guia_files:
            if Path(guia_file).exists():
                upload_guia(BASE_URL_PROD, token_prod, guia_file)
            else:
                print(f"⚠️  Arquivo não encontrado: {guia_file}")

        # 3. Testar novamente
        print("\n3️⃣ TESTANDO PRODUÇÃO APÓS SINCRONIZAÇÃO")
        prod_working_after = test_crosscheck(BASE_URL_PROD, token_prod)

        if prod_working_after:
            print("\n🎉 SUCESSO! Produção agora funciona igual ao local!")
        else:
            print("\n❌ FALHA! Produção ainda não funciona corretamente.")
    else:
        print("\n✅ Produção já está funcionando corretamente!")

    print("\n📊 RESUMO FINAL:")
    print(f"   Produção funcionando: {'✅' if prod_working else '❌'}")
    print("   Objetivo: Garantir que produção = local (100% funcional)")


if __name__ == "__main__":
    main()
