import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import {
  LogOut,
  Play,
  LayoutDashboard,
  FileText,
  FileBarChart,
  FileX,
  History,
  HelpCircle,
  User,
  Brain,
  AlertTriangle,
  TrendingUp,
  Bell,
  Settings,
  BarChart3,
  Activity,
  Clock,
  Target,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { toast } from 'sonner';
import Brand from './Brand';
import SidebarFooter from './Footer';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isOverlay, isOpen, isCollapsed } = useSidebarContext();

  // Estado para contadores dinâmicos (mockados por enquanto, mas preparados para dados reais)
  const [pendingGlosas, setPendingGlosas] = useState(3);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const isActive = (route: string) => location.pathname.startsWith(route);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  // ESTRUTURA PREMIUM - Baseada em fluxo de trabalho médico real

  // 1. VISÃO EXECUTIVA - Mais importante (Dashboard + Intelligence)
  const executiveItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
      description: 'Visão geral operacional',
    },
    {
      icon: Brain,
      label: 'Intelligence Hub',
      href: '/intelligence',
      description: 'Analytics avançado com IA',
      isPremium: true,
    },
  ];

  // 2. FLUXO OPERACIONAL - Sequência real de trabalho
  const operationalItems = [
    {
      icon: FileText,
      label: 'Guias Médicas',
      href: '/guides',
      description: 'Gestão de guias TISS',
    },
    {
      icon: FileBarChart,
      label: 'Demonstrativos',
      href: '/demonstratives',
      description: 'Análise de demonstrativos',
    },
  ];

  // 3. GESTÃO CRÍTICA - Itens que impactam receita (PRIORIDADE ALTA)
  const criticalItems = [
    {
      icon: FileX,
      label: 'Glosas Pendentes',
      href: '/unpaid-procedures',
      description: 'Gestão de contestações',
      isCritical: true,
      badge: pendingGlosas > 0 ? pendingGlosas : undefined,
      badgeVariant: 'destructive' as const,
    },
  ];

  // 4. ANÁLISE & COMPLIANCE
  const analysisItems = [
    {
      icon: History,
      label: 'Histórico',
      href: '/history',
      description: 'Auditoria e rastreabilidade',
    },
    {
      icon: BarChart3,
      label: 'Relatórios',
      href: '/reports',
      description: 'Relatórios customizados',
    },
  ];

  // 5. SUPORTE & CONFIGURAÇÕES
  const supportItems = [
    {
      icon: Bell,
      label: 'Notificações',
      href: '/notifications',
      description: 'Central de alertas',
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
      badgeVariant: 'default' as const,
    },
    {
      icon: HelpCircle,
      label: 'Suporte',
      href: '/help',
      description: 'Ajuda e documentação',
    },
  ];

  // 6. CONTA & CONFIGURAÇÕES (Sempre no final)
  const accountItems = [
    {
      icon: User,
      label: 'Perfil',
      href: '/profile',
      description: 'Dados pessoais e configurações',
    },
    {
      icon: Settings,
      label: 'Configurações',
      href: '/settings',
      description: 'Configurações do sistema',
    },
  ];

  // Classes condicionais baseadas no estado da sidebar
  const sidebarClasses = `
    fixed inset-y-0 left-0 flex flex-col
    bg-gradient-to-br from-white/95 via-blue-50/90 to-emerald-50/80 backdrop-blur-xl shadow-xl
    dark:bg-gradient-to-br dark:from-gray-900/98 dark:via-gray-800/95 dark:to-gray-900/98
    border-r border-slate-200/80 dark:border-slate-700/80 h-screen z-40
    transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
    ${
      isOverlay
        ? 'w-4/5 max-w-[320px] transform'
        : isCollapsed
          ? 'w-[72px]'
          : 'w-[280px]'
    }
    ${isOverlay && !isOpen ? '-translate-x-full' : 'translate-x-0'}
  `;

  // Componente para renderizar item do menu
  const MenuItem = ({ item, colorScheme }: { item: any; colorScheme: string }) => {
    const colors = {
      blue: {
        active:
          'bg-blue-600/15 text-blue-700 dark:text-blue-200 ring-1 ring-blue-600/25',
        hover: 'hover:text-blue-700 hover:bg-blue-600/10',
      },
      emerald: {
        active:
          'bg-emerald-600/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-600/25',
        hover: 'hover:text-emerald-700 hover:bg-emerald-600/10',
      },
      red: {
        active: 'bg-red-600/15 text-red-700 dark:text-red-200 ring-1 ring-red-600/25',
        hover: 'hover:text-red-700 hover:bg-red-600/10',
      },
      purple: {
        active:
          'bg-purple-600/15 text-purple-700 dark:text-purple-200 ring-1 ring-purple-600/25',
        hover: 'hover:text-purple-700 hover:bg-purple-600/10',
      },
      orange: {
        active:
          'bg-orange-600/15 text-orange-700 dark:text-orange-200 ring-1 ring-orange-600/25',
        hover: 'hover:text-orange-700 hover:bg-orange-600/10',
      },
      indigo: {
        active:
          'bg-indigo-600/15 text-indigo-700 dark:text-indigo-200 ring-1 ring-indigo-600/25',
        hover: 'hover:text-indigo-700 hover:bg-indigo-600/10',
      },
    };

    const scheme = colors[colorScheme as keyof typeof colors] || colors.blue;

    return (
      <li key={item.href}>
        <button
          onClick={() => navigate(item.href)}
          className={`group relative flex gap-3 items-center px-4 py-3.5 rounded-xl font-medium w-full text-left
            transition-all duration-200 ease-out
            ${
              isActive(item.href)
                ? `${scheme.active} shadow-sm scale-[1.02] font-semibold`
                : `text-slate-700 ${scheme.hover} dark:text-slate-300 dark:hover:bg-slate-700/40 hover:scale-[1.01]`
            }`}
        >
          <div className="relative">
            <item.icon
              className={`h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${
                item.isPremium ? 'text-gradient' : ''
              }`}
            />
            {item.isPremium && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            )}
            {item.isCritical && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
            )}
          </div>

          <div className={`flex-1 min-w-0 ${isCollapsed ? 'hidden xl:block' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">{item.label}</span>
              {item.badge && (
                <Badge
                  variant={item.badgeVariant || 'default'}
                  className="ml-2 px-1.5 py-0.5 text-xs font-bold min-w-[20px] h-5 flex items-center justify-center"
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            {!isCollapsed && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {item.description}
              </p>
            )}
          </div>
        </button>
      </li>
    );
  };

  return (
    <aside className={sidebarClasses}>
      {/* Brand com padding melhorado */}
      <div className="px-8 py-8">
        <Brand />
      </div>

      {/* Navigation com espaçamentos premium */}
      <nav className="flex-1 px-6 space-y-8 overflow-y-auto scrollbar-hide">
        {/* 1. VISÃO EXECUTIVA - Mais importante */}
        <div className="space-y-3">
          <h4 className="px-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Target className="h-3 w-3" />
            Visão Executiva
          </h4>
          <ul className="space-y-2">
            {executiveItems.map((item) => (
              <MenuItem key={item.href} item={item} colorScheme="blue" />
            ))}
          </ul>
        </div>

        {/* 2. FLUXO OPERACIONAL */}
        <div className="space-y-3">
          <h4 className="px-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-3 w-3" />
            Fluxo Operacional
          </h4>
          <ul className="space-y-2">
            {operationalItems.map((item) => (
              <MenuItem key={item.href} item={item} colorScheme="emerald" />
            ))}
          </ul>
        </div>

        {/* 3. GESTÃO CRÍTICA - Destaque especial com separação visual */}
        <div className="space-y-3 p-4 bg-red-50/40 dark:bg-red-900/10 rounded-xl border border-red-200/30 dark:border-red-800/30">
          <h4 className="px-3 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 animate-pulse" />
            Gestão Crítica
          </h4>
          <ul className="space-y-2">
            {criticalItems.map((item) => (
              <MenuItem key={item.href} item={item} colorScheme="red" />
            ))}
          </ul>
        </div>

        {/* 4. ANÁLISE & COMPLIANCE */}
        <div className="space-y-3">
          <h4 className="px-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Análise & Compliance
          </h4>
          <ul className="space-y-2">
            {analysisItems.map((item) => (
              <MenuItem key={item.href} item={item} colorScheme="purple" />
            ))}
          </ul>
        </div>

        {/* 5. SUPORTE */}
        <div className="space-y-3">
          <h4 className="px-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="h-3 w-3" />
            Suporte
          </h4>
          <ul className="space-y-2">
            {supportItems.map((item) => (
              <MenuItem key={item.href} item={item} colorScheme="orange" />
            ))}
          </ul>
        </div>
      </nav>

      {/* 6. CONTA & CONFIGURAÇÕES - Sempre no final com separação clara */}
      <div className="px-6 py-6 border-t border-slate-200/80 dark:border-slate-700/80 bg-white/40 dark:bg-gray-800/60 backdrop-blur-sm">
        <div className="space-y-3">
          <h4 className="px-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <User className="h-3 w-3" />
            Conta
          </h4>
          <ul className="space-y-2">
            {accountItems.map((item) => (
              <MenuItem key={item.href} item={item} colorScheme="indigo" />
            ))}
          </ul>
        </div>
      </div>

      {/* Footer com padding adequado */}
      <div className="px-6 pb-6">
        <SidebarFooter />
      </div>
    </aside>
  );
}
