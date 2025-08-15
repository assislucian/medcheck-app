import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Mail, ArrowLeft, Shield, CheckCircle, Clock } from 'lucide-react';
import { AuthFooter } from '@/components/layout/AuthFooter';
import { MedCheckLogo } from '@/components/ui/MedCheckLogo';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Digite um e-mail válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Simular API call - aqui você pode integrar com o backend real
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay da API
      
      setEmailSent(true);
      toast.success('E-mail de recuperação enviado com sucesso!');
      
      // Em um app real, chamaria a API:
      // const response = await fetch(`${API_URL}/api/auth/password-recovery`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
    } catch (error) {
      toast.error('Erro ao solicitar recuperação de senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
        {/* Background elements matching login page */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-green-100/30 via-emerald-100/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-blue-100/25 via-cyan-100/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-50/30"></div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen">
          <div className="text-center mb-8">
            <MedCheckLogo variant="success" size="lg" className="mb-4" />
          </div>

          <Card className="w-full max-w-md mx-auto backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 border border-green-200/30 dark:border-green-700/30 shadow-2xl shadow-green-500/20 dark:shadow-green-900/40 rounded-2xl overflow-hidden">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">
                E-mail Enviado!
              </CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-300">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 space-y-6">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      E-mail enviado para:
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 font-mono">
                      {email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Próximos passos:
                    </p>
                    <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                      <li>• Verifique sua caixa de entrada (e spam)</li>
                      <li>• Clique no link de recuperação</li>
                      <li>• Defina uma nova senha segura</li>
                      <li>• O link expira em 1 hora</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center px-8 pb-8">
              <Button
                onClick={() => {setEmailSent(false); setEmail(''); setErrors({});}}
                variant="outline"
                className="w-full mb-4"
              >
                Enviar para outro e-mail
              </Button>
              
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Lembrou da senha?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                >
                  Fazer login
                </Link>
              </p>
            </CardFooter>
          </Card>

          <AuthFooter variant="minimal" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Background elements matching login page */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-amber-100/30 via-orange-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-blue-100/25 via-indigo-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-50/30"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen">
        {/* Header */}
        <div className="text-center mb-8">
          <MedCheckLogo variant="attention" size="lg" className="mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recuperar Senha
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Digite seu e-mail para receber o link de recuperação
          </p>
        </div>

        <Card className="w-full max-w-md mx-auto backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 border border-amber-200/30 dark:border-amber-700/30 shadow-2xl shadow-amber-500/20 dark:shadow-amber-900/40 rounded-2xl overflow-hidden">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              Esqueceu a Senha?
            </CardTitle>
            <CardDescription className="text-base text-slate-500 dark:text-slate-400">
              Não se preocupe, vamos ajudar você a recuperar o acesso.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                >
                  E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="seu-email@dominio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Como funciona:
                    </p>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                      <li>• Enviaremos um link seguro para seu e-mail</li>
                      <li>• O link é válido por 1 hora</li>
                      <li>• Clique no link para criar uma nova senha</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Enviando Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Link de Recuperação
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center px-8 pb-8">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-4">
              Lembrou da senha?{' '}
              <Link
                to="/login"
                className="font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Fazer login
              </Link>
            </p>
            
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Voltar ao login
            </Link>
          </CardFooter>
        </Card>

        <AuthFooter variant="minimal" />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
