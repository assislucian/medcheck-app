import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import {
  LogOut,
  LayoutDashboard,
  FileText,
  FileBarChart,
  FileX,
  HelpCircle,
  User,
  Brain,
  Bell,
  Settings,
  BarChart3,
  Sparkles,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useRealTimeSync } from '../../hooks/useRealTimeSync';
import { toast } from 'sonner';
import Brand from './Brand';
import SidebarFooter from './Footer';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';
import { Separator } from '../ui/separator';
import axios from 'axios';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isOverlay, isOpen, isCollapsed } = useSidebarContext();

  // Estados dinâmicos com dados reais
  const [pendingGlosas, setPendingGlosas] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tempo real: atualizações automáticas da sidebar
  const {} = useRealTimeSync({
    onActivityUpdate: () => {
      console.log('🔄 Sidebar: atualizando contadores...');
      fetchPendingGlosas();
    },
  });

  // Buscar dados reais de glosas pendentes
  useEffect(() => {
    const fetchPendingGlosas = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Buscar dados do dashboard para obter contadores reais
        const dashboardResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Buscar demonstrativos para calcular glosas pendentes reais
        const demonstrativesResponse = await axios.get(
          `${
            import.meta.env.VITE_API_URL || 'http://localhost:8000'
          }/api/v1/demonstrativos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const demonstrativos = demonstrativesResponse.data;
        let totalGlosasPendentes = 0;

        // Calcular glosas pendentes baseado nos dados reais
        for (const demo of demonstrativos) {
          // Se tem glosa > 0, é uma glosa pendente
          const glosaValue =
            parseFloat(demo.glosa?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
          if (glosaValue > 0) {
            totalGlosasPendentes += 1;
          }
        }

        setPendingGlosas(totalGlosasPendentes);

        // Buscar notificações não lidas
        const activityResponse = await axios.get(
          `${
            import.meta.env.VITE_API_URL || 'http://localhost:8000'
          }/api/v1/activity-logs?limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Contar atividades recentes como "não lidas" (últimas 1 hora)
        const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
        const activities = Array.isArray(activityResponse.data.activities)
          ? activityResponse.data.activities
          : [];
        const recentActivities = activities.filter(
          (activity: any) => new Date(activity.timestamp) > oneHourAgo
        );
        setUnreadNotifications(recentActivities.length);

        // Log para debug
        if (recentActivities.length > 0) {
          console.log(
            `📊 ${recentActivities.length} atividade(s) recente(s) detectada(s)`
          );
        }
      } catch (error) {
        console.error('Erro ao buscar dados da sidebar:', error);
        // Manter valores padrão em caso de erro
        setPendingGlosas(0);
        setUnreadNotifications(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingGlosas();

    // Atualizar a cada 5 minutos (reduzido - tempo real cuida do resto)
    const interval = setInterval(fetchPendingGlosas, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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

  // ESTRUTURA OTIMIZADA - Fluxo de trabalho médico real
  const menuSections = [
    {
      id: 'dashboard',
      title: 'Visão Executiva',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          href: '/dashboard',
          description: 'Visão geral operacional',
          color: 'blue',
        },
      ],
    },
    {
      id: 'operations',
      title: 'Fluxo Operacional',
      items: [
        {
          icon: FileText,
          label: 'Guias Médicas',
          href: '/guides',
          description: 'Gestão de guias TISS',
          color: 'emerald',
        },
        {
          icon: FileBarChart,
          label: 'Demonstrativos',
          href: '/demonstratives',
          description: 'Análise de demonstrativos',
          color: 'emerald',
        },
      ],
    },
    {
      id: 'critical',
      title: 'Gestão Crítica',
      items: [
        {
          icon: FileX,
          label: 'Glosas Pendentes',
          href: '/unpaid-procedures',
          description: 'Contestações urgentes',
          color: 'red',
          badge: pendingGlosas,
          badgeVariant: 'destructive' as const,
          isCritical: true,
        },
      ],
    },
    {
      id: 'intelligence',
      title: 'Central de Inteligência CBHPM',
      items: [
        {
          icon: Brain,
          label: 'Intelligence Hub',
          href: '/intelligence',
          description: 'IA + Analytics + Relatórios CBHPM',
          color: 'purple',
          isPremium: true,
        },
      ],
    },
    {
      id: 'system',
      title: 'Sistema & Suporte',
      items: [
        {
          icon: Bell,
          label: 'Activity Log',
          href: '/notifications',
          description: 'Log de atividades',
          color: 'orange',
          badge: unreadNotifications,
          badgeVariant: 'default' as const,
        },
        {
          icon: HelpCircle,
          label: 'Suporte',
          href: '/help',
          description: 'Ajuda e documentação',
          color: 'orange',
        },
      ],
    },
    {
      id: 'account',
      title: 'Conta & Configurações',
      items: [
        {
          icon: User,
          label: 'Perfil',
          href: '/profile',
          description: 'Dados pessoais',
          color: 'slate',
        },
      ],
    },
  ];

  // Classes da sidebar
  const sidebarClasses = `
    fixed inset-y-0 left-0 flex flex-col
    bg-gradient-to-br from-white/98 via-blue-50/95 to-emerald-50/90 backdrop-blur-xl 
    dark:bg-gradient-to-br dark:from-gray-900/98 dark:via-gray-800/95 dark:to-gray-900/98
    border-r border-slate-200/80 dark:border-slate-700/80 h-screen z-40
    shadow-xl shadow-blue-500/5 dark:shadow-gray-900/20
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

  // Cores dos itens
  const colorSchemes = {
    blue: {
      active: 'bg-blue-600/15 text-blue-700 dark:text-blue-200 ring-1 ring-blue-600/25',
      hover: 'hover:text-blue-700 hover:bg-blue-600/10 dark:hover:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    emerald: {
      active:
        'bg-emerald-600/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-600/25',
      hover:
        'hover:text-emerald-700 hover:bg-emerald-600/10 dark:hover:text-emerald-200',
      icon: 'text-emerald-600 dark:text-emerald-400',
    },
    red: {
      active: 'bg-red-600/15 text-red-700 dark:text-red-200 ring-1 ring-red-600/25',
      hover: 'hover:text-red-700 hover:bg-red-600/10 dark:hover:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
    },
    purple: {
      active:
        'bg-purple-600/15 text-purple-700 dark:text-purple-200 ring-1 ring-purple-600/25',
      hover: 'hover:text-purple-700 hover:bg-purple-600/10 dark:hover:text-purple-200',
      icon: 'text-purple-600 dark:text-purple-400',
    },
    orange: {
      active:
        'bg-orange-600/15 text-orange-700 dark:text-orange-200 ring-1 ring-orange-600/25',
      hover: 'hover:text-orange-700 hover:bg-orange-600/10 dark:hover:text-orange-200',
      icon: 'text-orange-600 dark:text-orange-400',
    },
    indigo: {
      active:
        'bg-indigo-600/15 text-indigo-700 dark:text-indigo-200 ring-1 ring-indigo-600/25',
      hover: 'hover:text-indigo-700 hover:bg-indigo-600/10 dark:hover:text-indigo-200',
      icon: 'text-indigo-600 dark:text-indigo-400',
    },
    slate: {
      active:
        'bg-slate-600/15 text-slate-700 dark:text-slate-200 ring-1 ring-slate-600/25',
      hover: 'hover:text-slate-700 hover:bg-slate-600/10 dark:hover:text-slate-200',
      icon: 'text-slate-600 dark:text-slate-400',
    },
  };

  // Componente de item do menu
  const MenuItem = ({ item }: { item: any }) => {
    const scheme =
      colorSchemes[item.color as keyof typeof colorSchemes] || colorSchemes.blue;
    const active = isActive(item.href);

    return (
      <button
        key={item.href}
        onClick={() => navigate(item.href)}
        className={`
          group relative flex items-center w-full p-3 rounded-lg text-sm font-medium
          transition-all duration-200 ease-in-out
          ${active ? scheme.active : `text-gray-700 dark:text-gray-200 ${scheme.hover}`}
          ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3'}
        `}
        title={isCollapsed ? item.label : undefined}
      >
        {/* Ícone */}
        <div className="relative flex-shrink-0">
          <item.icon
            className={`
              h-5 w-5 transition-colors duration-200
              ${
                active
                  ? scheme.icon
                  : 'text-gray-500 dark:text-gray-400 group-hover:' + scheme.icon
              }
            `}
          />

          {/* Premium indicator */}
          {item.isPremium && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping opacity-75"></div>
            </div>
          )}
        </div>

        {/* Label e Badge - só mostra se não collapsed */}
        {!isCollapsed && (
          <>
            <div className="flex-1 ml-3 text-left">
              <div className="flex items-center justify-between">
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant || 'default'}
                    className="ml-2 px-1.5 py-0.5 text-xs h-5 min-w-[20px] flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {item.description}
                </p>
              )}
            </div>
          </>
        )}

        {/* Indicador de ativo */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-r-full"></div>
        )}
      </button>
    );
  };

  return (
    <div className={sidebarClasses}>
      {/* Header com Brand */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-700/60">
        <Brand collapsed={isCollapsed} />
      </div>

      {/* Menu Principal */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {menuSections.map((section) => (
          <div key={section.id}>
            {/* Título da seção - só mostra se não collapsed */}
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}

            {/* Itens da seção */}
            <div className="space-y-1">
              {section.items.map((item) => (
                <MenuItem key={item.href} item={item} />
              ))}
            </div>

            {/* Separador entre seções - só mostra se não collapsed */}
            {!isCollapsed && section.id !== 'account' && (
              <Separator className="my-4 bg-slate-200/60 dark:bg-slate-700/60" />
            )}
          </div>
        ))}
      </div>

      {/* Footer Premium */}
      <div className="border-t border-slate-200/60 dark:border-slate-700/60 p-4">
        {!isCollapsed && (
          <div className="mb-4">
            {/* Status Premium */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-700/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    Premium Edition
                  </p>
                  <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
                    v2025.01 • Online
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ações do Footer */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!isCollapsed && (
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center gap-2 p-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
