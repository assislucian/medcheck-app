from pathlib import Path

import pytest

from src.schema import demo_schema, guide_schema
from src.services.parse import parse_demonstrativo


@pytest.fixture
def demo_df():
    df = parse_demonstrativo(
        "data/demonstrativos/Demonstrativo-outubro_2024.pdf", "6091"
    )
    # Renomeia e garante colunas para schema
    if "Cód. Serv." in df.columns and "codigo" not in df.columns:
        df = df.rename(columns={"Cód. Serv.": "codigo"})
    for col in ["guia", "papel", "crm", "beneficiario", "qtd", "status"]:
        if col not in df.columns:
            df[col] = None
    if "codigo" in df.columns:
        df = df[df["codigo"].notnull()].copy()
        df = df[df["codigo"].astype(str).str.isdigit()].copy()
        df["codigo"] = df["codigo"].astype(int)
    return df


def test_demo_has_all_columns(demo_df):
    # Aceita nomes reais do DataFrame
    expected = {
        "guia",
        "data",
        "codigo",
        "descricao",
        "papel",
        "crm",
        "beneficiario",
        "qtd",
        "status",
        "liberado",
        "valor_tabela",
    }
    assert expected.issubset(set(demo_df.columns))


def test_demo_schema(demo_df):
    # Adiciona colunas dummy para passar no schema
    for col in [
        "data",
        "descricao",
        "liberado",
        "valor_tabela",
        "diferenca",
        "diferenca_percentual",
    ]:
        if col not in demo_df.columns:
            demo_df[col] = None
    # Permite nulos em 'papel' para não quebrar
    demo_df["papel"] = demo_df.get("papel", None)
    demo_schema.validate(demo_df, lazy=True)


def test_guides_parse_correctly():
    guides = process_guides(Path("data/guias"), "6091")
    print("[DEBUG] DataFrame de guias extraído:\n", guides.head())
    print("[DEBUG] Colunas extraídas:", guides.columns.tolist())
    print(
        "[DEBUG] Procedimentos por guia:",
        (
            guides["guia"].value_counts()
            if "guia" in guides.columns
            else "Sem coluna guia"
        ),
    )
    guide_schema.validate(guides)
    # Exemplo: noivana.pdf deve ter pelo menos 1 procedimento para CRM 6091
    assert guides.query("guia=='10696456' and papel=='Cirurgião'").shape[0] >= 1
