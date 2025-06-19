import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  icon,
  actions,
  children, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {children}
        </div>
      </div>
    </div>
  );
}
