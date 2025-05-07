import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
// import { Button } from '@/components/ui/button'; // Não é mais usado
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from 'react-router-dom';
import { ThemeToggle } from "../ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface UserMenuProps {
  name: string;
  email: string;
  specialty?: string;
  avatarUrl?: string;
  onLogout: () => void;
}

export const UserMenu = ({ name, email, specialty, avatarUrl, onLogout }: UserMenuProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full transition hover:bg-muted px-1 py-1"
          aria-label="Abrir menu do usuário"
        >
          <Avatar className="h-8 w-8 border border-muted">
            <AvatarImage src={avatarUrl} alt="Avatar" />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <span className="hidden xl:block text-sm font-medium text-neutral-900 dark:text-white max-w-[120px] truncate">{name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 max-w-xs rounded-xl shadow-xl border bg-popover p-0 mt-2">
        <div className="flex flex-col items-center gap-2 px-4 py-4 bg-muted rounded-t-xl border-b">
          <Avatar className="h-9 w-9 border border-muted">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="text-center w-full">
            <p className="font-semibold text-base truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            {specialty && <p className="text-xs text-muted-foreground truncate">CRM: {specialty}</p>}
          </div>
        </div>
        <div className="py-1">
          <DropdownMenuItem asChild className="transition-colors duration-100 hover:bg-muted/80 focus:bg-muted/80 cursor-pointer flex items-center gap-2 px-4 py-2" role="menuitem">
            <Link to="/profile">
              <User className="h-4 w-4" />
              <span>Meu Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="transition-colors duration-100 hover:bg-muted/80 focus:bg-muted/80 cursor-pointer flex items-center gap-2 px-4 py-2" role="menuitem">
            <Link to="/settings">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm">Tema</span>
          <ThemeToggle className="ml-0" />
        </div>
        <div className="py-1">
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="transition-colors duration-100 hover:bg-red-50 focus:bg-red-100 text-destructive font-semibold flex items-center gap-2 px-4 py-2 mt-1"
            onClick={onLogout}
            role="menuitem"
          >
            <LogOut className="h-4 w-4 text-destructive" />
            <span>Sair</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
