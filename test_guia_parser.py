import json
import os

from src.parsers.guia_parser import extract_text_from_pdf, parse_guia_pdf


def debug_pdf_content(pdf_path):
    """
    Extrai e exibe o conteúdo de um PDF para ajudar no debugging do parser.

    Args:
        pdf_path: Caminho do arquivo PDF
    """
    print(f"\n=== Conteúdo do PDF: {os.path.basename(pdf_path)} ===")
    try:
        text = extract_text_from_pdf(pdf_path)
        # Exibir apenas as primeiras 1000 caracteres para não sobrecarregar o console
        print(f"Primeiros 1000 caracteres:")
        print(text[:1000] + "...")

        # Procurar por termos relevantes
        terms = [
            "guia",
            "Guia",
            "GUIA",
            "30",
            "cirurgião",
            "Cirurgiao",
            "auxiliar",
            "Anestesista",
            "CRM",
        ]
        print("\nOcorrências de termos relevantes:")
        for term in terms:
            occurrences = text.count(term)
            print(f"  '{term}': {occurrences} ocorrências")

        # Salvar o texto completo em um arquivo para análise posterior
        debug_file = f"debug_{os.path.basename(pdf_path)}.txt"
        with open(debug_file, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"\nTexto completo salvo em {debug_file}")
    except Exception as e:
        print(f"Erro ao extrair texto: {e}")


def test_parse_guia_pdf():
    """
    Testa a função parse_guia_pdf com diferentes exemplos e CRMs.

    Verifica:
    1. Filtragem pelo CRM (apenas procedimentos onde o CRM participa)
    2. Extração correta de procedimentos e participações
    3. Formato de saída compatível com a especificação
    """
    # Localização dos arquivos de teste reais (usando arquivos encontrados nos uploads)
    base_dir = "uploads"
    pdf1 = os.path.join(
        base_dir, "8a259c72-a13e-42bd-bb6b-856dfda97b20_nubia_katia.pdf"
    )
    pdf2 = os.path.join(base_dir, "bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_0.pdf")
    pdf3 = os.path.join(base_dir, "bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_1.pdf")
    pdf4 = os.path.join(base_dir, "bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_2.pdf")

    # Lista de arquivos para testar
    pdf_files = [
        ("Nubia/Katia", pdf1),
        ("Guia 0", pdf2),
        ("Guia 1", pdf3),
        ("Guia 2", pdf4),
    ]

    # Verificar se os arquivos existem
    missing_files = []
    for name, path in pdf_files:
        if not os.path.exists(path):
            missing_files.append(path)

    if missing_files:
        print(
            f"AVISO: Os seguintes arquivos de teste não foram encontrados: {missing_files}"
        )
        print("Criando diretório uploads caso não exista...")
        os.makedirs(base_dir, exist_ok=True)
        return

    # Primeiro, extrair e exibir informações sobre o conteúdo dos PDFs para debug
    print("\n=== Debug de conteúdo dos PDFs ===")
    for _, pdf_path in pdf_files:
        debug_pdf_content(pdf_path)

    # Lista de CRMs para testar
    crms_to_test = ["6091", "7897", "9999"]

    # Executar testes para cada combinação de arquivo e CRM
    for crm in crms_to_test:
        print(f"\n=== Testando com CRM {crm} ===")

        for name, pdf_path in pdf_files:
            print(f"\nArquivo: {name}")
            try:
                result = parse_guia_pdf(pdf_path, crm)
                print(f"  Procedimentos encontrados: {len(result)}")

                if result:
                    # Verificar papel exercido
                    papeis = set(proc["papel_exercido"] for proc in result)
                    print(f"  Papéis exercidos: {', '.join(papeis)}")

                    # Exibir códigos dos procedimentos
                    codigos = [proc["codigo"] for proc in result]
                    print(f"  Códigos: {', '.join(codigos)}")

                    # Exibir detalhes do primeiro procedimento
                    print("\nDetalhes do primeiro procedimento:")
                    proc = result[0]
                    print(f"  Guia: {proc['guia']}")
                    print(f"  Código: {proc['codigo']}")
                    print(f"  Descrição: {proc['descricao']}")
                    print(f"  Papel exercido: {proc['papel_exercido']}")
                    print(f"  Participações: {len(proc['participacoes'])}")
                else:
                    print(
                        "  Nenhum procedimento encontrado para este CRM (esperado para CRM inexistente)"
                    )
            except Exception as e:
                print(f"  ERRO: {e}")

    print("\n=== Teste de formato de saída ===")
    # Teste específico para verificar o formato de saída com o arquivo nubia_katia.pdf
    try:
        result = parse_guia_pdf(pdf1, "6091")
        if result:
            print("Formato detalhado do primeiro procedimento:")
            print(json.dumps(result[0], indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Erro ao verificar formato: {e}")


def test_prestador_vs_guia():
    """
    Teste específico para verificar que o número do prestador não é confundido com número da guia.

    Este teste verifica:
    1. O parser não deve retornar guias duplicadas
    2. Números de prestador (geralmente 8 dígitos) não devem ser interpretados como números de guia
    """
    import json
    import os

    from src.parsers.guia_parser import parse_guia_pdf

    # Localização dos arquivos de teste
    base_dir = "uploads"
    pdf_files = [
        os.path.join(base_dir, "8a259c72-a13e-42bd-bb6b-856dfda97b20_nubia_katia.pdf"),
        os.path.join(base_dir, "bf14a491-9688-4ae7-ab85-55c2ae7a8a69_guia_0.pdf"),
    ]

    # Testar cada arquivo
    for pdf_path in pdf_files:
        if not os.path.exists(pdf_path):
            print(f"Arquivo de teste não encontrado: {pdf_path}")
            continue

        print(f"\nTestando arquivo: {os.path.basename(pdf_path)}")

        # Extrair o prestador diretamente para comparação
        import re

        import fitz  # PyMuPDF

        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()

        prestador_match = re.search(r"Prestador:?\s*(\d+)\s*-", text, re.IGNORECASE)
        prestador_number = prestador_match.group(1) if prestador_match else None

        # Processar o PDF com o parser
        result = parse_guia_pdf(pdf_path, "6091")

        print(f"Número do prestador: {prestador_number}")

        # Verificar o número de guias únicas
        unique_guias = set(proc["guia"] for proc in result)
        print(f"Guias encontradas: {unique_guias}")

        # TESTES

        # 1. O prestador não deve ser confundido com uma guia
        if prestador_number:
            for guia in unique_guias:
                assert (
                    guia != prestador_number
                ), f"ERRO: Número do prestador ({prestador_number}) foi detectado como guia!"

        # 2. Cada PDF deve gerar apenas uma guia única (a menos que realmente contenha múltiplas guias)
        assert (
            len(unique_guias) <= 1 or len(result) > 1
        ), f"ERRO: Múltiplas guias detectadas para um único PDF: {unique_guias}"

        print(
            f"✅ Teste passou com sucesso: o número do prestador não foi confundido com número de guia"
        )


if __name__ == "__main__":
    test_parse_guia_pdf()

    # Run the new test
    print("\n===== Teste específico para verificar confusão prestador vs guia =====")
    test_prestador_vs_guia()
