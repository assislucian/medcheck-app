import { ReactNode } from "react";
import clsx from "clsx";

interface InfoCardProps {
  icon?: ReactNode;
  title: string;
  value?: ReactNode;
  description?: string;
  variant?: "info" | "success" | "warning" | "danger" | "neutral";
  className?: string;
  children?: ReactNode;
}

const variantStyles = {
  info:    "bg-blue-50/40 border-blue-100/30",
  success: "bg-green-50/40 border-green-100/30",
  warning: "bg-amber-50/40 border-amber-200/40",
  danger:  "bg-red-50/40 border-red-100/30",
  neutral: "bg-white/60 border-gray-100/40",
};

export function InfoCard({
  icon,
  title,
  value,
  description,
  variant = "neutral",
  className = "",
  children,
}: InfoCardProps) {
  return (
    <div
      tabIndex={0}
      className={clsx(
        "flex items-center gap-4 rounded-xl border shadow-sm p-4 md:p-5 min-h-[64px] backdrop-blur-sm transition-all duration-150 outline-none",
        "hover:shadow-md hover:-translate-y-0.5 focus:shadow-lg focus:ring-2 focus:ring-blue-200",
        variantStyles[variant],
        className
      )}
      role={variant === "danger" || variant === "warning" ? "alert" : undefined}
    >
      {icon && (
        <div className="flex-shrink-0 flex items-center justify-center rounded-full bg-transparent p-2 text-2xl md:text-3xl">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base md:text-lg truncate">{title}</span>
          {value && (
            <span className="ml-2 text-xl md:text-2xl font-bold tabular-nums">{value}</span>
          )}
        </div>
        {description && (
          <div className="text-sm text-gray-600 mt-0.5 truncate">{description}</div>
        )}
        {children && (
          <div className="mt-2 flex flex-wrap gap-2 items-center">{children}</div>
        )}
      </div>
    </div>
  );
}

export default InfoCard; 