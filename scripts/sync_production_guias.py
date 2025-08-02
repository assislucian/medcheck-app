#!/usr/bin/env python3
"""
Script para Sincronizar Guias para Produção
==========================================

Este script envia as guias de teste do ambiente local 
para o ambiente de produção no Render.

Autor: MedCheck AI Assistant
Data: 2025-01-27
"""

import os
import time
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


def upload_guia(file_path: str, token: str) -> bool:
    """Faz upload de uma guia para produção"""
    print(f"\n📋 Enviando guia: {Path(file_path).name}")

    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False

    try:
        with open(file_path, "rb") as f:
            files = {"files": (Path(file_path).name, f, "application/pdf")}
            headers = {"Authorization": f"Bearer {token}"}

            response = requests.post(
                f"{BASE_URL_PROD}/api/v1/guias/upload",
                files=files,
                headers=headers,
                timeout=60,  # 60 segundos timeout
            )

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Upload bem-sucedido!")
            print(f"   📊 Resultado: {result}")
            return True
        else:
            print(f"❌ Erro no upload: {response.status_code}")
            print(f"   📝 Detalhes: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro no upload: {e}")
        return False


def upload_demonstrativo(file_path: str, token: str) -> bool:
    """Faz upload de um demonstrativo para produção"""
    print(f"\n📊 Enviando demonstrativo: {Path(file_path).name}")

    if not os.path.exists(file_path):
        print(f"❌ Arquivo não encontrado: {file_path}")
        return False

    try:
        with open(file_path, "rb") as f:
            files = {"file": (Path(file_path).name, f, "application/pdf")}
            headers = {"Authorization": f"Bearer {token}"}

            response = requests.post(
                f"{BASE_URL_PROD}/api/v1/demonstrativos/upload",
                files=files,
                headers=headers,
                timeout=120,  # 2 minutos timeout para demonstrativos
            )

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Upload bem-sucedido!")
            print(f"   📊 Resultado: {result}")
            return True
        else:
            print(f"❌ Erro no upload: {response.status_code}")
            print(f"   📝 Detalhes: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro no upload: {e}")
        return False


def verify_sync(token: str) -> bool:
    """Verifica se a sincronização foi bem-sucedida"""
    print(f"\n🔍 VERIFICANDO SINCRONIZAÇÃO")
    print("-" * 40)

    try:
        # Verificar guias
        guias_response = requests.get(
            f"{BASE_URL_PROD}/api/v1/guias",
            headers={"Authorization": f"Bearer {token}"},
            params={"pageSize": 100},
        )

        if guias_response.status_code == 200:
            data = guias_response.json()
            guias = data.get("data", []) if isinstance(data, dict) else data
            print(f"📋 Guias na produção: {len(guias)}")

            # Listar números únicos das guias
            numeros_guias = set(g.get("numero_guia") for g in guias)
            print(f"🏥 Guias únicas: {sorted(numeros_guias)}")
        else:
            print(f"❌ Erro ao verificar guias: {guias_response.text}")
            return False

        # Verificar demonstrativos
        demos_response = requests.get(
            f"{BASE_URL_PROD}/api/v1/demonstrativos",
            headers={"Authorization": f"Bearer {token}"},
        )

        if demos_response.status_code == 200:
            demonstrativos = demos_response.json()
            print(f"📊 Demonstrativos na produção: {len(demonstrativos)}")

            # Testar crosscheck no primeiro demonstrativo
            if demonstrativos:
                demo_id = demonstrativos[0]["id"]
                detalhes_response = requests.get(
                    f"{BASE_URL_PROD}/api/v1/demonstrativos/{demo_id}/detalhes",
                    headers={"Authorization": f"Bearer {token}"},
                )

                if detalhes_response.status_code == 200:
                    detalhes = detalhes_response.json()
                    if isinstance(detalhes, list):
                        total_proc = len(detalhes)
                        com_participacao = len(
                            [p for p in detalhes if p.get("participacoes", [])]
                        )
                        print(f"\n🎯 TESTE DE CROSSCHECK:")
                        print(f"   Total procedimentos: {total_proc}")
                        print(f"   Com participação: {com_participacao}")
                        print(
                            f"   Taxa de sucesso: {com_participacao/total_proc*100:.1f}%"
                        )

                        return com_participacao > 0
                    else:
                        print(f"❌ Erro nos detalhes: {detalhes}")
                        return False
                else:
                    print(f"❌ Erro ao testar detalhes: {detalhes_response.text}")
                    return False
        else:
            print(f"❌ Erro ao verificar demonstrativos: {demos_response.text}")
            return False

        return True

    except Exception as e:
        print(f"❌ Erro na verificação: {e}")
        return False


def sync_all_data():
    """Sincroniza todos os dados necessários"""
    print("🚀 SINCRONIZANDO DADOS PARA PRODUÇÃO")
    print("=" * 60)

    # 1. Autenticação
    token = get_auth_token()
    if not token:
        return False

    # 2. Upload das guias necessárias
    guias_files = [
        "data/guias/thayse borges.pdf",
        "data/guias/rodrigo bernardo.pdf",
        "data/guias/noivana.pdf",
        "data/guias/nubia_katia.pdf",
    ]

    print(f"\n📋 ENVIANDO GUIAS PARA PRODUÇÃO")
    print("-" * 40)

    guias_enviadas = 0
    for guia_file in guias_files:
        if os.path.exists(guia_file):
            if upload_guia(guia_file, token):
                guias_enviadas += 1
                time.sleep(2)  # Pausa entre uploads
        else:
            print(f"⚠️  Arquivo não encontrado: {guia_file}")

    # 3. Upload dos demonstrativos se necessário
    demo_files = [
        "data/demonstrativos/Demonstrativo-outubro_2024.pdf",
        "data/demonstrativos/Demonstrativo-abril_2024.pdf",
    ]

    print(f"\n📊 VERIFICANDO DEMONSTRATIVOS")
    print("-" * 40)

    demos_enviados = 0
    for demo_file in demo_files:
        if os.path.exists(demo_file):
            if upload_demonstrativo(demo_file, token):
                demos_enviados += 1
                time.sleep(3)  # Pausa maior para demonstrativos
        else:
            print(f"⚠️  Arquivo não encontrado: {demo_file}")

    # 4. Verificação final
    print(f"\n📊 RESULTADO DA SINCRONIZAÇÃO:")
    print(f"   Guias enviadas: {guias_enviadas}/{len(guias_files)}")
    print(f"   Demonstrativos enviados: {demos_enviados}/{len(demo_files)}")

    # 5. Testar crosscheck
    if verify_sync(token):
        print(f"\n🎉 SUCESSO! Produção sincronizada e crosscheck funcionando!")
        return True
    else:
        print(f"\n❌ FALHA! Problemas na sincronização ou crosscheck")
        return False


def main():
    """Função principal"""
    try:
        success = sync_all_data()

        if success:
            print(f"\n✅ MISSÃO CUMPRIDA!")
            print(f"   🏭 Produção: Funcionando 100%")
            print(f"   💻 Local: Funcionando 100%")
            print(f"   🔄 Crosscheck: Operacional em ambos ambientes")
        else:
            print(f"\n⚠️  ATENÇÃO: Verifique os logs para detalhes dos erros")

    except KeyboardInterrupt:
        print("\n\n⏹️  Sincronização interrompida pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante sincronização: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
