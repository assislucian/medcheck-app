import { LogOut, User, Settings, ChevronDown, Crown, Shield } from 'lucide-react';
// import { Button } from '@/components/ui/button'; // Não é mais usado
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface UserMenuProps {
  name: string;
  email: string;
  specialty?: string;
  crm?: string;
  uf?: string;
  avatarUrl?: string;
  onLogout: () => void;
}

export const UserMenu = ({
  name,
  email,
  specialty,
  crm,
  uf,
  avatarUrl,
  onLogout,
}: UserMenuProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatCRM = () => {
    if (!crm) return null;
    return uf ? `CRM ${crm}/${uf}` : `CRM ${crm}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800/60 px-3 py-2 group"
          aria-label="Abrir menu do usuário"
        >
          {/* Avatar com indicador premium */}
          <div className="relative">
            <Avatar className="h-9 w-9 border-2 border-blue-200 dark:border-blue-700 shadow-sm group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors">
              <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-semibold text-sm">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            {/* Premium Badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          {/* Nome do usuário - visível em telas grandes */}
          <div className="hidden xl:flex flex-col items-start min-w-0">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
              {name}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
              {formatCRM() || specialty || 'Médico'}
            </span>
          </div>

          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 max-w-xs rounded-2xl shadow-2xl border bg-white dark:bg-gray-900 p-0 mt-2 border-gray-200/60 dark:border-gray-700/60"
      >
        {/* Header com informações do usuário */}
        <div className="flex flex-col items-center gap-4 px-6 py-5 bg-gradient-to-br from-blue-50/80 to-emerald-50/40 dark:from-blue-900/20 dark:to-emerald-900/10 rounded-t-2xl border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="relative">
            <Avatar className="h-16 w-16 border-3 border-white dark:border-gray-800 shadow-lg">
              <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-bold text-lg">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="text-center w-full space-y-2">
            <p className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
              {name}
            </p>

            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {email}
              </p>
              {formatCRM() && (
                <Badge variant="outline" className="text-xs font-semibold self-center">
                  {formatCRM()}
                </Badge>
              )}
            </div>

            {specialty && (
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">
                {specialty}
              </p>
            )}

            {/* Status Premium */}
            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">Plano Premium</span>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <DropdownMenuItem
            asChild
            className="transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20 cursor-pointer flex items-center gap-3 px-6 py-3 text-base"
            role="menuitem"
          >
            <Link to="/profile">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">Meu Perfil</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tema
          </span>
          <ThemeToggle />
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* Logout */}
        <div className="py-2">
          <DropdownMenuItem
            className="transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold flex items-center gap-3 px-6 py-3 text-base"
            onClick={onLogout}
            role="menuitem"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
