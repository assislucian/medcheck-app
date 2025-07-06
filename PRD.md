# Product Requirements Document – MedCheck

## Visão Geral

Sistema de auditoria médica para médicos autônomos e pequenas clínicas. Automatiza a comparação entre demonstrativos de pagamento, guias de procedimentos e a tabela CBHPM 2015.

## Fontes de Dados

- PDFs de demonstrativos TISS
- PDFs de guias com papéis (cirurgião, auxiliar, etc.)
- Tabela CBHPM 2015 (XLSX)

## Funcionalidades-Chave

- Upload de múltiplos arquivos (PDFs)
- Parsing estruturado e via regex
- Comparação dos dados por CRM
- Cálculo de diferença entre valor pago e valor de tabela
- Relatório com casos: sem par, divergente, glosa
- Exportação dos dados
- Histórico por usuário

## Arquitetura

- Frontend: Next.js + Tailwind + TypeScript
- Backend: FastAPI + PostgreSQL
- JWT para autenticação
- Endpoints:
  - POST /api/v1/login
  - POST /api/v1/upload
  - GET /api/v1/history
  - GET /api/v1/history/{id}
