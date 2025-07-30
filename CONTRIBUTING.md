# Guia de Contribuição

## 🎯 Como Contribuir

Obrigado pelo interesse em contribuir com o MedCheck! Este projeto segue padrões profissionais de desenvolvimento.

## 📋 Antes de Começar

1. **Leia a documentação**:

   - [README.md](README.md) - Visão geral do projeto
   - [SECURITY.md](SECURITY.md) - Políticas de segurança
   - [.notes/project_overview.md](.notes/project_overview.md) - Detalhes técnicos

2. **Configure o ambiente**:

   ```bash
   # Clone o repositório
   git clone https://github.com/assislucian/medcheck-app.git
   cd medcheck-app

   # Copie e configure variáveis de ambiente
   cp env.example .env

   # Backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   pip install -r requirements-dev.txt

   # Frontend
   cd frontend && npm install
   ```

## 🔄 Fluxo de Trabalho

### 1. Crie uma Branch

```bash
# Convenção: tipo/descrição-breve
git checkout -b feature/nova-funcionalidade
git checkout -b bugfix/corrige-validacao
git checkout -b docs/atualiza-readme
```

### 2. Faça suas Alterações

- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Mantenha commits atômicos e descritivos

### 3. Teste Localmente

```bash
# Backend
pytest -v
flake8 src/
black src/
isort src/

# Frontend
cd frontend
npm run lint
npm run test
npm run build
```

### 4. Abra um Pull Request

- Use o template de PR
- Descreva claramente as mudanças
- Marque os revisores apropriados
- Aguarde aprovação antes do merge

## 🚀 Tipos de Contribuição

### 🐛 Correção de Bugs

1. Verifique se já existe uma issue
2. Reproduza o bug localmente
3. Corrija e adicione teste regressivo
4. Documente a correção no PR

### ✨ Novas Funcionalidades

1. Discuta a proposta em uma issue primeiro
2. Implemente seguindo os padrões
3. Adicione documentação
4. Inclua testes abrangentes

### 📚 Documentação

1. Use Markdown claro e objetivo
2. Inclua exemplos práticos
3. Mantenha consistência com docs existentes
4. Teste instruções antes do PR

### 🔒 Segurança

- Para vulnerabilidades, veja [SECURITY.md](SECURITY.md)
- Sempre teste mudanças de segurança
- Documente impactos no PR

## 🎨 Padrões de Código

### Backend (Python)

```python
# Use type hints
def processar_guia(guia_data: dict) -> dict:
    """Processa dados de uma guia médica.

    Args:
        guia_data: Dados da guia em formato dict

    Returns:
        Dados processados da guia
    """
    # Implementação...
```

### Frontend (TypeScript)

```typescript
// Use interfaces para tipagem
interface GuiaData {
  numero: string;
  data: string;
  procedimentos: Procedimento[];
}

// Componentes funcionais com hooks
const GuiaCard: React.FC<{ guia: GuiaData }> = ({ guia }) => {
  // Implementação...
};
```

## 🧪 Testes

### Backend

```bash
# Testes unitários
pytest tests/unit/

# Testes de integração
pytest tests/integration/

# Coverage
pytest --cov=src tests/
```

### Frontend

```bash
# Testes unitários
npm run test:unit

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Mensagens de Commit

Use o padrão Conventional Commits:

```
tipo(escopo): descrição breve

feat(api): adicionar endpoint de exportação LGPD
fix(parser): corrigir validação de CPF
docs(readme): atualizar instruções de instalação
test(parser): adicionar testes para edge cases
refactor(auth): melhorar estrutura de validação JWT
```

## 🔍 Processo de Review

### Para Revisores

- ✅ Funcionalidade funciona conforme esperado
- ✅ Código segue padrões do projeto
- ✅ Testes passam e cobrem mudanças
- ✅ Documentação atualizada se necessário
- ✅ Sem vazamentos de segurança

### Para Contribuidores

- Responda feedback construtivamente
- Faça ajustes solicitados
- Teste novamente após mudanças
- Seja paciente com o processo

## 🤝 Código de Conduta

- Seja respeitoso e profissional
- Foque nas ideias, não nas pessoas
- Aceite feedback construtivo
- Mantenha discussões técnicas e objetivas

## 🆘 Precisa de Ajuda?

- 📧 Email: dev@medcheck.com.br
- 💬 Discussions do GitHub
- 📱 Slack: #medcheck-dev
- 📋 Issues para dúvidas técnicas

## 🏆 Reconhecimento

Contribuidores são reconhecidos:

- 📜 CONTRIBUTORS.md
- 🎯 Release notes
- 💫 GitHub contributors graph
- 🏅 Badges especiais para contributors frequentes

---

💡 **Dica**: Para dúvidas sobre arquitetura ou design decisions, consulte a pasta [.notes/](.notes/) que contém contexto detalhado do projeto.
