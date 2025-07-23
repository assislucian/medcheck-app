import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
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

  // Mapear rotas para breadcrumbs minimalistas
  const routeMap: Record<string, BreadcrumbItem[]> = {
    '/dashboard': [],
    '/intelligence': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Central de Inteligência' },
    ],
    '/guides': [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Guias Médicas' }],
    '/demonstratives': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Demonstrativos' },
    ],
    '/unpaid-procedures': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Procedimentos Pendentes' },
    ],
    '/reports': [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Relatórios' }],
    '/profile': [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Perfil' }],
    '/notifications': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Atividades do Sistema' },
    ],
    '/help': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Central de Ajuda' },
    ],
  };

  // Usar items customizados ou gerar automaticamente baseado na rota
  const items = customItems || routeMap[location.pathname] || [];

  // Se não há breadcrumbs ou só tem um item, não mostrar
  if (items.length <= 1) return null;

  return (
    <nav
      className={cn('flex items-center text-sm text-gray-500', className)}
      aria-label="Breadcrumb"
    >
      <div className="flex items-center">
        <Link
          to="/dashboard"
          className="flex items-center hover:text-gray-700 transition-colors"
          aria-label="Voltar ao Dashboard"
        >
          <Home className="h-3.5 w-3.5" />
        </Link>

        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-3.5 w-3.5 mx-2 text-gray-400" />
            {item.href ? (
              <Link to={item.href} className="hover:text-gray-700 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
