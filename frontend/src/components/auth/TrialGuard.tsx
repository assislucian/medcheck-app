import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTrialStatus } from '@/hooks/use-trial-status';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TrialGuardProps {
  children: React.ReactNode;
}

const TrialGuard = ({ children }: TrialGuardProps) => {
  const { user } = useAuth();
  const { status, endDate, isLoading, error } = useTrialStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    console.log(
      'TrialGuard - User:',
      !!user,
      'Status:',
      status,
      'isLoading:',
      isLoading,
      'Path:',
      location.pathname
    );

    // Only proceed if loading is complete and we're not already on the welcome page
    if (!isLoading && user && !hasNavigated) {
      console.log('TrialGuard check complete - Status:', status);

      // Only redirect to welcome if not already on welcome page and trial not started
      if (status === 'not_started' && location.pathname !== '/welcome') {
        console.log(
          'Trial not started, redirecting to welcome page from:',
          location.pathname
        );
        setHasNavigated(true);
        navigate('/welcome', {
          state: { returnTo: location.pathname },
          replace: true,
        });
      } else if (status === 'expired') {
        console.log('Trial expired, showing message');
        toast.error('Seu período de avaliação expirou', {
          description: 'Por favor, atualize para um plano pago para continuar.',
        });
      }

      setIsChecking(false);
    } else if (!user && !isLoading) {
      // If there's no user and we're not loading, allow the auth routes to handle it
      setIsChecking(false);
    }
  }, [isLoading, user, status, navigate, location, hasNavigated]);

  // Added a max timeout to prevent infinite loading
  useEffect(() => {
    const maxLoadingTimer = setTimeout(() => {
      if (isChecking) {
        console.log('TrialGuard max loading time reached, forcing proceed');
        setIsChecking(false);
      }
    }, 5000);

    return () => clearTimeout(maxLoadingTimer);
  }, [isChecking]);

  if (error) {
    console.error('Trial status error:', error);
    // Don't block the app if there's an error checking trial status
    // Just log it and continue
  }

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-xl font-medium">Verificando acesso...</span>
      </div>
    );
  }

  // Always render children if not in the checking state
  return <>{children}</>;
};

export default TrialGuard;
