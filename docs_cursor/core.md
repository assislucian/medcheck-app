Projeto MedCheck: plataforma de auditoria médica automatizada para comparar demonstrativos TISS e guias de procedimentos com a tabela CBHPM 2015. O sistema filtra dados com base no CRM do médico logado.

Regras principais:

- Todos os dados devem ser filtrados pelo CRM.
- Consultas (código 10101012) têm valor fixo de R$ 85,00.
- Utilize FastAPI com Pydantic no backend.
- Frontend em Next.js + Tailwind CSS + shadcn/ui.
- Relatórios devem identificar divergências entre demonstrativos e guias.
- Tabela CBHPM é a base de comparação.
