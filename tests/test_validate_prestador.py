import json
import os
from pathlib import Path

from src.parsers.guia_parser import parse_guia_pdf

# Set up test files with proper paths - using actual paths from the uploads directory
test_files = [
    "uploads/8a259c72-a13e-42bd-bb6b-856dfda97b20_nubia_katia.pdf",
    "uploads/bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_0.pdf",
    "uploads/noivana.pdf",
]

print("\n\nPRESTADOR VALIDATION RESULTS:\n")
for f in test_files:
    if not os.path.exists(f):
        print(f"File not found: {f}")
        continue

    result = parse_guia_pdf(f, "6091")
    filename = f.split("/")[-1]
    print(f"File: {filename}")
    print(f"- Procedures: {len(result)}")

    if len(result) > 0:
        print(f'- Prestador: {result[0]["prestador"]}')
        assert "LIGA NORTERIOG CANCER POLICLINIC" in result[0]["prestador"]
        print(f"- Prestador check: PASSED")
    else:
        print("- No procedures found")
    print()


def test_prestador_exato():
    PDF_DIR = Path("uploads")
    pdf = PDF_DIR / "8a259c72-a13e-42bd-bb6b-856dfda97b20_nubia_katia.pdf"
    res = parse_guia_pdf(pdf, "6091")[0]
    assert res["prestador"] == "LIGA NORTERIOG CANCER POLICLINIC"


# Teste manual para debug
if __name__ == "__main__":
    test_prestador_exato()
    print("Prestador extraído corretamente!")
