import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Brain,
  FileText,
  FileBarChart,
  FileX,
  History,
  HelpCircle,
  Bell,
  User,
  Settings,
  BarChart3,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export function MainNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  // Estrutura organizada seguindo o mesmo padrão do sidebar
  const navItems = [
    // Visão Executiva
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      category: 'executive',
    },

    // Fluxo Operacional
    {
      name: 'Guias Médicas',
      href: '/guides',
      icon: FileText,
      category: 'operational',
    },
    {
      name: 'Demonstrativos',
      href: '/demonstratives',
      icon: FileBarChart,
      category: 'operational',
    },

    // Gestão Crítica
    {
      name: 'Glosas Pendentes',
      href: '/unpaid-procedures',
      icon: FileX,
      category: 'critical',
      badge: 3,
      badgeVariant: 'destructive',
    },

    // Análise & Compliance
    {
      name: 'Histórico',
      href: '/history',
      icon: History,
      category: 'analysis',
    },
    {
      name: 'Relatórios',
      href: '/reports',
      icon: BarChart3,
      category: 'analysis',
    },
    {
      name: 'Intelligence Hub',
      href: '/intelligence',
      icon: Brain,
      category: 'analysis',
      isPremium: true,
    },

    // Suporte
    {
      name: 'Notificações',
      href: '/notifications',
      icon: Bell,
      category: 'support',
      badge: 2,
    },
    {
      name: 'Suporte',
      href: '/help',
      icon: HelpCircle,
      category: 'support',
    },

    // Conta
    {
      name: 'Perfil',
      href: '/profile',
      icon: User,
      category: 'account',
    },
    {
      name: 'Configurações',
      href: '/settings',
      icon: Settings,
      category: 'account',
    },
  ];

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      executive: 'text-blue-600',
      operational: 'text-emerald-600',
      critical: 'text-red-600',
      analysis: 'text-purple-600',
      support: 'text-orange-600',
      account: 'text-indigo-600',
    };
    return colors[category as keyof typeof colors] || 'text-gray-600';
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
                  className={`w-full justify-start relative ${
                    location.pathname === item.href
                      ? getCategoryColor(item.category)
                      : ''
                  }`}
                  onClick={() => handleNavigate(item.href)}
                >
                  <div className="relative mr-2">
                    <item.icon className="h-4 w-4" />
                    {item.isPremium && (
                      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant || 'default'}
                      className="ml-auto px-1 py-0 text-xs h-4 min-w-[16px] flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
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
