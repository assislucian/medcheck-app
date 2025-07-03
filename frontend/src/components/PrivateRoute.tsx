import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  requireHealthPlan?: boolean;
}

export const PrivateRoute = ({
  children,
  requireHealthPlan = true,
}: PrivateRouteProps) => {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se requer seleção de plano de saúde e não é a própria página de seleção
  if (requireHealthPlan && location.pathname !== '/health-plan-selection') {
    const selectedHealthPlan = localStorage.getItem('selected_health_plan');

    // Se não tem plano selecionado, redireciona para seleção
    if (!selectedHealthPlan) {
      return <Navigate to="/health-plan-selection" replace />;
    }
  }

  return children;
};
