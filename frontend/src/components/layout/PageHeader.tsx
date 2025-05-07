import { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  icon?: ReactNode;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PageHeader({
  title,
  icon,
  description,
  actions,
  breadcrumbs,
  size = 'md',
  className = '',
}: PageHeaderProps) {
  const sizeMap = {
    sm: 'text-2xl py-2',
    md: 'text-3xl py-3',
    lg: 'text-4xl py-4',
  };
  return (
    <header className={`mb-6 flex flex-col gap-2 ${className}`}>
      {breadcrumbs && (
        <nav className="mb-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
          {breadcrumbs}
        </nav>
      )}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {icon && <span className="text-brand shrink-0">{icon}</span>}
          <h1 className={`font-bold text-brand truncate ${sizeMap[size]}`}>{title}</h1>
        </div>
        {actions && (
          <div className="flex items-center gap-2 ml-2 transition-all hover:scale-105 focus-within:scale-105">
            {actions}
          </div>
        )}
      </div>
      {description && (
        <div className="text-base text-muted-foreground mt-1 max-w-2xl">{description}</div>
      )}
    </header>
  );
}
