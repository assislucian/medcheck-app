import { ThemeToggle } from '../ThemeToggle';
import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { toast } from 'sonner';

export default function SidebarFooter() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isCollapsed } = useSidebarContext();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="mt-auto border-t border-slate-200/80 dark:border-slate-700/80 pt-6 space-y-4">
      {/* Controles Essenciais Premium */}
      <div className="px-4">
        <div
          className={`flex items-center gap-3 ${
            isCollapsed ? 'flex-col' : 'justify-between'
          }`}
        >
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group ${
              isCollapsed ? 'w-10 h-10 justify-center' : ''
            }`}
            title="Sair do sistema"
          >
            <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </div>

      {/* Version/Build info - só quando expandido */}
      {!isCollapsed && (
        <div className="px-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              MedCheck v2.0.0
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Premium Edition
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
