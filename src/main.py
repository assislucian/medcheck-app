import re
from pathlib import Path

import pandas as pd
import pdfplumber

from src.services.parse import parse_demonstrativo, parse_guide_pdf


# Helper function to extract full text (can be placed inside or outside parse_demonstrativo)
def extract_full_text(path: Path) -> str:
    """Extracts all text from a PDF file."""
    full_text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n"
    return full_text


def find_column(df: pd.DataFrame, patterns) -> str:
    """Encontra o nome da coluna que corresponde a qualquer padrão da lista (case-insensitive). Loga qual padrão casou."""
    for pat in patterns:
        for col in df.columns:
            if re.search(pat, col, re.IGNORECASE):
                print(f"[find_column] Coluna '{col}' casou com padrão '{pat}'")
                return col
    raise KeyError(
        f"Nenhuma coluna encontrada para padrões: {patterns} em {df.columns.tolist()}"
    )


# Dicionário de padrões para cada coluna essencial
COLUMN_PATTERNS = {
    "codigo": [r"cód.*serv", r"código(?:\s+serviço)?", r"cód\.? serviço", r"código"],
    "apresentado": [r"apresentado", r"valor apresentado"],
    "liberado": [r"liberad", r"valor liberado", r"valor pago"],
    "pro_rata": [r"pro\s*?rata"],
    "glosa": [r"glosa"],
}


def clean_currency(value) -> float:
    """Converte strings tipo 'R$ 1.234,56' ou '1234.56' em float."""
    if pd.isna(value):
        return 0.0
    s = str(value)
    # remove tudo que não seja dígito, vírgula ou ponto
    s = re.sub(r"[^\d,\.]", "", s)
    # vírgula -> ponto
    s = s.replace(",", ".")
    try:
        return float(s)
    except:
        return 0.0


def load_cbhpm(path: Path) -> pd.DataFrame:
    """Carrega CBHPM2015 e retorna DataFrame com dtype correto."""
    df = pd.read_excel(path, sheet_name="CBHPM2015")
    df["codigo"] = df["codigo"].astype(int)
    return df[
        [
            "codigo",
            "procedimento",
            "valor_cirurgiao",
            "valor_anestesista",
            "valor_primeiro_auxiliar",
        ]
    ]


def process_guides(guides_dir: Path, user_crm: str) -> pd.DataFrame:
    """Processa todas as guias em um diretório e retorna um DataFrame consolidado."""
    all_records = []

    for guide_file in guides_dir.glob("*.pdf"):
        print(f"\nProcessando guia: {guide_file.name}")
        try:
            df_guide = parse_guide_pdf(guide_file, user_crm)
            all_records.append(df_guide)
        except Exception as e:
            print(f"Erro ao processar guia {guide_file.name}: {e}")

    if not all_records:
        raise RuntimeError("Nenhuma guia foi processada com sucesso")

    return pd.concat(all_records, ignore_index=True)


def compare_demonstrative_with_guides(
    demo_df: pd.DataFrame, guides_df: pd.DataFrame
) -> dict:
    """Compara o demonstrativo com as guias e retorna um dicionário com as discrepâncias."""
    # Agrupa por código e soma os valores
    demo_grouped = (
        demo_df.groupby("codigo")
        .agg(
            {
                "liberado": "sum",
                "valor_tabela": "first",  # Pega o primeiro valor da tabela (deve ser o mesmo para todos)
                "diferenca": "sum",
                "diferenca_percent": "mean",  # Média das diferenças percentuais
            }
        )
        .reset_index()
    )

    guides_grouped = guides_df.groupby("codigo").agg({"liberado": "sum"}).reset_index()

    # Encontra procedimentos que estão em um mas não no outro
    demo_codes = set(demo_grouped["codigo"])
    guides_codes = set(guides_grouped["codigo"])

    only_in_demo = demo_codes - guides_codes
    only_in_guides = guides_codes - demo_codes

    # Encontra procedimentos com valores diferentes
    merged = pd.merge(
        demo_grouped,
        guides_grouped,
        on="codigo",
        how="outer",
        suffixes=("_demo", "_guides"),
    )
    different_values = merged[merged["liberado_demo"] != merged["liberado_guides"]]

    return {
        "only_in_demo": list(only_in_demo),
        "only_in_guides": list(only_in_guides),
        "different_values": (
            different_values.to_dict("records") if not different_values.empty else []
        ),
        "demo_total": demo_grouped["liberado"].sum(),
        "guides_total": guides_grouped["liberado"].sum(),
    }


def main():
    user_crm = "6091"  # ou conforme seu fluxo de autenticação
    # 1. Carrega CBHPM e demonstrativo
    cbhpm = load_cbhpm(Path("data/cbhpm/CBHPM2015_v1.xlsx"))
    demonstrativo_df = parse_demonstrativo(
        Path("data/demonstrativos/Demonstrativo-outubro_2024.pdf"), user_crm
    )

    # Renomeia coluna de código se necessário
    if (
        "Cód. Serv." in demonstrativo_df.columns
        and "codigo" not in demonstrativo_df.columns
    ):
        demonstrativo_df = demonstrativo_df.rename(columns={"Cód. Serv.": "codigo"})

    # Garante todas as colunas necessárias para o merge
    for col in ["guia", "papel", "crm", "beneficiario", "qtd", "status"]:
        if col not in demonstrativo_df.columns:
            demonstrativo_df[col] = None

    # Garante que só temos códigos válidos antes de converter
    if "codigo" in demonstrativo_df.columns:
        demonstrativo_df = demonstrativo_df[demonstrativo_df["codigo"].notnull()].copy()
        demonstrativo_df = demonstrativo_df[
            demonstrativo_df["codigo"].astype(str).str.isdigit()
        ].copy()
        demonstrativo_df["codigo"] = demonstrativo_df["codigo"].astype(int)
    else:
        raise KeyError("Coluna 'codigo' não encontrada no demonstrativo_df")

    # 2. Processa guias (já usando o parse_guide_pdf com date, beneficiario, qtd, status)
    guides_df = process_guides(Path("data/guias"), user_crm)

    # Força tipos das chaves de merge
    for df in [guides_df, demonstrativo_df]:
        df["guia"] = df["guia"].astype(str)
        df["codigo"] = df["codigo"].astype(int)
        df["papel"] = df["papel"].astype(str)
        df["crm"] = df["crm"].astype(str)

    print("Chaves de merge nas guias:")
    print(guides_df[["guia", "codigo", "papel", "crm"]].drop_duplicates())
    print("Chaves de merge no demonstrativo:")
    print(demonstrativo_df[["guia", "codigo", "papel", "crm"]].drop_duplicates())

    # 3. Gera comparison_df com todos os campos
    comparison_df = guides_df.merge(
        demonstrativo_df[
            ["guia", "codigo", "papel", "crm", "liberado", "valor_tabela"]
        ],
        on=["guia", "codigo", "papel", "crm"],
        how="left",
        validate="many_to_one",
    )

    print("Colunas do comparison_df:", comparison_df.columns.tolist())
    print(comparison_df.head())

    # Garante que as colunas existem
    if (
        "liberado" not in comparison_df.columns
        or "valor_tabela" not in comparison_df.columns
    ):
        raise KeyError(
            f"Colunas faltando após merge: {set(['liberado','valor_tabela']) - set(comparison_df.columns)}"
        )

    # 4. Cálculos de diferença
    comparison_df["diferenca"] = (
        comparison_df["liberado"] - comparison_df["valor_tabela"]
    )
    comparison_df["diferenca_percentual"] = (
        comparison_df["diferenca"] / comparison_df["valor_tabela"] * 100
    ).round(2)

    # 5. Validação de schema e assertions de sanidade
    from src.schema import demo_schema, guide_schema

    guide_schema.validate(guides_df)
    demo_schema.validate(comparison_df)
    assert "codigo" in demonstrativo_df.columns
    assert all(demonstrativo_df["codigo"].astype(str).str.isdigit())
    assert set(guides_df["papel"]).issubset(
        {"Cirurgião", "Anestesista", "1º Auxiliar", "2º Auxiliar"}
    )
    assert (
        comparison_df["liberado"].notna().sum() > 0
    ), "Nenhuma correspondência entre demonstrativo e guias!"

    # 6. Relatório final
    print("=== Relatório Cross-Check ===")
    print(f"Total de linhas nas guias: {len(guides_df)}")
    print(f"Merge OK: {comparison_df['liberado'].notna().sum()}")
    print(f"Sem correspondência: {comparison_df['liberado'].isna().sum()}")
    print(
        comparison_df.to_string(
            index=False,
            columns=[
                "guia",
                "date",
                "codigo",
                "descricao",
                "papel",
                "crm",
                "beneficiario",
                "qtd",
                "status",
                "liberado",
                "valor_tabela",
                "diferenca",
                "diferenca_percentual",
            ],
        )
    )


# === API FastAPI mínima para uso com Uvicorn ===
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, RedirectResponse

from src.api import app as api_app

# Exporta o app principal para o Uvicorn/FastAPI
app = api_app

# Healthcheck endpoint
@app.get("/healthz")
def healthz():
    return {"status": "ok"}

if __name__ == "__main__":
    main()
    # Utilitário temporário para debug: extrair texto de noivana.pdf
    guia_path = Path("data/guias/noivana.pdf")
    with pdfplumber.open(guia_path) as pdf:
        texto = "\n".join([p.extract_text() or "" for p in pdf.pages])
    print("\n[DEBUG] Primeiros 500 caracteres do texto extraído de noivana.pdf:\n")
    print(texto[:500])
    print("\n--- FIM DO TRECHO ---\n")
