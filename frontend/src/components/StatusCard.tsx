import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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
  variant = 'default'
}: StatusCardProps) {
  const variantStyles = {
    default: 'border-primary/20 bg-primary/5 hover:border-primary/30',
    success: 'border-success/20 bg-success/5 hover:border-success/30',
    error: 'border-destructive/20 bg-destructive/5 hover:border-destructive/30',
    warning: 'border-warning/20 bg-warning/5 hover:border-warning/30'
  };

  return (
    <div className="rounded-xl bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md transition p-6 flex items-center gap-4">
      <span className={cn(
        "h-10 w-10 flex items-center justify-center rounded-full bg-brand-light text-brand",
        variant === 'success' && 'bg-success/10 text-success',
        variant === 'error' && 'bg-danger/10 text-danger',
        variant === 'warning' && 'bg-warning/10 text-warning',
      )}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {trend && (
          <p className="text-xs flex items-center mt-1">
            <span className={cn(
              "mr-1",
              trend.isPositive ? "text-success" : "text-danger"
            )}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </span>
            em relação ao mês anterior
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {tooltipContent && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
