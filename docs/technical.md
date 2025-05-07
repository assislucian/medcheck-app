# Documentação Técnica

## Stack
- Backend: Python 3.12, FastAPI, SQLAlchemy, SQLite/Postgres
- Frontend: React, TypeScript, Vite, Tailwind
- Testes: pytest, Jest
- CI/CD: (a definir)

## Padrões e Guidelines
- Sempre documentar funções e endpoints
- Usar tipagem forte (TypeScript, type hints Python)
- Tratar erros e validar entradas/saídas
- Seguir princípios SOLID e DRY
- Testes automatizados obrigatórios para funções críticas

## Decisões Técnicas
- Autenticação JWT
- Rate limiting e brute force protection
- Logging estruturado
- Scripts de backup/restore
- LGPD: endpoints de exportação e anonimização

## Variáveis de Ambiente Obrigatórias
- `JWT_SECRET`: chave secreta para assinar tokens JWT. **Obrigatória em produção**. Defina no arquivo `.env` ou no ambiente do servidor. Em desenvolvimento, um valor padrão seguro é usado, mas não utilize em produção.
- `FRONTEND_ORIGINS`: lista de domínios permitidos para CORS (separados por vírgula). **Obrigatória em produção**. Exemplo: https://app.medcheck.com.br,https://admin.medcheck.com.br. Em dev, permite tudo por padrão.
- `DATABASE_URL`: string de conexão do banco de dados (ex: Postgres, SQLite, etc). **Obrigatória em produção**. Exemplo: postgresql://user:senha@host:5432/db. Em dev, usa SQLite local por padrão. 