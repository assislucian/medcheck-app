import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { LoadingSpinner } from './ui/loading-spinner';

const loginSchema = z.object({
  uf: z.string().min(2, 'Selecione a UF'),
  crm: z.string().min(4, 'Informe o CRM'),
  password: z.string().min(4, 'Informe a senha'),
});

const LoginForm = () => {
  const [uf, setUf] = useState('');
  const [crm, setCrm] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{uf?: string, crm?: string, password?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const validateForm = () => {
    try {
      loginSchema.parse({ uf, crm, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: {uf?: string, crm?: string, password?: string} = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'uf') newErrors.uf = err.message;
          if (err.path[0] === 'crm') newErrors.crm = err.message;
          if (err.path[0] === 'password') newErrors.password = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      await login(uf, crm, password);
      toast.success('Login realizado com sucesso!');
      navigate(redirectUrl);
    } catch (error: any) {
      setAuthError(error?.message || 'Erro ao fazer login. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Bem-vindo de volta</CardTitle>
        <CardDescription className="text-center">
          Faça login na sua conta para continuar
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authError && (
          <div className="mb-4 text-red-600 text-center text-sm">{authError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="uf" className="block text-sm font-medium mb-1">UF</label>
            <select
              id="uf"
              value={uf}
              onChange={e => setUf(e.target.value)}
              className="input input-bordered w-full"
              disabled={isLoading}
            >
              <option value="">Selecione</option>
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AP">AP</option>
              <option value="AM">AM</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MT">MT</option>
              <option value="MS">MS</option>
              <option value="MG">MG</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RS">RS</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="SC">SC</option>
              <option value="SP">SP</option>
              <option value="SE">SE</option>
              <option value="TO">TO</option>
            </select>
            {errors.uf && <div className="text-xs text-red-600 mt-1">{errors.uf}</div>}
          </div>
          <div>
            <label htmlFor="crm" className="block text-sm font-medium mb-1">CRM</label>
            <input
              id="crm"
              type="text"
              value={crm}
              onChange={e => setCrm(e.target.value)}
              className="input input-bordered w-full bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              autoComplete="username"
              disabled={isLoading}
            />
            {errors.crm && <div className="text-xs text-red-600 mt-1">{errors.crm}</div>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input input-bordered w-full bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              autoComplete="current-password"
              disabled={isLoading}
            />
            {errors.password && <div className="text-xs text-red-600 mt-1">{errors.password}</div>}
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" /> 
                Entrando...
              </span>
            ) : 'Entrar'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">Não tem uma conta? <Link to="/register" className="text-primary hover:underline">Cadastre-se</Link></span>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
