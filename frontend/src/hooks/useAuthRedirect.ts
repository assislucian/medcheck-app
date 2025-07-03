import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UseAuthRedirectOptions {
  requireHealthPlan?: boolean;
  redirectTo?: string;
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { requireHealthPlan = true, redirectTo } = options;

  useEffect(() => {
    if (loading) return;

    // Se o usuário está logado
    if (session) {
      // Verifica se já selecionou um plano de saúde
      const selectedHealthPlan = localStorage.getItem('selected_health_plan');

      // Se precisa de plano de saúde mas não tem um selecionado
      if (requireHealthPlan && !selectedHealthPlan) {
        // Só redireciona se não estiver já na página de seleção
        if (location.pathname !== '/health-plan-selection') {
          navigate('/health-plan-selection', { replace: true });
        }
        return;
      }

      // Se tem plano selecionado ou não precisa, redireciona para o destino
      if (redirectTo && location.pathname !== redirectTo) {
        navigate(redirectTo, { replace: true });
      } else if (!redirectTo && location.pathname !== '/dashboard') {
        // Default: vai para dashboard se não especificou destino
        navigate('/dashboard', { replace: true });
      }
    }
  }, [session, loading, navigate, location.pathname, requireHealthPlan, redirectTo]);

  return {
    isRedirecting:
      loading ||
      (session &&
        requireHealthPlan &&
        !localStorage.getItem('selected_health_plan') &&
        location.pathname !== '/health-plan-selection'),
  };
};

export const getRedirectPath = (): string => {
  const selectedHealthPlan = localStorage.getItem('selected_health_plan');

  // Se não tem plano selecionado, vai para seleção
  if (!selectedHealthPlan) {
    return '/health-plan-selection';
  }

  // Se tem plano, vai para dashboard
  return '/dashboard';
};
