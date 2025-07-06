Função: Extrair dados tabulares de PDFs de demonstrativos TISS.

Lógica:

1. Tentar extrair com `pdfplumber` usando `extract_tables()`.
2. Se falhar, usar `regex` para capturar linhas com estrutura esperada.
3. Remover linhas com "Total", cabeçalhos duplicados ou vazias.
4. Validar códigos de serviço contra CBHPM ou 10101012.
5. Enriquecer com colunas extras (guia, papel, CRM, status) para possibilitar merge posterior.
