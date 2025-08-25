import React, { useRef } from 'react';
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
  Play,
  BarChart3,
  Menu,
  ChevronDown,
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
import { useMobileHero, useAccordion, useVideoModal } from '@/hooks/use-mobile-hero';

/**
 * Hero Section Mobile COMPLETAMENTE CORRIGIDA
 * ✅ Cards não quebram mais
 * ✅ Botões posicionados corretamente
 * ✅ Touch targets otimizados
 * ✅ Performance máxima
 * ✅ Zero breaking changes no web
 */
const HeroSectionMobileFixed: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { 
    menuOpen, 
    scrollToSection, 
    toggleMenu, 
    triggerHaptic,
    platform 
  } = useMobileHero();
  
  const { isExpanded, toggleItem } = useAccordion(3);
  const { isOpen: showDemoModal, openModal: showDemo, closeModal: closeDemoModal } = useVideoModal();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Data otimizada e sem quebras
  const painPoints = [
    {
      icon: DollarSign,
      title: 'Honorários Defasados',
      description: 'CBHPM desatualizada causa perdas de até 40% nos honorários médicos',
      impact: '-R$ 15k/mês',
      gradient: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
    {
      icon: AlertTriangle,
      title: 'Glosas Abusivas', 
      description: 'Planos de saúde glosam procedimentos sem base técnica válida',
      impact: '70% dos médicos',
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
    },
    {
      icon: Clock,
      title: 'Tempo Perdido',
      description: 'Médicos perdem 8+ horas semanais com burocracia desnecessária',
      impact: '32h/mês perdidas',
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    },
    {
      icon: FileText,
      title: 'Contestações Manuais',
      description: 'Processo manual de contestação é lento e possui baixa eficácia',
      impact: '15% taxa sucesso',
      gradient: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
    },
  ];

  const stats = [
    { 
      value: 'R$ 2.3Mi', 
      label: 'Recuperado', 
      sublabel: '12 meses',
      Icon: TrendingUp,
      color: 'emerald'
    },
    { 
      value: '15k+', 
      label: 'Contestadas', 
      sublabel: '95% sucesso',
      Icon: Shield,
      color: 'blue'
    },
    { 
      value: '2.5k+', 
      label: 'Médicos', 
      sublabel: 'Brasil',
      Icon: Users,
      color: 'purple'
    },
    { 
      value: '40%', 
      label: 'Aumento', 
      sublabel: 'receita',
      Icon: BarChart3,
      color: 'orange'
    },
  ];

  const solutions = [
    {
      icon: Calculator,
      title: 'Auditoria CBHPM',
      description: 'Análise automática de honorários com base na tabela CBHPM atualizada. Identifica valores defasados e calcula o valor correto automaticamente.',
      benefit: '+40% honorários',
      features: ['Comparação automática CBHPM', 'Relatórios detalhados', 'Alertas de defasagem']
    },
    {
      icon: Shield,
      title: 'Contestação Automática',
      description: 'Geração automática de contestações com base legal e técnica sólida. Documentos prontos para envio aos planos de saúde.',
      benefit: '-70% glosas',
      features: ['Base legal atualizada', 'Templates profissionais', 'Histórico de sucesso']
    },
    {
      icon: TrendingUp,
      title: 'Gestão Financeira',
      description: 'Controle completo das suas finanças com relatórios especializados e análises de performance por convênio.',
      benefit: '+35% receita',
      features: ['Dashboard executivo', 'Análise por convênio', 'Projeções financeiras']
    },
  ];

  // Handlers otimizados
  const handleStartTrial = async () => {
    triggerHaptic('medium');
    if (session) {
      navigate('/dashboard');
      toast.success('Bem-vindo ao MedCheck!');
    } else {
      navigate('/register');
    }
  };

  const handleShowDemo = () => {
    triggerHaptic('light');
    showDemo();
  };

  const handleLogin = () => {
    triggerHaptic('light');
    if (session) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleMenuToggle = () => {
    triggerHaptic('light');
    toggleMenu();
  };

  const handleSectionNavigation = (sectionId: string) => {
    triggerHaptic('light');
    scrollToSection(sectionId);
  };

  return (
    <div 
      className="relative min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-emerald-50/40 overflow-hidden"
      style={{
        paddingTop: platform === 'ios' ? 'env(safe-area-inset-top, 0px)' : '0px',
        paddingBottom: platform === 'ios' ? 'env(safe-area-inset-bottom, 0px)' : '0px',
      }}
    >
      {/* Background layers otimizado */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-emerald-50/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-200/20 to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Header mobile sticky */}
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
              className="text-blue-600 dark:text-blue-400 font-semibold px-3 py-2 h-10 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 active:bg-blue-100 dark:active:bg-blue-800/50 transition-colors"
            >
              {session ? 'Dashboard' : 'Entrar'}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 h-10 w-10 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
              onClick={handleMenuToggle}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 mobile-menu">
            <div className="p-4 space-y-1">
              <button 
                className="w-full text-left py-3 px-4 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors font-medium"
                onClick={() => handleSectionNavigation('solucoes')}
              >
                Soluções
              </button>
              <button 
                className="w-full text-left py-3 px-4 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors font-medium"
                onClick={() => handleSectionNavigation('precos')}
              >
                Preços
              </button>
              <button 
                className="w-full text-left py-3 px-4 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors font-medium"
                onClick={() => handleSectionNavigation('contato')}
              >
                Contato
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="px-4 pt-8 pb-12">
          <div className="max-w-sm mx-auto text-center">
            {/* Badge de credibilidade */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 border border-blue-200/50 mb-6 shadow-sm">
              <Award className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
              <span className="text-blue-800 font-semibold text-sm">
                #1 Brasil - 2.5k+ médicos confiam
              </span>
            </div>

            {/* Headline responsivo */}
            <h1 
              className="font-bold mb-6 leading-tight text-center"
              style={{ fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', lineHeight: '1.2' }}
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

            <p className="text-gray-600 dark:text-slate-300 mb-8 text-base leading-relaxed max-w-xs mx-auto">
              <strong className="text-blue-600">Auditoria CBHPM</strong>, 
              <strong className="text-emerald-600"> contestação automática</strong> e
              <strong className="text-blue-600"> gestão financeira</strong> integradas.
            </p>

            {/* CTAs principais - Touch optimized */}
            <div className="space-y-3 mb-10">
              <Button
                onClick={handleStartTrial}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-98 touch-manipulation"
              >
                <span>Teste Grátis - 30 Dias</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <Button
                onClick={handleShowDemo}
                variant="outline"
                className="w-full h-12 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 bg-white/80 dark:bg-slate-700/80 text-lg font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 active:bg-gray-100 dark:active:bg-slate-500 transition-all duration-200 active:scale-98 touch-manipulation"
              >
                <Play className="mr-2 w-5 h-5" />
                <span>Ver Demo (3 min)</span>
              </Button>
            </div>

            {/* Stats grid - Cards que não quebram */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {stats.map((stat, index) => {
                const colorVariants = {
                  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
                  blue: 'bg-blue-50 border-blue-200 text-blue-600',
                  purple: 'bg-purple-50 border-purple-200 text-purple-600',
                  orange: 'bg-orange-50 border-orange-200 text-orange-600',
                };

                return (
                  <div 
                    key={index} 
                    className={`text-center p-4 rounded-xl ${colorVariants[stat.color]} border shadow-sm transition-transform duration-200 active:scale-95`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <stat.Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1 leading-none">
                      {stat.value}
                    </div>
                    <div className="text-gray-700 dark:text-slate-200 font-semibold text-sm mb-1 leading-none">
                      {stat.label}
                    </div>
                    <div className="text-gray-500 dark:text-slate-400 text-xs leading-none">
                      {stat.sublabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pain Points - Scroll horizontal otimizado */}
        <section className="mb-12">
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold text-center text-gray-900">
              Problemas que Todo Médico Enfrenta
            </h2>
          </div>
          
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-4 scrollbar-hide scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {painPoints.map((pain, index) => (
              <div
                key={index}
                className={`flex-shrink-0 w-72 p-6 rounded-xl bg-white border shadow-sm snap-center ${pain.borderColor} transition-transform duration-200 active:scale-95`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${pain.gradient} flex items-center justify-center mb-4 shadow-sm`}>
                  <pain.icon className="w-5 h-5 text-white" />
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">
                  {pain.title}
                </h3>
                
                <p className="text-gray-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
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

        {/* Solutions Accordion */}
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
                  onClick={() => toggleItem(index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                  style={{ minHeight: '72px' }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                      <solution.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-base mb-1 leading-tight">
                        {solution.title}
                      </h3>
                      <div className="text-sm text-emerald-600 font-semibold">
                        {solution.benefit}
                      </div>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                      isExpanded(index) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {isExpanded(index) && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-4 mt-4">
                      {solution.description}
                    </p>
                    <div className="space-y-2">
                      {solution.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
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
            <h2 className="text-2xl font-bold mb-4 leading-tight">
              Pronto para recuperar seu dinheiro?
            </h2>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Junte-se a 2.500+ médicos que aumentaram receita
            </p>
            
                      <Button
            onClick={handleStartTrial}
            className="w-full h-12 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-600 text-lg font-bold rounded-xl transition-all duration-200 active:scale-98 shadow-lg touch-manipulation"
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
            <div className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-white border border-gray-200 shadow-sm transition-transform duration-200 active:scale-95">
              <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-gray-700 text-sm font-semibold">LGPD</span>
            </div>
            <div className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-white border border-gray-200 shadow-sm transition-transform duration-200 active:scale-95">
              <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 text-sm font-semibold">ISO 27001</span>
            </div>
          </div>
        </section>
      </main>

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
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200 active:scale-98 touch-manipulation"
        >
          <span>Teste Grátis - 30 Dias</span>
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      {/* Demo Modal */}
      <Dialog open={showDemoModal} onOpenChange={closeDemoModal}>
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
                <span>Upload e análise automática de demonstrativos</span>
              </div>
              <div className="flex items-start text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Identificação automática de glosas e valores</span>
              </div>
              <div className="flex items-start text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Geração de contestações com base legal</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  closeDemoModal();
                  handleStartTrial();
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-lg h-12 touch-manipulation"
              >
                Começar Agora
              </Button>
              <Button
                variant="outline"
                onClick={closeDemoModal}
                className="px-6 h-12 touch-manipulation"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSS adicional */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .touch-manipulation {
          touch-action: manipulation;
        }
        
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
        
        .active\\:scale-95:active {
          transform: scale(0.95);
        }
        
        @supports (padding: max(0px)) {
          .ios-safe-area {
            padding-top: max(1rem, env(safe-area-inset-top));
            padding-bottom: max(1rem, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSectionMobileFixed; 