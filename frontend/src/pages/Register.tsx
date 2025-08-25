import RegisterForm from '@/components/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MedCheckLogo } from '@/components/ui/MedCheckLogo';

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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Clean Professional Background matching homepage and login */}
      <div className="absolute inset-0">
        {/* Subtle gradients for depth */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-emerald-100/25 via-cyan-100/20 to-transparent rounded-full blur-3xl"></div>
        
        {/* Light overlay for professionalism */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-50/30"></div>
      </div>

      {/* Subtle grid pattern matching homepage */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen">
        {loading ? (
          <LoadingSpinner text="Carregando..." />
        ) : (
          <>
            {/* Clean Professional Title matching homepage and login */}
            <div className="text-center mb-12">
              <div className="space-y-4">
                <MedCheckLogo variant="primary" size="lg" showImage={true} />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Junte-se ao MedCheck
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Comece a recuperar valores glosados e aumente sua receita médica em até
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {' '}
                    40% já no primeiro mês
                  </span>
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>95% de sucesso em contestações</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Teste grátis por 30 dias</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Cadastro */}
            <RegisterForm />

            {/* Clean Professional Footer */}
            <div className="mt-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Seus dados estão seguros - Certificação SSL e LGPD
              </p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
