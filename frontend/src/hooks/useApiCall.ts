/**
 * Hook centralizado para chamadas de API
 * Elimina duplicação de 15+ implementações de token/loading/error
 */
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ApiCallOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
  retries?: number;
}

interface ApiCallResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (url: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

export function useApiCall<T = any>(defaultOptions: ApiCallOptions = {}): ApiCallResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (url: string, fetchOptions: RequestInit = {}): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`;

      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);

      if (defaultOptions.showSuccessToast) {
        toast.success(defaultOptions.successMessage || 'Operação realizada com sucesso!');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro inesperado';
      setError(errorMessage);

      if (defaultOptions.showErrorToast !== false) {
        toast.error(defaultOptions.errorMessage || errorMessage);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [defaultOptions]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}