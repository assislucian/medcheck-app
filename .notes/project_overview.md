# Visão Geral do Projeto

## Objetivo
Processar PDFs de guias médicas, extraindo procedimentos e associando participações médicas, com foco em precisão, segurança e compliance (LGPD).

## Arquitetura
- **Backend:** Python (FastAPI), banco SQLite/Postgres, scripts de backup/restore, autenticação JWT, logging estruturado, rate limiting, LGPD endpoints.
- **Frontend:** React + TypeScript + Vite, integração via API REST, autenticação, upload e visualização de dados.

## Módulos Principais
- Parser de PDFs médicos
- Validação e comparação de demonstrativos
- Gestão de usuários médicos
- Auditoria e logs
- Exportação/anônimização de dados (LGPD)

## Diferenciais
- Segurança por padrão
- Documentação viva e orientada para AI
- Testes automatizados e scripts de backup 