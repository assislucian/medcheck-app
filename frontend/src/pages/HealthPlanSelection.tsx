// UPDATED - Version 2.0 - Correções aplicadas
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  Shield,
  CheckCircle,
  ArrowRight,
  Heart,
  Building2,
  Zap,
  Calendar,
  FileText,
  FileBarChart,
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  Hospital,
  TrendingUp,
  CreditCard,
  Stethoscope,
  Activity,
  Brain,
  Smartphone,
  Target,
} from 'lucide-react';

interface HealthPlanFeature {
  text: string;
  icon: React.ReactNode;
}

interface HealthPlan {
  id: string;
  name: string;
  logo: string;
  description: string;
  features: HealthPlanFeature[];
  status: 'active' | 'coming_soon';
  estimatedLaunch?: string;
  priority?: 'high' | 'medium' | 'low';
  color: {
    primary: string;
    secondary: string;
    accent: string;
    iconColor: string;
  };
}

const healthPlans: HealthPlan[] = [
  {
    id: 'unimed',
    name: 'Unimed',
    logo: '/logos/health-plans/unimed-new.svg',
    description:
      'Sistema cooperativista de medicina do Brasil, com foco em qualidade e humanização.',
    features: [
      {
        text: 'Demonstrativos detalhados por procedimento',
        icon: <FileBarChart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      },
      {
        text: 'Análise de glosas e participações médicas',
        icon: <AlertTriangle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      },
      {
        text: 'Comparação automática com tabela CBHPM',
        icon: <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      },
      {
        text: 'Relatórios de auditoria especializados',
        icon: <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      },
    ],
    status: 'active',
    color: {
      primary: 'from-emerald-600 to-green-700',
      secondary: 'from-emerald-50 to-green-50',
      accent: 'border-emerald-200',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  },
  {
    id: 'hapvida',
    name: 'Hapvida',
    logo: '/logos/health-plans/hapvida-new.svg',
    description:
      'Maior operadora de planos de saúde do Norte e Nordeste do Brasil.',
    features: [
      {
        text: 'Rede própria de hospitais e clínicas',
        icon: <Hospital className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      },
      {
        text: 'Análise especializada para Hapvida',
        icon: <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      },
      {
        text: 'Relatórios específicos do grupo',
        icon: <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      },
      {
        text: 'Monitoramento de glosas personalizado',
        icon: <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      },
    ],
    status: 'coming_soon',
    estimatedLaunch: 'Setembro 2025',
    priority: 'high',
    color: {
      primary: 'from-orange-600 to-red-700',
      secondary: 'from-orange-50 to-red-50',
      accent: 'border-orange-200',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  },
  {
    id: 'bradesco',
    name: 'Bradesco Saúde',
    logo: '/logos/health-plans/bradesco-new.svg',
    description:
      'Plano de saúde do Grupo Bradesco, com ampla cobertura nacional.',
    features: [
      {
        text: 'Cobertura nacional abrangente',
        icon: <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
      },
      {
        text: 'Integração com sistema bancário',
        icon: <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
      },
      {
        text: 'Relatórios financeiros detalhados',
        icon: <BarChart3 className="h-4 w-4 text-red-600 dark:text-red-400" />
      },
      {
        text: 'Análise de tendências de mercado',
        icon: <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
      },
    ],
    status: 'coming_soon',
    estimatedLaunch: 'Outubro 2025',
    priority: 'medium',
    color: {
      primary: 'from-red-600 to-red-700',
      secondary: 'from-red-50 to-red-50',
      accent: 'border-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  },
  {
    id: 'sulamerica',
    name: 'SulAmérica',
    logo: '/logos/health-plans/sulamerica-new.svg',
    description:
      'Uma das maiores seguradoras do Brasil, com tradição em saúde.',
    features: [
      {
        text: 'Rede credenciada premium',
        icon: <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      },
      {
        text: 'Medicina preventiva avançada',
        icon: <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      },
      {
        text: 'Relatórios de qualidade assistencial',
        icon: <ClipboardCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      },
      {
        text: 'Análise de eficiência operacional',
        icon: <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      },
    ],
    status: 'coming_soon',
    estimatedLaunch: 'Dezembro 2025',
    priority: 'medium',
    color: {
      primary: 'from-blue-600 to-indigo-700',
      secondary: 'from-blue-50 to-indigo-50',
      accent: 'border-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  },
  {
    id: 'amil',
    name: 'Amil',
    logo: '/logos/health-plans/amil-new.svg',
    description:
      'Uma das maiores operadoras do Brasil, parte do grupo UnitedHealth.',
    features: [
      {
        text: 'Rede credenciada ampla e qualificada',
        icon: <Hospital className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      },
      {
        text: 'Programas de saúde preventiva',
        icon: <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      },
      {
        text: 'Central de relacionamento 24h',
        icon: <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      },
      {
        text: 'Análise de utilização e custos',
        icon: <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      },
    ],
    status: 'coming_soon',
    estimatedLaunch: 'Janeiro 2026',
    priority: 'medium',
    color: {
      primary: 'from-purple-600 to-violet-700',
      secondary: 'from-purple-50 to-violet-50',
      accent: 'border-purple-200',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  },
];

const HealthPlanSelection = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlanSelection = async (planId: string) => {
    const plan = healthPlans.find((p) => p.id === planId);

    if (!plan) return;

    if (plan.status === 'coming_soon') {
      toast.info(`${plan.name} estará disponível em breve!`, {
        description: 'Estamos trabalhando para oferecer suporte completo a este plano de saúde. Cadastre-se na lista de espera para ser notificado.',
        duration: 4000,
        action: {
          label: 'Lista de Espera',
          onClick: () => {
            toast.success('Adicionado à lista de espera!', {
              description: `Você será notificado quando ${plan.name} estiver disponível.`
            });
          }
        }
      });
      return;
    }

    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      // Simula um pequeno delay para feedback visual
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Salva a seleção do plano no localStorage para uso posterior
      localStorage.setItem('selected_health_plan', planId);

      toast.success(`${plan.name} selecionado com sucesso!`, {
        description: 'Você será redirecionado para o dashboard.',
      });

      // Redireciona para o dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error('Erro ao selecionar plano de saúde');
      setIsLoading(false);
      setSelectedPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-cyan-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      {/* Medical Professional Background with Clean Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-300/20 via-indigo-300/15 to-cyan-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-cyan-300/25 via-indigo-300/20 to-blue-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/8 via-indigo-400/5 to-cyan-400/8"></div>
      </div>

      <div className="relative max-w-6xl mx-auto space-y-8">
        {/* Header Premium */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-600 border border-blue-200 dark:border-slate-500">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Seleção de Plano de Saúde
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Escolha seu Plano de Saúde ✨
          </h1>

          <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Selecione o plano de saúde para o qual você deseja analisar demonstrativos e
            guias médicas. Cada plano possui um parser especializado para garantir
            máxima precisão na análise.
          </p>
        </div>

        {/* Cards de Planos de Saúde */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 place-items-center max-w-7xl mx-auto">
          {healthPlans.map((plan) => (
                         <Card
               key={plan.id}
               className={`relative overflow-hidden border-0 shadow-lg hover:shadow-2xl dark:shadow-slate-900/50 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] bg-white dark:bg-slate-800/95 backdrop-blur-sm w-full max-w-[320px] h-[380px] flex flex-col group ${
                 selectedPlan === plan.id && isLoading ? 'ring-2 ring-blue-400 shadow-blue-200 dark:shadow-blue-900/50' : ''
               } ${
                 plan.status === 'active' 
                   ? 'cursor-pointer hover:shadow-blue-200/60 dark:hover:shadow-blue-900/30 ring-2 ring-emerald-300/50 dark:ring-emerald-400/40 shadow-emerald-100/30 dark:shadow-emerald-900/20' 
                   : 'cursor-default hover:opacity-90'
               }`}
               onClick={() => handlePlanSelection(plan.id)}
             >
                             {/* Background Gradient */}
               <div
                 className="absolute inset-0 bg-gradient-to-br from-slate-50/30 to-gray-50/30 dark:from-slate-700/40 dark:to-slate-600/40"
               ></div>

              {/* Top Border Gradient */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.color.primary}`}
              ></div>

                              <div className="relative p-8 flex flex-col h-full justify-between">
                {/* Logo Container - Fixo no topo */}
                <div className="flex items-center justify-center mb-4 h-20">
                  <div className="relative">
                    <img
                      src={plan.logo}
                      alt={`Logo ${plan.name}`}
                      className="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback para ícone se a imagem não carregar
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Mostra ícone de fallback baseado no plano
                        const container = target.parentElement;
                        if (container) {
                          const icon = document.createElement('div');
                          icon.className = 'flex items-center justify-center w-20 h-20';
                          if (plan.id === 'unimed') {
                            icon.innerHTML = '<svg class="h-12 w-12 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
                          } else if (plan.id === 'hapvida') {
                            icon.innerHTML = '<svg class="h-12 w-12 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21V3h18v18H3zm2-2h14V5H5v14z"/></svg>';
                          } else {
                            icon.innerHTML = '<svg class="h-12 w-12 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
                          }
                          container.appendChild(icon);
                        }
                      }}
                    />
                    {/* Glow effect for active plans */}
                    {plan.status === 'active' && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-cyan-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </div>
                </div>

                                 {/* Status Badge - Centralizado */}
                 <div className="flex justify-center mb-4">
                   {plan.status === 'active' ? (
                     <Badge 
                       className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 px-4 py-2"
                       aria-label="Plano disponível"
                     >
                       <CheckCircle className="h-3 w-3 mr-1.5" />
                       Disponível
                     </Badge>
                   ) : (
                     <Badge
                       variant="outline"
                       className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700/60 dark:to-slate-600/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500 px-4 py-2 shadow-sm"
                       aria-label={`Disponível ${plan.estimatedLaunch}`}
                       title={`Previsão de lançamento: ${plan.estimatedLaunch}`}
                     >
                       <Calendar className="h-3 w-3 mr-1.5" />
                       {plan.estimatedLaunch}
                     </Badge>
                   )}
                 </div>

                {/* Plan Name - Espaço fixo para evitar desalinhamento */}
                <div className="text-center mb-6 h-16 flex items-center justify-center px-2">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200 leading-tight text-center">
                    {plan.name}
                  </h3>
                </div>

                {/* Action Button - Fixo na parte inferior */}
                <div className="mt-auto flex justify-center">
                                    <Button
                    size="default"
                    variant={plan.status === 'active' ? 'primary' : 'outline'}
                    className={`w-full max-w-[310px] font-medium ${
                      plan.status === 'active' 
                        ? 'shadow-lg' 
                        : ''
                    }`}
                    disabled={isLoading && selectedPlan === plan.id}
                    aria-label={
                      plan.status === 'active' 
                        ? `Selecionar plano ${plan.name}` 
                        : `${plan.name} em breve`
                    }
                  >
                                         {isLoading && selectedPlan === plan.id ? (
                       <div className="flex items-center justify-center gap-2">
                         <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         <span>Conectando...</span>
                       </div>
                     ) : plan.status === 'active' ? (
                       <div className="flex items-center justify-center gap-2">
                         <span>Selecionar Plano</span>
                         <ArrowRight className="h-4 w-4" />
                       </div>
                     ) : (
                       <div className="flex items-center justify-center gap-2">
                         <span className="font-medium">Em breve</span>
                       </div>
                     )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Progress Roadmap */}
        <div className="text-center pt-8 space-y-4">
          <div className="bg-white dark:bg-slate-800/60 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3">
              📈 Progresso do Roadmap
            </h3>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">1</span>
              <span className="text-slate-500 dark:text-slate-400">de</span>
              <span className="text-2xl font-bold text-slate-600 dark:text-slate-300">5</span>
              <span className="text-slate-500 dark:text-slate-400">planos disponíveis</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-500" style={{width: '20%'}}></div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              🚀 Próximos lançamentos: Hapvida (Set/2025) • Bradesco (Out/2025) • SulAmérica (Dez/2025)
            </p>
          </div>
        </div>

        {/* Footer Premium */}
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-600 border border-blue-200 dark:border-slate-500">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Análise segura e precisa para seu plano de saúde
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthPlanSelection;
