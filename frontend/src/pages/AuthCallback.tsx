import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AuthCallback = () => {
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      setLoading(true);

      try {
        // Get the code from URL search parameters
        const code = new URLSearchParams(location.search).get('code');

        if (!code) {
          throw new Error('No code parameter found in the URL');
        }

        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          throw error;
        }

        toast.success('Login realizado com sucesso!', { id: 'login-success' });
      } catch (err: any) {
        console.error('Error in auth callback:', err);
        setError(err.message || 'An error occurred during authentication');
        toast.error('Erro de autenticação. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [location]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" text="Autenticando..." />
      </div>
    );
  }

  // If there's an error, you might want to show it or redirect to an error page
  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
        <div className="text-destructive text-lg font-semibold">
          Erro de autenticação
        </div>
        <div className="text-muted-foreground">{error}</div>
        <a href="/login" className="text-primary hover:underline">
          Voltar ao login
        </a>
      </div>
    );
  }

  // If successful, redirect to the dashboard
  return <Navigate to="/dashboard" replace />;
};

export default AuthCallback;
