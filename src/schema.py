import pandera as pa
from pandera import Check, Column, DataFrameSchema

demo_schema = DataFrameSchema(
    {
        "guia": Column(str, nullable=True),
        "data": Column(str, nullable=True),
        "codigo": Column(int, Check(lambda s: s > 0)),
        "descricao": Column(str),
        "papel": Column(
            str,
            Check.isin(["Cirurgião", "Anestesista", "1º Auxiliar", "2º Auxiliar"]),
            nullable=True,
        ),
        "crm": Column(str, Check.str_matches(r"^\d{1,6}$"), nullable=True),
        "beneficiario": Column(str, nullable=True),
        "qtd": Column(int, Check(lambda s: s >= 1)),
        "status": Column(str, nullable=True),
        "liberado": Column(float, nullable=True),
        "valor_tabela": Column(float, nullable=True),
        "diferenca": Column(float, nullable=True),
        "diferenca_percentual": Column(float, nullable=True),
    }
)

guide_schema = DataFrameSchema(
    {
        "guia": Column(str),
        "data": Column(str),
        "codigo": Column(int, Check(lambda s: s > 0)),
        "descricao": Column(str),
        "papel": Column(
            str,
            Check.isin(["Cirurgião", "Anestesista", "1º Auxiliar", "2º Auxiliar"]),
            nullable=True,
        ),
        "crm": Column(str, Check.str_matches(r"^\d{1,6}$"), nullable=True),
        "beneficiario": Column(str, nullable=True),
        "qtd": Column(int, Check(lambda s: s >= 1)),
        "status": Column(str, nullable=True),
    }
)