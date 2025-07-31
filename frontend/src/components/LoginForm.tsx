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

  /** Compatível com <select> nativo ou SelectCustom */
  const handleUfChange = (valueOrEvent: any) => {
    const value = valueOrEvent?.target ? valueOrEvent.target.value : valueOrEvent;
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
      await login(uf, crm, password); // envia UF + CRM + senha
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
          <span className="text-sm font-medium text-health-accent dark:text-mint-400">
            Acesso Seguro
          </span>
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
          <div>
            <label htmlFor="uf" className="block text-sm font-semibold mb-3 text-ink dark:text-health-surface/90">
              Estado (UF)
            </label>
            <SelectCustom
              id="uf"
              value={uf}
              onChange={handleUfChange}
              placeholder="Selecione seu estado"
              disabled={isLoading}
            >
              <option value="AC">Acre (AC)</option>
              <option value="AL">Alagoas (AL)</option>
              <option value="AP">Amapá (AP)</option>
              <option value="AM">Amazonas (AM)</option>
              <option value="BA">Bahia (BA)</option>
              <option value="CE">Ceará (CE)</option>
              <option value="DF">Distrito Federal (DF)</option>
              <option value="ES">Espírito Santo (ES)</option>
              <option value="GO">Goiás (GO)</option>
              <option value="MA">Maranhão (MA)</option>
              <option value="MT">Mato Grosso (MT)</option>
              <option value="MS">Mato Grosso do Sul (MS)</option>
              <option value="MG">Minas Gerais (MG)</option>
              <option value="PA">Pará (PA)</option>
              <option value="PB">Paraíba (PB)</option>
              <option value="PR">Paraná (PR)</option>
              <option value="PE">Pernambuco (PE)</option>
              <option value="PI">Piauí (PI)</option>
              <option value="RJ">Rio de Janeiro (RJ)</option>
              <option value="RN">Rio Grande do Norte (RN)</option>
              <option value="RS">Rio Grande do Sul (RS)</option>
              <option value="RO">Rondônia (RO)</option>
              <option value="RR">Roraima (RR)</option>
              <option value="SC">Santa Catarina (SC)</option>
              <option value="SP">São Paulo (SP)</option>
              <option value="SE">Sergipe (SE)</option>
              <option value="TO">Tocantins (TO)</option>
            </SelectCustom>
            {errors.uf && <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">{errors.uf}</div>}
          </div>

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
              className="w-full px-4 py-4 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-health-surface/50 dark:border-health-accent/50 rounded-xl text-ink dark:text-health-surface placeholder:text-ink-light dark:placeholder:text-health-accent/60 focus:outline-none focus:ring-2 focus:ring-health-primary/50 focus:border-health-primary/50 transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/60 text-lg"
              autoComplete="username"
              disabled={isLoading}
            />
            {errors.crm && <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">{errors.crm}</div>}
          </div>

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
                className="w-full px-4 py-4 pr-12 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-health-surface/50 dark:border-health-accent/50 rounded-xl text-ink dark:text-health-surface placeholder:text-ink-light dark:placeholder:text-health-accent/60 focus:outline-none focus:ring-2 focus:ring-health-primary/50 focus:border-health-primary/50 transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/60 text-lg"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-light dark:text-health-accent/60 hover:text-health-primary dark:hover:text-health-accent transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">{errors.password}</div>}
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-health-primary dark:text-health-accent hover:text-health-dark dark:hover:text-mint-300 transition-colors underline decoration-health-accent/50 hover:decoration-health-primary"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-health-primary via-health-accent to-health-primary hover:from-health-dark hover:via-health-accent hover:to-health-dark text-white rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-health-primary/30 dark:shadow-health-dark/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <LoadingSpinner size="sm" />
                Entrando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Entrar na Plataforma
                <Shield className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 px-8 pb-8 bg-gradient-to-br from-health-surface/30 via-health-soft/20 to-health-surface/30 dark:from-health-dark/10 dark:via-health-primary/5 dark:to-health-dark/10">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-health-primary/50 to-transparent"></div>
        <span className="text-ink-light dark:text-health-surface/70 text-center">
          Não tem uma conta?{' '}
          <Link
            to="/register"
            className="font-semibold text-health-primary dark:text-health-accent hover:text-health-dark dark:hover:text-mint-300 transition-colors underline decoration-health-accent/50 hover:decoration-health-primary"
          >
            Cadastre-se gratuitamente
          </Link>
        </span>
        <p className="text-xs text-center text-ink-light dark:text-health-surface/50">
          Ao fazer login, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
