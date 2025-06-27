import { ThemeToggle } from '../ThemeToggle';
import { LogOut, User, Crown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

export default function SidebarFooter() {
  const navigate = useNavigate();
  const { signOut, user, userProfile } = useAuth();
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
    <div className="mt-auto border-t border-slate-200/80 dark:border-slate-700/80 pt-6 space-y-4">
      {/* User Card Premium - quando expandido */}
      {!isCollapsed && userProfile && (
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/80 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
          <div className="flex items-center gap-3">
            {/* Avatar/Initial */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name || 'Usuário'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {(userProfile.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* Premium indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {userProfile.name || 'Usuário'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  CRM {userProfile.crm || 'N/A'}
                </p>
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                  {userProfile.uf || 'BR'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status/Plan indicator */}
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-600/60">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Shield className="w-3 h-3" />
                <span className="font-medium">Plano Premium</span>
              </div>
              <span className="text-slate-500 dark:text-slate-400">Online</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed user indicator */}
      {isCollapsed && userProfile && (
        <div className="px-4">
          <div className="relative mx-auto w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name || 'Usuário'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {(userProfile.name || 'U').charAt(0).toUpperCase()}
              </span>
            )}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-4">
        <div
          className={`flex items-center ${
            isCollapsed ? 'flex-col gap-3' : 'justify-between'
          }`}
        >
          <ThemeToggle />

          <button
            onClick={handleSignOut}
            className={`flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group ${
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
