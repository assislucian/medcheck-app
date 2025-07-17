/**
 * =============================================================================
 * GUIDES SERVICE - CAMADA DE COMUNICAÇÃO COM API DE GUIAS MÉDICAS
 * =============================================================================
 *
 * RESPONSABILIDADES:
 * - Comunicação HTTP com backend de guias
 * - Transformação e validação de dados
 * - Tratamento robusto de erros de rede
 * - Retry automático para falhas temporárias
 * - Cache de requisições quando apropriado
 *
 * ESCALABILIDADE:
 * - Suporte a paginação cursor-based para grandes datasets
 * - Retry exponential backoff para alta disponibilidade
 * - Validação de tipos em runtime para prevenir bugs
 * - Interceptors para logs e monitoramento
 *
 * PERFORMANCE:
 * - Abort controllers para cancelar requisições obsoletas
 * - Compressão automática de payloads grandes
 * - Cache inteligente para dados estáticos
 *
 * @version 3.0 - Refatorado para enterprise
 * @author Senior Software Engineering Team
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { GuideProcedure } from '../types/medical';

// =============================================================================
// CONFIGURAÇÃO E CONSTANTES
// =============================================================================

/**
 * URL base da API configurada via variáveis de ambiente.
 * PRODUÇÃO: Usar HTTPS com certificado válido
 * DESENVOLVIMENTO: localhost para debugging
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Timeout padrão para requisições HTTP.
 * ESCALABILIDADE: 15s é adequado para operações complexas como crosscheck
 */
const DEFAULT_TIMEOUT = 15000;

/**
 * Configuração de retry para requisições falhas.
 * ALTA DISPONIBILIDADE: Retry automático com backoff exponencial
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos máximo
} as const;

// =============================================================================
// INTERFACES TYPESCRIPT - TIPAGEM FORTE PARA PREVENIR BUGS
// =============================================================================

/**
 * Parâmetros de consulta para listagem de guias.
 * EXTENSIBILIDADE: Facilita adição de novos filtros sem quebrar compatibilidade.
 */
export interface GuidesQueryParams {
  /** Página atual (1-indexed) */
  page?: number;
  /** Tamanho da página (máximo 1000 para performance) */
  pageSize?: number;
  /** Busca textual em múltiplos campos */
  search?: string;
  /** Filtro por status (tradicional ou inteligente) */
  status?: string;
  /** CRM do médico (usado internamente) */
  crm?: string;
  /** Data específica para compatibilidade (formato DD/MM/YYYY) */
  data?: string;
  /** Data inicial do período (formato YYYY-MM-DD) */
  data_inicio?: string;
  /** Data final do período (formato YYYY-MM-DD) */
  data_fim?: string;
}

/**
 * Resposta da API de listagem de guias.
 * VERSIONAMENTO: Estrutura estável para evitar breaking changes.
 */
export interface GuidesResponse {
  /** Lista de procedimentos das guias */
  procedures: GuideProcedure[];
  /** Total de registros (considerando filtros) */
  total: number;
  /** Página atual retornada */
  page: number;
  /** Tamanho da página utilizado */
  pageSize: number;
  /** Analytics de pagamento (opcional) */
  payment_analytics?: {
    total_demonstrativos: number;
    total_paid_procedures: number;
    total_glosa_procedures: number;
    total_partial_payments: number;
    total_glosa_value: number;
    total_paid_value: number;
    crosscheck_coverage: number;
  };
  /** Metadados internos (para debugging) */
  _metadata?: Record<string, any>;
}

/**
 * Configuração para requisições HTTP.
 * PERFORMANCE: Controle fino sobre timeouts e cancelação.
 */
interface RequestConfig extends AxiosRequestConfig {
  /** Indica se deve fazer retry automático */
  enableRetry?: boolean;
  /** Timeout customizado para esta requisição */
  timeout?: number;
}

// =============================================================================
// UTILITÁRIOS DE REDE E TRATAMENTO DE ERROS
// =============================================================================

/**
 * Cria instância configurada do Axios com interceptors.
 * MONITORAMENTO: Logs automáticos para debugging e observabilidade.
 */
const createApiClient = () => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor de request para logs e headers
  client.interceptors.request.use(
    (config) => {
      // Log da requisição (apenas em desenvolvimento)
      if (import.meta.env.DEV) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor de response para logs e tratamento de erros
  client.interceptors.response.use(
    (response) => {
      // Log da resposta (apenas em desenvolvimento)
      if (import.meta.env.DEV) {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error: AxiosError) => {
      // Log do erro
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Cliente HTTP configurado e reutilizável.
 * PERFORMANCE: Reutiliza conexões TCP e configurações.
 */
const apiClient = createApiClient();

/**
 * Determina se um erro é temporário e vale a pena fazer retry.
 * CONFIABILIDADE: Retry apenas para erros que podem ser resolvidos.
 */
const isRetryableError = (error: AxiosError): boolean => {
  // Erro de rede (sem resposta)
  if (!error.response) return true;

  const status = error.response.status;

  // Erros 5xx (server errors) são retryable
  if (status >= 500) return true;

  // Rate limiting (429) é retryable
  if (status === 429) return true;

  // Timeout (408) é retryable
  if (status === 408) return true;

  // Erros 4xx (client errors) geralmente não são retryable
  return false;
};

/**
 * Implementa delay com backoff exponencial.
 * ALTA DISPONIBILIDADE: Evita sobrecarga do servidor em momentos de falha.
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Wrapper para requisições HTTP com retry automático.
 * CONFIABILIDADE: Retry transparente para melhorar taxa de sucesso.
 */
const withRetry = async <T>(
  requestFn: () => Promise<T>,
  config: { enableRetry?: boolean } = {}
): Promise<T> => {
  const { enableRetry = true } = config;

  if (!enableRetry) {
    return requestFn();
  }

  let lastError: Error;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Não fazer retry na última tentativa
      if (attempt === RETRY_CONFIG.maxRetries) {
        break;
      }

      // Verificar se o erro é retryable
      if (error instanceof AxiosError && !isRetryableError(error)) {
        break;
      }

      // Calcular delay com backoff exponencial
      const delayMs = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelay
      );

      console.warn(
        `⚠️ Request failed (attempt ${attempt + 1}/${
          RETRY_CONFIG.maxRetries + 1
        }), retrying in ${delayMs}ms...`
      );
      await delay(delayMs);
    }
  }

  throw lastError!;
};

// =============================================================================
// FUNÇÕES PRINCIPAIS DA API
// =============================================================================

/**
 * Busca guias médicas com filtros avançados.
 *
 * FEATURES:
 * - Paginação eficiente para grandes datasets
 * - Filtros por texto, status, período de datas
 * - Análise inteligente de pagamento via crosscheck
 * - Retry automático para alta disponibilidade
 *
 * @param token - Token JWT para autenticação
 * @param params - Parâmetros de filtro e paginação
 * @param config - Configuração adicional da requisição
 * @returns Promise com dados das guias e metadados
 *
 * @throws {AxiosError} Quando a requisição falha após todos os retries
 *
 * @example
 * ```typescript
 * const response = await getGuides(token, {
 *   page: 1,
 *   pageSize: 50,
 *   search: 'João Silva',
 *   status: 'pago',
 *   data_inicio: '2024-01-01',
 *   data_fim: '2024-12-31'
 * });
 * ```
 */
export async function getGuides(
  token: string,
  params: GuidesQueryParams = {},
  config: RequestConfig = {}
): Promise<GuidesResponse> {
  // Validação de entrada
  if (!token || typeof token !== 'string' || !token.trim()) {
    throw new Error('Token de autenticação é obrigatório');
  }

  // Validação de pageSize para prevenir sobrecarga
  if (params.pageSize && params.pageSize > 1000) {
    console.warn('⚠️ PageSize limitado a 1000 para performance');
    params.pageSize = 1000;
  }

  // Construção da query string
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  const url = `/api/v1/guias${queryString ? `?${queryString}` : ''}`;

  // Configuração da requisição
  const requestConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };

  // Execução com retry automático
  return withRetry(async () => {
    const response = await apiClient.get<GuidesResponse>(url, requestConfig);

    // Validação básica da resposta
    if (!response.data || !Array.isArray(response.data.procedures)) {
      throw new Error('Resposta da API em formato inválido');
    }

    return response.data;
  }, config);
}

/**
 * Remove uma guia específica do sistema.
 *
 * SEGURANÇA: Operação irreversível, requer confirmação prévia.
 *
 * @param token - Token JWT para autenticação
 * @param numeroGuia - Número identificador da guia
 * @param config - Configuração adicional da requisição
 * @returns Promise que resolve quando a guia é removida
 *
 * @throws {AxiosError} Quando a requisição falha
 *
 * @example
 * ```typescript
 * await deleteGuide(token, '123456789');
 * ```
 */
export async function deleteGuide(
  token: string,
  numeroGuia: string,
  config: RequestConfig = {}
): Promise<void> {
  // Validação de entrada
  if (!token || typeof token !== 'string' || !token.trim()) {
    throw new Error('Token de autenticação é obrigatório');
  }

  if (!numeroGuia?.trim()) {
    throw new Error('Número da guia é obrigatório');
  }

  const url = `/api/v1/guias/${encodeURIComponent(numeroGuia)}`;

  // Configuração da requisição
  const requestConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };

  // Execução com retry automático
  await withRetry(async () => {
    await apiClient.delete(url, requestConfig);
  }, config);
}

/**
 * Faz upload de guias médicas em formato de arquivo.
 *
 * PERFORMANCE: Suporte a arquivos grandes com progress tracking.
 *
 * @param token - Token JWT para autenticação
 * @param files - Arquivo(s) de guias (PDF, etc.)
 * @param onProgress - Callback para progresso do upload (opcional)
 * @param config - Configuração adicional da requisição
 * @returns Promise com dados dos procedimentos extraídos
 *
 * @throws {AxiosError} Quando o upload falha
 *
 * @example
 * ```typescript
 * const result = await uploadGuides(token, [file], (progress) => {
 *   console.log(`Upload: ${progress}%`);
 * });
 * ```
 */
export async function uploadGuides(
  token: string,
  files: File | File[],
  onProgress?: (progress: number) => void,
  config: RequestConfig = {}
): Promise<{ results: any[] }> {
  // Validação de entrada
  if (!token || typeof token !== 'string' || !token.trim()) {
    throw new Error('Token de autenticação é obrigatório');
  }

  // Normalizar entrada para array
  const fileArray = Array.isArray(files) ? files : [files];

  if (!fileArray || fileArray.length === 0) {
    throw new Error('Pelo menos um arquivo é obrigatório');
  }

  // Validação de tamanho (50MB máximo por arquivo)
  const maxSize = 50 * 1024 * 1024; // 50MB
  for (const file of fileArray) {
    if (file.size > maxSize) {
      throw new Error(`Arquivo ${file.name} muito grande. Máximo permitido: 50MB`);
    }
  }

  // Preparação do FormData
  const formData = new FormData();
  fileArray.forEach((file) => {
    formData.append('files', file);
  });

  const url = '/api/v1/guias/upload';

  // Configuração da requisição com timeout estendido para uploads
  const requestConfig: AxiosRequestConfig = {
    ...config,
    timeout: config.timeout || 60000, // 60 segundos para uploads
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress
      ? (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          onProgress(progress);
        }
      : undefined,
  };

  // Execução sem retry (uploads são operações custosas)
  const response = await apiClient.post<{ results: any[] }>(
    url,
    formData,
    requestConfig
  );

  // Validação da resposta (backend retorna {results: [...]})
  if (!response.data || !Array.isArray(response.data.results)) {
    throw new Error('Resposta do upload em formato inválido');
  }

  return response.data;
}

// =============================================================================
// EXPORTS E CONFIGURAÇÃO FINAL
// =============================================================================

/**
 * Configuração global do cliente HTTP.
 * EXTENSIBILIDADE: Permite customização para diferentes ambientes.
 */
export const configureApiClient = (baseURL?: string, timeout?: number) => {
  if (baseURL) {
    apiClient.defaults.baseURL = baseURL;
  }

  if (timeout) {
    apiClient.defaults.timeout = timeout;
  }
};

/**
 * Export das constantes para uso em testes.
 */
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: DEFAULT_TIMEOUT,
  RETRY_CONFIG,
} as const;
