import pandas as pd
import pdfplumber
import re
from pathlib import Path

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
    raise KeyError(f"Nenhuma coluna encontrada para padrões: {patterns} em {df.columns.tolist()}")

# Dicionário de padrões para cada coluna essencial
COLUMN_PATTERNS = {
    'codigo':      [r'cód.*serv', r'código(?:\s+serviço)?', r'cód\.? serviço', r'código'],
    'apresentado': [r'apresentado', r'valor apresentado'],
    'liberado':   [r'liberad', r'valor liberado', r'valor pago'],
    'pro_rata':   [r'pro\s*?rata'],
    'glosa':      [r'glosa']
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
    df['codigo'] = df['codigo'].astype(int)
    return df[[
        'codigo',
        'procedimento',
        'valor_cirurgiao',
        'valor_anestesista',
        'valor_primeiro_auxiliar'
    ]]

def parse_demonstrativo(path: Path, user_crm: str) -> pd.DataFrame:
    """
    Extrai dados do PDF de demonstrativo, usando regex linha a linha do texto bruto.
    Só aceita procedimentos cujo código está na CBHPM2015.
    """
    import re
    cbhpm_df = load_cbhpm(Path("data/cbhpm/CBHPM2015_v1.xlsx"))
    valid_codes = set(cbhpm_df['codigo'].astype(str))
    with pdfplumber.open(path) as pdf:
        text = "\n".join(p.extract_text() or '' for p in pdf.pages)
    # Regex para capturar linhas de procedimento (ajustar conforme layout real)
    # Exemplo: Lote Conta Guia Data Carteira Nome Acom. Cód. Serv. Desc. Serv. Qtd. Apresentado Liberado Pro rata Glosa
    pattern = re.compile(
        r'(?P<lote>\d+)\s+(?P<conta>\d+)\s+(?P<guia>\d+)\s+(?P<data>\d{2}/\d{2}/\d{4})\s+(?P<carteira>\d+)\s+(?P<nome>.+?)\s+(?P<acom>\w+)\s+(?P<codigo>\d+)\s+(?P<descricao>.+?)\s+(?P<qtd>\d+)\s+(?P<apresentado>\d+,\d{2})\s+(?P<liberado>\d+,\d{2})\s+(?P<pro_rata>\d+,\d{2})\s+(?P<glosa>\d+,\d{2})',
        re.MULTILINE
    )
    matches = [m.groupdict() for m in pattern.finditer(text)]
    print(f"[Regex] Total de linhas de procedimento extraídas: {len(matches)}")
    df = pd.DataFrame(matches)
    if not df.empty:
        print(f"[Regex] Primeiras 5 linhas extraídas:\n{df.head()}")
    else:
        print("[Regex] Nenhuma linha de procedimento encontrada!")
    # Filtrar apenas códigos válidos da CBHPM
    df['codigo'] = df['codigo'].astype(str)
    df = df[df['codigo'].isin(valid_codes)].copy()
    print(f"[Regex] Após filtro CBHPM, linhas: {len(df)}")
    if not df.empty:
        print(df.head())
    # Renomear e garantir colunas essenciais
    for col in ['guia', 'papel', 'crm', 'beneficiario', 'qtd', 'status']:
        if col not in df.columns:
            df[col] = None
    # Casts e limpeza
    if 'codigo' in df.columns:
        df['codigo'] = pd.to_numeric(df['codigo'], errors='coerce')
        df = df[df['codigo'].notnull()].copy()
        df['codigo'] = df['codigo'].astype(int)
    else:
        raise KeyError("Coluna 'codigo' não encontrada no demonstrativo_df")
    # Merge com CBHPM para trazer valores de tabela
    demo_df = df.merge(
        cbhpm_df,
        on="codigo",
        how="left"
    )
    # Calcula valor_tabela de acordo com o papel
    def valor_por_papel(row):
        if row['papel'] == 'Cirurgião':
            return row['valor_cirurgiao']
        elif row['papel'] == 'Anestesista':
            return row['valor_anestesista']
        elif row['papel'] == '1º Auxiliar':
            return row['valor_primeiro_auxiliar']
        elif row['papel'] == '2º Auxiliar':
            return row['valor_primeiro_auxiliar']
        return None
    demo_df['valor_tabela'] = demo_df.apply(valor_por_papel, axis=1)
    # Garante que 'liberado' e 'valor_tabela' são float
    if 'liberado' in demo_df.columns:
        demo_df['liberado'] = pd.to_numeric(demo_df['liberado'], errors='coerce').fillna(0.0)
    else:
        demo_df['liberado'] = 0.0
    if 'valor_tabela' in demo_df.columns:
        demo_df['valor_tabela'] = pd.to_numeric(demo_df['valor_tabela'], errors='coerce').fillna(0.0)
    else:
        demo_df['valor_tabela'] = 0.0
    # Calcula diferença e diferença percentual
    demo_df['diferenca'] = demo_df['liberado'] - demo_df['valor_tabela']
    demo_df['diferenca_percentual'] = demo_df['diferenca'].astype(float) / demo_df['valor_tabela'].replace(0, float('nan')) * 100
    demo_df['diferenca_percentual'] = demo_df['diferenca_percentual'].round(2).fillna(0.0)
    print(f"[DEBUG] DataFrame final antes do return, linhas: {len(demo_df)}\n{demo_df.head()}")
    return demo_df

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

def compare_demonstrative_with_guides(demo_df: pd.DataFrame, guides_df: pd.DataFrame) -> dict:
    """Compara o demonstrativo com as guias e retorna um dicionário com as discrepâncias."""
    # Agrupa por código e soma os valores
    demo_grouped = demo_df.groupby('codigo').agg({
        'liberado': 'sum',
        'valor_tabela': 'first',  # Pega o primeiro valor da tabela (deve ser o mesmo para todos)
        'diferenca': 'sum',
        'diferenca_percent': 'mean'  # Média das diferenças percentuais
    }).reset_index()
    
    guides_grouped = guides_df.groupby('codigo').agg({
        'liberado': 'sum'
    }).reset_index()
    
    # Encontra procedimentos que estão em um mas não no outro
    demo_codes = set(demo_grouped['codigo'])
    guides_codes = set(guides_grouped['codigo'])
    
    only_in_demo = demo_codes - guides_codes
    only_in_guides = guides_codes - demo_codes
    
    # Encontra procedimentos com valores diferentes
    merged = pd.merge(demo_grouped, guides_grouped, on='codigo', how='outer', suffixes=('_demo', '_guides'))
    different_values = merged[merged['liberado_demo'] != merged['liberado_guides']]
    
    return {
        'only_in_demo': list(only_in_demo),
        'only_in_guides': list(only_in_guides),
        'different_values': different_values.to_dict('records') if not different_values.empty else [],
        'demo_total': demo_grouped['liberado'].sum(),
        'guides_total': guides_grouped['liberado'].sum()
    }

def parse_guide_pdf(path, user_crm: str) -> pd.DataFrame:
    from pathlib import Path
    path = Path(path)  # Garante que path é um objeto Path
    import re
    import pdfplumber
    import pandas as pd
    text = ""
    with pdfplumber.open(path) as pdf:
        for p in pdf.pages:
            txt = p.extract_text(x_tolerance=1, y_tolerance=1) or ""
            text += txt + "\n"

    # Split em blocos que começam com GUIA (8 dígitos) + DATA
    blocks = re.split(r'(?m)(?=^\s*(\d{8})\s+\d{2}/\d{2}/\d{4})', text)
    total_blocos = max(0, len(blocks) - 1)
    records = []

    papel_map = {
        r'Cirurgiao': 'Cirurgião',
        r'Anestesista': 'Anestesista',
        r'Primeiro Auxiliar': '1º Auxiliar',
        r'Segundo Auxiliar': '2º Auxiliar'
    }

    for blk in blocks[1:]:  # ignora o preâmbulo
        # extrai guia, data, código, descrição, quantidade e status
        m = re.match(
            r'^\s*(?P<guia>\d{8})\s+(?P<date>\d{2}/\d{2}/\d{4})\s+'
            r'(?P<code>30\d{6})\s+(?P<desc>.+?)\s+(?P<qtd>\d+)\s+(?P<status>\w+)',
            blk, re.DOTALL | re.MULTILINE
        )
        if not m:
            continue
        guia = m.group('guia')
        codigo = m.group('code')
        desc = m.group('desc').strip()
        date = m.group('date')
        qtd = m.group('qtd')
        status = m.group('status')

        # Beneficiário: procurar linha com "Beneficiário: ... - NOME PACIENTE"
        beneficiario = ''
        bmatch = re.search(r'Benefici[áa]rio: [^\-]+- ([A-ZÇÁÉÍÓÚÂÊÔÃÕÜ\s]+)', blk)
        if bmatch:
            beneficiario = bmatch.group(1).strip()

        # detecta papel dentro do bloco
        papel = None
        for pat, nome in papel_map.items():
            if re.search(rf'{pat}\s+{user_crm}\b', blk, re.IGNORECASE):
                papel = nome
                break

        if papel:
            records.append({
                'guia': guia,
                'date': date,
                'codigo': int(codigo),
                'descricao': desc,
                'papel': papel,
                'crm': user_crm,
                'beneficiario': beneficiario,
                'qtd': int(qtd),
                'status': status
            })

    df = pd.DataFrame(records)
    print(f"[parse_guide_pdf] {path.name}: {total_blocos} blocos de guia detectados, {len(df)} procedimentos para CRM {user_crm}")
    return df

def main():
    user_crm = "6091"  # ou conforme seu fluxo de autenticação
    # 1. Carrega CBHPM e demonstrativo
    cbhpm = load_cbhpm(Path("data/cbhpm/CBHPM2015_v1.xlsx"))
    demonstrativo_df = parse_demonstrativo(
        Path("data/demonstrativos/Demonstrativo-outubro_2024.pdf"),
        user_crm
    )

    # Renomeia coluna de código se necessário
    if 'Cód. Serv.' in demonstrativo_df.columns and 'codigo' not in demonstrativo_df.columns:
        demonstrativo_df = demonstrativo_df.rename(columns={'Cód. Serv.': 'codigo'})

    # Garante todas as colunas necessárias para o merge
    for col in ['guia', 'papel', 'crm', 'beneficiario', 'qtd', 'status']:
        if col not in demonstrativo_df.columns:
            demonstrativo_df[col] = None

    # Garante que só temos códigos válidos antes de converter
    if 'codigo' in demonstrativo_df.columns:
        demonstrativo_df = demonstrativo_df[demonstrativo_df['codigo'].notnull()].copy()
        demonstrativo_df = demonstrativo_df[demonstrativo_df['codigo'].astype(str).str.isdigit()].copy()
        demonstrativo_df['codigo'] = demonstrativo_df['codigo'].astype(int)
    else:
        raise KeyError("Coluna 'codigo' não encontrada no demonstrativo_df")

    # 2. Processa guias (já usando o parse_guide_pdf com date, beneficiario, qtd, status)
    guides_df = process_guides(Path("data/guias"), user_crm)

    # Força tipos das chaves de merge
    for df in [guides_df, demonstrativo_df]:
        df['guia'] = df['guia'].astype(str)
        df['codigo'] = df['codigo'].astype(int)
        df['papel'] = df['papel'].astype(str)
        df['crm'] = df['crm'].astype(str)

    print("Chaves de merge nas guias:")
    print(guides_df[['guia','codigo','papel','crm']].drop_duplicates())
    print("Chaves de merge no demonstrativo:")
    print(demonstrativo_df[['guia','codigo','papel','crm']].drop_duplicates())

    # 3. Gera comparison_df com todos os campos
    comparison_df = guides_df.merge(
        demonstrativo_df[['guia','codigo','papel','crm','liberado','valor_tabela']],
        on=['guia','codigo','papel','crm'],
        how='left',
        validate='many_to_one'
    )

    print("Colunas do comparison_df:", comparison_df.columns.tolist())
    print(comparison_df.head())

    # Garante que as colunas existem
    if 'liberado' not in comparison_df.columns or 'valor_tabela' not in comparison_df.columns:
        raise KeyError(f"Colunas faltando após merge: {set(['liberado','valor_tabela']) - set(comparison_df.columns)}")

    # 4. Cálculos de diferença
    comparison_df['diferenca'] = comparison_df['liberado'] - comparison_df['valor_tabela']
    comparison_df['diferenca_percentual'] = (
        comparison_df['diferenca'] / comparison_df['valor_tabela'] * 100
    ).round(2)

    # 5. Validação de schema e assertions de sanidade
    from src.schema import demo_schema, guide_schema
    guide_schema.validate(guides_df)
    demo_schema.validate(comparison_df)
    assert 'codigo' in demonstrativo_df.columns
    assert all(demonstrativo_df['codigo'].astype(str).str.isdigit())
    assert set(guides_df['papel']).issubset({"Cirurgião","Anestesista","1º Auxiliar","2º Auxiliar"})
    assert comparison_df['liberado'].notna().sum() > 0, "Nenhuma correspondência entre demonstrativo e guias!"

    # 6. Relatório final
    print("=== Relatório Cross-Check ===")
    print(f"Total de linhas nas guias: {len(guides_df)}")
    print(f"Merge OK: {comparison_df['liberado'].notna().sum()}")
    print(f"Sem correspondência: {comparison_df['liberado'].isna().sum()}")
    print(comparison_df.to_string(index=False,
        columns=['guia','date','codigo','descricao','papel','crm',
                 'beneficiario','qtd','status','liberado','valor_tabela',
                 'diferenca','diferenca_percentual']))

# === Removido: API FastAPI mínima para uso com Uvicorn ===

if __name__ == "__main__":
    main()
    # Utilitário temporário para debug: extrair texto de noivana.pdf
    guia_path = Path("data/guias/noivana.pdf")
    with pdfplumber.open(guia_path) as pdf:
        texto = "\n".join([p.extract_text() or '' for p in pdf.pages])
    print("\n[DEBUG] Primeiros 500 caracteres do texto extraído de noivana.pdf:\n")
    print(texto[:500])
    print("\n--- FIM DO TRECHO ---\n")
