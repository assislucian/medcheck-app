# 🧑‍💻 MedCheck Frontend — Guia Rápido

**Frontend React + TypeScript + Vite para o MedCheck. Foco em UX, segurança, integração robusta com backend e AI-first.**

---

## 🚀 Instalação e Execução

```bash
# Instale as dependências
cd frontend
npm install  # ou yarn install

# Crie o arquivo de variáveis de ambiente
cp .env.example .env

# Rode o app em modo dev
npm run dev  # ou yarn dev
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
npm run build  # ou yarn build
```
Os arquivos finais estarão em `frontend/dist/`.

## 🧪 Testes
```bash
npm test  # ou yarn test
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
- **Como aponto para o backend de produção?** Edite `VITE_API_URL` no `.env`.
- **Como faço deploy?** Rode `npm run build` e publique o conteúdo de `dist/` em seu host (ex: Vercel, Netlify).
- **Como contribuo?** Siga as premissas de segurança e documentação do projeto.

---
**Dúvidas? Consulte `.notes/meeting_notes.md` ou abra uma issue.**
