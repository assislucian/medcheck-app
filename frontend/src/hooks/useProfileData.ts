import { useState, useEffect } from 'react';
import { safeFetch, useApiErrorHandler, ApiErrorDetails } from '../utils/errorHandler';

interface ProfileData {
  crm: string;
  uf: string;
  nome: string;
  email?: string;
  specialty?: string;
  hospital?: string;
  phone?: string;
  bio?: string;
}

interface DashboardData {
  total_demonstrativos: number;
  total_guias: number;
  valor_total_liberado: string;
  valor_total_glosa: string;
  demonstrativos_recentes: any[];
  guias_recentes: any[];
}

interface UseProfileDataReturn {
  profile: ProfileData | null;
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  isAuthError: boolean;
  refetch: () => void;
}

export const useProfileData = (): UseProfileDataReturn => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const { handleError } = useApiErrorHandler();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setIsAuthError(false);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthError(true);
        setError('Token de autenticação não encontrado. Faça login novamente.');
        setIsLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Carrega dados do perfil e dashboard em paralelo
      const [profileResponse, dashboardResponse] = await Promise.allSettled([
        safeFetch('/api/v1/profile', { headers }),
        safeFetch('/api/v1/dashboard', { headers }),
      ]);

      // Processa resposta do perfil
      if (profileResponse.status === 'fulfilled') {
        setProfile(profileResponse.value);
      } else {
        const profileError = handleError(profileResponse.reason);
        console.warn('Erro ao carregar perfil:', profileError.message);

        if (profileError.isAuthError) {
          setIsAuthError(true);
          setError('Sessão expirada. Faça login novamente.');
          setIsLoading(false);
          return;
        }
      }

      // Processa resposta do dashboard
      if (dashboardResponse.status === 'fulfilled') {
        setDashboard(dashboardResponse.value);
      } else {
        const dashboardError = handleError(dashboardResponse.reason);
        console.warn('Erro ao carregar dashboard:', dashboardError.message);

        if (dashboardError.isAuthError && !isAuthError) {
          setIsAuthError(true);
          setError('Sessão expirada. Faça login novamente.');
          setIsLoading(false);
          return;
        }
      }

      // Se ambos falharam por motivos não relacionados à autenticação
      if (
        profileResponse.status === 'rejected' &&
        dashboardResponse.status === 'rejected'
      ) {
        const profileError = handleError(profileResponse.reason);
        const dashboardError = handleError(dashboardResponse.reason);

        if (!profileError.isAuthError && !dashboardError.isAuthError) {
          setError('Erro ao carregar dados. Tente novamente.');
        }
      }
    } catch (error) {
      const errorDetails = handleError(error as Error);

      if (errorDetails.isAuthError) {
        setIsAuthError(true);
        setError('Sessão expirada. Faça login novamente.');
      } else if (errorDetails.isNetworkError) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(errorDetails.message || 'Erro desconhecido ao carregar dados.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Função para recarregar dados
  const refetch = () => {
    fetchData();
  };

  return {
    profile,
    dashboard,
    isLoading,
    error,
    isAuthError,
    refetch,
  };
};
