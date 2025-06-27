import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';

export const TokenRefresh = () => {
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    // Verifica se há token expirado no localStorage
    const token = localStorage.getItem('token');

    if (token && isAuthenticated) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (payload.exp && payload.exp < currentTime) {
          console.log('Token expirado detectado, fazendo logout...');
          logout();
          window.location.href = '/login';
        }
      } catch (e) {
        console.error('Erro ao validar token:', e);
        logout();
        window.location.href = '/login';
      }
    }
  }, [logout, isAuthenticated]);

  return null; // Componente invisível
};

export default TokenRefresh;
