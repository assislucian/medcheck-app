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
} from 'lucide-react';

interface HealthPlan {
  id: string;
  name: string;
  logo?: string;
  description: string;
  features: string[];
  status: 'active' | 'coming_soon';
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const healthPlans: HealthPlan[] = [
  {
    id: 'unimed',
    name: 'Unimed',
    description:
      'Sistema cooperativista de medicina do Brasil, com foco em qualidade e humanização.',
    features: [
      'Demonstrativos detalhados por procedimento',
      'Análise de glosas e participações médicas',
      'Comparação automática com tabela CBHPM',
      'Relatórios de auditoria especializados',
    ],
    status: 'active',
    color: {
      primary: 'from-emerald-600 to-green-700',
      secondary: 'from-emerald-50 to-green-50',
      accent: 'border-emerald-200',
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
        description:
          'Estamos trabalhando para oferecer suporte completo a este plano de saúde.',
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 p-6">
      {/* Background Premium com Efeitos Dourados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-amber-300/15 via-yellow-300/10 to-orange-300/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-emerald-300/20 via-teal-300/15 to-green-300/12 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-emerald-400/5"></div>
      </div>

      <div className="relative max-w-6xl mx-auto space-y-8">
        {/* Header Premium */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <Shield className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              Seleção de Plano de Saúde
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 bg-clip-text text-transparent">
            Escolha seu Plano de Saúde
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Selecione o plano de saúde para o qual você deseja analisar demonstrativos e
            guias médicas. Cada plano possui um parser especializado para garantir
            máxima precisão na análise.
          </p>
        </div>

        {/* Cards de Planos de Saúde */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {healthPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 cursor-pointer ${
                selectedPlan === plan.id && isLoading ? 'ring-2 ring-amber-400' : ''
              }`}
              onClick={() => handlePlanSelection(plan.id)}
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${plan.color.secondary}`}
              ></div>

              {/* Top Border Gradient */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.color.primary}`}
              ></div>

              <div className="relative p-6">
                <CardHeader className="p-0 space-y-4">
                  {/* Logo/Icon Container */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color.secondary} ${plan.color.accent} border-2`}
                  >
                    {plan.id === 'unimed' && (
                      <Heart className="h-8 w-8 text-emerald-600" />
                    )}
                    {plan.id === 'hapvida' && (
                      <Building2 className="h-8 w-8 text-blue-600" />
                    )}
                    {plan.id === 'bradesco' && <Zap className="h-8 w-8 text-red-600" />}
                  </div>

                  {/* Title e Status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-gray-800">
                        {plan.name}
                      </CardTitle>

                      {plan.status === 'active' ? (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Em Breve
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-0 space-y-4">
                  {/* Features List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Funcionalidades
                    </h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Button
                    className={`w-full ${
                      plan.status === 'active'
                        ? `bg-gradient-to-r ${plan.color.primary} hover:opacity-90 text-white border-0`
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 border-0 cursor-not-allowed'
                    } transition-all duration-300`}
                    disabled={
                      plan.status === 'coming_soon' ||
                      (isLoading && selectedPlan === plan.id)
                    }
                  >
                    {isLoading && selectedPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Conectando...
                      </div>
                    ) : plan.status === 'active' ? (
                      <div className="flex items-center gap-2">
                        Selecionar {plan.name}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Em Desenvolvimento
                        <Calendar className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Premium */}
        <div className="text-center pt-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <Shield className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700">
              Análise segura e precisa para seu plano de saúde
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthPlanSelection;
