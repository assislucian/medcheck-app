import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "../ThemeToggle";
import { LogOut, Play, LayoutDashboard, FileText, FileBarChart, FileX, History, HelpCircle, User } from "lucide-react";
import { useAuth } from "../../contexts/auth/AuthContext";
import { toast } from "sonner";
import Brand from "./Brand";
import SidebarFooter from "./Footer";
import { useSidebarContext } from "../../contexts/SidebarContext";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isOverlay, isOpen, isCollapsed } = useSidebarContext();

  const isActive = (route: string) => location.pathname.startsWith(route);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
      navigate("/login");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error("Erro ao fazer logout");
    }
  };

  const mainMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Guias", href: "/guides" },
    { icon: FileBarChart, label: "Demonstrativos", href: "/demonstratives" },
    { icon: FileX, label: "Não Pagos", href: "/unpaid-procedures" },
    { icon: History, label: "Histórico", href: "/history" },
    { icon: HelpCircle, label: "Suporte", href: "/support" },
  ];

  // Classes condicionais baseadas no estado da sidebar
  const sidebarClasses = `
    fixed inset-y-0 left-0 flex flex-col
    bg-gradient-to-br from-white/90 via-blue-50/80 to-emerald-50/60 backdrop-blur-md shadow-lg
    border-r border-slate-200 dark:border-slate-700 px-6 py-6 h-screen z-40
    transition-transform duration-300 ease-\[cubic-bezier(.4,0,.2,1)\]
    ${isOverlay ? 'w-[var(--sidebar-width)] transform' : isCollapsed ? 'w-[72px]' : 'w-[var(--sidebar-width)]'}
    ${isOverlay && !isOpen ? '-translate-x-full' : 'translate-x-0'}
  `;

  return (
    <aside className={sidebarClasses}>
      <Brand />
      {/* Espaço para UserMiniCard futuramente, se necessário */}
      <nav className="flex-1 mt-4 space-y-2 overflow-y-auto scrollbar-hide">
        <h4 className="mt-6 mb-2 text-xs font-semibold text-neutral-400 uppercase">Operações</h4>
        <ul className="space-y-1">
          {mainMenuItems.slice(0, 4).map((item) => (
            <li key={item.href}>
              <button
                onClick={() => navigate(item.href)}
                className={`group flex gap-3 items-center px-4 py-2 rounded-lg font-medium w-full text-left
                  transition-all duration-150
                  ${isActive(item.href)
                    ? 'bg-blue-600/10 text-blue-700 dark:text-blue-200 ring-2 ring-blue-600/20'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-600/5 dark:text-slate-300 dark:hover:bg-slate-700/40'}`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0 transition-colors group-hover:scale-105" />
                <span className={`${isCollapsed ? 'hidden xl:inline' : ''}`}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <h4 className="mt-6 mb-2 text-xs font-semibold text-neutral-400 uppercase">Insights</h4>
        <ul className="space-y-1">
          {mainMenuItems.slice(4).map((item) => (
            <li key={item.href}>
              <button
                onClick={() => navigate(item.href)}
                className={`group flex gap-3 items-center px-4 py-2 rounded-lg font-medium w-full text-left
                  transition-all duration-150
                  ${isActive(item.href)
                    ? 'bg-blue-600/10 text-blue-700 dark:text-blue-200 ring-2 ring-blue-600/20'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-600/5 dark:text-slate-300 dark:hover:bg-slate-700/40'}`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0 transition-colors group-hover:scale-105" />
                <span className={`${isCollapsed ? 'hidden xl:inline' : ''}`}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <h4 className="mt-6 mb-2 text-xs font-semibold text-neutral-400 uppercase">Conta</h4>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate('/profile')}
              className={`group flex gap-3 items-center px-4 py-2 rounded-lg font-medium w-full text-left
                transition-all duration-150
                ${isActive('/profile')
                  ? 'bg-blue-600/10 text-blue-700 dark:text-blue-200 ring-2 ring-blue-600/20'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-blue-600/5 dark:text-slate-300 dark:hover:bg-slate-700/40'}`}
            >
              <User className="h-4 w-4 flex-shrink-0 transition-colors group-hover:scale-105" />
              <span className={`${isCollapsed ? 'hidden xl:inline' : ''}`}>Perfil</span>
            </button>
          </li>
        </ul>
      </nav>
      <SidebarFooter />
    </aside>
  );
}
