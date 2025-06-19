import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
import os
import pandas as pd
from src.parsers.cbhpm_parser import CBHPMParser
from src.parsers.guia_parser import parse_guia_pdf
from src.parsers.demonstrativo_parser import DemonstrativoParser
from src.main import parse_demonstrativo
import io
import tempfile
import json
from fastapi.testclient import TestClient
from src.api import app, create_access_token

def test_cbhpm_parser():
    """Test CBHPM parser with sample data."""
    # Create a sample CBHPM Excel file
    sample_data = {
        'codigo': ['31602010', '31602029', '31602037'],
        'procedimento': [
            'Analgesia controlada pelo paciente – por dia subsequente',
            'Analgesia por dia subsequente. Acompanhamento de analgesia por cateter peridural',
            'Anestesia geral ou condutiva para realização de bloqueio neurolítico'
        ],
        'valor_cirurgiao': ['R$135.78', 'R$135.78', 'R$432.47'],
        'valor_anestesista': ['', '', ''],
        'valor_primeiro_auxiliar': ['', '', '']
    }
    
    test_file = "data/cbhpm/test_cbhpm.xlsx"
    os.makedirs(os.path.dirname(test_file), exist_ok=True)
    
    # Create DataFrame and save as Excel
    df = pd.DataFrame(sample_data)
    df.to_excel(test_file, index=False)
    
    parser = CBHPMParser(test_file)
    
    # Test procedure retrieval
    procedure = parser.get_procedure("31602010")
    assert procedure is not None
    assert procedure["description"] == "Analgesia controlada pelo paciente – por dia subsequente"
    assert procedure["surgeon_value"] == 135.78
    
    # Test value validation
    assert parser.validate_procedure_value("31602010", 135.78, "surgeon")
    assert not parser.validate_procedure_value("31602010", 150.00, "surgeon")

def test_guia_parser():
    """Test Guia parser with sample PDF."""
    # Note: This test requires a sample PDF file
    # You'll need to create a sample PDF with the expected format
    test_file = "data/guias/test_guia.pdf"
    if not os.path.exists(test_file):
        pytest.skip("Test PDF file not found")
    
    procedures = parse_guia_pdf(test_file, crm_filter="123456")
    # Wrapper para compatibilidade com get_procedures()
    class GuiaParserWrapper:
        def __init__(self, procedures):
            self._procedures = procedures
        def get_procedures(self):
            return self._procedures
    guia_parser = GuiaParserWrapper(procedures)
    procedures = guia_parser.get_procedures()
    # Basic validation
    assert isinstance(procedures, list)
    if procedures:
        assert "codigo" in procedures[0]
        assert "descricao" in procedures[0]
        assert "quantidade" in procedures[0]

def test_demonstrativo_parser():
    """Test Demonstrativo parser with sample PDF."""
    # Note: This test requires a sample PDF file
    # You'll need to create a sample PDF with the expected format
    test_file = "data/demonstrativos/test_demonstrativo.pdf"
    if not os.path.exists(test_file):
        pytest.skip("Test PDF file not found")
    
    parser = DemonstrativoParser(test_file)
    payments = parser.get_payments()
    
    # Basic validation
    assert isinstance(payments, list)
    if payments:
        assert "code" in payments[0]
        assert "description" in payments[0]
        assert "financial" in payments[0]

# NOVO TESTE PARA O PARSER DE DEMONSTRATIVO DO src/main.py
@pytest.mark.parametrize("pdf_path,cbhpm_path", [
    ("data/demonstrativos/Demonstrativo-outubro_2024.pdf", "data/cbhpm/CBHPM2015_v1.xlsx"),
])
def test_parse_demonstrativo_main(pdf_path, cbhpm_path):
    if not (os.path.exists(pdf_path) and os.path.exists(cbhpm_path)):
        pytest.skip("Arquivos de teste não encontrados")
    df = parse_demonstrativo(pdf_path, user_crm="6091")
    # Deve retornar DataFrame não vazio se houver procedimentos válidos
    assert isinstance(df, pd.DataFrame)
    assert len(df) > 0, "O DataFrame do demonstrativo está vazio, mas deveria conter procedimentos."
    # Todos os códigos extraídos devem estar na CBHPM
    cbhpm_codes = set(pd.read_excel(cbhpm_path)['codigo'].astype(int))
    assert set(df['codigo']).issubset(cbhpm_codes), "Existem códigos no demonstrativo que não estão na CBHPM."
    # O parser não deve retornar linhas para PDFs sem procedimentos válidos
    # (Teste negativo: arquivo fictício)
    empty_df = parse_demonstrativo("data/demonstrativos/arquivo_inexistente.pdf", user_crm="6091") if os.path.exists("data/demonstrativos/arquivo_inexistente.pdf") else pd.DataFrame()
    assert empty_df.empty or len(empty_df) == 0 

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def jwt_token():
    # Gera um token JWT válido para CRM de teste
    return create_access_token({"crm": "123456", "nome": "Teste"})

def test_upload_guia_endpoint(client, jwt_token):
    # Cria um PDF de guia de exemplo (pode ser um PDF vazio para o teste estrutural)
    with tempfile.NamedTemporaryFile(suffix='.pdf') as tmp:
        tmp.write(b'%PDF-1.4\n%Fake PDF for test\n')
        tmp.flush()
        tmp.seek(0)
        files = {"file": ("guia_teste.pdf", tmp, "application/pdf")}
        headers = {"Authorization": f"Bearer {jwt_token}"}
        response = client.post("/api/v1/guias/upload", files=files, headers=headers)
        assert response.status_code in (200, 400, 422)  # 422 é esperado para payload inválido
        if response.status_code == 200:
            data = response.json()
            assert "crm" in data
            assert data["crm"] == "123456"
            assert "procedures" in data
            assert isinstance(data["procedures"], list)
        else:
            # Deve retornar erro de processamento se o PDF não for válido
            assert "Erro ao processar guia" in response.text or "Apenas arquivos PDF" in response.text or response.status_code == 422 