import json
import os

import pandas as pd
import pytest

from src.comparators.procedure_comparator import ProcedureComparator
from src.parsers.cbhpm_parser import CBHPMParser
from src.parsers.demonstrativo_parser import DemonstrativoParser
from src.parsers.guia_parser import parse_guia_pdf


def test_comparison():
    """Test the complete comparison flow with sample data."""
    # Create sample CBHPM data
    cbhpm_data = {
        "codigo": ["31602010", "31602029", "31602037"],
        "procedimento": [
            "Analgesia controlada pelo paciente – por dia subsequente",
            "Analgesia por dia subsequente. Acompanhamento de analgesia por cateter peridural",
            "Anestesia geral ou condutiva para realização de bloqueio neurolítico",
        ],
        "valor_cirurgiao": ["R$135.78", "R$135.78", "R$432.47"],
        "valor_anestesista": ["", "", ""],
        "valor_primeiro_auxiliar": ["", "", ""],
    }

    cbhpm_file = "data/cbhpm/test_cbhpm.xlsx"
    os.makedirs(os.path.dirname(cbhpm_file), exist_ok=True)

    # Create DataFrame and save as Excel
    df = pd.DataFrame(cbhpm_data)
    df.to_excel(cbhpm_file, index=False)

    # Create sample Guia data (simulated PDF content)
    guia_file = "data/guias/test_guia.pdf"
    if not os.path.exists(guia_file):
        pytest.skip("Test Guia PDF not found")

    # Create sample Demonstrativo data (simulated PDF content)
    demonstrativo_file = "data/demonstrativos/test_demonstrativo.pdf"
    if not os.path.exists(demonstrativo_file):
        pytest.skip("Test Demonstrativo PDF not found")

    # Initialize parsers
    cbhpm_parser = CBHPMParser(cbhpm_file)
    guia_procedures = parse_guia_pdf(guia_file, crm_filter="123456")
    demonstrativo_parser = DemonstrativoParser(demonstrativo_file)

    # Simular um GuiaParser wrapper se necessário para compatibilidade
    class GuiaParserWrapper:
        def __init__(self, procedures):
            self._procedures = procedures

        def get_procedures(self):
            return self._procedures

    guia_parser = GuiaParserWrapper(guia_procedures)

    # Initialize comparator
    comparator = ProcedureComparator(cbhpm_parser, guia_parser, demonstrativo_parser)

    # Run comparison
    comparator.compare_all()

    # Get results
    results = comparator.get_results()
    summary = comparator.get_summary()

    # Basic validation
    assert isinstance(results, list)
    assert isinstance(summary, dict)
    assert "total_procedures" in summary
    assert "valid_payments" in summary
    assert "not_paid" in summary
    assert "invalid_value" in summary

    # Save results for inspection
    output_file = "test_comparison_results.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(
            {"summary": summary, "details": results}, f, indent=2, ensure_ascii=False
        )

    print(f"\nTest results saved to: {output_file}")
