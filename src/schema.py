import pandera as pa
from pandera import Column, DataFrameSchema, Check

demo_schema = DataFrameSchema({
    "guia":       Column(pa.String, nullable=True),
    "date":       Column(pa.String, nullable=True),
    "codigo":     Column(pa.Int,   Check(lambda s: s > 0)),
    "descricao":  Column(pa.String),
    "papel":      Column(pa.String, Check.isin(["Cirurgião","Anestesista","1º Auxiliar","2º Auxiliar"])),
    "crm":        Column(pa.String, Check.str_matches(r"^\d{1,6}$")),
    "beneficiario": Column(pa.String, nullable=True),
    "qtd":        Column(pa.Int, Check(lambda s: s >= 1)),
    "status":     Column(pa.String, nullable=True),
    "liberado":   Column(pa.Float, nullable=True),
    "valor_tabela": Column(pa.Float, nullable=True),
    "diferenca":  Column(pa.Float, nullable=True),
    "diferenca_percentual": Column(pa.Float, nullable=True),
})

guide_schema = DataFrameSchema({
    "guia":       Column(pa.String),
    "date":       Column(pa.String),
    "codigo":     Column(pa.Int,   Check(lambda s: s > 0)),
    "descricao":  Column(pa.String),
    "papel":      Column(pa.String, Check.isin(["Cirurgião","Anestesista","1º Auxiliar","2º Auxiliar"])),
    "crm":        Column(pa.String, Check.str_matches(r"^\d{1,6}$")),
    "beneficiario": Column(pa.String, nullable=True),
    "qtd":        Column(pa.Int, Check(lambda s: s >= 1)),
    "status":     Column(pa.String, nullable=True),
}) 