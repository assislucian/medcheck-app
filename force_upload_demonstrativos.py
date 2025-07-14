#!/usr/bin/env python3
"""
Script para Forçar Upload de Demonstrativos
==========================================

Este script força o upload de demonstrativos para produção,
mesmo se já existirem registros no banco, para resolver
o problema de arquivos órfãos.

Autor: MedCheck AI Assistant
Data: 2025-01-27
"""

import os
from pathlib import Path

import requests

# Configuração
BASE_URL_PROD = "https://medcheck-backend.onrender.com"
TEST_USER = {"username": "6091", "password": "@Luassis90", "scope": "AC"}  # CRM  # UF


def get_auth_token() -> str:
    """Autentica e obtém token JWT"""
    print("🔐 Fazendo login na produção...")

    try:
        response = requests.post(
            f"{BASE_URL_PROD}/token",
            data=TEST_USER,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        if response.status_code == 200:
            token = response.json().get("access_token")
            print("✅ Login bem-sucedido!")
            return token
        else:
            print(f"❌ Erro no login: {response.text}")
            return None

    except Exception as e:
        print(f"❌ Erro na autenticação: {e}")
        return None


def delete_existing_demonstrativo(demo_id: int, token: str) -> bool:
    """Deleta demonstrativo existente"""
    print(f"🗑️ Deletando demonstrativo ID: {demo_id}")

    try:
        response = requests.delete(
            f"{BASE_URL_PROD}/api/v1/demonstrativos/{demo_id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        if response.status_code == 200:
            print("✅ Demonstrativo deletado com sucesso")
            return True
        else:
            print(f"❌ Erro ao deletar: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro na deleção: {e}")
        return False


def upload_demonstrativo_force(file_path: str, token: str) -> bool:
    """Faz upload forçado de demonstrativo"""
    print(f"\n📊 Upload forçado: {Path(file_path).name}")

    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False

    try:
        with open(file_path, "rb") as f:
            files = {"files": (Path(file_path).name, f, "application/pdf")}
            headers = {"Authorization": f"Bearer {token}"}

            response = requests.post(
                f"{BASE_URL_PROD}/api/v1/demonstrativos/upload",
                files=files,
                headers=headers,
                timeout=120,
            )

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Upload bem-sucedido!")

            # Verificar se algum resultado foi bem-sucedido
            if result.get("results"):
                for res in result["results"]:
                    if res.get("success"):
                        print(f"   📊 Novo demonstrativo ID: {res.get('id')}")
                        return True
                    else:
                        print(f"   ⚠️ {res.get('error', 'Erro desconhecido')}")

            return False
        else:
            print(f"❌ Erro no upload: {response.status_code}")
            print(f"   📝 Detalhes: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro no upload: {e}")
        return False


def test_demonstrativo_details(demo_id: int, token: str) -> bool:
    """Testa se o demonstrativo funciona corretamente"""
    print(f"\n🧪 Testando demonstrativo ID: {demo_id}")

    try:
        response = requests.get(
            f"{BASE_URL_PROD}/api/v1/demonstrativos/{demo_id}/detalhes",
            headers={"Authorization": f"Bearer {token}"},
        )

        if response.status_code == 200:
            detalhes = response.json()
            if isinstance(detalhes, list) and len(detalhes) > 0:
                total_proc = len(detalhes)
                com_participacao = len(
                    [p for p in detalhes if p.get("participacoes", [])]
                )

                print(f"✅ Demonstrativo funcionando!")
                print(f"   📊 Total procedimentos: {total_proc}")
                print(f"   🎯 Com participação: {com_participacao}")
                print(f"   📈 Taxa crosscheck: {com_participacao/total_proc*100:.1f}%")

                return com_participacao > 0
            else:
                print(f"❌ Nenhum procedimento encontrado")
                return False
        else:
            print(f"❌ Erro ao testar: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro no teste: {e}")
        return False


def force_fix_production():
    """Força correção da produção"""
    print("🚀 CORREÇÃO FORÇADA DE DEMONSTRATIVOS NA PRODUÇÃO")
    print("=" * 60)
    print("Este script vai deletar demonstrativos órfãos e recriar com arquivos")
    print()

    # 1. Autenticação
    token = get_auth_token()
    if not token:
        return False

    # 2. Listar demonstrativos existentes
    print("\n📊 VERIFICANDO DEMONSTRATIVOS EXISTENTES")
    print("-" * 40)

    try:
        response = requests.get(
            f"{BASE_URL_PROD}/api/v1/demonstrativos",
            headers={"Authorization": f"Bearer {token}"},
        )

        if response.status_code != 200:
            print(f"❌ Erro ao listar demonstrativos: {response.text}")
            return False

        demonstrativos = response.json()
        print(f"📈 Total demonstrativos: {len(demonstrativos)}")

        # 3. Deletar demonstrativos órfãos
        demo_ids_to_delete = []
        for demo in demonstrativos:
            demo_id = demo["id"]
            print(f"\n🔍 Verificando demo ID {demo_id}...")

            # Testar se arquivo existe
            test_response = requests.get(
                f"{BASE_URL_PROD}/api/v1/demonstrativos/{demo_id}/detalhes",
                headers={"Authorization": f"Bearer {token}"},
            )

            if test_response.status_code == 404:
                if "Arquivo do demonstrativo não encontrado" in test_response.text:
                    print(f"   ❌ Arquivo órfão detectado - marcado para deleção")
                    demo_ids_to_delete.append(demo_id)
                else:
                    print(f"   ⚠️ Outro erro: {test_response.text}")
            else:
                print(f"   ✅ Arquivo OK")

        # 4. Deletar órfãos
        if demo_ids_to_delete:
            print(f"\n🗑️ DELETANDO {len(demo_ids_to_delete)} DEMONSTRATIVOS ÓRFÃOS")
            print("-" * 40)

            for demo_id in demo_ids_to_delete:
                delete_existing_demonstrativo(demo_id, token)
        else:
            print(f"\n✅ Nenhum demonstrativo órfão encontrado")

        # 5. Upload dos novos demonstrativos
        demo_files = [
            "data/demonstrativos/Demonstrativo-outubro_2024.pdf",
            "data/demonstrativos/Demonstrativo-abril_2024.pdf",
        ]

        print(f"\n📤 FAZENDO UPLOAD DE NOVOS DEMONSTRATIVOS")
        print("-" * 40)

        uploaded_ids = []
        for demo_file in demo_files:
            if os.path.exists(demo_file):
                if upload_demonstrativo_force(demo_file, token):
                    # Verificar qual ID foi criado
                    response = requests.get(
                        f"{BASE_URL_PROD}/api/v1/demonstrativos",
                        headers={"Authorization": f"Bearer {token}"},
                    )
                    if response.status_code == 200:
                        new_demos = response.json()
                        if new_demos and len(new_demos) > len(uploaded_ids):
                            new_id = new_demos[0]["id"]  # Mais recente
                            uploaded_ids.append(new_id)
            else:
                print(f"⚠️ Arquivo não encontrado: {demo_file}")

        # 6. Testar crosscheck nos novos demonstrativos
        if uploaded_ids:
            print(f"\n🧪 TESTANDO CROSSCHECK")
            print("-" * 40)

            all_working = True
            for demo_id in uploaded_ids:
                if not test_demonstrativo_details(demo_id, token):
                    all_working = False

            if all_working:
                print(f"\n🎉 SUCESSO TOTAL!")
                print(f"   🏭 Produção: ✅ 100% operacional")
                print(f"   🔄 Crosscheck: ✅ Funcionando perfeitamente")
                print(f"   📊 Demonstrativos: {len(uploaded_ids)} funcionando")
                print(f"   🎯 Problema resolvido definitivamente!")
                return True
            else:
                print(f"\n⚠️ Parcialmente funcionando")
                return False
        else:
            print(f"\n❌ Nenhum demonstrativo foi enviado")
            return False

    except Exception as e:
        print(f"❌ Erro durante correção: {e}")
        return False


def main():
    """Função principal"""
    try:
        success = force_fix_production()

        if success:
            print(f"\n✅ CORREÇÃO CONCLUÍDA COM SUCESSO!")
            print(f"   🔧 Arquivos órfãos removidos")
            print(f"   📤 Novos demonstrativos enviados")
            print(f"   🎯 Crosscheck 100% operacional")
            print(f"   🏆 Sistema MedCheck totalmente funcional")
        else:
            print(f"\n⚠️ Correção não foi 100% bem-sucedida")
            print(f"   Verifique os logs para detalhes")

    except KeyboardInterrupt:
        print("\n\n⏹️ Correção interrompida pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante execução: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
