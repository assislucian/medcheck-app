import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "../ThemeToggle";
import { LogOut, Play, LayoutDashboard, FileText, FileBarChart, FileX, History, HelpCircle, User } from "lucide-react";
import { useAuth } from "../../contexts/auth/AuthContext";
import { toast } from "sonner";
import Brand from "./Brand";
import SidebarFooter from "./Footer";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

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

  return (
    <aside className="fixed inset-y-0 left-0 flex flex-col w-[272px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 px-6 py-6 h-screen z-40">
      <Brand />
      {/* Espaço para UserMiniCard futuramente, se necessário */}
      <nav className="flex-1 mt-4 space-y-2 overflow-y-auto">
        <h4 className="mt-6 mb-2 text-xs font-semibold text-neutral-400 uppercase">Operações</h4>
        <ul className="space-y-1">
          {mainMenuItems.slice(0, 4).map((item) => (
            <li key={item.href}>
              <button
                onClick={() => navigate(item.href)}
                className={`flex gap-3 items-center px-4 py-2 rounded transition-colors w-full text-left
                  ${isActive(item.href)
                    ? 'bg-brand-50 text-brand border-l-4 border-brand'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
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
                className={`flex gap-3 items-center px-4 py-2 rounded transition-colors w-full text-left
                  ${isActive(item.href)
                    ? 'bg-brand-50 text-brand border-l-4 border-brand'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <h4 className="mt-6 mb-2 text-xs font-semibold text-neutral-400 uppercase">Conta</h4>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate('/profile')}
              className={`flex gap-3 items-center px-4 py-2 rounded transition-colors w-full text-left
                ${isActive('/profile')
                  ? 'bg-brand-50 text-brand border-l-4 border-brand'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            >
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="mt-auto pt-4 space-y-3 border-t border-neutral-200">
        <SidebarFooter />
      </div>
    </aside>
  );
}
