import { ReactNode } from "react";
import clsx from "clsx";

interface InfoCardProps {
  icon?: ReactNode;
  title: string;
  value?: ReactNode;
  description?: string;
  variant?: "info" | "success" | "warning" | "danger" | "neutral";
  elevation?: "flat" | "raised" | "elevated";
  className?: string;
  children?: ReactNode;
}

const variantStyles = {
  info:    "bg-blue-50/40 border-blue-100/30 text-blue-900 dark:bg-blue-900/30 dark:border-blue-800/40 dark:text-blue-100",
  success: "bg-green-50/40 border-green-100/30 text-green-900 dark:bg-green-900/30 dark:border-green-800/40 dark:text-green-100",
  warning: "bg-amber-50/40 border-amber-200/40 text-amber-900 dark:bg-amber-900/30 dark:border-amber-800/40 dark:text-amber-100",
  danger:  "bg-red-50/40 border-red-100/30 text-red-900 dark:bg-red-900/30 dark:border-red-800/40 dark:text-red-100",
  neutral: "bg-white/60 border-gray-100/40 text-gray-900 dark:bg-zinc-900/60 dark:border-zinc-800/40 dark:text-gray-100",
};

const elevationStyles = {
  flat: "shadow-none border",
  raised: "shadow-sm border",
  elevated: "shadow-lg border",
};

/**
 * InfoCard - Card de informação com ícone, título, valor, descrição e children customizáveis.
 * @param {InfoCardProps} props
 */
export function InfoCard({
  icon,
  title,
  value,
  description,
  variant = "neutral",
  elevation = "raised",
  className = "",
  children,
}: InfoCardProps) {
  return (
    <div
      tabIndex={0}
      className={clsx(
        "rounded-2xl p-4 flex flex-col gap-1 min-w-0 transition-all duration-150 outline-none",
        variantStyles[variant],
        elevationStyles[elevation],
        "hover:shadow-lg hover:scale-[1.025] focus:shadow-lg focus:scale-[1.025]",
        "hover:bg-opacity-80 focus:bg-opacity-90",
        "focus-visible:ring-2 focus-visible:ring-brand/60",
        "cursor-pointer",
        className
      )}
      aria-label={title}
      role={variant === "danger" || variant === "warning" ? "alert" : undefined}
    >
      <div className="flex items-center gap-3 mb-1">
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="font-semibold text-base md:text-lg truncate flex-1">{title}</span>
      </div>
      {value && <div className="text-3xl md:text-4xl font-extrabold text-ink mb-1 truncate">{value}</div>}
      {description && <div className="text-sm md:text-base text-muted-foreground mb-1 truncate">{description}</div>}
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}

export default InfoCard; 