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
    | 'primary'
    | 'professional';
  className?: string;
  children?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  hover?: boolean;
  size?: 'sm' | 'default';
}

const variantStyles = {
  default:
    'bg-gradient-to-br from-white via-gray-50/80 to-gray-100/50 border-gray-200 text-gray-900 hover:from-gray-50 hover:via-gray-100/80 hover:to-gray-200/50 dark:from-gray-800/95 dark:via-gray-700/90 dark:to-gray-800/95 dark:border-gray-600/60 dark:text-gray-100',
  success:
    'bg-gradient-to-br from-emerald-50/90 via-emerald-100/60 to-emerald-200/40 border-emerald-200/60 text-emerald-900 hover:from-emerald-100/90 hover:via-emerald-200/60 hover:to-emerald-300/40 dark:from-emerald-900/40 dark:via-emerald-800/50 dark:to-emerald-900/40 dark:border-emerald-600/60 dark:text-emerald-100',
  warning:
    'bg-gradient-to-br from-amber-50/90 via-amber-100/60 to-amber-200/40 border-amber-200/60 text-amber-900 hover:from-amber-100/90 hover:via-amber-200/60 hover:to-amber-300/40 dark:from-amber-900/40 dark:via-amber-800/50 dark:to-amber-900/40 dark:border-amber-600/60 dark:text-amber-100',
  danger:
    'bg-gradient-to-br from-red-50/90 via-red-100/60 to-red-200/40 border-red-200/60 text-red-900 hover:from-red-100/90 hover:via-red-200/60 hover:to-red-300/40 dark:from-red-900/40 dark:via-red-800/50 dark:to-red-900/40 dark:border-red-600/60 dark:text-red-100',
  info: 'bg-gradient-to-br from-blue-50/90 via-blue-100/60 to-blue-200/40 border-blue-200/60 text-blue-900 hover:from-blue-100/90 hover:via-blue-200/60 hover:to-blue-300/40 dark:from-blue-900/40 dark:via-blue-800/50 dark:to-blue-900/40 dark:border-blue-600/60 dark:text-blue-100',
  primary:
    'bg-gradient-to-br from-blue-50/90 via-blue-100/60 to-blue-200/40 border-blue-200/60 text-blue-900 hover:from-blue-100/90 hover:via-blue-200/60 hover:to-blue-300/40 dark:from-blue-900/40 dark:via-blue-800/50 dark:to-blue-900/40 dark:border-blue-600/60 dark:text-blue-100',
  neutral:
    'bg-gradient-to-br from-gray-50/90 via-gray-100/60 to-gray-200/40 border-gray-200/60 text-gray-900 hover:from-gray-100/90 hover:via-gray-200/60 hover:to-gray-300/40 dark:from-gray-900/40 dark:via-gray-800/50 dark:to-gray-900/40 dark:border-gray-600/60 dark:text-gray-100',
  medical:
    'bg-gradient-to-br from-blue-50/80 via-white/90 to-emerald-50/60 border-blue-200/50 text-gray-900 hover:from-blue-100/80 hover:via-blue-50/90 hover:to-emerald-100/60 dark:from-blue-900/30 dark:via-gray-800/95 dark:to-emerald-900/30 dark:border-blue-600/50 dark:text-gray-100',
  professional:
    'bg-gradient-to-br from-slate-50 via-white to-slate-100/50 border-slate-200 text-slate-900 hover:from-slate-100 hover:via-slate-50 hover:to-slate-200/50 shadow-sm dark:from-slate-800/95 dark:via-slate-700/90 dark:to-slate-800/95 dark:border-slate-600/60 dark:text-slate-100',
} as const;

const iconVariantStyles = {
  default:
    'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 shadow-sm dark:from-gray-600/80 dark:to-gray-700/80 dark:text-gray-200',
  success:
    'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 shadow-sm dark:from-emerald-800/60 dark:to-emerald-700/80 dark:text-emerald-300',
  warning:
    'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 shadow-sm dark:from-amber-800/60 dark:to-amber-700/80 dark:text-amber-300',
  danger:
    'bg-gradient-to-br from-red-100 to-red-200 text-red-600 shadow-sm dark:from-red-800/60 dark:to-red-700/80 dark:text-red-300',
  info: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 shadow-sm dark:from-blue-800/60 dark:to-blue-700/80 dark:text-blue-300',
  primary:
    'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 shadow-sm dark:from-blue-800/60 dark:to-blue-700/80 dark:text-blue-300',
  neutral:
    'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 shadow-sm dark:from-gray-600/80 dark:to-gray-700/80 dark:text-gray-200',
  medical:
    'bg-gradient-to-br from-blue-100 via-blue-50 to-emerald-100 text-blue-600 shadow-sm dark:from-blue-800/60 dark:via-blue-700/80 dark:to-emerald-800/60 dark:text-blue-300',
  professional:
    'bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-md dark:from-slate-500/80 dark:to-slate-600/80 dark:text-slate-100',
} as const;

/**
 * InfoCard - Card profissional com gradientes e identidade visual médica
 */
export const InfoCard = ({
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
  size = 'default',
}: InfoCardProps) => {
  const isSmall = size === 'sm';
  
  if (loading) {
    return (
      <div
        className={cn(
          'w-full rounded-xl border shadow-sm animate-pulse backdrop-blur-sm',
          isSmall ? 'p-4' : 'p-8',
          'bg-gradient-to-br from-gray-100/80 via-gray-200/60 to-gray-300/40 border-gray-200/60',
          'dark:from-gray-800/95 dark:via-gray-700/90 dark:to-gray-800/95 dark:border-gray-600/60',
          className
        )}
      >
        <div className={cn("flex items-start justify-between", isSmall ? "mb-3" : "mb-6")}>
          <div className={cn("bg-gray-200/80 rounded-xl shadow-sm dark:bg-gray-600/60 animate-pulse", isSmall ? "h-8 w-8" : "h-12 w-12")} />
          {trend && (
            <div className={cn("bg-gray-200/80 rounded dark:bg-gray-600/60 animate-pulse", isSmall ? "h-3 w-8" : "h-4 w-12")} />
          )}
        </div>
        <div className={cn("space-y-", isSmall ? "2" : "4")}>
          <div className={cn("bg-gray-200/80 rounded dark:bg-gray-600/60 animate-pulse", isSmall ? "h-3 w-20" : "h-4 w-24")} />
          <div className={cn("bg-gray-200/80 rounded dark:bg-gray-600/60 animate-pulse", isSmall ? "h-6 w-24" : "h-8 w-32")} />
          <div className={cn("bg-gray-200/80 rounded dark:bg-gray-600/60 animate-pulse", isSmall ? "h-2 w-16" : "h-3 w-20")} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full rounded-xl border shadow-sm transition-all duration-300 backdrop-blur-sm',
        isSmall ? 'p-3' : 'p-4 sm:p-6 lg:p-8',
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
        <div className={cn("flex items-start justify-between", isSmall ? "mb-3" : "mb-4 sm:mb-6")}>
          {icon && (
            <div
              className={cn(
                'flex items-center justify-center rounded-xl transition-all duration-300',
                isSmall ? 'h-8 w-8' : 'h-10 w-10 sm:h-12 sm:w-12',
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
                'flex items-center gap-1 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm',
                isSmall ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs',
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

        {/* Conteúdo principal com espaçamento melhorado */}
        <div className={cn("space-y-", isSmall ? "1 sm:space-y-2" : "2 sm:space-y-3")}>
          <div className={cn("font-semibold text-gray-600 dark:text-gray-400 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-300", isSmall ? "text-xs" : "text-xs sm:text-sm")}>
            {title}
          </div>
          <div className={cn("font-bold tracking-tight leading-none transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400", isSmall ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl xl:text-4xl")}>
            {value}
          </div>
          {description && (
            <div className={cn("text-gray-500 dark:text-gray-500 transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-400 leading-relaxed", isSmall ? "text-xs" : "text-xs sm:text-sm")}>
              {description}
            </div>
          )}
        </div>

        {/* Children content */}
        {children && (
          <div className={cn("transition-all duration-300 group-hover:translate-x-1", isSmall ? "mt-3" : "mt-6")}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
