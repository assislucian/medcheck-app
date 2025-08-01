import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import axios from 'axios';
import { ApiService } from '../../services/api';
import { AuthContextProps } from './types';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const performLogout = () => {
    setToken(null);
    setUser(null);
    setUserProfile(null);

    // Limpa todos os dados locais relacionados ao usuário
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('guias_activity_log_')) {
        localStorage.removeItem(key);
      }
    });

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    // Configura interceptador para capturar erros 401 globalmente
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401 && token) {
          console.log('Token expirado detectado globalmente, fazendo logout...');
          performLogout();
          toast.error('Sessão expirada. Faça login novamente.');
          // Redireciona para login se não estiver na página de login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

      // Decodifica JWT para obter dados básicos do usuário
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));

        // Verifica se o token não está expirado
        const currentTime = Date.now() / 1000;
        if (payload.exp && payload.exp < currentTime) {
          console.log('Token expirado encontrado no localStorage');
          performLogout();
          setLoading(false);
          return;
        }

        setUser(payload);

        // Carrega perfil completo da API
        loadUserProfile(savedToken);
      } catch (e) {
        console.error('Erro ao decodificar token:', e);
        performLogout();
      }
    }
    setLoading(false);

    // Cleanup do interceptador quando o componente for desmontado
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const loadUserProfile = async (authToken?: string) => {
    try {
      const tokenToUse = authToken || token;
      if (!tokenToUse) return;

      const response = await axios.get(`${API_URL}/api/v1/profile`, {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });

      if (response.data) {
        setUserProfile({
          ...user,
          ...response.data,
          name: response.data.nome,
          email: response.data.email,
          specialty: response.data.specialty,
          hospital: response.data.hospital,
          phone: response.data.phone,
          bio: response.data.bio,
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil completo:', error);

      // Se for erro 401, o token expirou - fazer logout
      if (error?.response?.status === 401) {
        console.log('Token expirado, fazendo logout automático...');
        performLogout();
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      // Para outros erros, apenas logar sem fazer logout
    }
  };

  const login = async (uf: string, crm: string, senha: string) => {
    try {
      const params = new URLSearchParams();
      params.append('username', crm);
      params.append('password', senha);
      params.append('uf', uf);

      const res = await axios.post(`${API_URL}/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const newToken = res.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Decodifica JWT para obter dados básicos
      try {
        const payload = JSON.parse(atob(newToken.split('.')[1]));
        setUser(payload);

        // Carrega perfil completo
        await loadUserProfile(newToken);

        toast.success('Login realizado com sucesso!', { id: 'login-success' });
      } catch (e) {
        console.error('Erro ao processar dados do usuário:', e);
        setUser(null);
        setUserProfile(null);
      }
    } catch (error: any) {
      setToken(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setUserProfile(null);

      const errorMessage = error?.response?.data?.detail || 'Erro ao fazer login.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    performLogout();
    toast.info('Logout realizado com sucesso!');
  };

  const getProfile = async () => {
    try {
      await loadUserProfile();
      return userProfile || user;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return user; // Fallback para dados básicos do JWT
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await axios.patch(`${API_URL}/api/v1/profile`, profileData);

      if (response.data) {
        // Recarrega o perfil após atualização
        await loadUserProfile();
        toast.success('Perfil atualizado com sucesso!');
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Erro ao atualizar perfil.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const contextValue: AuthContextProps = {
    user,
    userProfile: userProfile || user,
    session: token ? { access_token: token } : null,
    isAuthenticated: !!token,
    loading,
    validateUserCRM: async () => true,
    login,
    logout,
    signUp: async () => {
      throw new Error('Not implemented');
    },
    signInWithPassword: async () => {
      throw new Error('Not implemented');
    },
    signInWithGoogle: async () => {
      throw new Error('Not implemented');
    },
    signOut: logout,
    getProfile,
    updateProfile,
    resetPassword: async () => {
      throw new Error('Not implemented');
    },
    updatePassword: async () => {
      throw new Error('Not implemented');
    },
    isPasswordStrong: () => true,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
