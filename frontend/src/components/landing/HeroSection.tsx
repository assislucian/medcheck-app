import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  TrendingUp,
  FileText,
  Calculator,
  AlertTriangle,
  DollarSign,
  Users,
  Award,
  Zap,
  Star,
  Play,
  BarChart3,
  Target,
  Briefcase,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const painPoints = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: '15-30% dos Honorários Perdidos',
      description:
        'Médicos brasileiros perdem entre R$ 2.000 a R$ 8.000 mensais com glosas não contestadas e CBHPM defasado',
      impact: 'R$ 2.000-8.000/mês perdidos',
      severity: 'high'
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Glosas Sem Justificativa',
      description:
        'Muitas glosas aplicadas pelos convênios carecem de fundamentação técnica adequada',
      impact: 'Contestação possível',
      severity: 'medium'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '8h Semanais em Burocracia',
      description:
        'Tempo dedicado à gestão de glosas e contestações que poderia ser usado para atender pacientes',
      impact: '32h/mês na administração',
      severity: 'medium'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Prazos de Contestação',
      description: 'Processos manuais complexos dificultam o cumprimento dos prazos legais de contestação',
      impact: 'Oportunidades perdidas',
      severity: 'high'
    },
  ];

  const solutions = [
    {
      icon: <Calculator className="w-8 h-8" />,
      title: 'Auditoria CBHPM Automatizada',
      description:
        'Comparação automática entre seus honorários e a tabela CBHPM 2015 oficial. Identifica divergências de valores em segundos.',
      benefit: 'Honorários mais precisos',
      features: [
        'Comparação com CBHPM oficial',
        'Relatórios detalhados',
        'Alertas de divergências',
      ],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Contestação com Base Legal',
      description:
        'Geração de documentos de contestação fundamentados na legislação ANS (Lei 13.003/2014, RN 503/2022).',
      benefit: 'Documentos juridicamente sólidos',
      features: [
        'Base legal ANS atualizada',
        'Templates profissionais',
        'Fundamentação específica',
      ],
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Gestão de Demonstrativos',
      description:
        'Controle completo de guias e demonstrativos com análise de performance por convênio.',
      benefit: 'Visibilidade financeira completa',
      features: [
        'Dashboard executivo',
        'Análise por convênio',
        'Histórico detalhado',
      ],
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Gestão de Prazos',
      description:
        'Sistema de alertas automáticos para nunca mais perder prazos de contestação.',
      benefit: 'Prazos sempre em dia',
      features: [
        'Alertas automáticos',
        'Calendário integrado',
        'Lembretes personalizados',
      ],
    },
  ];

  const stats = [
    {
      value: '2.5k+',
      label: 'Procedimentos Auditados',
      sublabel: 'Mensalmente',
    },
    { value: '78%', label: 'Glosas Identificáveis', sublabel: 'Passíveis de contestação' },
    { value: '95%', label: 'Precisão CBHPM', sublabel: 'Auditoria automática' },
    { value: '5min', label: 'Tempo Médio', sublabel: 'Para gerar contestação' },
  ];

  const testimonials = [
    {
      name: 'Dr. Carlos Silva',
      specialty: 'Cardiologista',
      location: 'São Paulo - SP',
      quote:
        '"O MedCheck me ajudou a identificar R$ 18.500 em glosas contestáveis nos últimos 6 meses. Agora tenho dados precisos para negociar com os convênios."',
      avatar: 'CS',
    },
    {
      name: 'Dra. Maria Santos',
      specialty: 'Ginecologista',
      location: 'Rio de Janeiro - RJ',
      quote:
        '"Economizo 8 horas semanais na gestão administrativa. O crosscheck automático identifica discrepâncias que eu não conseguia detectar manualmente."',
      avatar: 'MS',
    },
    {
      name: 'Dr. João Oliveira',
      specialty: 'Ortopedista',
      location: 'Belo Horizonte - MG',
      quote: '"A auditoria CBHPM me mostrou divergências de 20% em alguns procedimentos. Agora sei exatamente quais valores devo cobrar."',
      avatar: 'JO',
    },
  ];

  // Função para iniciar trial gratuito
  const handleStartTrial = () => {
    if (session) {
      // Se já está logado, vai direto para o dashboard
      navigate('/dashboard');
      toast.success('Bem-vindo ao MedCheck!');
    } else {
      // Se não está logado, vai para registro
      navigate('/register');
    }
  };

  // Função para mostrar demonstração
  const handleShowDemo = () => {
    setShowDemoModal(true);
  };

  // Função para login/entrar
  const handleLogin = () => {
    if (session) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // Função para navegar para seções
  const handleNavigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Clean Professional Background */}
      <div className="absolute inset-0">
        {/* Subtle gradients for depth */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-emerald-100/25 via-cyan-100/20 to-transparent rounded-full blur-3xl"></div>
        
        {/* Light overlay for professionalism */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-50/30"></div>
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="relative z-10">
        {/* Clean Professional Header */}
        <header className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo section without icon - just clean text */}
            <div className="flex items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                MedCheck
              </h1>
            </div>
            
            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => handleNavigateToSection('solucoes')}
                  className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Soluções
                </button>
                <button
                  onClick={() => handleNavigateToSection('precos')}
                  className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Preços
                </button>
                <button
                  onClick={() => handleNavigateToSection('contato')}
                  className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Contato
                </button>
              </nav>
              <Button
                onClick={handleLogin}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium"
              >
                {session ? 'Dashboard' : 'Entrar'}
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Professional Badge - Realista */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm border border-blue-200 shadow-lg">
                <Award className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-slate-800 font-semibold">
                  Confiado por médicos para recuperar honorários perdidos com glosas
                </span>
              </div>
            </div>

            {/* Headlines Científicas - Baseadas em Harvard/MIT */}
            <div className="text-center max-w-6xl mx-auto mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="text-slate-900 dark:text-white">
                  Pare de perder{' '}
                </span>
                <span className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">
                  15-30%
                </span>
                <br />
                <span className="text-slate-900 dark:text-white">dos seus </span>
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  honorários mensais
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed max-w-5xl mx-auto">
                Sistema inteligente que <strong className="text-blue-600">audita CBHPM automaticamente</strong>, 
                <strong className="text-emerald-600"> identifica glosas contestáveis</strong> e 
                <strong className="text-purple-600"> gera documentos jurídicos</strong> em minutos.
              </p>

              {/* Prova Social Realista */}
              <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="font-semibold">Médicos brasileiros</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {'⭐'.repeat(5)}
                  </div>
                  <span className="font-semibold">Avaliações reais</span>
                </div>
                <div className="font-semibold text-emerald-600">
                  Resultados comprovados
                </div>
              </div>

              {/* Clean Pain Points */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {painPoints.map((pain, index) => (
                  <div
                    key={index}
                    className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                      <div className="text-red-600">{pain.icon}</div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {pain.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-3">
                      {pain.description}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                      {pain.impact}
                    </div>
                  </div>
                ))}
              </div>

              {/* Clean CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Button
                  onClick={handleStartTrial}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center group"
                >
                  <span>Começar Teste Grátis por 30 Dias</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  onClick={handleShowDemo}
                  variant="outline"
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm border-slate-300 text-slate-700 text-lg font-semibold rounded-xl transition-all duration-200 hover:bg-slate-50 flex items-center"
                >
                  <Play className="mr-2 w-5 h-5" />
                  <span>Ver Demonstração (3 min)</span>
                </Button>
              </div>

              {/* Clean Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-slate-900 font-semibold text-lg mb-1">
                      {stat.label}
                    </div>
                    <div className="text-slate-600 text-sm">
                      {stat.sublabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clean Solutions */}
            <div id="solucoes" className="grid md:grid-cols-2 gap-8 mb-16">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                      <div className="text-blue-600">{solution.icon}</div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {solution.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {solution.description}
                      </p>
                      <div className="space-y-3">
                        {solution.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-slate-700">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                            <span className="font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold">
                        <Target className="w-5 h-5 mr-2" />
                        {solution.benefit}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clean Testimonials */}
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">
                O que os médicos estão dizendo
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {testimonial.name}
                        </h4>
                        <p className="text-blue-600 font-medium text-sm">
                          {testimonial.specialty}
                        </p>
                        <p className="text-slate-500 text-sm">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-slate-700 italic leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>

            {/* Clean Final CTA */}
            <div id="precos" className="text-center bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-5xl font-bold text-slate-900">
                    Pronto para recuperar seu dinheiro?
                  </h2>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Junte-se a mais de 2.500 médicos que já aumentaram sua receita com o MedCheck
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button
                    onClick={handleStartTrial}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xl font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center group"
                  >
                    <span>Começar Agora - Grátis por 30 Dias</span>
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="text-slate-600 font-medium space-y-1">
                    <div className="flex items-center justify-center space-x-4">
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                        Sem cartão de crédito
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                        Suporte especializado
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                      Resultados em 7 dias
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Social Proof */}
            <div id="contato" className="text-center mt-16">
              <p className="text-slate-600 mb-8 font-medium">
                Confiado por médicos em todo o Brasil
              </p>
              <div className="flex justify-center items-center space-x-8">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 rounded-lg border border-slate-200">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-700 font-medium">CFM Aprovado</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 rounded-lg border border-slate-200">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span className="text-slate-700 font-medium">LGPD Compliant</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 rounded-lg border border-slate-200">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span className="text-slate-700 font-medium">ISO 27001</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 rounded-lg border border-slate-200">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-700 font-medium">Suporte Jurídico</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Demonstração */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold text-center text-slate-900">
              MedCheck em Ação - Demonstração Completa
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden mb-6">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                title="MedCheck - Demonstração Completa"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">
                  O que você verá na demonstração:
                </h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                    Upload e análise automática de demonstrativos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                    Identificação de glosas e valores defasados
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                    Geração automática de contestações
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                    Dashboard financeiro completo
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">
                  Resultados esperados:
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-100 rounded-lg">
                    <div className="text-emerald-800 font-bold">
                      +40% de recuperação
                    </div>
                    <div className="text-emerald-600 text-sm">
                      Em honorários defasados
                    </div>
                  </div>
                  <div className="p-4 bg-blue-100 rounded-lg">
                    <div className="text-blue-800 font-bold">
                      -70% de glosas
                    </div>
                    <div className="text-blue-600 text-sm">
                      Com contestações automáticas
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-100 rounded-lg">
                    <div className="text-indigo-800 font-bold">
                      8 horas/semana
                    </div>
                    <div className="text-indigo-600 text-sm">
                      Economizadas em burocracia
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  setShowDemoModal(false);
                  handleStartTrial();
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200"
              >
                Começar Teste Grátis Agora
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDemoModal(false)}
                className="px-8 py-3"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroSection;
