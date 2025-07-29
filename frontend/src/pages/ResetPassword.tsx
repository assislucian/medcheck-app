import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ResetPasswordPage = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        new_password: newPassword,
      });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              Cole o token recebido e digite sua nova senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Token de Recuperação</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Cole o token aqui"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">Nova Senha</Label>
                <Input
                  id="new_password"
                  type="password"
                  placeholder="********"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default ResetPasswordPage;
