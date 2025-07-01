import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items: customItems,
  className,
}) => {
  const location = useLocation();

  // Mapear rotas para breadcrumbs automaticamente
  const routeMap: Record<string, BreadcrumbItem[]> = {
    '/dashboard': [{ label: 'Centro de Comando', icon: <Home className="h-4 w-4" /> }],
    '/intelligence': [
      {
        label: 'Centro de Comando',
        href: '/dashboard',
        icon: <Home className="h-4 w-4" />,
      },
      { label: 'Intelligence Hub' },
    ],
    '/guides': [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Guias Médicas', href: '/guides' },
    ],
    '/demonstratives': [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Demonstrativos', href: '/demonstratives' },
    ],
    '/unpaid-procedures': [
      {
        label: 'Centro de Comando',
        href: '/dashboard',
        icon: <Home className="h-4 w-4" />,
      },
      { label: 'Gestão Crítica' },
      { label: 'Glosas Pendentes' },
    ],
    '/reports': [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Relatórios', href: '/reports' },
    ],
    '/profile': [
      {
        label: 'Centro de Comando',
        href: '/dashboard',
        icon: <Home className="h-4 w-4" />,
      },
      { label: 'Configurações' },
      { label: 'Perfil' },
    ],
    '/notifications': [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Activity Log', href: '/notifications' },
    ],
    '/help': [
      {
        label: 'Centro de Comando',
        href: '/dashboard',
        icon: <Home className="h-4 w-4" />,
      },
      { label: 'Suporte' },
      { label: 'Central de Ajuda' },
    ],
  };

  // Usar items customizados ou gerar automaticamente baseado na rota
  const items = customItems ||
    routeMap[location.pathname] || [
      {
        label: 'Centro de Comando',
        href: '/dashboard',
        icon: <Home className="h-4 w-4" />,
      },
    ];

  if (items.length <= 1) return null;

  return (
    <nav
      className={cn(
        'flex items-center space-x-1 text-sm text-muted-foreground py-2 px-1',
        className
      )}
      aria-label="Breadcrumb"
    >
      <div className="flex items-center space-x-1">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground/60" />}
            {item.href ? (
              <Link
                to={item.href}
                className="flex items-center space-x-1 hover:text-primary transition-colors rounded px-2 py-1 hover:bg-muted/50"
                aria-label={`Ir para ${item.label}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-1 font-medium text-foreground px-2 py-1">
                {item.icon}
                <span>{item.label}</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
