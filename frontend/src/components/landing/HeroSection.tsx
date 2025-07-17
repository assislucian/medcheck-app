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
    <div className="relative min-h-screen bg-gradient-to-br from-medical-50/30 via-brand-50/15 to-mint-50/20 dark:from-slate-900 dark:via-trust-900/8 dark:to-medical-900/8 overflow-hidden">
      {/* Medical Professional Visual: Premium Clean Background */}
      <div className="absolute inset-0">
        {/* Gradientes médicos premium ultra-suaves */}
        <div className="absolute top-0 left-1/4 w-[900px] h-[900px] bg-gradient-to-br from-medical-200/12 via-brand-200/8 to-transparent rounded-full blur-[100px] medical-pulse-soft"></div>
        <div className="absolute bottom-0 right-1/4 w-[1000px] h-[1000px] bg-gradient-to-tl from-mint-200/15 via-medical-200/10 to-transparent rounded-full blur-[120px] medical-pulse-soft animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-to-r from-trust-200/8 via-mint-200/6 to-transparent rounded-full blur-[140px]"></div>

        {/* Overlays médicos premium com profundidade */}
        <div className="absolute inset-0 bg-gradient-to-br from-medical-100/4 via-transparent to-mint-100/4"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-100/3 via-transparent to-trust-100/3"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-medical-100/2 via-transparent to-mint-100/3"></div>

        {/* Noise texture premium para profundidade */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]"></div>
      </div>

      {/* Grid pattern médico ultra-sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,116,217,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,116,217,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(0,116,217,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,116,217,0.01)_1px,transparent_1px)] bg-[size:80px_80px]"></div>

      <div className="relative z-10">
        {/* Header Premium com Cores Douradas */}
        <header className="px-6 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MedCheckLogo
                size="lg"
                className="group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-3xl font-bold bg-gradient-to-r from-health-dark via-health-primary to-health-accent bg-clip-text text-transparent">
                MedCheck
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => handleNavigateToSection('solucoes')}
                  className="text-ink dark:text-health-surface hover:text-health-primary dark:hover:text-health-accent transition-colors font-semibold"
                >
                  Soluções
                </button>
                <button
                  onClick={() => handleNavigateToSection('precos')}
                  className="text-ink dark:text-health-surface hover:text-health-accent dark:hover:text-mint-500 transition-colors font-semibold"
                >
                  Preços
                </button>
                <button
                  onClick={() => handleNavigateToSection('contato')}
                  className="text-ink dark:text-health-surface hover:text-health-primary dark:hover:text-health-accent transition-colors font-semibold"
                >
                  Contato
                </button>
              </nav>
              <Button
                onClick={handleLogin}
                className="px-8 py-3 bg-gradient-to-r from-health-primary via-health-accent to-health-primary hover:from-health-dark hover:via-health-accent hover:to-health-dark text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-xl shadow-health-primary/30 font-bold"
              >
                {session ? 'Dashboard' : 'Entrar'}
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Badge Premium with Cool Colors */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-health-surface/80 via-health-soft/70 to-health-surface/80 dark:from-health-dark/40 dark:via-health-primary/30 dark:to-health-dark/40 backdrop-blur-xl border border-health-primary/50 dark:border-health-accent/40 shadow-2xl shadow-health-primary/20">
                <Award className="w-6 h-6 text-health-dark dark:text-health-accent mr-3" />
                <span className="text-health-dark dark:text-health-surface font-bold text-lg">
                  #1 em Auditoria Médica no Brasil - Mais de 2.500 médicos confiam
                </span>
              </div>
            </div>

            {/* Headline with Medical Colors */}
            <div className="text-center max-w-6xl mx-auto mb-20">
              <h1 className="text-6xl md:text-8xl font-bold mb-10 leading-tight">
                <span className="text-ink dark:text-health-surface">
                  Médico, pare de{' '}
                </span>
                <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent drop-shadow-lg">
                  perder dinheiro
                </span>
                <br />
                <span className="text-ink dark:text-health-surface">com </span>
                <span className="bg-gradient-to-r from-health-primary via-health-accent to-health-primary bg-clip-text text-transparent drop-shadow-lg">
                  glosas abusivas
                </span>
              </h1>

              <p className="text-2xl md:text-3xl text-ink-light dark:text-health-surface mb-16 leading-relaxed max-w-5xl mx-auto font-medium">
                A primeira plataforma brasileira que combina{' '}
                <strong className="text-health-primary dark:text-health-accent font-bold">
                  auditoria CBHPM
                </strong>
                ,
                <strong className="text-health-accent dark:text-mint-500 font-bold">
                  {' '}
                  contestação automatizada
                </strong>{' '}
                e
                <strong className="text-health-primary dark:text-health-accent font-bold">
                  {' '}
                  gestão financeira médica
                </strong>{' '}
                em um só lugar.
              </p>

              {/* Pain Points Premium Medical Design */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                {painPoints.map((pain, index) => (
                  <div
                    key={index}
                    className="group medical-card-premium medical-hover-lift medical-transition-slow rounded-3xl p-8 relative overflow-hidden"
                  >
                    {/* Subtle gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-transparent to-rose-50/40 dark:from-red-900/20 dark:via-transparent dark:to-rose-900/10 rounded-3xl"></div>

                    {/* Icon container with premium styling */}
                    <div className="relative z-10 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 flex items-center justify-center group-hover:scale-110 medical-transition border border-red-200/50 dark:border-red-800/50">
                        <div className="text-red-600 dark:text-red-400">
                          {pain.icon}
                        </div>
                      </div>
                    </div>

                    {/* Content with improved hierarchy */}
                    <div className="relative z-10 space-y-4">
                      <h3 className="text-xl font-bold text-ink dark:text-health-surface leading-tight">
                        {pain.title}
                      </h3>
                      <p className="text-ink-light dark:text-health-surface/80 text-sm leading-relaxed">
                        {pain.description}
                      </p>

                      {/* Impact badge with premium styling */}
                      <div className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-100/80 to-rose-100/80 dark:from-red-900/60 dark:to-rose-900/60 border border-red-200/60 dark:border-red-800/50 medical-elevation-1">
                        <span className="text-red-700 dark:text-red-300 text-sm font-semibold">
                          {pain.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs Premium Medical Design */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                <Button
                  onClick={handleStartTrial}
                  className="group px-16 py-6 bg-gradient-to-r from-health-primary via-health-accent to-health-primary hover:from-health-dark hover:via-health-accent hover:to-health-dark text-white text-xl font-bold rounded-2xl medical-transition medical-elevation-2 hover:medical-elevation-3 flex items-center shadow-lg shadow-health-primary/20 hover:shadow-health-primary/30"
                >
                  <span className="relative z-10">
                    Começar Teste Grátis por 30 Dias
                  </span>
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 medical-transition relative z-10" />

                  {/* Shimmer effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-2xl"></div>
                </Button>

                <Button
                  onClick={handleShowDemo}
                  variant="outline"
                  className="group px-16 py-6 medical-card-premium text-health-dark dark:text-health-surface text-xl font-bold rounded-2xl medical-transition medical-elevation-1 hover:medical-elevation-2 backdrop-blur-xl border border-health-primary/20 dark:border-health-accent/20 flex items-center"
                >
                  <Play className="mr-3 w-6 h-6 group-hover:scale-110 medical-transition" />
                  <span>Ver Demonstração (3 min)</span>
                </Button>
              </div>

              {/* Stats Premium Medical Design */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center medical-card-premium medical-hover-lift medical-transition-slow rounded-3xl p-8 group medical-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Gradient background with depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-health-surface/20 via-transparent to-health-soft/10 rounded-3xl opacity-0 group-hover:opacity-100 medical-transition"></div>

                    <div className="relative z-10 space-y-4">
                      {/* Number with enhanced gradient */}
                      <div className="text-5xl md:text-6xl font-bold medical-text-gradient mb-4 group-hover:scale-105 medical-transition">
                        {stat.value}
                      </div>

                      {/* Label with premium typography */}
                      <div className="text-health-dark dark:text-health-surface font-bold text-xl mb-2 leading-tight">
                        {stat.label}
                      </div>

                      {/* Subtitle with refined styling */}
                      <div className="text-ink-light dark:text-health-accent text-sm font-medium opacity-80">
                        {stat.sublabel}
                      </div>

                      {/* Decorative accent line */}
                      <div className="w-12 h-0.5 bg-gradient-to-r from-health-primary to-health-accent mx-auto rounded-full opacity-0 group-hover:opacity-100 medical-transition"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions Premium Medical Design */}
            <div id="solucoes" className="grid md:grid-cols-2 gap-12 mb-24">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className="group medical-card-premium medical-hover-lift medical-transition-slow rounded-3xl p-12 relative overflow-hidden medical-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Premium gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-health-accent/5 via-transparent to-mint-200/10 rounded-3xl opacity-0 group-hover:opacity-100 medical-transition"></div>

                  <div className="relative z-10 flex items-start space-x-8">
                    {/* Icon container with enhanced styling */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-health-accent/20 via-health-accent/10 to-mint-200/20 flex items-center justify-center group-hover:scale-110 medical-transition medical-elevation-2 border border-health-accent/20">
                        <div className="text-health-accent dark:text-health-accent text-3xl">
                          {solution.icon}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-6">
                      {/* Title with premium typography */}
                      <h3 className="text-3xl font-bold text-health-dark dark:text-health-surface leading-tight">
                        {solution.title}
                      </h3>

                      {/* Description with improved readability */}
                      <p className="text-ink-light dark:text-health-surface/90 leading-relaxed text-lg">
                        {solution.description}
                      </p>

                      {/* Features with enhanced design */}
                      <div className="space-y-4">
                        {solution.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center text-ink dark:text-health-surface/90 group-hover:translate-x-1 medical-transition"
                            style={{ transitionDelay: `${idx * 0.05}s` }}
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-health-accent to-mint-500 flex items-center justify-center mr-4 flex-shrink-0">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Benefit badge with premium styling */}
                      <div className="inline-flex items-center px-8 py-4 rounded-2xl medical-card-premium medical-elevation-1 border border-health-accent/20">
                        <Target className="w-6 h-6 text-health-accent mr-3" />
                        <span className="text-health-dark dark:text-health-surface font-bold text-lg">
                          {solution.benefit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials Premium Medical Design */}
            <div className="mb-24">
              <h2 className="text-5xl font-bold text-center text-health-dark dark:text-health-surface mb-16 medical-text-gradient">
                O que os médicos estão dizendo
              </h2>
              <div className="grid md:grid-cols-3 gap-10">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="medical-card-premium medical-hover-lift medical-transition-slow rounded-3xl p-10 relative overflow-hidden group medical-fade-in-up"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {/* Subtle premium overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-health-surface/10 via-transparent to-health-soft/5 rounded-3xl opacity-0 group-hover:opacity-100 medical-transition"></div>

                    <div className="relative z-10 space-y-6">
                      {/* Header with avatar and info */}
                      <div className="flex items-center space-x-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-health-primary to-health-accent rounded-2xl flex items-center justify-center text-white font-bold text-xl medical-elevation-2 group-hover:scale-110 medical-transition shadow-lg">
                          {testimonial.avatar}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-health-dark dark:text-health-surface text-lg leading-tight">
                            {testimonial.name}
                          </h4>
                          <p className="text-health-accent dark:text-health-accent font-semibold">
                            {testimonial.specialty}
                          </p>
                          <p className="text-ink-light dark:text-health-surface/70 text-sm">
                            {testimonial.location}
                          </p>
                        </div>
                      </div>

                      {/* Stars with enhanced styling */}
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-6 h-6 text-health-accent fill-current group-hover:scale-110 medical-transition"
                            style={{ transitionDelay: `${i * 0.05}s` }}
                          />
                        ))}
                      </div>

                      {/* Quote with premium typography */}
                      <blockquote className="text-health-dark dark:text-health-surface italic text-lg leading-relaxed font-medium relative">
                        <span className="text-6xl text-health-accent/20 absolute -top-4 -left-2 font-serif">
                          "
                        </span>
                        <span className="relative z-10">{testimonial.quote}</span>
                        <span className="text-6xl text-health-accent/20 absolute -bottom-8 -right-2 font-serif">
                          "
                        </span>
                      </blockquote>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Final Premium Medical Design */}
            <div
              id="precos"
              className="text-center medical-card-premium medical-elevation-3 rounded-3xl p-20 relative overflow-hidden group"
            >
              {/* Premium background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-health-surface/20 via-health-primary/5 to-health-soft/15 dark:from-health-dark/30 dark:via-health-primary/10 dark:to-health-accent/20 rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-health-accent/3 to-transparent rounded-3xl"></div>

              {/* Animated background elements */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-health-accent/10 to-transparent rounded-full blur-xl group-hover:scale-150 medical-transition-slow"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-health-primary/8 to-transparent rounded-full blur-2xl group-hover:scale-125 medical-transition-slow"></div>

              <div className="relative z-10 space-y-12">
                <div className="space-y-6">
                  <h2 className="text-6xl font-bold medical-text-gradient leading-tight">
                    Pronto para recuperar seu dinheiro?
                  </h2>
                  <p className="text-2xl text-ink-light dark:text-health-surface max-w-4xl mx-auto leading-relaxed font-medium">
                    Junte-se a mais de 2.500 médicos que já aumentaram sua receita com o
                    MedCheck
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                  <Button
                    onClick={handleStartTrial}
                    className="group px-20 py-8 bg-gradient-to-r from-health-primary via-health-accent to-health-primary hover:from-health-dark hover:via-health-accent hover:to-health-dark text-white text-2xl font-bold rounded-2xl medical-transition medical-elevation-2 hover:medical-elevation-3 flex items-center shadow-lg shadow-health-primary/20 hover:shadow-health-primary/30 relative overflow-hidden"
                  >
                    <span className="relative z-10">
                      Começar Agora - Grátis por 30 Dias
                    </span>
                    <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-1 medical-transition relative z-10" />

                    {/* Enhanced shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200 rounded-2xl"></div>
                  </Button>

                  <div className="text-ink-light dark:text-health-accent font-semibold text-lg space-y-2">
                    <div className="flex items-center justify-center space-x-6">
                      <span className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-health-accent mr-2" />
                        Sem cartão de crédito
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-health-accent mr-2" />
                        Suporte especializado
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-health-accent mr-2" />
                      Resultados em 7 dias
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof with Health Colors */}
            <div id="contato" className="text-center mt-20">
              <p className="text-ink-light dark:text-health-accent mb-12 text-lg font-medium">
                Confiado por médicos em todo o Brasil
              </p>
              <div className="flex justify-center items-center space-x-12 opacity-80">
                <div className="flex items-center space-x-3 p-6 rounded-xl bg-gradient-to-r from-health-surface/80 to-health-soft/80 dark:from-health-dark/30 dark:to-health-primary/30 shadow-lg">
                  <Users className="w-6 h-6 text-health-primary dark:text-health-accent" />
                  <span className="text-health-dark dark:text-health-surface font-bold">
                    CFM Aprovado
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-6 rounded-xl bg-gradient-to-r from-health-soft/80 to-mint-100/80 dark:from-health-accent/30 dark:to-mint-900/30 shadow-lg">
                  <Shield className="w-6 h-6 text-health-accent dark:text-mint-300" />
                  <span className="text-health-dark dark:text-health-surface font-bold">
                    LGPD Compliant
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-6 rounded-xl bg-gradient-to-r from-health-surface/80 to-health-primary/80 dark:from-health-primary/30 dark:to-health-dark/30 shadow-lg">
                  <Award className="w-6 h-6 text-health-primary dark:text-health-accent" />
                  <span className="text-health-dark dark:text-health-surface font-bold">
                    ISO 27001
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-6 rounded-xl bg-gradient-to-r from-health-soft/80 to-health-surface/80 dark:from-health-accent/30 dark:to-health-dark/30 shadow-lg">
                  <Briefcase className="w-6 h-6 text-health-accent dark:text-health-primary" />
                  <span className="text-health-dark dark:text-health-surface font-bold">
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
