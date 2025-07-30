#!/usr/bin/env python3
"""
🔍 VERIFICAÇÃO PRÉ-DEPLOY RENDER
Verifica se o projeto está pronto para deploy no Render
"""

import os
import subprocess
import sys


def check_file_exists(filepath, description):
    """Verifica se arquivo existe"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} (MISSING)")
        return False


def check_frontend_build():
    """Testa build do frontend"""
    print("\n🔧 Testing Frontend Build...")
    try:
        os.chdir("frontend")
        result = subprocess.run(["npm", "ci"], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ npm ci failed: {result.stderr}")
            return False

        result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ npm build failed: {result.stderr}")
            return False

        # Verificar se dist existe
        if os.path.exists("dist/index.html"):
            print("✅ Frontend build successful")
            return True
        else:
            print("❌ Frontend build - dist/index.html not found")
            return False
    except Exception as e:
        print(f"❌ Frontend build error: {e}")
        return False
    finally:
        os.chdir("..")


def check_backend_dependencies():
    """Verifica dependências do backend"""
    print("\n📦 Checking Backend Dependencies...")
    try:
        with open("requirements.txt", "r") as f:
            requirements = f.read()

        critical_deps = [
            "fastapi",
            "uvicorn",
            "sqlalchemy",
            "psycopg2-binary",
            "python-jose",
            "passlib",
            "python-multipart",
        ]

        missing = []
        for dep in critical_deps:
            if dep not in requirements:
                missing.append(dep)

        if missing:
            print(f"❌ Missing dependencies: {missing}")
            return False
        else:
            print("✅ All critical dependencies present")
            return True

    except Exception as e:
        print(f"❌ Error checking dependencies: {e}")
        return False


def check_render_yaml():
    """Verifica configuração do render.yaml"""
    print("\n⚙️ Checking render.yaml...")
    try:
        if not os.path.exists("render.yaml"):
            print("❌ render.yaml not found")
            return False

        with open("render.yaml", "r") as f:
            content = f.read()

        # Verificações críticas CORRIGIDAS
        checks = [
            ("medcheck-frontend", "Frontend service"),
            ("medcheck-backend", "Backend service"),
            ("medcheck-db", "Database service"),
            ("type: static", "Frontend static type (CORRETO)"),
            ("runtime: python", "Backend Python runtime"),
            ("/*", "SPA routing"),
            ("npm run build", "Frontend build command"),
            ("uvicorn", "Backend start command"),
            ("publishPath: frontend/dist", "Static publish path"),
        ]

        all_good = True
        for check, desc in checks:
            if check in content:
                print(f"✅ {desc}: Found")
            else:
                print(f"❌ {desc}: Missing '{check}'")
                all_good = False

        return all_good

    except Exception as e:
        print(f"❌ Error checking render.yaml: {e}")
        return False


def check_production_api():
    """Verifica arquivo de produção da API"""
    print("\n🐍 Checking Production API...")
    api_file = "src/api_render_production.py"

    if not os.path.exists(api_file):
        print(f"❌ {api_file} not found")
        return False

    try:
        with open(api_file, "r") as f:
            content = f.read()

        # Verificações críticas
        checks = [
            ("from fastapi import", "FastAPI import"),
            ("CORSMiddleware", "CORS configuration"),
            ("DATABASE_URL", "Database config"),
            ("create_engine", "SQLAlchemy setup"),
            ('@app.get("/health")', "Health endpoint"),
            ('if __name__ == "__main__":', "Standalone run"),
        ]

        all_good = True
        for check, desc in checks:
            if check in content:
                print(f"✅ {desc}: Found")
            else:
                print(f"❌ {desc}: Missing '{check}'")
                all_good = False

        return all_good

    except Exception as e:
        print(f"❌ Error checking production API: {e}")
        return False


def main():
    """Executa todas as verificações"""
    print("🚀 RENDER READINESS CHECK")
    print("=" * 40)

    checks = []

    # Verificar arquivos essenciais
    print("\n📁 Checking Essential Files...")
    checks.append(check_file_exists("render.yaml", "Render Blueprint"))
    checks.append(check_file_exists("requirements.txt", "Python Requirements"))
    checks.append(check_file_exists("frontend/package.json", "Frontend Package"))
    checks.append(check_file_exists("src/api_render_production.py", "Production API"))

    # Verificar configurações
    checks.append(check_render_yaml())
    checks.append(check_production_api())
    checks.append(check_backend_dependencies())
    checks.append(check_frontend_build())

    # Resultado final
    print("\n" + "=" * 40)
    print("📊 SUMMARY:")
    passed = sum(checks)
    total = len(checks)

    if passed == total:
        print(f"🎉 ALL CHECKS PASSED ({passed}/{total})")
        print("✅ READY FOR RENDER DEPLOY!")
        return 0
    else:
        print(f"❌ SOME CHECKS FAILED ({passed}/{total})")
        print("🔧 Please fix issues before deploying")
        return 1


if __name__ == "__main__":
    sys.exit(main())
