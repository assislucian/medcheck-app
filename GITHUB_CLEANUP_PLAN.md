# 🧹 PLANO DE LIMPEZA DO REPOSITÓRIO GITHUB

## 🎯 **OBJETIVOS:**

- Remover branches desnecessários
- Limpar arquivos problemáticos commitados
- Organizar estrutura do repositório
- Implementar melhores práticas

## 🚨 **PROBLEMAS IDENTIFICADOS:**

### **1. BRANCHES DESNECESSÁRIOS (28+):**

```
remotes/origin/dependabot/* (23 branches)
remotes/origin/codex/* (4 branches)
remotes/origin/cursor/* (1 branch)
remotes/origin/3275h7-codex/* (1 branch)
feat/ui-harmonizacao (local, não utilizado)
```

### **2. ARQUIVOS PROBLEMÁTICOS:**

- ❌ `.coverage` (commitado - deveria estar só no .gitignore)
- ❌ Histórico pode conter `.env` files sensíveis

### **3. ESTRUTURA:**

- Falta de organização em tags/releases
- Commits recentes muito fragmentados
- Documentação espalhada

## 🔧 **AÇÕES RECOMENDADAS:**

### **FASE 1: LIMPEZA DE BRANCHES**

```bash
# 1. Remover branches locais desnecessários
git branch -D feat/ui-harmonizacao

# 2. Remover branches remotos do Dependabot (via GitHub)
# - Usar GitHub CLI ou interface web
# - Manter apenas branches ativas (main)

# 3. Configurar auto-merge para PRs do Dependabot
```

### **FASE 2: LIMPEZA DE ARQUIVOS**

```bash
# 1. Remover .coverage do histórico
git filter-branch --index-filter 'git rm --cached --ignore-unmatch .coverage' HEAD

# 2. Verificar se há .env files no histórico
git log --all --full-history -- "*.env"

# 3. Adicionar ao .gitignore se necessário (já está ✅)
```

### **FASE 3: ORGANIZAÇÃO**

```bash
# 1. Criar tag para versão atual
git tag -a v1.0.0 -m "Versão inicial estável com Blueprint"

# 2. Organizar documentação
# 3. Criar releases no GitHub
```

### **FASE 4: CONFIGURAÇÕES DE REPOSITÓRIO**

```yaml
# .github/dependabot.yml - Auto-merge
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 3

  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 3
```

## ⚠️ **AÇÕES IMEDIATAS:**

### **CRÍTICO - EXECUTAR AGORA:**

1. ✅ Remover `.coverage` do repositório
2. ✅ Limpar branches locais não utilizados
3. ✅ Configurar proteções da branch main

### **IMPORTANTE - PRÓXIMOS PASSOS:**

1. 📋 Remover branches remotos via GitHub
2. 📋 Criar tag v1.0.0 para marco atual
3. 📋 Configurar auto-merge do Dependabot
4. 📋 Organizar documentação

## 🎯 **RESULTADO ESPERADO:**

- Repositório limpo com apenas branch `main`
- Sem arquivos problemáticos no histórico
- Documentação organizada
- Configurações de CI/CD otimizadas
- Histórico mais limpo e profissional

## 📊 **MÉTRICAS DE SUCESSO:**

- **Branches:** De 28+ para 1-2 (main + dev se necessário)
- **Tamanho:** Redução do repositório após limpeza
- **Organização:** Documentação centralizada
- **Automação:** Dependabot configurado com auto-merge
