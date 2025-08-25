import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLegalModals } from '@/contexts/LegalContext';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { SelectCustom } from './ui/select';
import { toast } from 'sonner';
import { z } from 'zod';
import { LoadingSpinner } from './ui/loading-spinner';
import { Shield, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';
import { registerUser, loginWithPassword } from '@/services/api';
import { formatValidationError } from '../utils/errorUtils';

const registerSchema = z
  .object({
    crm: z.string().min(4, 'Informe o CRM'),
    nome: z.string().min(2, 'Informe o nome completo'),
    email: z.string().email('Informe um e-mail válido'),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter letra maiúscula')
      .regex(/[a-z]/, 'A senha deve conter letra minúscula')
      .regex(/[0-9]/, 'A senha deve conter número')
      .regex(/[^A-Za-z0-9]/, 'A senha deve conter símbolo'),
    confirmPassword: z.string(),
    uf: z.string().min(2, 'Selecione o estado'),
    termsAccepted: z.boolean().refine(val => val === true, 'Você deve aceitar os termos'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

const RegisterForm = () => {
  const [crm, setCrm] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uf, setUf] = useState('SP');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showTerms, showPrivacy } = useLegalModals();

  const validateForm = () => {
    const result = registerSchema.safeParse({
      crm,
      nome,
      email,
      password,
      confirmPassword,
      uf,
      termsAccepted,
    });
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        newErrors[issue.path[0]] = issue.message;
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const resp = await registerUser({
        crm,
        nome,
        email,
        password,
        uf,
        terms_accepted: termsAccepted,
        terms_version: "2025-05-05",
      });

      toast.success(resp?.message ?? 'Cadastro realizado com sucesso!');

      try {
        await loginWithPassword(email, password);
        navigate('/dashboard');
      } catch {
        navigate('/login');
      }
    } catch (error: any) {
      const raw = error?.message ?? 'Erro ao cadastrar';
      let msg = raw;
      try {
        const parsed = JSON.parse(raw);
        msg = formatValidationError(parsed) || raw;
      } catch {}
      toast.error(msg);
      setRegisterError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 border border-blue-200/30 dark:border-blue-700/30 shadow-2xl shadow-blue-500/20 dark:shadow-blue-900/40 rounded-2xl overflow-hidden">
      <form onSubmit={handleSubmit}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-blue-700 dark:text-blue-400">
            Crie sua Conta
          </CardTitle>
          <CardDescription className="text-lg text-slate-500 dark:text-slate-400">
            Acesso exclusivo para médicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Nome Completo
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {errors.nome && (
                <p className="mt-1 text-xs text-red-500">{errors.nome}</p>
              )}
            </div>
            <div className="col-span-1">
              <label
                htmlFor="crm"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                CRM
              </label>
              <input
                id="crm"
                type="text"
                placeholder="Seu número de CRM"
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {errors.crm && (
                <p className="mt-1 text-xs text-red-500">{errors.crm}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu-email@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha forte"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Confirme a Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-blue-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="uf"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Estado (UF)
            </label>
            <select
              id="uf"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="SP" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">São Paulo (SP)</option>
              <option value="RJ" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Rio de Janeiro (RJ)</option>
              <option value="MG" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Minas Gerais (MG)</option>
              <option value="RS" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Rio Grande do Sul (RS)</option>
              <option value="PR" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Paraná (PR)</option>
              <option value="SC" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Santa Catarina (SC)</option>
              <option value="BA" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Bahia (BA)</option>
              <option value="GO" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Goiás (GO)</option>
              <option value="DF" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Distrito Federal (DF)</option>
              <option value="PE" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Pernambuco (PE)</option>
              <option value="CE" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Ceará (CE)</option>
              <option value="ES" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Espírito Santo (ES)</option>
              <option value="MT" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Mato Grosso (MT)</option>
              <option value="MS" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Mato Grosso do Sul (MS)</option>
              <option value="PB" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Paraíba (PB)</option>
              <option value="AL" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Alagoas (AL)</option>
              <option value="RN" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Rio Grande do Norte (RN)</option>
              <option value="SE" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Sergipe (SE)</option>
              <option value="PI" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Piauí (PI)</option>
              <option value="MA" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Maranhão (MA)</option>
              <option value="TO" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Tocantins (TO)</option>
              <option value="PA" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Pará (PA)</option>
              <option value="AM" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Amazonas (AM)</option>
              <option value="RO" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Rondônia (RO)</option>
              <option value="AC" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Acre (AC)</option>
              <option value="RR" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Roraima (RR)</option>
              <option value="AP" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Amapá (AP)</option>
            </select>
            {errors.uf && (
              <p className="mt-1 text-xs text-red-500">{errors.uf}</p>
            )}
          </div>

          <div className="flex items-start space-x-3">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="text-sm text-slate-700 dark:text-slate-200">
              Eu aceito os{' '}
              <button
                type="button"
                onClick={showTerms}
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Termos de Uso
              </button>
              {' '}e a{' '}
              <button
                type="button"
                onClick={showPrivacy}
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Política de Privacidade
              </button>
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="mt-1 text-xs text-red-500">{errors.termsAccepted}</p>
          )}

          {registerError && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Erro no cadastro:</strong>
              <span className="block sm:inline ml-2">{registerError}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center px-8 pb-8">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Cadastrando...
              </>
            ) : (
              <>
                <UserPlus className="mr-2" />
                Finalizar Cadastro
              </>
            )}
          </Button>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Faça login aqui
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm;
