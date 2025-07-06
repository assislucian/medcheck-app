import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import TokenValidation from '@/components/auth/TokenValidation';
import PasswordForm from '@/components/auth/PasswordForm';

const ResetPassword = () => {
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Current URL:', window.location.href);
    console.log('Hash:', window.location.hash);
    console.log('Search params:', window.location.search);

    const checkSession = async () => {
      try {
        console.log('Verificando token de recuperação de senha');
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Erro ao verificar sessão:', error);
          setIsTokenValid(false);
          toast.error('Link de redefinição de senha inválido ou expirado');
          return;
        }

        console.log('Dados da sessão:', data);

        if (!data.session) {
          console.warn('Sem sessão ativa para redefinição de senha');

          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const queryParams = new URLSearchParams(window.location.search);

          console.log('Hash params:', Object.fromEntries(hashParams.entries()));
          console.log('Query params:', Object.fromEntries(queryParams.entries()));

          const accessToken =
            hashParams.get('access_token') || queryParams.get('access_token');
          const refreshToken =
            hashParams.get('refresh_token') || queryParams.get('refresh_token');
          const type = hashParams.get('type') || queryParams.get('type');

          if ((accessToken || refreshToken) && type === 'recovery') {
            console.log('Token de recuperação detectado na URL');

            try {
              let sessionParams: any = {};

              if (accessToken) {
                sessionParams.access_token = accessToken;
              }

              if (refreshToken) {
                sessionParams.refresh_token = refreshToken;
              }

              const { data: sessionData, error: sessionError } =
                await supabase.auth.setSession(sessionParams);

              if (sessionError) {
                console.error('Erro ao definir sessão com token:', sessionError);
                setIsTokenValid(false);
                toast.error('Token de recuperação inválido');
              } else {
                console.log('Sessão configurada com sucesso:', sessionData);
                setIsTokenValid(true);
              }
            } catch (e) {
              console.error('Erro ao processar tokens da URL:', e);
              setIsTokenValid(false);
            }
          } else {
            const recoveryHash = window.location.hash;
            if (recoveryHash && recoveryHash.includes('type=recovery')) {
              console.log('Hash de recuperação detectado');
              setIsTokenValid(true);
            } else {
              console.warn('Nenhum token de recuperação encontrado na URL');
              setIsTokenValid(false);
            }
          }
        } else {
          console.log('Sessão válida encontrada');
          setIsTokenValid(true);
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        setIsTokenValid(false);
        toast.error('Ocorreu um erro ao verificar o link de redefinição');
      }
    };

    checkSession();
  }, []);

  const handlePasswordReset = async (password: string) => {
    setIsLoading(true);
    try {
      console.log('Tentando atualizar senha...');
      await updatePassword(password);
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      toast.error('Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Redefinir Senha | MedCheck</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <h1 className="text-4xl font-bold mb-2 text-gradient">MedCheck</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Crie uma nova senha para sua conta
          </p>

          <TokenValidation isValid={isTokenValid} />

          {isTokenValid && (
            <Card className="w-full max-w-md mx-auto glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Redefinir senha
                </CardTitle>
                <CardDescription className="text-center">
                  Crie uma nova senha segura para sua conta
                </CardDescription>
              </CardHeader>

              <CardContent>
                <PasswordForm onSubmit={handlePasswordReset} isLoading={isLoading} />
              </CardContent>

              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">
                    Voltar para o login
                  </Link>
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
