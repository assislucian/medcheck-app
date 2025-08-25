import React, { useState, useEffect } from 'react';
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
  Menu,
  ChevronDown,
  ChevronRight,
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
import { useDevice } from '@/hooks/use-device';

/**
 * Hero Section 100% otimizada para mobile
 * Corrige todos os problemas de cards quebrados e layout
 */
const HeroSectionMobile: React.FC = () => {
  const { isMobile, isTablet, platform, width } = useDevice();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // Setup de scroll para sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      const stickyCTA = document.getElementById('mobile-sticky-cta');
      if (stickyCTA) {
        const scrolled = window.scrollY > window.innerHeight * 0.6;
        stickyCTA.style.transform = scrolled ? 'translateY(0)' : 'translateY(100%)';
        stickyCTA.style.opacity = scrolled ? '1' : '0';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Data otimizada para mobile
  const painPoints = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: 'Honorários Defasados',
      description: 'CBHPM desatualizada causa perdas de até 40%',
      impact: '-R$ 15k/mês',
      color: 'bg-gradient-to-br from-red-500 to-rose-600',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Glosas Abusivas', 
      description: 'Planos glosam sem base técnica',
      impact: '70% afetados',
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Tempo Perdido',
      description: '8+ horas semanais em burocracia',
      impact: '32h/mês',
      color: 'bg-gradient-to-br from-amber-500 to-orange-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Contestações Manuais',
      description: 'Processo manual lento e ineficaz',
      impact: '15% sucesso',
      color: 'bg-gradient-to-br from-yellow-500 to-amber-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
  ];

  const stats = [
    { 
      value: 'R$ 2.3Mi', 
      label: 'Recuperado', 
      sublabel: '12 meses',
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200'
    },
    { 
      value: '15k+', 
      label: 'Contestadas', 
      sublabel: '95% sucesso',
      icon: <Shield className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      value: '2.5k+', 
      label: 'Médicos', 
      sublabel: 'Brasil',
      icon: <Users className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200'
    },
    { 
      value: '40%', 
      label: 'Aumento', 
      sublabel: 'receita',
      icon: <BarChart3 className="w-4 h-4 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200'
    },
  ];

  const solutions = [
    {
      icon: <Calculator className="w-6 h-6" />,
      title: 'Auditoria CBHPM',
      description: 'Análise automática de honorários com tabela atualizada. Identifica defasagens e calcula valores corretos.',
      benefit: '+40% honorários',
      features: ['Comparação automática', 'Relatórios detalhados', 'Alertas de defasagem']
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Contestação Auto',
      description: 'Geração automática de contestações com base legal sólida. Documentos prontos para envio.',
      benefit: '-70% glosas',
      features: ['Base legal atualizada', 'Templates profissionais', 'Histórico de sucesso']
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Gestão Financeira',
      description: 'Controle completo com relatórios especializados e análises por convênio.',
      benefit: '+35% receita',
      features: ['Dashboard executivo', 'Análise por convênio', 'Projeções financeiras']
    },
  ];

  // Handlers
  const handleStartTrial = () => {
    if (session) {
      navigate('/dashboard');
      toast.success('Bem-vindo ao MedCheck!');
    } else {
      navigate('/register');
    }
  };

  const handleShowDemo = () => {
    setShowDemoModal(true);
  };

  const handleLogin = () => {
    if (session) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-emerald-50/40 overflow-hidden"
      style={{
        paddingTop: platform === 'ios' ? 'env(safe-area-inset-top, 0px)' : '0px',
        paddingBottom: platform === 'ios' ? 'env(safe-area-inset-bottom, 0px)' : '0px',
      }}
    >
      {/* Background otimizado para mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-emerald-50/30" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-200/20 to-transparent rounded-full blur-3xl" />

      {/* Header mobile otimizado */}
      <header className="relative z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <MedCheckLogo size="sm" showImage={true} />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleLogin}
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-400 font-semibold px-3 py-2 h-auto hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              {session ? 'Dashboard' : 'Entrar'}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 h-auto"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Menu mobile overlay */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
            <div className="p-4 space-y-2">
              <button 
                className="w-full text-left py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => navigateToSection('solucoes')}
              >
                Soluções
              </button>
              <button 
                className="w-full text-left py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => navigateToSection('precos')}
              >
                Preços
              </button>
              <button 
                className="w-full text-left py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => navigateToSection('contato')}
              >
                Contato
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="relative z-10">
        {/* Hero Content */}
        <section className="px-4 pt-8 pb-12">
          <div className="max-w-sm mx-auto text-center">
            {/* Badge mais compacto */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 border border-blue-200/50 mb-6">
              <Award className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-800 font-semibold text-sm">
                #1 Brasil - 2.5k+ médicos
              </span>
            </div>

            {/* Headline responsivo com clamp */}
            <h1 
              className="font-bold mb-6 leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 6vw, 2.5rem)' }}
            >
              <span className="text-gray-900">Médico, pare de </span>
              <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                perder dinheiro
              </span>
              <br />
              <span className="text-gray-900">com </span>
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                glosas abusivas
              </span>
            </h1>

            <p className="text-gray-600 mb-8 text-base leading-relaxed px-2">
              <strong className="text-blue-600">Auditoria CBHPM</strong>, 
              <strong className="text-emerald-600"> contestação automática</strong> e
              <strong className="text-blue-600"> gestão financeira</strong> em um só lugar.
            </p>

            {/* CTAs principais - Touch optimized */}
            <div className="space-y-3 mb-10">
              <Button
                onClick={handleStartTrial}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 active:scale-95"
                style={{ minHeight: '44px' }}
              >
                <span>Teste Grátis - 30 Dias</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <Button
                onClick={handleShowDemo}
                variant="outline"
                className="w-full py-4 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 bg-white/80 dark:bg-slate-700/80 text-lg font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 active:scale-95 transition-all duration-200"
                style={{ minHeight: '44px' }}
              >
                <Play className="mr-2 w-5 h-5" />
                <span>Ver Demo (3 min)</span>
              </Button>
            </div>

            {/* Stats grid otimizado */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className={`text-center p-4 rounded-xl ${stat.color} shadow-sm border`}
                >
                  <div className="flex items-center justify-center mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-xl font-bold text-gray-800 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-700 font-semibold text-sm mb-1">
                    {stat.label}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {stat.sublabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pain Points - Scroll horizontal com snap */}
        <section className="mb-12">
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold text-center text-gray-900">
              Problemas que Todo Médico Enfrenta
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-4 scrollbar-hide">
            {painPoints.map((pain, index) => (
              <div
                key={index}
                className={`flex-shrink-0 w-72 p-6 rounded-xl bg-white border shadow-sm snap-center ${pain.borderColor}`}
              >
                <div className={`w-12 h-12 rounded-xl ${pain.color} flex items-center justify-center mb-4`}>
                  <div className="text-white">
                    {pain.icon}
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  {pain.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {pain.description}
                </p>
                
                <div className={`inline-flex items-center px-3 py-2 rounded-full ${pain.bgColor} border ${pain.borderColor}`}>
                  <span className={`${pain.textColor} text-sm font-semibold`}>
                    {pain.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Solutions - Accordion mobile-friendly */}
        <section id="solucoes" className="px-4 mb-12">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
            Nossa Solução
          </h2>
          
          <div className="space-y-3">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
                  style={{ minHeight: '60px' }}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                      <div className="text-blue-600">
                        {solution.icon}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {solution.title}
                      </h3>
                      <div className="text-sm text-emerald-600 font-semibold">
                        {solution.benefit}
                      </div>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      expandedCard === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedCard === index && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {solution.description}
                    </p>
                    <div className="space-y-2">
                      {solution.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section id="precos" className="px-4 mb-12">
          <div className="text-center p-8 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              Pronto para recuperar seu dinheiro?
            </h2>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Junte-se a 2.500+ médicos que aumentaram receita
            </p>
            
                      <Button
            onClick={handleStartTrial}
            className="w-full py-4 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-600 text-lg font-bold rounded-xl transition-all duration-300 active:scale-95 shadow-lg"
            style={{ minHeight: '44px' }}
          >
              <span>Começar Agora - Grátis 30 Dias</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Credibilidade */}
        <section id="contato" className="px-4 pb-20">
          <p className="text-center text-gray-500 mb-6 text-sm">
            Confiado por médicos em todo o Brasil
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-gray-700 text-sm font-semibold">LGPD</span>
            </div>
            <div className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700 text-sm font-semibold">ISO 27001</span>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky CTA bottom */}
      <div 
        id="mobile-sticky-cta"
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 transform translate-y-full transition-all duration-300 opacity-0"
        style={{
          paddingBottom: platform === 'ios' ? 'calc(1rem + env(safe-area-inset-bottom, 0px))' : '1rem'
        }}
      >
        <Button
          onClick={handleStartTrial}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all duration-200"
          style={{ minHeight: '44px' }}
        >
          <span>Teste Grátis - 30 Dias</span>
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      {/* Modal de Demo otimizado para mobile */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="max-w-[90vw] w-full mx-4 max-h-[85vh] p-0 overflow-hidden rounded-xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-bold text-center">
              MedCheck em Ação
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0"
                title="MedCheck Demo"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Upload e análise automática</span>
              </div>
              <div className="flex items-start text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Identificação de glosas</span>
              </div>
              <div className="flex items-start text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Contestações automáticas</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDemoModal(false);
                  handleStartTrial();
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-lg py-3"
              >
                Começar Agora
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDemoModal(false)}
                className="px-6 py-3"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSS customizado para mobile */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Touch optimizations */
        button, [role="button"] {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* iOS specific */
        @supports (padding: max(0px)) {
          .ios-safe-top {
            padding-top: max(1rem, env(safe-area-inset-top));
          }
          .ios-safe-bottom {
            padding-bottom: max(1rem, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSectionMobile; 