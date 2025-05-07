# 🧠 MedCheck Backend — Guia Rápido

[![CI](https://github.com/SEU_USUARIO/SEU_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU_USUARIO/SEU_REPO/actions)

---

## ⚠️ Premissas e Regras de Ouro

**Atenção! Este projeto está em produção. Nunca:**
- Apague ou reescreva funções inteiras sem ordem explícita.
- Alterne o nome de funções principais como `parse_guia_pdf`, `associate_participations_to_procedures` ou `load_reference_matrix`.
- Modifique parâmetros de servidor no backend sem validação.
- Gere múltiplos arquivos auxiliares sem necessidade.

**Você deve sempre:**
- Explicar sua intenção antes de aplicar qualquer refatoração.
- Operar como um engenheiro de software profissional com foco em precisão médica e segurança jurídica.
- Priorizar legibilidade, documentação e compatibilidade com os dados dos PDFs reais.

**Sobre `parse_guia_pdf()`:**
- Ela é a função central do projeto.
- Toda modificação precisa preservar:
  - Filtro por CRM obrigatório
  - Associação de procedimentos com participações
  - Beneficiário, Prestador, Papel Exercido

**Formato de saída esperado:**
- Cada procedimento retornado deve conter:
  - guia, data_execucao, codigo, descricao, quantidade, beneficiario, prestador, papel_exercido, participacoes[]

**Em caso de dúvida, pergunte no chat do projeto antes de agir.**

**Validador de demonstrativos e guias médicas com foco em precisão, segurança, LGPD e automação AI-first.**

---

## 🚀 Instalação Rápida

```bash
# Clone o repositório
 git clone https://github.com/SEU_USUARIO/SEU_REPO.git
 cd backend_test

# Crie e ative o ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

## ⚙️ Variáveis de Ambiente Obrigatórias
Crie um arquivo `.env` na raiz com:
```
JWT_SECRET=chave-secreta-forte
DATABASE_URL=sqlite:///medicos.db  # ou sua string Postgres
FRONTEND_ORIGINS=http://localhost:5173,https://app.medcheck.com.br
ENV=dev  # ou prod
```
Veja detalhes em `docs/technical.md`.

## 🏃 Como Rodar
```bash
uvicorn src.api:app --reload
```
Acesse: http://localhost:8000/docs

## 🧪 Testes
```bash
pytest
```

## 🛡️ CI/CD
- Pipeline GitHub Actions: roda testes backend/frontend, lint e build a cada push/PR.
- Badge de status no topo deste README.

## 🤖 AI & Contribuição
- Siga as regras de `.cursorrules` e `.notes/` para máxima eficiência com Cursor AI.
- Sempre documente funções e preserve tipagem/segurança.

## 📚 Links Úteis
- [docs/technical.md](docs/technical.md): stack, padrões, variáveis.
- [docs/status.md](docs/status.md): progresso e features.
- [DEPLOY_PLAN.md](DEPLOY_PLAN.md): checklist de deploy seguro.
- [.notes/](.notes/): visão geral, tarefas, histórico.

## ❓ FAQ
- **Como configuro o banco?** Use `DATABASE_URL` para Postgres ou SQLite.
- **Como limito CORS?** Defina `FRONTEND_ORIGINS` com os domínios permitidos.
- **Como rodar em produção?** Defina `ENV=prod` e todas as variáveis obrigatórias.

---
**Em caso de dúvida, consulte `.notes/meeting_notes.md` ou abra uma issue.**