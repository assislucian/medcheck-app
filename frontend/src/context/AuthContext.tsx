import React, { createContext, useContext, useEffect, useState } from 'react';

type Session = {
  accessToken: string;
  crm: string;
  uf: string | null;
};

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  login: (uf: string, crm: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL =
  import.meta.env.VITE_API_URL ?? 'https://medcheck-backend.onrender.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // restaura sessão
    const raw = localStorage.getItem('medcheck_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSession(parsed);
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (uf: string, crm: string, password: string) => {
    // /token usa application/x-www-form-urlencoded
    const form = new URLSearchParams();
    form.set('username', crm);    // backend usa CRM como username
    form.set('password', password);
    form.set('uf', uf);           // <-- enviamos UF para validar no backend

    const res = await fetch(`${API_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data?.detail) detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      } catch {}
      throw new Error(detail);
    }

    const data = await res.json(); // { access_token, token_type, user }
    // podemos decodificar o JWT se quiser extrair uf/crm; mas o backend já valida UF
    const newSession: Session = {
      accessToken: data.access_token,
      crm,
      uf,
    };
    setSession(newSession);
    localStorage.setItem('medcheck_session', JSON.stringify(newSession));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('medcheck_session');
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
