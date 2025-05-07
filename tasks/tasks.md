# Backlog de Tarefas

## TASK-001: Centralizar segredos em variáveis de ambiente
Status: Em Progresso
Prioridade: Alta

### Requisitos
- Remover segredos hardcoded do código
- Usar .env e variáveis de ambiente para JWT, DB, etc

### Critérios de Aceitação
- Nenhum segredo sensível exposto no código
- Documentação de variáveis obrigatórias

---

## TASK-002: Restringir CORS para domínios confiáveis
Status: A Fazer
Prioridade: Alta

### Requisitos
- Permitir apenas domínios do frontend em produção

### Critérios de Aceitação
- CORS seguro em produção

---

## TASK-003: Adicionar CI para testes automatizados
Status: A Fazer
Prioridade: Alta

### Requisitos
- Rodar pytest e Jest a cada push
- Badge de status no README

### Critérios de Aceitação
- Pipeline CI funcionando
- Testes obrigatórios para merge 