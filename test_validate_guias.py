"""
Testes de regressão — garantem que o parser continue funcionando
independentemente de futuras refatorações no Cursor ou no código.
"""

import json
from pathlib import Path

import pytest

from src.parsers.guia_parser import parse_guia_pdf

# PDFs de testes (coloque na pasta tests/assets ou ajuste o path)
PDF_DIR = Path(__file__).parent / "assets"
EXAMPLES = [
    ("nubia_katia.pdf", "6091", 4),
    ("rodrigo bernardo.pdf", "6091", 1),
    ("thayse borges.pdf", "6091", 3),
    ("noivana.pdf", "6091", 2),
]


@pytest.mark.parametrize("filename, crm, expected_count", EXAMPLES)
def test_parse_count(filename: str, crm: str, expected_count: int):
    pdf_path = PDF_DIR / filename
    result = parse_guia_pdf(pdf_path, crm_filter=crm)
    assert len(result) == expected_count, f"{filename}: contagem incorreta"


def test_fields_presence():
    pdf_path = PDF_DIR / "rodrigo bernardo.pdf"
    res = parse_guia_pdf(pdf_path, crm_filter="6091")[0]

    mandatory_fields = {
        "guia",
        "data_execucao",
        "codigo",
        "descricao",
        "quantidade",
        "beneficiario",
        "prestador",
        "papel_exercido",
        "participacoes",
    }
    assert mandatory_fields.issubset(res.keys())
    assert res["data_execucao"].count("/") == 2  # dd/mm/yyyy


test_files = [
    "uploads/8a259c72-a13e-42bd-bb6b-856dfda97b20_nubia_katia.pdf",
    "uploads/bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_0.pdf",
    "uploads/noivana.pdf",
]

print("\n\nVALIDATION RESULTS:\n")
for f in test_files:
    result = parse_guia_pdf(f, "6091")
    filename = f.split("/")[-1]
    print(f"File: {filename}")
    print(f"- Procedures: {len(result)}")
    print(f'- Guia numbers: {[p["guia"] for p in result]}')
    required_fields = all(
        [
            "guia" in p
            and "codigo" in p
            and "descricao" in p
            and "data_execucao" in p
            and "beneficiario" in p
            and "prestador" in p
            and "papel_exercido" in p
            for p in result
        ]
    )
    print(f"- Required fields present: {required_fields}")
    date_format = all(
        [
            p["data_execucao"].count("/") == 2
            and len(p["data_execucao"].split("/")[0]) == 2
            for p in result
        ]
    )
    print(f"- Date format correct (dd/mm/yyyy): {date_format}")

    if "rodrigo bernardo.pdf" in f:
        for res in result:
            assert res["prestador"] == "LIGA NORTERIOG CANCER POLICLINIC"
            print(f"- Prestador check for rodrigo bernardo.pdf: PASSED")
    print()
