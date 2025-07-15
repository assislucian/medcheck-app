import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import { useMobileLayout } from '../../hooks/use-mobile';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface InfoCardProps {
  icon?: ReactNode;
  title: ReactNode;
  value?: ReactNode;
  description?: ReactNode;
  variant?:
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral'
    | 'default'
    | 'medical'
    | 'primary'
    | 'professional';
  className?: string;
  children?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  loading?: boolean;
  hover?: boolean;
  // Novas props para mobile
  compact?: boolean; // Versão compacta para mobile
  priority?: 'high' | 'medium' | 'low'; // Prioridade para ordenação mobile
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>; // Ações do dropdown mobile
  mobileLabel?: string; // Label customizada para mobile
}

const variantStyles = {
  info: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20',
  success: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20',
  warning: 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20',
  danger: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20',
  neutral: 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/20',
  default: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50',
  medical:
    'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20',
  primary: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20',
  professional:
    'border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/20',
};

const iconVariantStyles = {
  info: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40',
  success: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/40',
  warning: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40',
  danger: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40',
  neutral: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/40',
  default: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/40',
  medical:
    'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40',
  primary: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40',
  professional: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/40',
};

export function InfoCard({
  icon,
  title,
  value,
  description,
  variant = 'default',
  className,
  children,
  trend,
  loading = false,
  hover = true,
  compact = false,
  priority = 'medium',
  actions,
  mobileLabel,
}: InfoCardProps) {
  const { isMobile, shouldStackCards } = useMobileLayout();

  // Determinar se usar layout compacto baseado em mobile ou prop
  const isCompact = compact || isMobile;

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 shadow-sm',
          isCompact ? 'p-4' : 'p-6',
          className
        )}
      >
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={cn(
                'rounded-lg bg-gray-200 dark:bg-gray-700',
                isCompact ? 'h-8 w-8' : 'h-10 w-10'
              )}
            />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border shadow-sm transition-all duration-200 backdrop-blur-sm',
        variantStyles[variant],
        hover && 'hover:shadow-md hover:scale-[1.02] hover:border-opacity-60',
        isCompact ? 'p-4' : 'p-6',
        className
      )}
    >
      {/* Header com ícone, título e ações */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <div
              className={cn(
                'rounded-lg flex items-center justify-center flex-shrink-0',
                iconVariantStyles[variant],
                isCompact ? 'h-8 w-8' : 'h-10 w-10'
              )}
            >
              {icon}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                'font-semibold text-gray-900 dark:text-gray-100 leading-tight',
                isCompact ? 'text-sm' : 'text-base'
              )}
            >
              {mobileLabel && isMobile ? mobileLabel : title}
            </h3>

            {/* Trend inline para mobile compacto */}
            {isCompact && trend && (
              <div className="flex items-center gap-1 mt-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {Math.abs(trend.value)}% {trend.label || ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown de ações para mobile */}
        {actions && actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-60 hover:opacity-100 touch-manipulation"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {actions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={action.onClick}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Valor principal */}
      {value && (
        <div className="mb-2">
          <div
            className={cn(
              'font-bold text-gray-900 dark:text-gray-100 tabular-nums',
              isCompact ? 'text-xl' : 'text-2xl lg:text-3xl'
            )}
          >
            {value}
          </div>
        </div>
      )}

      {/* Descrição e trend (não compacto) */}
      <div className="flex items-center justify-between">
        {description && (
          <p
            className={cn(
              'text-gray-600 dark:text-gray-400 leading-relaxed',
              isCompact ? 'text-xs' : 'text-sm'
            )}
          >
            {description}
          </p>
        )}

        {/* Trend para versão não compacta */}
        {!isCompact && trend && (
          <div className="flex items-center gap-1 ml-3">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                trend.isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {Math.abs(trend.value)}%
            </span>
            {trend.label && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Children content */}
      {children && (
        <div
          className={cn(
            'border-t border-gray-200 dark:border-gray-700',
            isCompact ? 'mt-3 pt-3' : 'mt-4 pt-4'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Componente de grid responsivo para InfoCards
export function InfoCardGrid({
  children,
  className,
  columns,
}: {
  children: ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}) {
  const { isMobile, isTablet, shouldStackCards } = useMobileLayout();

  // Determinar número de colunas baseado no dispositivo
  const getCols = () => {
    if (isMobile) return columns?.mobile || 1;
    if (isTablet) return columns?.tablet || 2;
    return columns?.desktop || 4;
  };

  const cols = getCols();

  // Classes de grid responsivo
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  } as const;

  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-6',
        gridClasses[cols as keyof typeof gridClasses] ||
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
}
