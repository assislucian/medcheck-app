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
    <div className="border-b border-gray-200/60 bg-gradient-to-r from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 dark:border-gray-700/60">
      <div className="px-0 py-8">
        {/* Breadcrumbs com espaçamento melhorado */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6"
            aria-label="Breadcrumb"
          >
            <span className="font-medium">MedCheck</span>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-primary transition-colors font-medium"
                    aria-label={`Ir para ${crumb.label}`}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Header Principal com espaçamentos premium */}
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="flex items-start gap-6 min-w-0 flex-1">
            {/* Ícone melhorado */}
            {icon && (
              <div className="flex-shrink-0 p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm">
                <div className="text-primary">{icon}</div>
              </div>
            )}

            {/* Título e Descrição com melhor hierarquia */}
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-base xl:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions com melhor posicionamento */}
          {actions && <div className="flex-shrink-0 flex items-start">{actions}</div>}
        </div>

        {/* Children com espaçamento adequado */}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
export { PageHeader };
