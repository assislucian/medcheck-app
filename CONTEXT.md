# CONTEXTO DO MEDCHECK

Este projeto processa PDFs de guias médicas com estrutura padronizada (CBHPM). O parser `guia_parser.py` extrai os procedimentos, associando participações médicas a cada procedimento.

Filtros obrigatórios:

- Apenas procedimentos com CRM do médico logado são retornados.
- Campos obrigatórios: `guia`, `beneficiario`, `prestador`, `papel_exercido`, `participacoes`, `data_execucao`.
- Um PDF = uma única guia. Nunca gerar múltiplas guias erroneamente.
