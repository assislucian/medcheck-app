import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContextProps } from './types';
// import { toast } from 'sonner'; // TODO: Reintroduzir quando forem adicionados toasts de feedback
import { getProfileData } from '@/utils/supabase/profileHelpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      // Decodifica JWT para obter dados do usuário
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setUser(payload);
        // Carrega perfil adicional do Supabase
        getProfileData(payload.sub || payload.id).then((supabaseProfile) => {
          if (supabaseProfile) {
            setUserProfile({ ...payload, ...supabaseProfile });
          } else {
            setUserProfile(payload);
          }
        });
      } catch (e) {
        setUser(null);
        setUserProfile(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (uf: string, crm: string, senha: string) => {
    try {
      const params = new URLSearchParams();
      params.append('username', crm);
      params.append('password', senha);
      params.append('scope', uf);
      const res = await axios.post(`${API_URL}/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      setToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
      axios.defaults.headers.common['Authorization'] =
        `Bearer ${res.data.access_token}`;
      // Decodifica JWT para obter dados do usuário
      try {
        const payload = JSON.parse(atob(res.data.access_token.split('.')[1]));
        setUser(payload);
        const supabaseProfile = await getProfileData(payload.sub || payload.id);
        setUserProfile({ ...payload, ...(supabaseProfile || {}) });
      } catch (e) {
        setUser(null);
        setUserProfile(null);
      }
    } catch (error: any) {
      setToken(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setUserProfile(null);
      throw new Error(error?.response?.data?.detail || 'Erro ao fazer login.');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserProfile(null);
    // Limpa todos os logs locais segmentados por CRM
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('guias_activity_log_')) localStorage.removeItem(key);
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
  };

  const contextValue: AuthContextProps = {
    user,
    userProfile,
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
    getProfile: async () => user,
    updateProfile: async () => {
      throw new Error('Not implemented');
    },
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
