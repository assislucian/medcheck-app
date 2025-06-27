import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
    | 'primary';
  className?: string;
  children?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  hover?: boolean;
}

const variantStyles = {
  default:
    'bg-gradient-to-br from-white via-gray-50/80 to-gray-100/50 border-gray-200 text-gray-900 hover:from-gray-50 hover:via-gray-100/80 hover:to-gray-200/50 dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-900/50 dark:border-gray-700 dark:text-gray-100',
  success:
    'bg-gradient-to-br from-emerald-50/90 via-emerald-100/60 to-emerald-200/40 border-emerald-200/60 text-emerald-900 hover:from-emerald-100/90 hover:via-emerald-200/60 hover:to-emerald-300/40 dark:from-emerald-900/30 dark:via-emerald-800/40 dark:to-emerald-700/20 dark:border-emerald-700/60 dark:text-emerald-100',
  warning:
    'bg-gradient-to-br from-amber-50/90 via-amber-100/60 to-amber-200/40 border-amber-200/60 text-amber-900 hover:from-amber-100/90 hover:via-amber-200/60 hover:to-amber-300/40 dark:from-amber-900/30 dark:via-amber-800/40 dark:to-amber-700/20 dark:border-amber-700/60 dark:text-amber-100',
  danger:
    'bg-gradient-to-br from-red-50/90 via-red-100/60 to-red-200/40 border-red-200/60 text-red-900 hover:from-red-100/90 hover:via-red-200/60 hover:to-red-300/40 dark:from-red-900/30 dark:via-red-800/40 dark:to-red-700/20 dark:border-red-700/60 dark:text-red-100',
  info: 'bg-gradient-to-br from-blue-50/90 via-blue-100/60 to-blue-200/40 border-blue-200/60 text-blue-900 hover:from-blue-100/90 hover:via-blue-200/60 hover:to-blue-300/40 dark:from-blue-900/30 dark:via-blue-800/40 dark:to-blue-700/20 dark:border-blue-700/60 dark:text-blue-100',
  primary:
    'bg-gradient-to-br from-blue-50/90 via-blue-100/60 to-blue-200/40 border-blue-200/60 text-blue-900 hover:from-blue-100/90 hover:via-blue-200/60 hover:to-blue-300/40 dark:from-blue-900/30 dark:via-blue-800/40 dark:to-blue-700/20 dark:border-blue-700/60 dark:text-blue-100',
  neutral:
    'bg-gradient-to-br from-gray-50/90 via-gray-100/60 to-gray-200/40 border-gray-200/60 text-gray-900 hover:from-gray-100/90 hover:via-gray-200/60 hover:to-gray-300/40 dark:from-gray-900/30 dark:via-gray-800/40 dark:to-gray-700/20 dark:border-gray-700/60 dark:text-gray-100',
  medical:
    'bg-gradient-to-br from-blue-50/80 via-white/90 to-emerald-50/60 border-blue-200/50 text-gray-900 hover:from-blue-100/80 hover:via-blue-50/90 hover:to-emerald-100/60 dark:from-blue-900/20 dark:via-gray-800/90 dark:to-emerald-900/30 dark:border-blue-700/50 dark:text-gray-100',
} as const;

const iconVariantStyles = {
  default:
    'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 shadow-sm dark:from-gray-700 dark:to-gray-800 dark:text-gray-300',
  success:
    'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 shadow-sm dark:from-emerald-900/40 dark:to-emerald-800/60 dark:text-emerald-400',
  warning:
    'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 shadow-sm dark:from-amber-900/40 dark:to-amber-800/60 dark:text-amber-400',
  danger:
    'bg-gradient-to-br from-red-100 to-red-200 text-red-600 shadow-sm dark:from-red-900/40 dark:to-red-800/60 dark:text-red-400',
  info: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 shadow-sm dark:from-blue-900/40 dark:to-blue-800/60 dark:text-blue-400',
  primary:
    'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 shadow-sm dark:from-blue-900/40 dark:to-blue-800/60 dark:text-blue-400',
  neutral:
    'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 shadow-sm dark:from-gray-700 dark:to-gray-800 dark:text-gray-300',
  medical:
    'bg-gradient-to-br from-blue-100 via-blue-50 to-emerald-100 text-blue-600 shadow-sm dark:from-blue-900/40 dark:via-blue-800/60 dark:to-emerald-900/40 dark:text-blue-400',
} as const;

/**
 * InfoCard - Card profissional com gradientes e identidade visual médica
 */
const InfoCard = ({
  icon,
  title,
  value,
  description,
  variant = 'default',
  className = '',
  children,
  trend,
  loading = false,
  hover = true,
}: InfoCardProps) => {
  if (loading) {
    return (
      <div
        className={cn(
          'w-full rounded-xl border p-6 shadow-sm animate-pulse backdrop-blur-sm',
          'bg-gradient-to-br from-gray-100/80 via-gray-200/60 to-gray-300/40 border-gray-200/60',
          'dark:from-gray-800/80 dark:via-gray-700/60 dark:to-gray-600/40 dark:border-gray-700/60',
          className
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 bg-gray-200/80 rounded-xl shadow-sm dark:bg-gray-700/80 animate-pulse" />
          {trend && (
            <div className="h-4 w-12 bg-gray-200/80 rounded dark:bg-gray-700/80 animate-pulse" />
          )}
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 bg-gray-200/80 rounded dark:bg-gray-700/80 animate-pulse" />
          <div className="h-8 w-32 bg-gray-200/80 rounded dark:bg-gray-700/80 animate-pulse" />
          <div className="h-3 w-20 bg-gray-200/80 rounded dark:bg-gray-700/80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full rounded-xl border p-6 shadow-sm transition-all duration-300 backdrop-blur-sm',
        hover &&
          'hover:shadow-lg hover:scale-[1.02] cursor-pointer hover:-translate-y-1',
        'group relative overflow-hidden',
        variantStyles[variant],
        className
      )}
    >
      {/* Subtle overlay for premium glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />

      {/* Animated background shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="relative z-10">
        {/* Header com ícone e trend */}
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300',
                'group-hover:scale-110 group-hover:rotate-3',
                iconVariantStyles[variant]
              )}
            >
              {icon}
            </div>
          )}

          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 backdrop-blur-sm',
                'group-hover:scale-105',
                trend.isPositive
                  ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-700/60'
                  : 'bg-red-100/80 text-red-700 border border-red-200/60 dark:bg-red-900/40 dark:text-red-400 dark:border-red-700/60'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        {/* Conteúdo principal */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-300">
            {title}
          </div>
          <div className="text-3xl font-bold tracking-tight leading-none transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {value}
          </div>
          {description && (
            <div className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-400">
              {description}
            </div>
          )}
        </div>

        {/* Children content */}
        {children && (
          <div className="mt-4 transition-all duration-300 group-hover:translate-x-1">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export { InfoCard };
