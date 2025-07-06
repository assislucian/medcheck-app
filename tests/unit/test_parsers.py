"""
Testes unitários para módulos de parsing.
Testam demonstrativo_parser.py e guia_parser.py isoladamente.
"""

from io import BytesIO
from unittest.mock import MagicMock, Mock, patch

import pandas as pd
import pytest

from src.parsers.demonstrativo_parser import DemonstrativoParser

# from src.parsers.guia_parser import GuiaParser  # TODO: Implementar classe


class TestDemonstrativoParser:
    """Testes para DemonstrativoParser."""

    def setup_method(self):
        """Setup para cada teste."""
        self.parser = DemonstrativoParser()

    def test_parse_valid_pdf_success(self):
        """Teste: parsing de PDF válido retorna dados corretos."""
        # Arrange
        mock_pdf_content = b"Mock PDF content"
        expected_data = {
            "beneficiario": "João Silva",
            "procedimentos": [
                {"codigo": "12345", "descricao": "Consulta", "valor": 100.0}
            ],
        }

        with patch.object(self.parser, "_extract_text_from_pdf") as mock_extract:
            mock_extract.return_value = "João Silva\n12345 Consulta R$ 100,00"

            with patch.object(self.parser, "_parse_procedures") as mock_parse:
                mock_parse.return_value = expected_data["procedimentos"]

                # Act
                result = self.parser.parse_pdf(mock_pdf_content)

                # Assert
                assert result["beneficiario"] == expected_data["beneficiario"]
                assert len(result["procedimentos"]) == 1
                assert result["procedimentos"][0]["codigo"] == "12345"

    def test_parse_invalid_pdf_raises_error(self):
        """Teste: PDF inválido levanta exceção apropriada."""
        # Arrange
        invalid_pdf = b"Invalid content"

        with patch.object(self.parser, "_extract_text_from_pdf") as mock_extract:
            mock_extract.side_effect = Exception("PDF corrupted")

            # Act & Assert
            with pytest.raises(Exception, match="PDF corrupted"):
                self.parser.parse_pdf(invalid_pdf)

    def test_extract_beneficiario_name(self):
        """Teste: extração correta do nome do beneficiário."""
        # Arrange
        text_content = "BENEFICIÁRIO: João da Silva Santos\nDATA: 2023-01-01"

        # Act
        result = self.parser._extract_beneficiario(text_content)

        # Assert
        assert result == "João da Silva Santos"

    def test_parse_procedures_multiple_items(self):
        """Teste: parsing de múltiplos procedimentos."""
        # Arrange
        text_content = """
        12345 Consulta médica R$ 100,00
        67890 Exame laboratorial R$ 50,00
        """

        # Act
        result = self.parser._parse_procedures(text_content)

        # Assert
        assert len(result) == 2
        assert result[0]["codigo"] == "12345"
        assert result[1]["codigo"] == "67890"

    def test_validate_document_structure_valid(self):
        """Teste: validação de estrutura de documento válido."""
        # Arrange
        valid_structure = {
            "beneficiario": "João Silva",
            "procedimentos": [{"codigo": "12345"}],
        }

        # Act & Assert
        assert self.parser._validate_structure(valid_structure) is True

    def test_validate_document_structure_invalid(self):
        """Teste: validação de estrutura de documento inválido."""
        # Arrange
        invalid_structure = {"beneficiario": ""}

        # Act & Assert
        assert self.parser._validate_structure(invalid_structure) is False


class TestGuiaParser:
    """Testes para GuiaParser."""

    def setup_method(self):
        """Setup para cada teste."""
        self.parser = GuiaParser()

    def test_parse_valid_excel_success(self):
        """Teste: parsing de Excel válido retorna dados corretos."""
        # Arrange
        mock_excel_data = pd.DataFrame(
            {
                "NUMERO_GUIA": ["G001", "G002"],
                "BENEFICIARIO": ["João Silva", "Maria Santos"],
                "PROCEDIMENTO": ["12345", "67890"],
                "VALOR": [100.0, 150.0],
            }
        )

        with patch("pandas.read_excel") as mock_read:
            mock_read.return_value = mock_excel_data

            # Act
            result = self.parser.parse_excel(BytesIO(b"mock excel"))

            # Assert
            assert len(result) == 2
            assert result[0]["numero_guia"] == "G001"
            assert result[1]["beneficiario"] == "Maria Santos"

    def test_parse_excel_with_missing_columns(self):
        """Teste: Excel com colunas faltando levanta erro."""
        # Arrange
        incomplete_data = pd.DataFrame(
            {
                "NUMERO_GUIA": ["G001"],
                # Faltando outras colunas obrigatórias
            }
        )

        with patch("pandas.read_excel") as mock_read:
            mock_read.return_value = incomplete_data

            # Act & Assert
            with pytest.raises(ValueError, match="Colunas obrigatórias"):
                self.parser.parse_excel(BytesIO(b"mock excel"))

    def test_normalize_data_formats(self):
        """Teste: normalização de formatos de data e valores."""
        # Arrange
        raw_data = [
            {
                "data_procedimento": "2023-12-01",
                "valor": "R$ 100,50",
                "numero_guia": "G001",
            }
        ]

        # Act
        result = self.parser._normalize_data(raw_data)

        # Assert
        assert result[0]["valor"] == 100.50
        assert isinstance(result[0]["data_procedimento"], str)

    def test_validate_data_integrity_success(self):
        """Teste: validação de integridade de dados bem-sucedida."""
        # Arrange
        valid_data = [
            {
                "numero_guia": "G001",
                "beneficiario": "João Silva",
                "procedimento": "12345",
                "valor": 100.0,
            }
        ]

        # Act & Assert
        assert self.parser._validate_data_integrity(valid_data) is True

    def test_validate_data_integrity_failure(self):
        """Teste: validação de integridade falha com dados inválidos."""
        # Arrange
        invalid_data = [
            {
                "numero_guia": "",  # Número de guia vazio
                "beneficiario": "João Silva",
                "procedimento": "12345",
                "valor": -100.0,  # Valor negativo
            }
        ]

        # Act & Assert
        assert self.parser._validate_data_integrity(invalid_data) is False

    def test_cross_reference_with_cbhpm_success(self):
        """Teste: cross-reference com CBHPM funciona corretamente."""
        # Arrange
        procedures = [{"codigo": "12345", "descricao": "Consulta"}]

        with patch.object(self.parser, "_get_cbhpm_data") as mock_cbhpm:
            mock_cbhpm.return_value = {
                "12345": {"descricao": "Consulta médica", "valor_referencia": 100.0}
            }

            # Act
            result = self.parser._cross_reference_cbhpm(procedures)

            # Assert
            assert result[0]["valor_cbhpm"] == 100.0
            assert "cbhpm_match" in result[0]

    @pytest.mark.parametrize(
        "file_extension,expected_parser",
        [
            (".xlsx", "parse_excel"),
            (".xls", "parse_excel"),
            (".csv", "parse_csv"),
            (".pdf", "parse_pdf"),
        ],
    )
    def test_detect_file_type_correct_parser(self, file_extension, expected_parser):
        """Teste: detecção correta do tipo de arquivo."""
        # Arrange
        filename = f"test_file{file_extension}"

        # Act
        parser_method = self.parser._detect_file_type(filename)

        # Assert
        assert parser_method == expected_parser

    def test_handle_duplicate_entries(self):
        """Teste: tratamento correto de entradas duplicadas."""
        # Arrange
        data_with_duplicates = [
            {"numero_guia": "G001", "procedimento": "12345"},
            {"numero_guia": "G001", "procedimento": "12345"},  # Duplicata
            {"numero_guia": "G002", "procedimento": "67890"},
        ]

        # Act
        result = self.parser._remove_duplicates(data_with_duplicates)

        # Assert
        assert len(result) == 2
        assert result[0]["numero_guia"] == "G001"
        assert result[1]["numero_guia"] == "G002"

    def test_error_handling_malformed_data(self):
        """Teste: tratamento de erros para dados malformados."""
        # Arrange
        malformed_excel = BytesIO(b"Invalid Excel content")

        with patch("pandas.read_excel") as mock_read:
            mock_read.side_effect = Exception("Malformed Excel")

            # Act & Assert
            with pytest.raises(Exception):
                self.parser.parse_excel(malformed_excel)


class TestParserIntegration:
    """Testes de integração entre parsers."""

    def test_demonstrativo_guia_cross_validation(self):
        """Teste: validação cruzada entre demonstrativo e guias."""
        # Arrange
        demo_parser = DemonstrativoParser()
        guia_parser = GuiaParser()

        demo_data = {
            "beneficiario": "João Silva",
            "procedimentos": [{"codigo": "12345", "valor": 100.0}],
        }

        guia_data = [
            {"beneficiario": "João Silva", "procedimento": "12345", "valor": 100.0}
        ]

        # Act
        validation_result = demo_parser.cross_validate_with_guias(demo_data, guia_data)

        # Assert
        assert validation_result["match_status"] == "complete"
        assert validation_result["discrepancies"] == []

    def test_data_consistency_validation(self):
        """Teste: validação de consistência entre fontes de dados."""
        # Arrange
        source1_data = [{"codigo": "12345", "valor": 100.0}]
        source2_data = [{"codigo": "12345", "valor": 105.0}]  # Valor diferente

        parser = DemonstrativoParser()

        # Act
        consistency_check = parser._validate_consistency(source1_data, source2_data)

        # Assert
        assert consistency_check["has_discrepancies"] is True
        assert len(consistency_check["value_differences"]) == 1
