import RegisterForm from '@/components/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const RegisterPage = () => {
  const { session, loading } = useAuth();

  // Redirect based on health plan selection if already logged in
  if (session) {
    const selectedHealthPlan = localStorage.getItem('selected_health_plan');

    // Se não tem plano selecionado, vai para seleção de plano
    if (!selectedHealthPlan) {
      return <Navigate to="/health-plan-selection" replace />;
    }

    // Se já tem plano, vai para dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-rose-50/30 dark:from-slate-900 dark:via-amber-900/10 dark:to-rose-900/10 overflow-hidden">
      {/* Background Premium com Efeitos Dourados */}
      <div className="absolute inset-0">
        {/* Gradientes dourados premium que transmitem prosperidade */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-amber-300/20 via-yellow-300/15 to-orange-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-emerald-300/25 via-teal-300/20 to-green-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-rose-300/10 via-pink-300/8 to-purple-300/12 rounded-full blur-3xl"></div>

        {/* Overlays dourados que transmitem luxo e confiança */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/8 via-transparent to-emerald-400/8"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/6 via-transparent to-teal-400/6"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-yellow-400/5 via-transparent to-green-400/7"></div>
      </div>

      {/* Grid pattern mais sutil e elegante */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen">
        {loading ? (
          <LoadingSpinner text="Carregando..." />
        ) : (
          <>
            {/* Título Premium sem Logo */}
            <div className="text-center mb-12">
              <div className="space-y-3">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  MedCheck
                </h1>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-amber-100">
                  Junte-se ao MedCheck
                </h2>
                <p className="text-xl text-slate-600 dark:text-amber-200/80 max-w-2xl mx-auto leading-relaxed">
                  Comece a recuperar valores glosados e aumente sua receita médica em
                  até
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    {' '}
                    40% já no primeiro mês
                  </span>
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-slate-500 dark:text-amber-200/60">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>95% de sucesso em contestações</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span>Teste grátis por 30 dias</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Cadastro */}
            <RegisterForm />

            {/* Footer Premium */}
            <div className="mt-12 text-center">
              <p className="text-slate-500 dark:text-amber-200/60 text-sm">
                Seus dados estão seguros - Certificação SSL e LGPD
              </p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
