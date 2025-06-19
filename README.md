# 🧠 MedCheck SaaS — Plataforma de Auditoria Médica

[![CI](https://github.com/assislucian/medcheck-app/actions/workflows/ci.yml/badge.svg)](https://github.com/assislucian/medcheck-app/actions)

---

## 🚀 Visão Geral

O MedCheck é uma plataforma SaaS para auditoria de guias e demonstrativos médicos, com foco em precisão, segurança, compliance (LGPD) e automação. Permite upload, validação, comparação e exportação de dados médicos, com autenticação JWT e logs de auditoria.

- **Backend:** Python (FastAPI), SQLite/Postgres, autenticação JWT, LGPD endpoints, scripts de backup/restore, logging estruturado, rate limiting.
- **Frontend:** React + TypeScript + Vite, integração via API REST, autenticação, upload e visualização de dados.

---

## 🏗️ Arquitetura & Diferenciais
- Parser avançado de PDFs médicos
- Validação e comparação de demonstrativos
- Gestão de usuários médicos e auditoria
- Exportação/anônimização de dados (LGPD)
- Segurança por padrão (CORS, JWT, rate limit, logs)
- Documentação viva e orientada para AI
- Testes automatizados e scripts de backup

---

## ⚙️ Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/assislucian/medcheck-app.git
cd medcheck-app

# Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e outro em `frontend/` conforme exemplos abaixo:

### Backend (`.env` na raiz)
```
DATABASE_URL=sqlite:///./medicos.db
SECRET_KEY=changeme
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_SECRET=dev-secret-change-me  # Troque em produção por um valor forte e secreto
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000
```

> **Importante:** Nunca versionar `.env`. Sempre use segredos fortes em produção.

---

## 🏃 Como Rodar

### Backend (FastAPI)
```bash
uvicorn src.main:app --reload
```
Acesse: http://localhost:8000/docs

### Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
Acesse: http://localhost:8080

### Docker Compose (opcional, para ambiente integrado)
```bash
docker-compose up --build
```
- Backend: http://localhost:3000
- Banco de dados: Postgres em http://localhost:5432
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

---

## 🚀 Deploy Backend no Railway

1. Crie um projeto no [Railway](https://railway.app/).
2. Conecte o repositório GitHub.
3. Configure as variáveis de ambiente:
   - `DATABASE_URL` (ex: fornecido pelo Railway Postgres)
   - `JWT_SECRET` (valor forte e secreto)
   - `ALGORITHM` (HS256)
   - `ACCESS_TOKEN_EXPIRE_MINUTES` (ex: 480)
4. Configure o comando de start: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
5. Certifique-se de que `requirements.txt` está atualizado.
6. (Opcional) Adicione um serviço Postgres pelo painel Railway.
7. O deploy será feito automaticamente a cada push na branch principal.

> **Dica:** Use o painel de logs do Railway para monitorar o deploy e eventuais erros.

# Deploy Gratuito para Testes no Railway

Este projeto pode ser publicado gratuitamente para testes usando o Railway, permitindo que médicos testem todas as funcionalidades via web.

## Passo a Passo para Deploy Backend (FastAPI) no Railway

### 1. Crie Conta e Projeto
- Acesse https://railway.app/
- Faça login com GitHub.
- Clique em "New Project" e selecione "Deploy from GitHub repo".
- Escolha este repositório.

### 2. Configure o Banco de Dados
- No painel do projeto, clique em "Add Plugin" > "PostgreSQL".
- Copie a string de conexão gerada (ex: `postgresql://...`).

### 3. Configure Variáveis de Ambiente
No painel "Variables" do Railway, adicione:
- `DATABASE_URL` = (cole a string do passo anterior)
- `JWT_SECRET` = (valor forte, ex: `um-segredo-para-teste`)
- `FRONTEND_ORIGINS` = (URL do frontend, ex: `https://seufrontend.vercel.app`)
- `SKIP_AUTH` = `true` (opcional, para testes sem login)
- `CRM_LOGADO` = `6091` (opcional, CRM de teste)

### 4. Deploy
- O Railway detecta o Dockerfile e faz o build automaticamente.
- Após o deploy, acesse a URL pública gerada (ex: `https://medical-honorarium-validator.up.railway.app`).
- Teste a API em `/docs` (Swagger UI).

### 5. Integração com Frontend
- No frontend (Vercel/Netlify/local), configure a variável de ambiente para apontar para a URL do backend Railway:
  - Exemplo (React): `REACT_APP_API_URL=https://medical-honorarium-validator.up.railway.app`

### 6. Observações
- O plano gratuito do Railway pode dormir após inatividade, mas é suficiente para testes.
- Não use dados sensíveis neste ambiente.
- Para dúvidas, consulte a documentação oficial do Railway.

---

## Dicas para Testes
- Use o endpoint `/api/v1/register` para cadastrar médicos.
- Use `/token` para autenticação (ou SKIP_AUTH para pular login).
- Uploads e validações funcionam normalmente.

---

## Suporte
Em caso de dúvidas, abra uma issue ou entre em contato com o time técnico.

---

## 🏗️ Deploy Frontend na Vercel

Veja instruções em `frontend/README.md`.

---

## 🧪 Testes & Lint

### Backend
```bash
pytest           # Testes automatizados
flake8 src/      # Lint
black src/       # Formatação
isort src/       # Imports
```

### Frontend
```bash
cd frontend
npm test         # Testes (Jest)
npm run lint     # Lint (ESLint)
npm run build    # Build de produção
```

---

## 🔐 Autenticação & Segurança
- Autenticação JWT (login via `/token`)
- Rate limiting (SlowAPI)
- CORS restrito (ajuste em produção)
- Logging estruturado e logs de auditoria
- Endpoints LGPD: exportação, anonimização, consentimento
- Nunca exponha segredos no frontend

### Exemplo de login via curl
```bash
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=CRM&password=SENHA&scope=UF"
```

---

## 🚢 Deploy & Boas Práticas
- Deploy backend: AWS EC2/ECS, Supabase, ou Docker
- Deploy frontend: Vercel, Netlify, ou build estático
- Configure variáveis de ambiente e segredos em produção
- Ative HTTPS, backups automáticos e monitore logs
- Siga checklist de segurança e compliance (ver `DEPLOY_PLAN.md`)

---

## 📚 Links Úteis
- [docs/technical.md](docs/technical.md): stack, padrões, variáveis
- [DEPLOY_PLAN.md](DEPLOY_PLAN.md): checklist de deploy seguro
- [.notes/](.notes/): visão geral, tarefas, histórico
- [frontend/README.md](frontend/README.md): guia do frontend

---

## ❓ FAQ
- **Como aponto o frontend para produção?** Edite `VITE_API_URL` no `.env` do frontend.
- **Como faço deploy?** Veja `DEPLOY_PLAN.md`.
- **Como contribuo?** Siga as premissas de segurança, documentação e boas práticas do projeto.
- **Dúvidas?** Consulte `.notes/` ou abra uma issue.

---

## Configuração de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```
cp .env.example .env
```

Preencha as variáveis conforme necessário.

## Healthcheck

O backend expõe o endpoint `/healthz` para verificação de status.

**MedCheck — Healthtech SaaS. Segurança, precisão e compliance em auditoria médica.**
