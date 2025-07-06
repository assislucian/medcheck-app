"""
Configurações adicionais para corrigir problemas de teste.
"""

import os

import pytest


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment_fixes():
    """Configura ambiente específico para corrigir problemas."""
    # Desabilitar rate limiting
    os.environ["DISABLE_RATE_LIMIT"] = "true"
    os.environ["TESTING"] = "true"

    # Configurar autenticação bypass
    os.environ["SKIP_AUTH"] = "true"
    os.environ["CRM_LOGADO"] = "6091"
    os.environ["UF_LOGADO"] = "RN"

    # Database de teste
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"

    yield

    # Cleanup
    for key in ["DISABLE_RATE_LIMIT", "SKIP_AUTH", "CRM_LOGADO", "UF_LOGADO"]:
        if key in os.environ:
            del os.environ[key]
