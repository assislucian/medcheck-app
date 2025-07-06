Função: Extrair informações estruturadas de guias em PDF.

### Objetivo

- Ler cada ocorrência de procedimento contida na guia, sem supor quantidade fixa.
- Garantir que todos os campos (guia, data, código, descrição, qtd, status, beneficiário, prestador) reflitam exatamente o PDF.

### Fluxo de Parsing

1. **Leitura do cabeçalho**

   - Extrair nome do beneficiário: procurar padrão `Beneficiário: \d+ - (.+)` na primeira página.
   - Extrair prestador: procurar padrão `Prestador: (.+)` na primeira página.

2. **Normalização do texto**

   - Concatenar texto de todas as páginas.
   - Remover quebras de linha após hífen (`-\n` → `''`).
   - Quebras de linha restantes dividem em linhas não vazias.

3. **Detecção de blocos de procedimento**

   - Identificar início de cada procedimento por regex:
     ```regex
     ^(?P<guia>\d{8})\s+(?P<data>\d{2}/\d{2}/\d{4})\s+(?P<codigo>30\d{6})
     ```
   - Cada vez que esse padrão aparecer, iniciar um novo bloco até o próximo.

4. **Extração de campos de procedimento**

   - Dentro de cada bloco, usar regex para capturar exatamente:
     - `guia`, `data`, `codigo`
     - `descricao`: todo texto até o próximo número que corresponda à quantidade antes do status
     - `qtd`: `\d+` imediatamente anterior ao status
     - `status`: texto exato `Gerado pela execução` ou `Fechada`
     ```regex
     (?P<descricao>.+?)\s+(?P<qtd>\d+)\s+(?P<status>Gerado pela execução|Fechada)
     ```

5. **Extração de participações**

   - Ainda no mesmo bloco, localizar a seção “Participação Médico” e, para cada linha que contenha:
     ```regex
     (?P<papel>Anestesista|Cirurgiao|Primeiro Auxiliar|Segundo Auxiliar)\s+(?P<crm>\d+)
     ```
   - Para cada papel+CRM extraído, gerar uma entrada separada para o mesmo procedimento.
   - Não substituir o `status` global do procedimento por status de participação.

6. **Propagação de beneficiário e prestador**

   - Incluir em cada entrada os valores extraídos no cabeçalho.

7. **Filtragem por CRM**
   - Após extrair todos os registros, aplicar filtro final para manter apenas aqueles cujo `crm` corresponda ao médico autenticado.

### Observações

- **Não agrupar nem resumir** procedimentos: cada ocorrência no PDF vira exatamente uma entrada.
- **Campo `qtd`** deve refletir a quantidade por procedimento, não o número de papéis.
- **Manter status** vindo diretamente do PDF (campo `status`), sem substituir pelo status de participação.
