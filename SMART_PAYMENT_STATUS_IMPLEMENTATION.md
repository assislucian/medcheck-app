# Sistema Inteligente de Status de Pagamento - MedCheck

## Visão Geral

Este documento descreve a implementação do sistema inteligente de status de pagamento para o MedCheck, que permite aos médicos acompanhar automaticamente o status de pagamento de seus procedimentos através do cruzamento entre guias médicas e demonstrativos financeiros.

## Funcionalidades Implementadas

### 1. Sistema Hierárquico de Status

O sistema possui **dois níveis de granularidade**:

#### **Status Agregado da Guia (Principal)**

- Exibido na coluna principal da tabela
- Calculado automaticamente baseado no conjunto de todos os procedimentos da guia
- Segue hierarquia de prioridade inteligente
- Informa o médico sobre o estado geral da guia

#### **Status Individual por Procedimento (Secundário)**

- Exibido na tabela expandida de detalhes
- Status específico de cada linha/procedimento
- Permite análise granular procedimento por procedimento
- Base para cálculo do status agregado

### 2. Análise Inteligente de Status de Pagamento

#### Status Disponíveis:

- **💰 Pago**: Procedimento pago integralmente
- **⚠️ Parcialmente Pago**: Valor aprovado menor que o apresentado
- **❌ Glosado**: Procedimento negado (valor aprovado = 0)
- **⏳ Não Pago**: Procedimento encontrado mas sem pagamento
- **📋 Sem Análise**: Engloba procedimentos não encontrados nos demonstrativos ou quando não há demonstrativos carregados

### 3. Lógica Hierárquica de Status Agregado

O status da guia é calculado baseado nos status individuais seguindo esta hierarquia:

```
1. Todos pagos → "💰 Pago"
2. Há glosas + pagamentos → "⚠️ Parcialmente Pago"
3. Apenas glosas → "❌ Glosado"
4. Pagamentos parciais → "⚠️ Parcialmente Pago"
5. Alguns pagos + pendentes → "⚠️ Parcialmente Pago"
6. Sem análise → "📋 Sem Análise"
7. Nenhum pago → "⏳ Não Pago"
```

### 4. Substituição do Status Original

**MUDANÇA IMPORTANTE**: O status original da guia ("Gerado pela execução", "Pendente", etc.) foi substituído pelo status inteligente de pagamento na coluna principal da tabela. Isso permite que o médico faça a gestão financeira diretamente na tela de guias.

### 5. Filtros Simplificados

Os filtros foram otimizados para remover redundâncias:

#### Filtros Anteriores (Removidos):

- ~~Fechada~~
- ~~Pendente~~
- ~~Processada~~
- ~~Gerado pela execução~~
- ~~🔍 Não Encontrado~~
- ~~📄 Sem Demonstrativo~~

#### Filtros Atuais (Simplificados):

- **💰 Pago**: Procedimentos pagos integralmente
- **⚠️ Parcialmente Pago**: Procedimentos com pagamento parcial
- **❌ Glosado**: Procedimentos glosados/negados
- **⏳ Não Pago**: Procedimentos sem pagamento
- **📋 Sem Análise**: Unifica "não encontrado" e "sem demonstrativo"

### 6. Dashboard de Analytics

Painel com métricas consolidadas:

- Taxa de cobertura de demonstrativos
- Total de procedimentos pagos
- Total de glosas identificadas
- Pagamentos parciais detectados

## Implementação Técnica

### Backend (src/api.py)

#### Status Individual por Procedimento:

```python
# Primeiro: Calcular status individual para cada procedimento
individual_procedure_status = {}  # (guia, codigo) -> status_info

for g in guias:
    key = (str(g.numero_guia), str(g.codigo))
    demo_info = demonstrativo_procedures.get(key)

    # Análise inteligente individual
    if demo_info:
        if demo_info["is_paid"]:
            if demo_info["is_partial_payment"]:
                smart_status = "parcialmente_pago"
            else:
                smart_status = "pago"
        else:
            if demo_info["is_full_glosa"]:
                smart_status = "glosado"
            else:
                smart_status = "nao_pago"
    else:
        if demonstrativos:
            smart_status = "nao_encontrado"
        else:
            smart_status = "sem_demonstrativo"

    individual_procedure_status[key] = {
        "status": smart_status,
        "reason": smart_reason,
        "demonstrativo_info": demo_info,
        "has_demonstrativo": len(demonstrativos) > 0
    }
```

#### Status Agregado da Guia:

```python
# Segundo: Calcular status agregado por guia
for guia_num, procs in guide_procedures.items():
    status_counts = {
        'pago': 0, 'parcialmente_pago': 0, 'glosado': 0,
        'nao_pago': 0, 'nao_encontrado': 0, 'sem_demonstrativo': 0
    }

    # Contar status de cada procedimento
    for proc in procs:
        proc_status = proc["smart_payment_status"]["status"]
        if proc_status in status_counts:
            status_counts[proc_status] += 1

    # Aplicar hierarquia de prioridade
    if status_counts['pago'] == total_procs:
        aggregated_status = "pago"
    elif status_counts['glosado'] > 0:
        if status_counts['pago'] > 0 or status_counts['parcialmente_pago'] > 0:
            aggregated_status = "parcialmente_pago"
        else:
            aggregated_status = "glosado"
    # ... outras regras de hierarquia
```

#### Filtro Unificado:

```python
# Filtro unificado para análise pendente
if status == 'sem_analise':
    if smart_status in ['nao_encontrado', 'sem_demonstrativo']:
        procedures_with_smart_status.append(procedure_data)
```

### Frontend

#### Componente PaymentStatusIndicator.tsx:

- Suporte para tamanhos: `xs`, `sm`, `md`, `lg`
- Indicadores visuais inteligentes
- Tooltips detalhados com informações financeiras
- Formatação monetária brasileira
- Cores e ícones específicos por status

#### Página Guides.tsx:

- **Coluna principal**: Usa status agregado da guia (`guide_aggregated_status`)
- **Tabela expandida**: Nova coluna "Status de Pagamento" com status individual por procedimento
- Analytics cards com métricas de pagamento
- Filtros simplificados sem redundância
- Contador de pendentes baseado em análise inteligente

#### FiltersToolbar.tsx:

- Filtros reorganizados por relevância
- Filtro unificado "📋 Sem Análise"
- Remoção de filtros redundantes
- Visual clean e profissional

## Benefícios para o Médico

### 1. Gestão Financeira Hierárquica

- **Visão macro**: Status geral da guia na listagem principal
- **Visão micro**: Status detalhado por procedimento na expansão
- **Inteligência contextual**: O sistema entende que uma guia com 3 procedimentos pagos e 1 glosado deve ser "Parcialmente Pago"

### 2. Interface Optimizada

- **Dois níveis de informação**: Geral e específico
- **Sem poluição visual**: Status relevante onde importa
- **Navegação intuitiva**: Click para expandir e ver detalhes

### 3. Casos de Uso Reais

- **Guia 10714706 - NUBIA KATIA**: 4 procedimentos, 1 glosado → Status agregado "Parcialmente Pago", detalhes mostram qual foi glosado
- **Gestão acionável**: Filtrar por "Glosado" para ver todas as guias com problemas
- **Análise granular**: Expandir para ver exatamente qual procedimento teve glosa

## Fluxo de Uso

1. **Upload de Guias**: Médico carrega guias médicas
2. **Upload de Demonstrativos**: Médico carrega demonstrativos financeiros
3. **Análise Automática**: Sistema cruza automaticamente os dados
4. **Visualização Hierárquica**:
   - Status agregado na coluna principal
   - Status individual na expansão de detalhes
5. **Gestão Acionável**: Médico filtra e expande conforme necessário

## Compatibilidade

### Backward Compatibility

- Sistema mantém compatibilidade com dados existentes
- Fallback para sistema antigo quando necessário
- Migração transparente de funcionalidades

### Preservação de Funcionalidades

- Todas as funcionalidades originais mantidas
- Adição de inteligência sem quebrar fluxos existentes
- Dados históricos preservados

## Métricas de Sucesso

### KPIs Implementados:

- **Taxa de Cobertura**: % de procedimentos com demonstrativos
- **Taxa de Pagamento**: % de procedimentos pagos
- **Taxa de Glosas**: % de procedimentos glosados
- **Valor Total Pago**: Soma dos valores aprovados
- **Procedimentos Pendentes**: Contagem de itens sem análise

## Próximos Passos

### Melhorias Futuras:

1. Alertas automáticos para glosas
2. Relatórios de performance por período
3. Exportação avançada de dados financeiros
4. Integração com sistemas de cobrança
5. Dashboards comparativos de performance
6. **Comparação com CBHPM**: Símbolos para valores acima/abaixo da tabela

## Conclusão

A implementação do sistema inteligente de status de pagamento com hierarquia de dois níveis transforma a página de guias em um centro de gestão financeira completo e inteligente. O médico agora tem:

- **Visão estratégica** com status agregado por guia
- **Controle operacional** com status individual por procedimento
- **Interface limpa** sem redundâncias ou poluição visual
- **Inteligência contextual** que entende cenários reais como guias mistas (pagos + glosados)

O sistema mantém a simplicidade de uso enquanto adiciona camadas de inteligência que automatizam processos manuais complexos, resultando em uma experiência mais eficiente e acionável para o profissional médico.
