Função: Cruzar dados das guias e dos demonstrativos.

Lógica:

1. Fazer merge por: `guia`, `codigo`, `crm`, `qtd`.
2. Calcular valor de tabela:
   - código 10101012 = R$ 85,00
   - demais códigos → buscar valor conforme papel na CBHPM.
3. Calcular:
   - diferença = liberado – valor_tabela
   - % diferença = diferença / valor_tabela \* 100
4. Classificar divergências:
   - Sem par no demonstrativo
   - Sem par na guia
   - Diferença percentual > 10% = possível glosa
