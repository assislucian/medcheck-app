import re
from pathlib import Path

import pandas as pd
import pdfplumber


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


def parse_demonstrativo(path: Path, user_crm: str) -> pd.DataFrame:
    """
    Extrai dados do PDF de demonstrativo, usando regex linha a linha do texto bruto.
    Só aceita procedimentos cujo código está na CBHPM2015.
    """
    cbhpm_df = load_cbhpm(Path("data/cbhpm/CBHPM2015_v1.xlsx"))
    valid_codes = set(cbhpm_df["codigo"].astype(str))
    with pdfplumber.open(path) as pdf:
        text = "\n".join(p.extract_text() or "" for p in pdf.pages)
    pattern = re.compile(
        r"(?P<lote>\d+)\s+(?P<conta>\d+)\s+(?P<guia>\d+)\s+(?P<data>\d{2}/\d{2}/\d{4})\s+(?P<carteira>\d+)\s+(?P<nome>.+?)\s+(?P<acom>\w+)\s+(?P<codigo>\d+)\s+(?P<descricao>.+?)\s+(?P<qtd>\d+)\s+(?P<apresentado>\d+,\d{2})\s+(?P<liberado>\d+,\d{2})\s+(?P<pro_rata>\d+,\d{2})\s+(?P<glosa>\d+,\d{2})",
        re.MULTILINE,
    )
    matches = [m.groupdict() for m in pattern.finditer(text)]
    df = pd.DataFrame(matches)
    df["codigo"] = df["codigo"].astype(str)
    df = df[df["codigo"].isin(valid_codes)].copy()
    for col in ["guia", "papel", "crm", "beneficiario", "qtd", "status"]:
        if col not in df.columns:
            df[col] = None
    if "codigo" in df.columns:
        df["codigo"] = pd.to_numeric(df["codigo"], errors="coerce")
        df = df[df["codigo"].notnull()].copy()
        df["codigo"] = df["codigo"].astype(int)
    else:
        raise KeyError("Coluna 'codigo' não encontrada no demonstrativo_df")
    demo_df = df.merge(cbhpm_df, on="codigo", how="left")

    def valor_por_papel(row):
        if row["papel"] == "Cirurgião":
            return row["valor_cirurgiao"]
        elif row["papel"] == "Anestesista":
            return row["valor_anestesista"]
        elif row["papel"] == "1º Auxiliar":
            return row["valor_primeiro_auxiliar"]
        elif row["papel"] == "2º Auxiliar":
            return row["valor_primeiro_auxiliar"]
        return None

    demo_df["valor_tabela"] = demo_df.apply(valor_por_papel, axis=1)
    if "liberado" in demo_df.columns:
        demo_df["liberado"] = pd.to_numeric(
            demo_df["liberado"], errors="coerce"
        ).fillna(0.0)
    else:
        demo_df["liberado"] = 0.0
    if "valor_tabela" in demo_df.columns:
        demo_df["valor_tabela"] = pd.to_numeric(
            demo_df["valor_tabela"], errors="coerce"
        ).fillna(0.0)
    else:
        demo_df["valor_tabela"] = 0.0
    demo_df["diferenca"] = demo_df["liberado"] - demo_df["valor_tabela"]
    demo_df["diferenca_percentual"] = (
        demo_df["diferenca"].astype(float)
        / demo_df["valor_tabela"].replace(0, float("nan"))
        * 100
    )
    demo_df["diferenca_percentual"] = (
        demo_df["diferenca_percentual"].round(2).fillna(0.0)
    )
    return demo_df


def parse_guide_pdf(path, user_crm: str) -> pd.DataFrame:
    """
    Extrai dados de um PDF de guia médica, retornando um DataFrame com os procedimentos do médico.
    """
    path = Path(path)
    text = ""
    with pdfplumber.open(path) as pdf:
        for p in pdf.pages:
            txt = p.extract_text(x_tolerance=1, y_tolerance=1) or ""
            text += txt + "\n"
    blocks = re.split(r"(?m)(?=^\s*(\d{8})\s+\d{2}/\d{2}/\d{4})", text)
    total_blocos = max(0, len(blocks) - 1)
    records = []
    papel_map = {
        r"Cirurgiao": "Cirurgião",
        r"Anestesista": "Anestesista",
        r"Primeiro Auxiliar": "1º Auxiliar",
        r"Segundo Auxiliar": "2º Auxiliar",
    }
    for blk in blocks[1:]:
        m = re.match(
            r"^\s*(?P<guia>\d{8})\s+(?P<date>\d{2}/\d{2}/\d{4})\s+"
            r"(?P<code>30\d{6})\s+(?P<desc>.+?)\s+(?P<qtd>\d+)\s+(?P<status>\w+)",
            blk,
            re.DOTALL | re.MULTILINE,
        )
        if not m:
            continue
        guia = m.group("guia")
        codigo = m.group("code")
        desc = m.group("desc").strip()
        date = m.group("date")
        qtd = m.group("qtd")
        status = m.group("status")
        beneficiario = ""
        bmatch = re.search(r"Benefici[áa]rio: [^\-]+- ([A-ZÇÁÉÍÓÚÂÊÔÃÕÜ\s]+)", blk)
        if bmatch:
            beneficiario = bmatch.group(1).strip()
        papel = None
        for pat, nome in papel_map.items():
            if re.search(rf"{pat}\s+{user_crm}\\b", blk, re.IGNORECASE):
                papel = nome
                break
        if papel:
            records.append(
                {
                    "guia": guia,
                    "date": date,
                    "codigo": int(codigo),
                    "descricao": desc,
                    "papel": papel,
                    "crm": user_crm,
                    "beneficiario": beneficiario,
                    "qtd": int(qtd),
                    "status": status,
                }
            )
    df = pd.DataFrame(records)
    return df
