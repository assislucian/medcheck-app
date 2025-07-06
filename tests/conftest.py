"""
Configuração global de testes para MedCheck.
Inclui fixtures para banco de dados, cliente HTTP e configurações de teste.
"""

import asyncio
import os
import tempfile
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.api import Base, SessionLocal, app, engine


# Configuração de ambiente de teste
@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Configura o ambiente de teste."""
    os.environ["TESTING"] = "true"
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    yield
    # Cleanup após todos os testes
    if os.path.exists("./test.db"):
        os.remove("./test.db")


# Fixture para banco de dados de teste
@pytest.fixture(scope="function")
def test_db():
    """Cria um banco de dados temporário para cada teste."""
    # Criar banco temporário
    db_fd, db_path = tempfile.mkstemp()
    test_engine = create_engine(f"sqlite:///{db_path}")

    # Criar todas as tabelas
    Base.metadata.create_all(bind=test_engine)

    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )

    def override_get_database():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    # Override da dependency no app (se necessário)
    # app.dependency_overrides[get_database] = override_get_database

    yield TestingSessionLocal()

    # Cleanup
    os.close(db_fd)
    os.unlink(db_path)
    # app.dependency_overrides.clear()


# Cliente de teste síncrono
@pytest.fixture(scope="function")
def client(test_db) -> Generator[TestClient, None, None]:
    """Cliente de teste para requisições síncronas."""
    with TestClient(app) as test_client:
        yield test_client


# Cliente de teste assíncrono
@pytest_asyncio.fixture(scope="function")
async def async_client(test_db) -> AsyncGenerator[AsyncClient, None]:
    """Cliente de teste para requisições assíncronas."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


# Fixture para dados de teste
@pytest.fixture(scope="function")
def sample_user_data():
    """Dados de usuário para testes."""
    return {"uf": "RN", "crm": "6091", "password": "@Luassis90"}


@pytest.fixture(scope="function")
def authenticated_headers(client, sample_user_data):
    """Headers de autenticação para testes."""
    login_data = {
        "username": sample_user_data["crm"],
        "password": sample_user_data["password"],
        "scope": sample_user_data["uf"],
    }
    response = client.post("/token", data=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# Fixture para arquivos de teste
@pytest.fixture(scope="function")
def sample_pdf_file():
    """Arquivo PDF de exemplo para testes."""
    # Criar um PDF simples para testes
    from io import BytesIO

    pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n"
    return BytesIO(pdf_content)


# Configuração para testes assíncronos
@pytest.fixture(scope="session")
def event_loop():
    """Configura event loop para testes assíncronos."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# Configuração do Playwright para testes E2E
try:
    import pytest
    from playwright.sync_api import sync_playwright

    @pytest.fixture(scope="function")
    def page():
        """Fixture do Playwright para testes E2E."""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            yield page
            context.close()
            browser.close()

except ImportError:
    # Playwright não instalado, criar fixture mock
    @pytest.fixture(scope="function")
    def page():
        """Mock fixture quando Playwright não está disponível."""
        pytest.skip("Playwright não instalado")
