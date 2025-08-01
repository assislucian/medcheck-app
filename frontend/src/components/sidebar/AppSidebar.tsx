import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import {
  LogOut,
  LayoutDashboard,
  FileText,
  FileBarChart,
  AlertTriangle,
  Bell,
  User,
  Settings,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useRealTimeSync } from '../../hooks/useRealTimeSync';
import { toast } from 'sonner';
import Brand from './Brand';
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
  const [pendingProcedures, setPendingProcedures] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tempo real: atualizações automáticas da sidebar
  const {} = useRealTimeSync({
    onActivityUpdate: () => {
      console.log('🔄 Sidebar: atualizando contadores...');
      fetchData();
    },
  });

  // Buscar dados reais para contadores
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Buscar procedimentos não pagos
      const unpaidResponse = await axios.get(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:8000'
        }/api/v1/unpaid-procedures`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingProcedures(unpaidResponse.data.unpaid_procedures || 0);

      // Buscar notificações não lidas (atividades recentes)
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
    } catch (error) {
      console.error('Erro ao buscar dados da sidebar:', error);
      setPendingProcedures(0);
      setUnreadNotifications(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
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

  // ESTRUTURA OTIMIZADA - Essencial e profissional
  const menuSections = [
    {
      id: 'main',
      title: 'Principal',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          href: '/dashboard',
          description: 'Visão geral executiva',
          color: 'blue',
        },
      ],
    },
    {
      id: 'operations',
      title: 'Operacional',
      items: [
        {
          icon: FileText,
          label: 'Guias Médicas',
          href: '/guides',
          description: 'Central de guias TISS',
          color: 'emerald',
        },
        {
          icon: FileBarChart,
          label: 'Demonstrativos',
          href: '/demonstratives',
          description: 'Análise de pagamentos',
          color: 'emerald',
        },
        {
          icon: AlertTriangle,
          label: 'Pendências',
          href: '/unpaid-procedures',
          description: 'Procedimentos não pagos',
          color: 'amber',
          badge: pendingProcedures,
          badgeVariant: pendingProcedures > 0 ? 'destructive' : 'secondary',
        },
      ],
    },
    {
      id: 'analytics',
      title: 'Inteligência',
      items: [
        {
          icon: BarChart3,
          label: 'Relatórios',
          href: '/reports',
          description: 'Análise financeira avançada',
          color: 'purple',
        },
      ],
    },
    {
      id: 'system',
      title: 'Sistema',
      items: [
        // Item temporariamente removido
        // {
        //   icon: Bell,
        //   label: 'Atividades',
        //   href: '/notifications',
        //   description: 'Log do sistema',
        //   color: 'slate',
        //   badge: unreadNotifications,
        //   badgeVariant: 'default',
        // },
        {
          icon: User,
          label: 'Perfil',
          href: '/profile',
          description: 'Dados da conta',
          color: 'slate',
        },
      ],
    },
  ];

  // Classes da sidebar
  const sidebarClasses = `
    fixed inset-y-0 left-0 flex flex-col
    bg-white dark:bg-gray-900
    border-r border-gray-200 dark:border-gray-700 h-screen z-40
    shadow-lg
    transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
    ${
      isOverlay
        ? 'w-4/5 max-w-[280px] transform'
        : isCollapsed
          ? 'w-[70px]'
          : 'w-[260px]'
    }
    ${isOverlay && !isOpen ? '-translate-x-full' : 'translate-x-0'}
  `;

  // Cores dos itens
  const colorSchemes = {
    blue: {
      active: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200',
      hover:
        'hover:text-blue-700 hover:bg-blue-50 dark:hover:text-blue-200 dark:hover:bg-blue-950/30',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    emerald: {
      active:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200',
      hover:
        'hover:text-emerald-700 hover:bg-emerald-50 dark:hover:text-emerald-200 dark:hover:bg-emerald-950/30',
      icon: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      active: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200',
      hover:
        'hover:text-amber-700 hover:bg-amber-50 dark:hover:text-amber-200 dark:hover:bg-amber-950/30',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    slate: {
      active: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
      hover:
        'hover:text-gray-700 hover:bg-gray-50 dark:hover:text-gray-200 dark:hover:bg-gray-800',
      icon: 'text-gray-600 dark:text-gray-400',
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
        </div>

        {/* Label e Badge - só mostra se não collapsed */}
        {!isCollapsed && (
          <>
            <div className="flex-1 ml-3 text-left">
              <div className="flex items-center justify-between">
                <span className="truncate">{item.label}</span>
                {item.badge > 0 && (
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
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>
        )}
      </button>
    );
  };

  return (
    <div className={sidebarClasses}>
      {/* Header com Brand */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <Brand collapsed={isCollapsed} />
      </div>

      {/* Menu Principal */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {menuSections.map((section, index) => (
          <div key={section.id}>
            {/* Título da seção - só mostra se não collapsed */}
            {!isCollapsed && (
              <div className="px-3 mb-2">
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

            {/* Separador entre seções - só mostra se não collapsed e não é a última seção */}
            {!isCollapsed && index < menuSections.length - 1 && (
              <Separator className="my-3 bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {/* Status Version - só mostra se não collapsed */}
        {!isCollapsed && (
          <div className="mb-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  MedCheck Pro
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  v2025.01 • Online
                </p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
