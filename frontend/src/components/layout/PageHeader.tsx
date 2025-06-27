import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  children?: ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  breadcrumbs,
  children,
  className,
}) => {
  return (
    <div className="border-b border-border bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <div className="px-6 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className="flex items-center space-x-1 text-sm text-muted-foreground mb-4"
            aria-label="Breadcrumb"
          >
            <span>MedCheck</span>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="h-4 w-4" />
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-primary transition-colors"
                    aria-label={`Ir para ${crumb.label}`}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Header Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Ícone */}
            {icon && (
              <div className="flex-shrink-0 p-3 bg-primary/10 rounded-xl border border-primary/20">
                <div className="text-primary">{icon}</div>
              </div>
            )}

            {/* Título e Descrição */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>

        {children && <div className="mt-4 sm:mt-6">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
