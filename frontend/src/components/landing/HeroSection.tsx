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
import MedCheckLogo from '@/components/ui/MedCheckLogo';
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
      title: 'Honorários Defasados',
      description:
        'Tabela CBHPM desatualizada resulta em perdas de até 40% nos honorários médicos',
      impact: '-R$ 15.000/mês',
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Glosas Abusivas',
      description:
        'Planos de saúde glosam procedimentos sem base técnica, gerando prejuízos mensais',
      impact: '70% dos médicos afetados',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Tempo Perdido',
      description:
        'Médicos gastam 8+ horas semanais com burocracia ao invés de atender pacientes',
      impact: '32h/mês perdidas',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Contestações Manuais',
      description: 'Processo manual de contestação é demorado e muitas vezes ineficaz',
      impact: '15% taxa de sucesso',
    },
  ];

  const solutions = [
    {
      icon: <Calculator className="w-8 h-8" />,
      title: 'Auditoria Inteligente CBHPM',
      description:
        'Análise automática de honorários com base na tabela CBHPM atualizada. Identifica valores defasados e calcula o valor correto automaticamente.',
      benefit: 'Recupere até 40% dos seus honorários',
      features: [
        'Comparação automática CBHPM',
        'Relatórios detalhados',
        'Alertas de defasagem',
      ],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Contestação Automatizada',
      description:
        'Geração automática de contestações com base legal e técnica sólida. Documentos prontos para envio aos planos de saúde.',
      benefit: 'Reduza glosas em até 70%',
      features: [
        'Base legal atualizada',
        'Templates profissionais',
        'Histórico de sucesso',
      ],
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Gestão Financeira Médica',
      description:
        'Controle completo das suas finanças com relatórios especializados e análises de performance por convênio.',
      benefit: 'Aumente sua receita em 35%',
      features: [
        'Dashboard executivo',
        'Análise por convênio',
        'Projeções financeiras',
      ],
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Automação de Prazos',
      description:
        'Nunca mais perca um prazo de contestação com alertas inteligentes e calendário automatizado.',
      benefit: '100% dos prazos cumpridos',
      features: [
        'Alertas por WhatsApp',
        'Calendário integrado',
        'Lembretes automáticos',
      ],
    },
  ];

  const stats = [
    {
      value: 'R$ 2.3M+',
      label: 'Recuperado para médicos',
      sublabel: 'nos últimos 12 meses',
    },
    { value: '15.000+', label: 'Glosas contestadas', sublabel: 'com 95% de sucesso' },
    { value: '2.500+', label: 'Médicos ativos', sublabel: 'em todo o Brasil' },
    { value: '40%', label: 'Aumento médio', sublabel: 'na receita líquida' },
  ];

  const testimonials = [
    {
      name: 'Dr. Carlos Silva',
      specialty: 'Cardiologista',
      location: 'São Paulo - SP',
      quote:
        'Recuperei R$ 47.000 em glosas que achava perdidas. O MedCheck mudou minha vida financeira.',
      avatar: 'CS',
    },
    {
      name: 'Dra. Maria Santos',
      specialty: 'Ginecologista',
      location: 'Rio de Janeiro - RJ',
      quote:
        'Agora tenho tempo para o que realmente importa: meus pacientes. A automação é perfeita.',
      avatar: 'MS',
    },
    {
      name: 'Dr. João Oliveira',
      specialty: 'Ortopedista',
      location: 'Belo Horizonte - MG',
      quote: 'Em 6 meses, minha receita aumentou 42%. O ROI foi imediato.',
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
    <div className="relative min-h-screen bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-rose-50/30 dark:from-slate-900 dark:via-amber-900/10 dark:to-rose-900/10 overflow-hidden">
      {/* Neurociência Visual: Background Luxuoso */}
      <div className="absolute inset-0">
        {/* Gradientes dourados premium que transmitem prosperidade */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-amber-300/20 via-yellow-300/15 to-orange-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[900px] h-[900px] bg-gradient-to-tl from-emerald-300/25 via-teal-300/20 to-green-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-rose-300/10 via-pink-300/8 to-purple-300/12 rounded-full blur-3xl"></div>

        {/* Overlays dourados que transmitem luxo e confiança */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/8 via-transparent to-emerald-400/8"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/6 via-transparent to-teal-400/6"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-yellow-400/5 via-transparent to-green-400/7"></div>
      </div>

      {/* Grid pattern mais sutil e elegante */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="relative z-10">
        {/* Header Premium com Cores Douradas */}
        <header className="px-6 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MedCheckLogo
                size="lg"
                className="group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                MedCheck
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => handleNavigateToSection('solucoes')}
                  className="text-slate-800 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-semibold"
                >
                  Soluções
                </button>
                <button
                  onClick={() => handleNavigateToSection('precos')}
                  className="text-slate-800 dark:text-amber-100 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-semibold"
                >
                  Preços
                </button>
                <button
                  onClick={() => handleNavigateToSection('contato')}
                  className="text-slate-800 dark:text-amber-100 hover:text-orange-700 dark:hover:text-orange-300 transition-colors font-semibold"
                >
                  Contato
                </button>
              </nav>
              <Button
                onClick={handleLogin}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-700 hover:via-orange-700 hover:to-yellow-700 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/30 font-bold"
              >
                {session ? 'Dashboard' : 'Entrar'}
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Badge Premium Dourado */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-amber-100/80 via-yellow-100/70 to-orange-100/80 dark:from-amber-900/40 dark:via-yellow-900/30 dark:to-orange-900/40 backdrop-blur-xl border border-amber-300/50 dark:border-amber-500/40 shadow-2xl shadow-amber-500/20">
                <Award className="w-6 h-6 text-amber-700 dark:text-amber-300 mr-3" />
                <span className="text-amber-900 dark:text-amber-200 font-bold text-lg">
                  #1 em Auditoria Médica no Brasil - Mais de 2.500 médicos confiam
                </span>
              </div>
            </div>

            {/* Headline com Cores Neurocientíficas */}
            <div className="text-center max-w-6xl mx-auto mb-20">
              <h1 className="text-6xl md:text-8xl font-bold mb-10 leading-tight">
                <span className="text-slate-900 dark:text-amber-50">
                  Médico, pare de{' '}
                </span>
                <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent drop-shadow-lg">
                  perder dinheiro
                </span>
                <br />
                <span className="text-slate-900 dark:text-amber-50">com </span>
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                  glosas abusivas
                </span>
              </h1>

              <p className="text-2xl md:text-3xl text-slate-700 dark:text-amber-100 mb-16 leading-relaxed max-w-5xl mx-auto font-medium">
                A primeira plataforma brasileira que combina{' '}
                <strong className="text-amber-800 dark:text-amber-300 font-bold">
                  auditoria CBHPM
                </strong>
                ,
                <strong className="text-emerald-800 dark:text-emerald-300 font-bold">
                  {' '}
                  contestação automatizada
                </strong>{' '}
                e
                <strong className="text-orange-800 dark:text-orange-300 font-bold">
                  {' '}
                  gestão financeira médica
                </strong>{' '}
                em um só lugar.
              </p>

              {/* Pain Points com Vermelho Impactante */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                {painPoints.map((pain, index) => (
                  <div
                    key={index}
                    className="group p-8 rounded-3xl bg-gradient-to-br from-red-100/90 via-rose-100/80 to-pink-100/90 dark:from-red-900/30 dark:via-rose-900/20 dark:to-pink-900/30 backdrop-blur-xl border border-red-300/60 dark:border-red-500/40 hover:border-red-400/80 dark:hover:border-red-400/60 transition-all duration-500 hover:scale-105 shadow-2xl shadow-red-500/20 hover:shadow-red-500/30"
                  >
                    <div className="text-red-700 dark:text-red-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                      {pain.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-red-100 mb-3 text-lg">
                      {pain.title}
                    </h3>
                    <p className="text-slate-700 dark:text-red-200 text-sm mb-4 leading-relaxed">
                      {pain.description}
                    </p>
                    <div className="text-red-800 dark:text-red-300 text-sm font-bold px-4 py-3 bg-gradient-to-r from-red-200/80 to-rose-200/80 dark:from-red-800/60 dark:to-rose-800/60 rounded-xl border border-red-300/60 dark:border-red-500/40 shadow-lg">
                      {pain.impact}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs Dourados Premium */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                <Button
                  onClick={handleStartTrial}
                  className="group px-16 py-6 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-700 hover:via-orange-700 hover:to-yellow-700 text-white text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/50 flex items-center"
                >
                  Começar Teste Grátis por 30 Dias
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={handleShowDemo}
                  variant="outline"
                  className="group px-16 py-6 bg-gradient-to-r from-amber-100/90 via-yellow-100/90 to-orange-100/90 dark:from-amber-800/80 dark:via-yellow-800/80 dark:to-orange-800/80 text-amber-900 dark:text-amber-100 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-xl border border-amber-300/60 dark:border-amber-600/60 shadow-2xl hover:shadow-xl flex items-center"
                >
                  <Play className="mr-3 w-6 h-6" />
                  Ver Demonstração (3 min)
                </Button>
              </div>

              {/* Stats com Dourado Premium */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-24">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center p-8 rounded-3xl bg-gradient-to-br from-amber-100/80 via-yellow-100/60 to-orange-100/80 dark:from-amber-900/60 dark:via-yellow-900/40 dark:to-orange-900/60 backdrop-blur-xl border border-amber-300/50 dark:border-amber-600/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-700 via-orange-700 to-yellow-700 bg-clip-text text-transparent mb-4 drop-shadow-lg">
                      {stat.value}
                    </div>
                    <div className="text-slate-800 dark:text-amber-200 font-bold text-xl mb-2">
                      {stat.label}
                    </div>
                    <div className="text-slate-600 dark:text-amber-300 text-sm font-medium">
                      {stat.sublabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions com Verde Próspero */}
            <div id="solucoes" className="grid md:grid-cols-2 gap-12 mb-24">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className="group p-12 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-green-50/90 dark:from-emerald-900/40 dark:via-teal-900/30 dark:to-green-900/40 backdrop-blur-xl border border-emerald-300/60 dark:border-emerald-600/50 hover:border-emerald-400/80 dark:hover:border-emerald-500/70 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-3xl"
                >
                  <div className="flex items-start space-x-8">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/30 via-teal-500/25 to-green-500/30 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                      {solution.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-emerald-100 mb-4">
                        {solution.title}
                      </h3>
                      <p className="text-slate-700 dark:text-emerald-200 mb-6 leading-relaxed text-lg">
                        {solution.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-3 mb-6">
                        {solution.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center text-slate-700 dark:text-emerald-200"
                          >
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3" />
                            <span className="font-semibold">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="inline-flex items-center px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-200/90 via-green-200/80 to-teal-200/90 dark:from-emerald-800/60 dark:via-green-800/50 dark:to-teal-800/60 border border-emerald-300/60 dark:border-emerald-500/50 shadow-xl">
                        <Target className="w-6 h-6 text-emerald-700 dark:text-emerald-300 mr-3" />
                        <span className="text-emerald-900 dark:text-emerald-200 font-bold text-lg">
                          {solution.benefit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials Dourados */}
            <div className="mb-24">
              <h2 className="text-5xl font-bold text-center text-slate-900 dark:text-amber-100 mb-16">
                O que os médicos estão dizendo
              </h2>
              <div className="grid md:grid-cols-3 gap-10">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="p-10 rounded-3xl bg-gradient-to-br from-amber-100/90 via-yellow-100/80 to-orange-100/90 dark:from-amber-900/50 dark:via-yellow-900/40 dark:to-orange-900/50 backdrop-blur-xl border border-amber-300/60 dark:border-amber-600/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-18 h-18 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl">
                        {testimonial.avatar}
                      </div>
                      <div className="ml-5">
                        <h4 className="font-bold text-slate-900 dark:text-amber-100 text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-slate-700 dark:text-amber-200 font-semibold">
                          {testimonial.specialty}
                        </p>
                        <p className="text-slate-600 dark:text-amber-300 text-sm">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-6 h-6 text-yellow-500 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-slate-800 dark:text-amber-200 italic text-lg leading-relaxed font-medium">
                      "{testimonial.quote}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Final Dourado Premium */}
            <div
              id="precos"
              className="text-center bg-gradient-to-br from-amber-600/15 via-orange-600/10 to-yellow-600/15 dark:from-amber-600/25 dark:via-orange-600/15 dark:to-yellow-600/25 backdrop-blur-xl border border-amber-300/40 dark:border-amber-500/40 rounded-3xl p-20 shadow-2xl"
            >
              <h2 className="text-6xl font-bold text-slate-900 dark:text-amber-100 mb-8">
                Pronto para recuperar seu dinheiro?
              </h2>
              <p className="text-2xl text-slate-700 dark:text-amber-200 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                Junte-se a mais de 2.500 médicos que já aumentaram sua receita com o
                MedCheck
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  onClick={handleStartTrial}
                  className="group px-20 py-8 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-700 hover:via-orange-700 hover:to-yellow-700 text-white text-2xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center"
                >
                  Começar Agora - Grátis por 30 Dias
                  <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-slate-600 dark:text-amber-300 font-semibold text-lg">
                  ✓ Sem cartão de crédito ✓ Suporte especializado ✓ Resultados em 7 dias
                </p>
              </div>
            </div>

            {/* Social Proof Dourado */}
            <div id="contato" className="text-center mt-20">
              <p className="text-slate-600 dark:text-amber-300 mb-12 text-lg font-medium">
                Confiado por médicos em todo o Brasil
              </p>
              <div className="flex justify-center items-center space-x-12 opacity-80">
                <div className="flex items-center space-x-3 p-6 rounded-xl bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-900/30 dark:to-orange-900/30 shadow-lg">
                  <Users className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  <span className="text-slate-800 dark:text-amber-200 font-bold">
                    CFM Aprovado
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-6 rounded-xl bg-gradient-to-r from-emerald-100/80 to-teal-100/80 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-lg">
                  <Shield className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
                  <span className="text-slate-800 dark:text-emerald-200 font-bold">
                    LGPD Compliant
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-6 rounded-xl bg-gradient-to-r from-orange-100/80 to-yellow-100/80 dark:from-orange-900/30 dark:to-yellow-900/30 shadow-lg">
                  <Award className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                  <span className="text-slate-800 dark:text-orange-200 font-bold">
                    ISO 27001
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-6 rounded-xl bg-gradient-to-r from-yellow-100/80 to-amber-100/80 dark:from-yellow-900/30 dark:to-amber-900/30 shadow-lg">
                  <Briefcase className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
                  <span className="text-slate-800 dark:text-yellow-200 font-bold">
                    Suporte Jurídico
                  </span>
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
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              MedCheck em Ação - Demonstração Completa
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-amber-100">
                  O que você verá na demonstração:
                </h3>
                <ul className="space-y-2 text-slate-700 dark:text-amber-200">
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-amber-100">
                  Resultados esperados:
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-emerald-100/80 to-green-100/80 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg">
                    <div className="text-emerald-800 dark:text-emerald-300 font-bold">
                      +40% de recuperação
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 text-sm">
                      Em honorários defasados
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-amber-100/80 to-yellow-100/80 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg">
                    <div className="text-amber-800 dark:text-amber-300 font-bold">
                      -70% de glosas
                    </div>
                    <div className="text-amber-600 dark:text-amber-400 text-sm">
                      Com contestações automáticas
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                    <div className="text-blue-800 dark:text-blue-300 font-bold">
                      8 horas/semana
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 text-sm">
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
                className="px-8 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-700 hover:via-orange-700 hover:to-yellow-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-xl"
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
