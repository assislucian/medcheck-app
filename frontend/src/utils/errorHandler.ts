/**
 * Utilitário para tratamento robusto de erros de API
 */

export interface ApiErrorDetails {
  status: number;
  message: string;
  isAuthError: boolean;
  isNetworkError: boolean;
}

/**
 * Verifica se uma string é JSON válido
 */
const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extrai mensagem de erro de uma resposta HTML
 */
const extractErrorFromHTML = (html: string): string => {
  // Tenta extrair título ou mensagem de erro de páginas HTML
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Procura por mensagens comuns de erro
  if (html.includes('401') || html.includes('Unauthorized')) {
    return 'Sessão expirada. Faça login novamente.';
  }
  if (html.includes('403') || html.includes('Forbidden')) {
    return 'Acesso negado.';
  }
  if (html.includes('404') || html.includes('Not Found')) {
    return 'Recurso não encontrado.';
  }
  if (html.includes('500') || html.includes('Internal Server Error')) {
    return 'Erro interno do servidor.';
  }

  return 'Erro de comunicação com o servidor.';
};

/**
 * Processa resposta da API de forma robusta
 */
export const processApiResponse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type') || '';

  // Se não for JSON, provavelmente é uma página de erro
  if (!contentType.includes('application/json')) {
    const text = await response.text();

    const errorDetails: ApiErrorDetails = {
      status: response.status,
      message: extractErrorFromHTML(text),
      isAuthError: response.status === 401 || response.status === 403,
      isNetworkError: false,
    };

    throw new Error(JSON.stringify(errorDetails));
  }

  const text = await response.text();

  // Verifica se é JSON válido
  if (!isValidJSON(text)) {
    const errorDetails: ApiErrorDetails = {
      status: response.status,
      message: 'Resposta inválida do servidor.',
      isAuthError: false,
      isNetworkError: false,
    };

    throw new Error(JSON.stringify(errorDetails));
  }

  const data = JSON.parse(text);

  // Se não for sucesso HTTP, lança erro
  if (!response.ok) {
    const errorDetails: ApiErrorDetails = {
      status: response.status,
      message: data.detail || data.message || 'Erro desconhecido',
      isAuthError: response.status === 401 || response.status === 403,
      isNetworkError: false,
    };

    throw new Error(JSON.stringify(errorDetails));
  }

  return data;
};

/**
 * Wrapper para fetch com tratamento de erro robusto
 */
export const safeFetch = async (url: string, options?: RequestInit): Promise<any> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    return await processApiResponse(response);
  } catch (error) {
    // Se for erro de rede
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const errorDetails: ApiErrorDetails = {
        status: 0,
        message: 'Erro de conexão. Verifique sua internet.',
        isAuthError: false,
        isNetworkError: true,
      };

      throw new Error(JSON.stringify(errorDetails));
    }

    // Re-lança outros erros
    throw error;
  }
};

/**
 * Hook para tratar erros de API de forma consistente
 */
export const useApiErrorHandler = () => {
  const handleError = (error: Error): ApiErrorDetails => {
    try {
      // Tenta parsear como erro estruturado
      const errorDetails = JSON.parse(error.message) as ApiErrorDetails;
      return errorDetails;
    } catch {
      // Se não conseguir parsear, trata como erro genérico
      return {
        status: 0,
        message: error.message || 'Erro desconhecido',
        isAuthError: false,
        isNetworkError: false,
      };
    }
  };

  return { handleError };
};
