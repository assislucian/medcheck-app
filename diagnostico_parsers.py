from pathlib import Path

import pdfplumber

from src.services.parse import parse_demonstrativo, parse_guide_pdf

# 1. Texto bruto do demonstrativo
print("\n=== TEXTO BRUTO DEMONSTRATIVO ===")
with pdfplumber.open("data/demonstrativos/Demonstrativo-outubro_2024.pdf") as pdf:
    txt = "".join(p.extract_text() or "" for p in pdf.pages)
print(txt[:1000])

# 2. DataFrame do demonstrativo
print("\n=== DATAFRAME DEMONSTRATIVO ===")
df = parse_demonstrativo("data/demonstrativos/Demonstrativo-outubro_2024.pdf", "6091")
print(df.head())
print("Colunas:", df.columns.tolist(), "Linhas:", len(df))

# 3. Texto bruto de uma guia (noivana.pdf)
print("\n=== TEXTO BRUTO GUIA (noivana.pdf) ===")
with pdfplumber.open("data/guias/noivana.pdf") as pdf:
    txtg = "".join(p.extract_text() or "" for p in pdf.pages)
print(txtg[:1000])

# 4. DataFrame da guia
print("\n=== DATAFRAME GUIA (noivana.pdf) ===")
dfg = parse_guide_pdf(Path("data/guias/noivana.pdf"), "6091")
print(dfg.head())
print("Colunas:", dfg.columns.tolist(), "Linhas:", len(dfg))
