# Task List

## Alta Prioridade

- [x] Centralizar segredos em variáveis de ambiente (backend)
- [x] **Limpar arquitetura backend - remover duplicatas e dados mockados** 
- [ ] Restringir CORS para domínios confiáveis
- [ ] Adicionar CI para rodar testes automatizados
- [ ] Melhorar README do frontend com instruções de build/deploy

## Média Prioridade

- [ ] Automatizar geração de directory_structure.md
- [ ] Integrar logs com ferramenta externa (ex: Sentry)
- [ ] Adicionar testes automatizados no frontend

## Baixa Prioridade

- [ ] Avaliar internacionalização e acessibilidade no frontend
- [ ] Documentar scripts de backup/restore

## Concluídas

- [x] Criar .cursorrules e .cursorignore
- [x] Estruturar .notes/ e arquivos principais
- [x] Corrigir vulnerabilidade CVE-2025-48379 no Pillow (atualização 11.2.1 → 11.3.0)
- [x] **Limpar arquitetura backend:**
  - [x] Remover `backend/app.py` (dados mockados)
  - [x] Remover APIs duplicadas (`api_production.py`, `api_simple.py`, etc)
  - [x] Atualizar `requirements.txt` com dependências completas
  - [x] Garantir que Render use `src/api.py` (backend real)
  - [x] Documentar arquitetura limpa em `.notes/backend_architecture.md`
