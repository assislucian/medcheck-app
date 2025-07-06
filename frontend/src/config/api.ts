// Configuração centralizada da API
export const API_CONFIG = {
  // URL base da API - prioriza variável de ambiente, fallback para localhost
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',

  // Endpoints específicos
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/token',
      REGISTER: '/api/v1/register',
      PROFILE: '/api/v1/profile',
    },
    DASHBOARD: '/api/v1/dashboard',
    DEMONSTRATIVES: {
      LIST: '/api/v1/demonstrativos',
      UPLOAD: '/api/v1/demonstrativos/upload',
      DETAILS: (id: number) => `/api/v1/demonstrativos/${id}/detalhes`,
      DOWNLOAD: (id: number) => `/api/v1/demonstrativos/${id}/download`,
      DELETE: (id: number) => `/api/v1/demonstrativos/${id}`,
    },
    GUIDES: {
      LIST: '/api/v1/guias',
      UPLOAD: '/api/v1/guias/upload',
      SAVE: '/api/v1/guias/save',
      DELETE: (numero: string) => `/api/v1/guias/${numero}`,
    },
    ACTIVITY_LOGS: '/api/v1/activity-logs',
    VALIDATION: {
      CROSS: '/api/v1/validate-cross',
      SINGLE: '/api/v1/validate',
      STATUS: (jobId: string) => `/api/v1/status/${jobId}`,
      RESULT: (jobId: string) => `/api/v1/result/${jobId}`,
    },
  },
};

// Função helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
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
