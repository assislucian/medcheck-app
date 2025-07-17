import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  tooltipContent?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

export function StatusCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  tooltipContent,
  variant = 'default',
}: StatusCardProps) {
  const variantStyles = {
    default: {
      card: 'border-0 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 shadow-lg hover:shadow-xl',
      icon: 'bg-blue-500/10 text-blue-600',
      trend: 'text-blue-600',
    },
    success: {
      card: 'border-0 bg-gradient-to-br from-emerald-50/60 to-green-50/60 shadow-lg hover:shadow-xl',
      icon: 'bg-emerald-500/10 text-emerald-600',
      trend: 'text-emerald-600',
    },
    error: {
      card: 'border-0 bg-gradient-to-br from-red-50/60 to-rose-50/60 shadow-lg hover:shadow-xl',
      icon: 'bg-red-500/10 text-red-600',
      trend: 'text-red-600',
    },
    warning: {
      card: 'border-0 bg-gradient-to-br from-medical-50/60 to-brand-50/60 shadow-lg hover:shadow-xl',
      icon: 'bg-medical-500/10 text-medical-600',
      trend: 'text-medical-600',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <Card className={cn(currentVariant.card, 'transition-all duration-300', className)}>
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className={cn('p-4 rounded-2xl', currentVariant.icon)}>
            <Icon className="h-8 w-8" />
          </div>
          {tooltipContent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-5 w-5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h3>

          <div className="text-3xl font-bold text-gray-900">{value}</div>

          {trend && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-semibold px-2 py-1 rounded-full',
                  trend.isPositive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-sm text-gray-500">vs mês anterior</span>
            </div>
          )}

          {description && (
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
