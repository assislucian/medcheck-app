import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'h-20 w-20',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center max-w-md mx-auto',
        classes.container,
        className
      )}
    >
      {/* Ícone */}
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted/50 mb-4 text-muted-foreground',
            classes.icon
          )}
        >
          {React.cloneElement(icon as React.ReactElement, {
            className: cn((icon as any)?.props?.className, 'h-1/2 w-1/2'),
          })}
        </div>
      )}

      {/* Título */}
      <h3 className={cn('font-semibold text-foreground mb-2', classes.title)}>
        {title}
      </h3>

      {/* Descrição */}
      {description && (
        <p
          className={cn(
            'text-muted-foreground mb-6 leading-relaxed',
            classes.description
          )}
        >
          {description}
        </p>
      )}

      {/* Ações */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size={size === 'sm' ? 'sm' : 'default'}
              className="min-w-[120px]"
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'outline'}
              size={size === 'sm' ? 'sm' : 'default'}
              className="min-w-[120px]"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
