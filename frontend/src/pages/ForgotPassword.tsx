import { PublicLayout } from '@/components/layout/PublicLayout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email || !email.includes('@')) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Link de redefinição de senha enviado para seu email.');
    } catch (err: any) {
      console.error('Error sending password reset:', err);
      setError(err.message || 'Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout title="Esqueci Minha Senha">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md mx-auto glass-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Recuperar senha
            </CardTitle>
            <CardDescription className="text-center">
              Digite seu email para receber o link de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                    />
                  </svg>
                </div>
                <p>Email enviado com sucesso para {email}</p>
                <p className="text-sm text-muted-foreground">
                  Verifique sua caixa de entrada e siga as instruções para redefinir sua
                  senha.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Enviando...
                    </span>
                  ) : (
                    'Enviar link de redefinição'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default ForgotPassword;
