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
} from 'lucide-react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { toast } from 'sonner';
import Brand from './Brand';
import SidebarFooter from './Footer';
import { useSidebarContext } from '../../contexts/SidebarContext';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isOverlay, isOpen, isCollapsed } = useSidebarContext();

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

  const mainMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Guias', href: '/guides' },
    { icon: FileBarChart, label: 'Demonstrativos', href: '/demonstratives' },
    { icon: FileX, label: 'Não Pagos', href: '/unpaid-procedures' },
    { icon: History, label: 'Histórico', href: '/history' },
  ];

  // Reorganização mais lógica dos grupos de navegação
  const coreWorkflowItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Guias', href: '/guides' },
    { icon: FileBarChart, label: 'Demonstrativos', href: '/demonstratives' },
  ];

  const analysisItems = [
    { icon: FileX, label: 'Não Pagos', href: '/unpaid-procedures' },
    { icon: History, label: 'Histórico', href: '/history' },
  ];

  const accountItems = [{ icon: User, label: 'Perfil', href: '/profile' }];

  // Classes condicionais baseadas no estado da sidebar
  const sidebarClasses = `
    fixed inset-y-0 left-0 flex flex-col
    bg-gradient-to-br from-white/90 via-blue-50/80 to-emerald-50/60 backdrop-blur-md shadow-lg
    border-r border-slate-200 dark:border-slate-700 px-6 py-6 h-screen z-40
    transition-transform duration-300 ease-\[cubic-bezier(.4,0,.2,1)\]
    ${
      isOverlay
        ? 'w-4/5 max-w-[320px] transform'
        : isCollapsed
          ? 'w-[72px]'
          : 'w-[var(--sidebar-width)]'
    }
    ${isOverlay && !isOpen ? '-translate-x-full' : 'translate-x-0'}
  `;

  return (
    <aside className={sidebarClasses}>
      <Brand />
      {/* Espaço para UserMiniCard futuramente, se necessário */}
      <nav className="flex-1 mt-6 space-y-4 overflow-y-auto scrollbar-hide">
        {/* Grupo Principal - Fluxo de Trabalho */}
        <div className="space-y-1">
          <h4 className="px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Fluxo Principal
          </h4>
          <ul className="space-y-1">
            {coreWorkflowItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => navigate(item.href)}
                  className={`group flex gap-3 items-center px-4 py-3 rounded-xl font-medium w-full text-left
                    transition-all duration-200 ease-out
                    ${
                      isActive(item.href)
                        ? 'bg-blue-600/12 text-blue-700 dark:text-blue-200 shadow-sm ring-1 ring-blue-600/20 scale-[1.02]'
                        : 'text-slate-700 hover:text-blue-700 hover:bg-blue-600/8 dark:text-slate-300 dark:hover:bg-slate-700/40 hover:scale-[1.01]'
                    }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110" />
                  <span
                    className={`font-medium ${isCollapsed ? 'hidden xl:inline' : ''}`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Grupo Análise & Relatórios */}
        <div className="space-y-1">
          <h4 className="px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Análise & Relatórios
          </h4>
          <ul className="space-y-1">
            {analysisItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => navigate(item.href)}
                  className={`group flex gap-3 items-center px-4 py-3 rounded-xl font-medium w-full text-left
                    transition-all duration-200 ease-out
                    ${
                      isActive(item.href)
                        ? 'bg-emerald-600/12 text-emerald-700 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-600/20 scale-[1.02]'
                        : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-600/8 dark:text-slate-300 dark:hover:bg-slate-700/40 hover:scale-[1.01]'
                    }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110" />
                  <span
                    className={`font-medium ${isCollapsed ? 'hidden xl:inline' : ''}`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Spacer flexível para empurrar conta para baixo */}
        <div className="flex-1"></div>

        {/* Grupo Conta - Fixo na parte inferior */}
        <div className="space-y-1 mt-auto pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
          <h4 className="px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Conta
          </h4>
          <ul className="space-y-1">
            {accountItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => navigate(item.href)}
                  className={`group flex gap-3 items-center px-4 py-3 rounded-xl font-medium w-full text-left
                    transition-all duration-200 ease-out
                    ${
                      isActive(item.href)
                        ? 'bg-indigo-600/12 text-indigo-700 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-600/20 scale-[1.02]'
                        : 'text-slate-700 hover:text-indigo-700 hover:bg-indigo-600/8 dark:text-slate-300 dark:hover:bg-slate-700/40 hover:scale-[1.01]'
                    }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110" />
                  <span
                    className={`font-medium ${isCollapsed ? 'hidden xl:inline' : ''}`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <SidebarFooter />
    </aside>
  );
}
