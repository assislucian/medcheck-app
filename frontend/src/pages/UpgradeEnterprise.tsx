import React from 'react';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Crown, 
  Zap, 
  Shield, 
  Brain, 
  Users, 
  Database,
  BarChart3,
  Stethoscope,
  CheckCircle,
  Star,
  TrendingUp,
  Lock,
  Headphones,
  FileText,
  Globe,
  Briefcase,
  Rocket,
  Award,
  Clock,
  Phone
} from 'lucide-react';

const UpgradeEnterprise = () => {
  const enterpriseFeatures = [
    {
      icon: Brain,
      title: 'IA Médica Avançada',
      description: 'Algoritmos de machine learning especializados em medicina brasileira',
      highlight: 'Exclusivo Enterprise'
    },
    {
      icon: Database,
      title: 'Capacidade Ilimitada',
      description: 'Sem limites de upload, análise ou armazenamento de dados',
      highlight: 'Sem Limites'
    },
    {
      icon: Shield,
      title: 'Segurança Máxima',
      description: 'Criptografia militar, compliance LGPD e certificação ISO',
      highlight: 'Máxima Segurança'
    },
    {
      icon: Users,
      title: 'Equipes Ilimitadas',
      description: 'Adicione quantos médicos e assistentes precisar',
      highlight: 'Multi-usuário'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avançados',
      description: 'Dashboards executivos e relatórios personalizados',
      highlight: 'Business Intelligence'
    },
    {
      icon: Headphones,
      title: 'Suporte Premium 24/7',
      description: 'Gerente de conta dedicado e suporte prioritário',
      highlight: 'Suporte VIP'
    }
  ];

  const plans = [
    {
      name: 'Enterprise Starter',
      price: 'R$ 1.497',
      period: '/mês',
      description: 'Para clínicas de médio porte',
      features: [
        'Até 50 médicos',
        'IA médica avançada',
        'Suporte 24/7',
        'Integrações básicas',
        'Analytics avançados'
      ],
      highlight: false
    },
    {
      name: 'Enterprise Pro',
      price: 'R$ 2.997',
      period: '/mês',
      description: 'Para hospitais e grandes clínicas',
      features: [
        'Médicos ilimitados',
        'IA + Machine Learning',
        'Gerente dedicado',
        'Integrações completas',
        'BI personalizado',
        'API Enterprise'
      ],
      highlight: true
    },
    {
      name: 'Enterprise Custom',
      price: 'Sob consulta',
      period: '',
      description: 'Para redes hospitalares',
      features: [
        'Solução personalizada',
        'Deploy on-premise',
        'SLA garantido',
        'Treinamento in-loco',
        'Desenvolvimento custom'
      ],
      highlight: false
    }
  ];

  return (
    <AuthenticatedLayout
      title="MedCheck Enterprise"
      description="Solução médica enterprise com IA avançada e capacidade ilimitada"
    >
      <div className="min-h-screen bg-gradient-to-br from-medical-50/30 via-brand-50/20 to-mint-50/30">
        <div className="space-y-12 px-4 sm:px-6 lg:px-8">
          {/* Header Humanizado seguindo padrão Dashboard */}
          <div className="text-center space-y-4 pt-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-medical-100 to-brand-100 border border-medical-200/50">
              <Crown className="h-5 w-5 text-medical-700" />
              <span className="text-sm font-medium text-medical-800">
                Enterprise Edition
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-medical-700 via-brand-600 to-trust-800 bg-clip-text text-transparent">
              MedCheck Enterprise
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transforme sua instituição médica com tecnologia de nível mundial. IA avançada, capacidade ilimitada e suporte especializado.
            </p>
          </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {enterpriseFeatures.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-amber-50/30"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-amber-500"></div>
              
              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-amber-100">
                    <feature.icon className="h-8 w-8 text-purple-700" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs font-semibold">
                    {feature.highlight}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Planos Enterprise
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para sua instituição médica
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden ${
                plan.highlight 
                  ? 'border-2 border-purple-300 shadow-2xl transform scale-105' 
                  : 'border border-gray-200 shadow-lg'
              }`}>
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-amber-600 text-white text-center py-2 text-sm font-semibold">
                    Mais Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.highlight ? 'pt-12' : 'pt-6'}`}>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-purple-700">
                      {plan.price}
                      <span className="text-lg font-normal text-gray-500">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-6 text-lg font-semibold ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {plan.price === 'Sob consulta' ? 'Falar com Vendas' : 'Começar Agora'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-8 bg-gradient-to-r from-purple-50 to-amber-50 rounded-2xl p-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Pronto para revolucionar sua prática médica?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fale com nossos especialistas e descubra como o MedCheck Enterprise
              pode transformar sua instituição médica.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="px-12 py-6 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white text-lg font-semibold rounded-xl">
              <Phone className="mr-2 h-5 w-5" />
              Agendar Demonstração
            </Button>
            <Button variant="outline" className="px-12 py-6 text-lg font-semibold rounded-xl">
              <FileText className="mr-2 h-5 w-5" />
              Download do Caso de Negócio
            </Button>
          </div>
        </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default UpgradeEnterprise; 