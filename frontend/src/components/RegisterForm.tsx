import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
// usamos o serviço unificado (sem axios direto aqui)
import { registerUser, loginWithPassword } from '@/services/api';
// se quiser manter suas funções utilitárias de formatação de erro, pode usar:
import { formatValidationError } from '../utils/errorUtils';

const registerSchema = z
  .object({
    uf: z.string().min(2, 'Selecione a UF'),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

const TERMS_VERSION = '2025-05-05'; // mantenha sua versão/data de termos

const RegisterForm = () => {
  // defina um default para UF para evitar enviar string vazia
  const [uf, setUf] = useState('SP');
  const [crm, setCrm] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    uf?: string;
    crm?: string;
    nome?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateForm = () => {
    try {
      registerSchema.parse({ uf, crm, nome, email, password, confirmPassword });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: typeof errors = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'uf') newErrors.uf = err.message;
          if (err.path[0] === 'crm') newErrors.crm = err.message;
          if (err.path[0] === 'nome') newErrors.nome = err.message;
          if (err.path[0] === 'email') newErrors.email = err.message;
          if (err.path[0] === 'password') newErrors.password = err.message;
          if (err.path[0] === 'confirmPassword') newErrors.confirmPassword = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setAcceptError(null);

    if (!acceptedTerms) {
      setAcceptError(
        'É necessário aceitar os Termos de Uso e a Política de Privacidade para se cadastrar.'
      );
      return;
    }
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // ENVIO EXATO QUE O BACKEND ESPERA
      const resp = await registerUser({
        uf,
        crm,
        nome,             // 'nome' (não 'name')
        email,
        password,         // AQUI ESTAVA O PROBLEMA: era 'senha'
        terms_accepted: acceptedTerms,
        terms_version: TERMS_VERSION,
      });

      // sucesso (o backend retorna { message: "..." })
      toast.success(resp?.message ?? 'Cadastro realizado com sucesso!');

      // login automático: /token espera username=email e password
      try {
        await loginWithPassword(email, password);
        navigate('/dashboard');
      } catch {
        // Se o login automático falhar, direciona para login
        navigate('/login');
      }
    } catch (error: any) {
      // Traz a mensagem detalhada (422) que o serviço já formata (detail do FastAPI)
      const raw = error?.message ?? 'Erro ao cadastrar';
      // Se você quiser manter a sua util formatValidationError para arrays de detail:
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
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 border border-amber-200/30 dark:border-amber-700/30 shadow-2xl shadow-amber-500/20 dark:shadow-amber-900/40 rounded-2xl overflow-hidden">
      {/* Header Premium com Gradiente */}
      <CardHeader className="text-center pb-8 pt-10 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/40 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-yellow-900/15">
        <div className="flex items-center justify-center mb-4">
          <UserPlus className="w-8 h-8 text-amber-600 dark:text-amber-400 mr-3" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Teste Grátis 30 Dias
          </span>
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
          Cadastro Premium
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-amber-200/70 text-lg">
          Junte-se a 2.500+ médicos que já recuperaram R$ 2.3M+
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 py-6">
        {registerError && (
          <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-center text-sm backdrop-blur-sm">
            {registerError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="uf"
                className="block text-sm font-semibold mb-3 text-slate-700 dark:text-amber-200/90"
              >
                Estado (UF)
              </label>
              <SelectCustom
                id="uf"
                value={uf}
                onChange={(e: any) => setUf(e?.target?.value ?? e)}  {/* suporta nativo/custom */}
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
              {errors.uf && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                  {errors.uf}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="crm"
                className="block text-sm font-semibold mb-3 text-slate-700 dark:text-amber-200/90"
              >
                Número do CRM
              </label>
              <input
                id="crm"
                type="text"
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
                placeholder="Digite seu CRM"
                className="w-full px-4 py-4 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 rounded-xl text-slate-800 dark:text-amber-100 placeholder:text-slate-500 dark:placeholder:text-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/60 text-lg"
                autoComplete="username"
                disabled={isLoading}
              />
              {errors.crm && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                  {errors.crm}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-semibold mb-3 text-slate-700 dark:text-amber-200/90"
            >
              Nome Completo
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full px-4 py-4 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 rounded-xl text-slate-800 dark:text-amber-100 placeholder:text-slate-500 dark:placeholder:text-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duração-300 hover:bg-white/80 dark:hover:bg-slate-800/60 text-lg"
              autoComplete="name"
              disabled={isLoading}
            />
            {errors.nome && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                {errors.nome}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold mb-3 text-slate-700 dark:text-amber-200/90"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="w-full px-4 py-4 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 rounded-xl text-slate-800 dark:text-amber-100 placeholder:text-slate-500 dark:placeholder:text-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duração-300 hover:bg-white/80 dark:hover:bg-slate-800/60 text-lg"
              autoComplete="email"
              disabled={isLoading}
            />
            {errors.email && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                {errors.email}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold mb-3 text-slate-700 dark:text-amber-200/90"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha forte"
                  className="w-full px-4 py-4 pr-12 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 rounded-xl text-slate-800 dark:text-amber-100 placeholder:text-slate-500 dark:placeholder:text-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duração-300 hover:bg-white/80 dark:hover:bg-slate-800/60 text-lg"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-amber-300/60 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                  {errors.password}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold mb-3 text-slate-700 dark:text-amber-200/90"
              >
                Confirme a Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className="w-full px-4 py-4 pr-12 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 rounded-xl text-slate-800 dark:text-amber-100 placeholder:text-slate-500 dark:placeholder:text-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duração-300 hover:bg-white/80 dark:hover:bg-slate-800/60 text-lg"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-amber-300/60 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          {/* Termos e Condições */}
          <div className="bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/40 dark:from-amber-900/10 dark:via-orange-900/5 dark:to-yellow-900/10 rounded-xl p-6 border border-amber-200/30 dark:border-amber-700/20">
            <div className="flex items-start gap-4">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-amber-600 bg-white/60 border-amber-300 rounded focus:ring-amber-500 focus:ring-2"
                disabled={isLoading}
                required
              />
              <div className="flex-1">
                <label
                  htmlFor="acceptTerms"
                  className="text-sm text-slate-700 dark:text-amber-200/80 select-none leading-relaxed"
                >
                  Declaro que li e concordo com os{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline decoration-amber-300/50"
                  >
                    Termos de Uso
                  </a>{' '}
                  e a{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline decoration-amber-300/50"
                  >
                    Política de Privacidade
                  </a>.
                </label>
                <div className="mt-3 p-3 bg-slate-100/60 dark:bg-slate-800/40 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-xs text-slate-600 dark:text-amber-200/60 leading-relaxed">
                    <Shield className="w-4 h-4 inline mr-2 text-emerald-600 dark:text-emerald-400" />
                    <strong>Atenção:</strong> O MedCheck é uma ferramenta de apoio à
                    auditoria médica. O usuário é responsável pelos dados inseridos e
                    pelas decisões tomadas com base nos relatórios da plataforma.
                  </p>
                </div>
              </div>
            </div>
            {acceptError && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-3 font-medium">
                {acceptError}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-700 hover:via-orange-700 hover:to-yellow-700 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-amber-500/30 dark:shadow-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <LoadingSpinner size="sm" />
                Criando sua conta...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Criar Conta Premium
                <CheckCircle className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 px-8 pb-8 bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:from-amber-900/10 dark:via-orange-900/5 dark:to-yellow-900/10">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"></div>
        <span className="text-slate-600 dark:text-amber-200/70 text-center">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors underline decoration-amber-300/50 hover:decoration-amber-500"
          >
            Faça login aqui
          </Link>
        </span>
        <p className="text-xs text-center text-slate-500 dark:text-amber-200/50">
          Ao se cadastrar, você concorda com nossos Termos de Uso e Política de
          Privacidade
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
