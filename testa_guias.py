from pathlib import Path

from src.main import parse_guide_pdf

pdfs = [
    "data/guias/rodrigo bernardo.pdf",
    "data/guias/thayse borges.pdf",
    "data/guias/nubia_katia.pdf",
    "data/guias/noivana.pdf",
]

for p in pdfs:
    df = parse_guide_pdf(Path(p), "6091")
    print(f"[parse_guide_pdf] {Path(p).name}: {len(df)} procedimentos para CRM 6091")
