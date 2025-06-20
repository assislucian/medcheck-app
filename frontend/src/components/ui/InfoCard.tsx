import { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { InfoCardProps } from "../../types/medical";

interface InfoCardProps {
  icon?: ReactNode;
  title: ReactNode;
  value?: ReactNode;
  description?: ReactNode;
  variant?: "info" | "success" | "warning" | "danger" | "neutral" | "default";
  elevation?: "flat" | "raised" | "elevated";
  className?: string;
  children?: ReactNode;
  badge?: string;
}

const variantStyles = {
  default: 'bg-card text-card-foreground',
  success: 'bg-green-50/50 text-green-900 dark:bg-green-950/50 dark:text-green-100',
  warning: 'bg-yellow-50/50 text-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-100',
  info: 'bg-blue-50/50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100'
};

const elevationStyles = {
  flat: "shadow-none border",
  raised: "shadow border border-surface-3",
  elevated: "shadow-lg border border-surface-3",
};

/**
 * InfoCard - Card premium com glassmorphism, gradiente, shadow, animação e badge de conquista.
 * @param {InfoCardProps} props
 */
const InfoCard = ({
  icon,
  title,
  value,
  description,
  variant = 'default',
  elevation = "elevated",
  className = "",
  children,
  badge,
}: InfoCardProps) => {
  return (
    <div className={cn(
      "w-full rounded-xl border p-4 shadow-sm transition-all hover:shadow-md",
      variantStyles[variant],
      elevationStyles[elevation],
      className
    )}>
      <div className="flex items-center justify-between">
        <div className={cn(
          "rounded-lg p-2",
          variant === 'success' && "bg-green-100/50 text-green-600",
          variant === 'warning' && "bg-yellow-100/50 text-yellow-600",
          variant === 'info' && "bg-blue-100/50 text-blue-600",
          variant === 'default' && "bg-muted text-muted-foreground"
        )}>
          {icon}
        </div>
        {badge && (
          <span className={cn(
            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
            variant === 'success' && "bg-green-100/50 text-green-700",
            variant === 'warning' && "bg-yellow-100/50 text-yellow-700",
            variant === 'info' && "bg-blue-100/50 text-blue-700",
            variant === 'default' && "bg-muted text-muted-foreground"
          )}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      {children && <div className="mt-1 [&_button]:text-base">{children}</div>}
    </div>
  );
};

export default InfoCard; 