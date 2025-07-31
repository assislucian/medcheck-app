import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SelectCustom } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { LoadingSpinner } from './ui/loading-spinner';
import { Shield, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  uf: z.string().min(2, 'Selecione a UF'),
  crm: z.string().min(4, 'Informe o CRM'),
  password: z.string().min(4, 'Informe a senha'),
});

const LoginForm = () => {
  const [uf, setUf] = useState('');
  const [crm, setCrm] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ uf?: string; crm?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/health-plan-selection';

  /** Captura valor vindo como string, event ou objeto { value } */
  const handleUfChange = (raw: any) => {
    let value = '';
    if (typeof raw === 'string') value = raw;
    else if (raw?.target) value = raw.target.value;
    else if (typeof raw?.value === 'string') value = raw.value;
    setUf(value);
  };

  const validateForm = () => {
    try {
      loginSchema.parse({ uf, crm, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { uf?: string; crm?: string; password?: string } = {};
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
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await login(uf, crm, password);
      navigate(redirectUrl);
    } catch (error: any) {
      setAuthError(error?.message || 'Erro ao fazer login. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 border border-health-surface/30 dark:border-health-accent/30 shadow-2xl shadow-health-primary/20 dark:shadow-health-dark/40 rounded-2xl overflow-hidden">
      <CardHeader className="text-center pb-8 pt-10 bg-gradient-to-br from-health-surface/50 via-health-soft/30 to-health-surface/40 dark:from-health-dark/20 dark:via-health-primary/10 dark:to-health-dark/15">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-health-primary dark:text-health-accent mr-3" />
          <div className="w-2 h-2 bg-health-accent rounded-full animate-pulse mr-2"></div>
          <span className="text-sm font-medium text-health-accent dark:text-mint-400">Acesso Seguro</span>
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-health-dark via-health-primary to-health-accent bg-clip-text text-transparent mb-2">
          Área do Médico
        </CardTitle>
        <CardDescription className="text-ink-light dark:text-health-surface/70 text-lg">
          Faça login para acessar sua auditoria médica
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 py-6">
        {authError && (
          <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-center text-sm backdrop-blur-sm">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---- UF ---- */}
          <div>
            <label htmlFor="uf" className="block text-sm font-semibold mb-3 text-ink dark:text-health-surface/90">
              Estado (UF)
            </label>
            <SelectCustom
              id="uf"
              value={uf}
              onChange={handleUfChange}          // <select> nativo
              // @ts-ignore - algumas libs tipam diferente
              onValueChange={handleUfChange}     // Radix Select
              // @ts-ignore
              onSelectionChange={handleUfChange} // fallback para wrappers
              placeholder="Selecione seu estado"
              disabled={isLoading}
            >
              {[
                'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
                'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
              ].map((ufCode) => (
                <option key={ufCode} value={ufCode}>{ufCode}</option>
              ))}
            </SelectCustom>
            {errors.uf && <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">{errors.uf}</div>}
          </div>

          {/* ---- CRM ---- */}
          <div>
            <label htmlFor="crm" className="block text-sm font-semibold mb-3 text-ink dark:text-health-surface/90">
              Número do CRM
            </label>
            <input
              id="crm"
              type="text"
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              placeholder="Digite seu CRM"
              className="w-full px-4 py-4 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-health-surface/50 dark:border-health-accent/50 rounded-xl text-ink dark:text-health-surface"
              autoComplete="username"
              disabled={isLoading}
            />
            {errors.crm && <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">{errors.crm}</div>}
          </div>

          {/* ---- Password ---- */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-3 text-ink dark:text-health-surface/90">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-4 py-4 pr-12 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-health-surface/50 dark:border-health-accent/50 rounded-xl text-ink dark:text-health-surface"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light dark:text-health-accent/60"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">{errors.password}</div>}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-health-primary underline">
              Esqueceu a senha?
            </Link>
          </div>

          {/* ---- Botão ---- */}
          <Button
            type="submit"
            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-health-primary via-health-accent to-health-primary text-white rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <LoadingSpinner size="sm" />
                Entrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Entrar na Plataforma
                <Shield className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 px-8 pb-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-health-primary/50 to-transparent"></div>
        <span className="text-ink-light dark:text-health-surface/70 text-center">
          Não tem uma conta?{' '}
          <Link to="/register" className="font-semibold text-health-primary underline">
            Cadastre-se gratuitamente
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
