import { useState, useEffect } from 'react';
import { fetchWithAuth, handleApiError } from '../utils/errorHandler';

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
  totals: {
    totalRecebido: number;
    totalGlosado: number;
    totalProcedimentos: number;
    auditoriaPendente: number;
  };
  procedures: any[];
  glosas: any[];
}

interface UseProfileDataReturn {
  profileData: ProfileData | null;
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  retryProfile: () => void;
  retryDashboard: () => void;
}

export const useProfileData = (): UseProfileDataReturn => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    try {
      const response = await fetchWithAuth('/api/v1/profile');
      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      const message = handleApiError(err as Error);
      setError(message);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetchWithAuth('/api/v1/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      const message = handleApiError(err as Error);
      setError(message);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Carrega dados em paralelo
      await Promise.allSettled([fetchProfileData(), fetchDashboardData()]);
    } catch (err) {
      console.error('Erro geral:', err);
      const message = handleApiError(err as Error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const retryProfile = () => {
    fetchProfileData();
  };

  const retryDashboard = () => {
    fetchDashboardData();
  };

  return {
    profileData,
    dashboardData,
    loading,
    error,
    retryProfile,
    retryDashboard,
  };
};
