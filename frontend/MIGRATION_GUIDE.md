# Guia de Migração - Tratamento de Erros Frontend

Este guia demonstra como migrar componentes problemáticos para usar o novo sistema de tratamento de erros.

## Problemas Corrigidos

✅ **ActivitySummary.tsx** - Erro na linha 53  
✅ **ProfileDashboard.tsx** - Erro na linha 84  
✅ **use-profile-form.ts** - Erro na linha 54

## Padrões de Migração

### 1. Componentes com chamadas diretas de API

**ANTES (problemático):**

```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/v1/endpoint', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ⚠️ PROBLEMA: Tentativa de JSON.parse em HTML de erro
      const data = await response.json(); // SyntaxError aqui!
      setData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  fetchData();
}, []);
```

**DEPOIS (corrigido):**

```tsx
import { useProfileData } from '@/hooks/useProfileData';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const MyComponent = () => {
  const { dashboardData, profileData, loading, error, retryProfile } = useProfileData();

  if (error) {
    return <ErrorMessage error={error} onRetry={retryProfile} />;
  }

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return <div>{/* Usar dashboardData e profileData */}</div>;
};
```

### 2. Hooks personalizados com fetch

**ANTES (problemático):**

```ts
const useMyData = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/data', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ⚠️ PROBLEMA: Não verifica se response.ok
      const result = await response.json(); // Pode falhar!
      setData(result);
    };

    load();
  }, []);

  return { data };
};
```

**DEPOIS (corrigido):**

```ts
import { fetchWithAuth } from '@/utils/errorHandler';

const useMyData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithAuth('/api/v1/data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, error, retry: loadData };
};
```

### 3. Formulários com submissão

**ANTES (problemático):**

```tsx
const onSubmit = async (formData) => {
  try {
    const response = await fetch('/api/v1/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    // ⚠️ PROBLEMA: Pode receber HTML de erro
    const result = await response.json();
    toast.success('Sucesso!');
  } catch (err) {
    toast.error('Erro!');
  }
};
```

**DEPOIS (corrigido):**

```tsx
import { fetchWithAuth, handleApiError } from '@/utils/errorHandler';

const onSubmit = async (formData) => {
  try {
    const response = await fetchWithAuth('/api/v1/submit', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    toast.success('Sucesso!');
  } catch (error) {
    const message = handleApiError(error);
    toast.error(message);
  }
};
```

## Utilitários Disponíveis

### 1. `fetchWithAuth(url, options)`

- Adiciona automaticamente o token de autorização
- Verifica `response.ok` antes de retornar
- Lança erros apropriados para diferentes status HTTP

### 2. `handleApiError(error)`

- Detecta se a resposta é HTML ou JSON
- Extrai mensagens de erro de páginas HTML
- Retorna mensagens amigáveis ao usuário

### 3. `useProfileData()`

- Hook centralizado para dados de perfil e dashboard
- Carregamento paralelo otimizado
- Tratamento de erro integrado
- Funções de retry incluídas

### 4. `<ErrorMessage />`

- Componente consistente para exibir erros
- Botões contextuais (login/retry)
- Detecção automática do tipo de erro

## Checklist de Migração

Para migrar um componente problemático:

- [ ] Substituir `fetch` manual por `fetchWithAuth`
- [ ] Usar `useProfileData` se precisar de dados de perfil/dashboard
- [ ] Substituir tratamento de erro manual por `<ErrorMessage />`
- [ ] Adicionar estados de loading com `<Skeleton />`
- [ ] Testar cenários de erro (token expirado, rede, 404, etc.)
- [ ] Verificar console do browser para confirmar que erros sumiram

## Componentes Migrados

1. ✅ `ActivitySummary.tsx`
2. ✅ `ProfileDashboard.tsx`
3. ✅ `use-profile-form.ts`

## Próximos Passos

Identifique outros componentes que fazem chamadas de API e migre-os usando este padrão. Foque especialmente em:

- Componentes de dashboard
- Formulários que fazem POST/PUT
- Hooks personalizados com fetch
- Qualquer lugar onde você vê `await response.json()` sem verificar `response.ok`
