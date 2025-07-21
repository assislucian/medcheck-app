// Configuração centralizada da API
export const API_CONFIG = {
  // URL base da API - usa proxy do Vite em desenvolvimento, variável de ambiente em produção
  BASE_URL: import.meta.env.VITE_API_URL || '',

  // Endpoints específicos
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      PROFILE: '/api/user/profile',
    },
    DASHBOARD: '/api/dashboard/stats',
    DEMONSTRATIVES: {
      LIST: '/api/demonstratives',
      UPLOAD: '/api/demonstratives/upload',
      DETAILS: (id: number) => `/api/demonstratives/${id}`,
      DOWNLOAD: (id: number) => `/api/demonstratives/${id}/download`,
      DELETE: (id: number) => `/api/demonstratives/${id}`,
    },
    GUIDES: {
      LIST: '/api/v1/guias',  // ✅ Corrigido para o endpoint real
      UPLOAD: '/api/v1/guias/upload',
      SAVE: '/api/v1/guias/save',
      CREATE_SAMPLE: '/api/v1/guias/create-sample-data',  // ✅ Adicionado
      DELETE: (numero: string) => `/api/guides/${numero}`,
    },
    ACTIVITY_LOGS: '/api/activity-logs',
    VALIDATION: {
      CROSS: '/api/validate-cross',
      SINGLE: '/api/validate',
      STATUS: (jobId: string) => `/api/status/${jobId}`,
      RESULT: (jobId: string) => `/api/result/${jobId}`,
    },
  },
};

// Função helper para construir URLs completas
// ✅ Modificada para funcionar com proxy
export const buildApiUrl = (endpoint: string): string => {
  // Se BASE_URL estiver vazio (desenvolvimento), usar apenas o endpoint
  // O proxy do Vite vai redirecionar automaticamente
  if (!API_CONFIG.BASE_URL) {
    return endpoint;
  }
  // Em produção, usar a URL completa
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Configuração do axios com interceptors
export const configureAxios = () => {
  const axios = require('axios');

  // Interceptor para adicionar token automaticamente
  axios.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Interceptor para tratar erros de autenticação
  axios.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error?.response?.status === 401) {
        // Token expirado - limpar localStorage e redirecionar
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return axios;
};
