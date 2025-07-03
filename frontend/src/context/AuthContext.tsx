import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface User {
  crm: string;
  nome: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (crm: string, senha: string) => Promise<void>;
  logout: () => void;
  register: (crm: string, nome: string, senha: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Carrega token do localStorage ao iniciar
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Decodifica JWT para obter dados do usuário (simples, sem validação de assinatura)
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setUser({ crm: payload.crm, nome: payload.nome });
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Configura axios para enviar token automaticamente
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Login
  async function login(crm: string, senha: string) {
    const params = new URLSearchParams();
    params.append('username', crm);
    params.append('password', senha);
    const res = await axios.post(`${API_URL}/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const accessToken = res.data?.access_token;
    if (!accessToken) {
      throw new Error('Token de acesso não recebido');
    }
    setToken(accessToken);
    // Decodifica JWT para obter dados do usuário
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    setUser({ crm: payload.crm, nome: payload.nome });
  }

  // Logout
  function logout() {
    setToken(null);
    setUser(null);
  }

  // Cadastro
  async function register(crm: string, nome: string, senha: string) {
    await axios.post(`${API_URL}/api/v1/register`, { crm, nome, senha });
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
