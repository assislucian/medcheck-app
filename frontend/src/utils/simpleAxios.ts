/**
 * AXIOS SIMPLES E FUNCIONAL - Zero problemas de autenticação
 */

import axios from 'axios';
import { toast } from 'sonner';

// Configurar base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Criar instância do axios
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de forma simples
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se erro 401, limpar token e redirecionar
    if (error?.response?.status === 401) {
      console.log('🔴 Token expirado, fazendo logout...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Mostrar mensagem apenas se não estiver na tela de login
      if (!window.location.pathname.includes('/login')) {
        toast.error('Sessão expirada', {
          description: 'Faça login novamente',
          id: 'session-expired',
        });
        
        // Redirecionar para login após um breve delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } else if (error?.response?.status >= 500) {
      toast.error('Erro no servidor', {
        description: 'Tente novamente em alguns instantes',
        id: 'server-error',
      });
    } else if (error?.code === 'NETWORK_ERROR') {
      toast.error('Erro de conexão', {
        description: 'Verifique sua internet',
        id: 'network-error',
      });
    }
    
    return Promise.reject(error);
  }
);

export default api; 