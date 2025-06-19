# 🧑‍💻 MedCheck Frontend — Guia Rápido

**Frontend React + TypeScript + Vite para o MedCheck. Foco em UX, segurança, integração robusta com backend e AI-first.**

---

## 🚀 Instalação e Execução

```bash
# Instale as dependências
cd frontend
npm install

# Crie o arquivo de variáveis de ambiente
cp .env.example .env

# Rode o app em modo dev
npm run dev
```
Acesse: http://localhost:5173

## ⚙️ Variáveis de Ambiente
Exemplo de `.env`:
```
VITE_API_URL=http://localhost:8000
```
- Configure para apontar para o backend correto (local ou produção).

## 🏗️ Build e Deploy
```bash
npm run build
```
Os arquivos finais estarão em `frontend/dist/`.

### Deploy na Vercel (Recomendado)
1. Faça login em [vercel.com](https://vercel.com/) e conecte o repositório.
2. No painel do projeto, configure a variável de ambiente `VITE_API_URL` para o endpoint do backend (ex: https://api.medcheck.com.br).
3. O build será feito automaticamente (`npm run build`).
4. O domínio será provisionado automaticamente, ou configure o seu domínio customizado.
5. **Nunca exponha segredos no frontend.**

## 🧪 Testes
```bash
npm test
```

## 🤖 Premissas e Segurança
- Nunca exponha segredos no frontend.
- Sempre valide dados no backend.
- Siga as regras de `.cursorrules` e `.notes/` para máxima eficiência com AI.

## 🔗 Integração Backend
- O frontend consome a API do backend MedCheck (ver `VITE_API_URL`).
- Autenticação JWT, upload de arquivos, LGPD, etc.

## 📚 Links Úteis
- [../README.md](../README.md): guia do backend
- [docs/technical.md](../docs/technical.md): stack, padrões, variáveis
- [.notes/](../.notes/): visão geral, tarefas, histórico

## ❓ FAQ
- **Como aponto para o backend de produção?** Edite `VITE_API_URL` no `.env` ou no painel Vercel.
- **Como faço deploy?** Conecte o repositório na Vercel e configure as variáveis de ambiente.
- **Como contribuo?** Siga as premissas de segurança e documentação do projeto.

---
**Dúvidas? Consulte `.notes/meeting_notes.md` ou abra uma issue.**

## Configuração de Ambiente

Crie um arquivo `.env` na raiz do frontend com base no `.env.example`:

```
cp .env.example .env
```

Preencha a variável `VITE_API_URL` com a URL do backend (ex: https://medcheck-app.up.railway.app)
