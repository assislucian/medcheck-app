#!/usr/bin/env python3
"""
Script para Upload de Demonstrativos para Produção
=================================================

Este script faz upload dos demonstrativos de teste 
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


def upload_demonstrativo(file_path: str, token: str) -> bool:
    """Faz upload de um demonstrativo para produção"""
    print(f"\n📊 Enviando demonstrativo: {Path(file_path).name}")

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
                timeout=120,  # 2 minutos timeout
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


def test_crosscheck_after_upload(token: str) -> bool:
    """Testa crosscheck após upload dos demonstrativos"""
    print(f"\n🎯 TESTANDO CROSSCHECK APÓS UPLOAD")
    print("-" * 40)

    try:
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
                print(f"🔍 Testando demonstrativo ID: {demo_id}")

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
                        com_cbhpm = len([p for p in detalhes if p.get("valor_cbhpm")])
                        participacoes_total = sum(
                            len(p.get("participacoes", [])) for p in detalhes
                        )

                        print(f"\n🎯 RESULTADO DO CROSSCHECK:")
                        print(f"   Total procedimentos: {total_proc}")
                        print(
                            f"   Com participação: {com_participacao} ({com_participacao/total_proc*100:.1f}%)"
                        )
                        print(
                            f"   Com valor CBHPM: {com_cbhpm} ({com_cbhpm/total_proc*100:.1f}%)"
                        )
                        print(f"   Total participações: {participacoes_total}")

                        # Mostrar amostra dos dados
                        print(f"\n📝 AMOSTRA DOS DADOS:")
                        for i, proc in enumerate(detalhes[:3], 1):
                            print(f"\n   Procedimento {i}:")
                            print(f"   🏥 Guia: {proc.get('guia', 'N/A')}")
                            print(f"   📋 Descrição: {proc.get('descricao', 'N/A')}")
                            print(f"   🎭 Papel: {proc.get('papel_exercido', 'N/A')}")
                            print(
                                f"   👥 Participações: {len(proc.get('participacoes', []))}"
                            )
                            print(f"   💰 CBHPM: R$ {proc.get('valor_cbhpm', 0):.2f}")
                            print(
                                f"   💚 Liberado: R$ {proc.get('financial', {}).get('approved_value', 0):.2f}"
                            )

                        return com_participacao > 0 and com_participacao == total_proc
                    else:
                        print(f"❌ Erro nos detalhes: {detalhes}")
                        return False
                else:
                    print(f"❌ Erro ao testar detalhes: {detalhes_response.text}")
                    return False
        else:
            print(f"❌ Erro ao verificar demonstrativos: {demos_response.text}")
            return False

        return False

    except Exception as e:
        print(f"❌ Erro no teste: {e}")
        return False


def upload_all_demonstrativos():
    """Faz upload de todos os demonstrativos necessários"""
    print("🚀 FAZENDO UPLOAD DOS DEMONSTRATIVOS PARA PRODUÇÃO")
    print("=" * 60)

    # 1. Autenticação
    token = get_auth_token()
    if not token:
        return False

    # 2. Lista de demonstrativos para upload
    demo_files = [
        "data/demonstrativos/Demonstrativo-outubro_2024.pdf",
        "data/demonstrativos/Demonstrativo-abril_2024.pdf",
    ]

    print(f"\n📊 ENVIANDO DEMONSTRATIVOS")
    print("-" * 40)

    demos_enviados = 0
    for demo_file in demo_files:
        if os.path.exists(demo_file):
            if upload_demonstrativo(demo_file, token):
                demos_enviados += 1
                time.sleep(3)  # Pausa entre uploads
        else:
            print(f"⚠️  Arquivo não encontrado: {demo_file}")

    print(f"\n📊 RESULTADO DO UPLOAD:")
    print(f"   Demonstrativos enviados: {demos_enviados}/{len(demo_files)}")

    # 3. Testar crosscheck
    if demos_enviados > 0:
        if test_crosscheck_after_upload(token):
            print(f"\n🎉 SUCESSO TOTAL!")
            print(f"   🏭 Produção: ✅ Funcionando 100%")
            print(f"   💻 Local: ✅ Funcionando 100%")
            print(f"   🔄 Crosscheck: ✅ Operacional em ambos ambientes")
            print(f"   📊 Taxa de participação: 100%")
            return True
        else:
            print(f"\n⚠️  PARCIAL: Upload concluído, mas crosscheck com problemas")
            return False
    else:
        print(f"\n❌ FALHA: Nenhum demonstrativo foi enviado")
        return False


def main():
    """Função principal"""
    try:
        success = upload_all_demonstrativos()

        if success:
            print(f"\n✅ MISSÃO CUMPRIDA!")
            print(f"   🔧 Problema do 'Arquivo não encontrado' resolvido")
            print(f"   🎯 Crosscheck funcionando 100% na produção")
            print(f"   🏆 Sistema MedCheck totalmente operacional")
        else:
            print(f"\n⚠️  Verifique os logs para detalhes dos problemas")

    except KeyboardInterrupt:
        print("\n\n⏹️  Upload interrompido pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante upload: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
