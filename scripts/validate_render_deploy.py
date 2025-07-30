#!/usr/bin/env python3
"""
🔍 VALIDAÇÃO PÓS-DEPLOY RENDER
Verifica se o deploy no Render está funcionando corretamente
"""

import sys
import time

import requests


def test_url(url, description, expected_status=200, timeout=10):
    """Testa uma URL e retorna resultado"""
    try:
        print(f"🌐 Testing {description}...")
        response = requests.get(url, timeout=timeout)

        if response.status_code == expected_status:
            print(f"✅ {description}: OK ({response.status_code})")
            return True
        else:
            print(f"❌ {description}: {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"❌ {description}: Connection Error")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ {description}: Timeout")
        return False
    except Exception as e:
        print(f"❌ {description}: {e}")
        return False


def test_api_endpoints():
    """Testa endpoints específicos da API"""
    base_url = "https://medcheck-backend.onrender.com"

    endpoints = [
        ("/", "API Root"),
        ("/health", "Health Check"),
        ("/docs", "API Documentation"),
    ]

    results = []
    for endpoint, description in endpoints:
        url = f"{base_url}{endpoint}"
        results.append(test_url(url, f"API {description}"))
        time.sleep(1)  # Evitar rate limiting

    return results


def test_frontend():
    """Testa frontend"""
    frontend_url = "https://medcheck-frontend.onrender.com"

    # Testar página principal
    result = test_url(frontend_url, "Frontend Homepage")

    # Testar SPA routing (deve retornar 200, não 404)
    spa_result = test_url(f"{frontend_url}/dashboard", "Frontend SPA Routing")

    return [result, spa_result]


def main():
    """Executa validação completa"""
    print("🔍 VALIDAÇÃO PÓS-DEPLOY RENDER")
    print("=" * 40)

    all_results = []

    # Testar backend
    print("\n🔌 Testing Backend API...")
    api_results = test_api_endpoints()
    all_results.extend(api_results)

    # Testar frontend
    print("\n🌐 Testing Frontend...")
    frontend_results = test_frontend()
    all_results.extend(frontend_results)

    # Resultado final
    print("\n" + "=" * 40)
    print("📊 VALIDATION SUMMARY:")
    passed = sum(all_results)
    total = len(all_results)

    if passed == total:
        print(f"🎉 ALL TESTS PASSED ({passed}/{total})")
        print("✅ RENDER DEPLOY IS WORKING PERFECTLY!")
        print("\n🌐 Your application is live at:")
        print("Frontend: https://medcheck-frontend.onrender.com")
        print("Backend:  https://medcheck-backend.onrender.com")
        return 0
    else:
        print(f"❌ SOME TESTS FAILED ({passed}/{total})")
        print("🔧 Some services may still be starting up...")
        print("💡 Try again in a few minutes")
        return 1


if __name__ == "__main__":
    sys.exit(main())
