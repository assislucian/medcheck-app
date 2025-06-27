import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Brain,
  FileText,
  FileBarChart,
  FileQuestion,
  History,
  HelpCircle,
  Bell,
  User,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function MainNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LineChart,
    },
    {
      name: 'Intelligence Hub',
      href: '/intelligence',
      icon: Brain,
    },
    {
      name: 'Guias',
      href: '/guides',
      icon: FileText,
    },
    {
      name: 'Demonstrativos',
      href: '/demonstratives',
      icon: FileBarChart,
    },
    {
      name: 'Não Pagos',
      href: '/unpaid-procedures',
      icon: FileQuestion,
    },
    {
      name: 'Histórico',
      href: '/history',
      icon: History,
    },
    {
      name: 'Suporte',
      href: '/support',
      icon: HelpCircle,
    },
    {
      name: 'Notificações',
      href: '/notifications',
      icon: Bell,
    },
    {
      name: 'Perfil',
      href: '/profile',
      icon: User,
    },
  ];

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
        Menu Principal
      </h2>
      <div className="space-y-1">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleNavigate(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.name}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
