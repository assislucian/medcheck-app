import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { PublicLayout } from '@/layout/PublicLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/password-recovery`, {
        email,
      });
      toast.success(response.data.message);
      // Em um app real, o usuário checaria o e-mail. Aqui, podemos logar o token para facilitar.
      if (response.data.reset_token) {
        console.log('Use este token para resetar a senha:', response.data.reset_token);
        toast.info('Token de reset (simulado) logado no console.');
      }
    } catch (error) {
      toast.error('Erro ao solicitar recuperação de senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Recuperar Senha</CardTitle>
            <CardDescription>
              Digite seu e-mail para receber o link de recuperação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default ForgotPasswordPage;
