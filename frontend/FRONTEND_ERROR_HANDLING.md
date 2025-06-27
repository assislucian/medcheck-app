# Tratamento Robusto de Erros no Frontend

## Problema Identificado

O erro `SyntaxError: The string did not match the expected pattern` estava ocorrendo porque:

1. **API retornando HTML em vez de JSON**: Quando há erros 401/403/404, o servidor às vezes retorna páginas HTML de erro
2. **Token JWT expirado**: Causando redirecionamentos para páginas de login HTML
3. **Parsing inadequado**: Tentativa de fazer `JSON.parse()` em respostas não-JSON

## Solução Implementada

### 1. Utilitário de Tratamento de Erros (`utils/errorHandler.ts`)

**Principais funcionalidades:**

- Detecção inteligente de tipo de resposta (JSON vs HTML)
- Extração de mensagens de erro de páginas HTML
- Tratamento específico para erros de autenticação
- Wrapper seguro para fetch (`safeFetch`)

**Uso básico:**

```typescript
import { safeFetch, useApiErrorHandler } from '../utils/errorHandler';

// Em vez de fetch normal
const data = await safeFetch('/api/v1/profile', {
  headers: { Authorization: `Bearer ${token}` },
});

// Para tratar erros
const { handleError } = useApiErrorHandler();
try {
  // ... chamada da API
} catch (error) {
  const errorDetails = handleError(error);
  if (errorDetails.isAuthError) {
    // Redirecionar para login
  }
}
```

### 2. Hook Customizado (`hooks/useProfileData.ts`)

**Benefícios:**

- Carregamento paralelo de dados (perfil + dashboard)
- Tratamento robusto de erros
- Estado de loading consistente
- Função de retry

**Uso:**

```typescript
import { useProfileData } from '../hooks/useProfileData';

const MyComponent = () => {
  const { profile, dashboard, isLoading, error, isAuthError, refetch } = useProfileData();

  if (isAuthError) {
    // Mostrar tela de login
  }

  if (error) {
    // Mostrar erro com botão de retry
  }

  return (
    // Renderizar dados
  );
};
```

### 3. Componente de Erro (`components/ui/ErrorMessage.tsx`)

**Características:**

- UI consistente para diferentes tipos de erro
- Ações contextuais (login, retry)
- Indicadores visuais apropriados

**Exemplo:**

```typescript
<ErrorMessage
  error="Sessão expirada"
  isAuthError={true}
  onLogin={() => navigate('/login')}
/>
```

## Implementação nos Componentes Existentes

### Para corrigir componentes com erro:

1. **Substitua fetch direto por safeFetch:**

```typescript
// ❌ Antes
const response = await fetch('/api/v1/profile');
const data = await response.json(); // Pode falhar!

// ✅ Depois
import { safeFetch } from '../utils/errorHandler';
const data = await safeFetch('/api/v1/profile');
```

2. **Use o hook useProfileData:**

```typescript
// ❌ Antes
const [profile, setProfile] = useState(null);
useEffect(() => {
  fetch('/api/v1/profile')
    .then((res) => res.json()) // Pode falhar!
    .then(setProfile);
}, []);

// ✅ Depois
const { profile, isLoading, error } = useProfileData();
```

3. **Implemente tratamento de erro visual:**

```typescript
if (error) {
  return (
    <ErrorMessage
      error={error}
      isAuthError={isAuthError}
      onRetry={refetch}
      onLogin={() => navigate('/login')}
    />
  );
}
```

## Migração dos Componentes Problemáticos

### ActivitySummary.tsx

```typescript
// Substitua a lógica de fetch por:
const { dashboard, isLoading, error } = useProfileData();
```

### ProfileDashboard.tsx

```typescript
// Use o hook centralizado:
const { profile, dashboard, isLoading, error, isAuthError, refetch } = useProfileData();

// Trate erros adequadamente:
if (isAuthError) return <ErrorMessage isAuthError onLogin={handleLogin} />;
if (error) return <ErrorMessage error={error} onRetry={refetch} />;
```

### use-profile-form.ts

```typescript
// Para operações de formulário, use safeFetch:
import { safeFetch } from '../utils/errorHandler';

const updateProfile = async (data) => {
  try {
    return await safeFetch('/api/v1/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  } catch (error) {
    const errorDetails = handleError(error);
    // Trate erro apropriadamente
  }
};
```

## Benefícios da Solução

✅ **Erro robusto**: Não mais "string did not match expected pattern"  
✅ **UX melhorada**: Mensagens de erro claras e ações úteis  
✅ **Código limpo**: Lógica de erro centralizada  
✅ **Manutenibilidade**: Fácil de atualizar e debugar  
✅ **Consistência**: Comportamento uniforme em toda aplicação

## Testes

Para testar a solução:

1. **Simule token expirado**: Modifique o token no localStorage
2. **Desconecte internet**: Teste comportamento offline
3. **Force erro 500**: Configure backend para retornar erro
4. **Teste resposta HTML**: Configure servidor para retornar HTML em endpoint JSON

Todos os cenários devem ser tratados adequadamente com mensagens apropriadas.
