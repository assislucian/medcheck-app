#!/usr/bin/env python3
"""
📊 MONITOR DE DEPLOY RENDER
Monitora o status do deploy no Render em tempo real
"""

import sys
import time

import requests


def check_service_status(url, service_name, max_attempts=20):
    """Monitora status de um serviço"""
    print(f"\n🔍 Monitorando {service_name}...")

    for attempt in range(1, max_attempts + 1):
        try:
            print(f"   Tentativa {attempt}/{max_attempts}: ", end="", flush=True)

            response = requests.get(url, timeout=10)

            if response.status_code == 200:
                print("✅ ONLINE")
                return True
            else:
                print(f"❌ Status {response.status_code}")

        except requests.exceptions.ConnectionError:
            print("🔄 Conectando...")
        except requests.exceptions.Timeout:
            print("⏱️ Timeout...")
        except Exception as e:
            print(f"❌ Erro: {e}")

        if attempt < max_attempts:
            time.sleep(15)  # Aguardar 15 segundos entre tentativas

    return False


def main():
    """Monitor principal"""
    print("📊 MONITOR DE DEPLOY RENDER")
    print("=" * 40)
    print("🚀 Iniciando monitoramento...")
    print("⏱️ Verificando a cada 15 segundos")
    print("🛑 Ctrl+C para cancelar")

    # URLs para monitorar
    services = [
        ("https://medcheck-backend.onrender.com/health", "Backend API"),
        ("https://medcheck-frontend.onrender.com", "Frontend App"),
    ]

    results = []

    try:
        for url, name in services:
            result = check_service_status(url, name)
            results.append((name, result))

        # Resultado final
        print("\n" + "=" * 40)
        print("📊 RESULTADO DO MONITORAMENTO:")

        all_online = True
        for service_name, status in results:
            status_icon = "✅" if status else "❌"
            status_text = "ONLINE" if status else "OFFLINE"
            print(f"{status_icon} {service_name}: {status_text}")
            if not status:
                all_online = False

        if all_online:
            print("\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!")
            print("🌐 Sua aplicação está ONLINE e funcionando!")
            print("\n📋 URLs ATIVAS:")
            print("Frontend: https://medcheck-frontend.onrender.com")
            print("Backend:  https://medcheck-backend.onrender.com")
            print("API Docs: https://medcheck-backend.onrender.com/docs")
            return 0
        else:
            print("\n⚠️ ALGUNS SERVIÇOS AINDA ESTÃO OFFLINE")
            print("💡 Aguarde mais alguns minutos e tente novamente")
            print("🔧 Verifique os logs no Dashboard Render se persistir")
            return 1

    except KeyboardInterrupt:
        print("\n\n🛑 Monitoramento cancelado pelo usuário")
        print("💡 Execute novamente quando quiser verificar:")
        print("python3 scripts/monitor_render_deploy.py")
        return 0


if __name__ == "__main__":
    sys.exit(main())
