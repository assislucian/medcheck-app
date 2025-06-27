import { ThemeToggle } from '../ThemeToggle';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { toast } from 'sonner';

export default function SidebarFooter() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
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

  return (
    <div className="mt-auto border-t border-slate-200/60 pt-4">
      {/* Controles de tema e logout simplificados */}
      <div className="flex items-center justify-between px-4">
        <ThemeToggle />

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          title="Sair do sistema"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}
