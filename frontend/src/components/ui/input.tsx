import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { as?: string }>(
  ({ className, type, as, ...props }, ref) => {
    const Comp = as || "input";
    return (
      <Comp
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors duration-200",
          as === "select"
            ? "dark:bg-card-dark bg-card text-body dark:text-body-dark dark:border-border-dark border-border placeholder:text-muted-foreground dark:placeholder:text-muted-foreground"
            : "bg-[#fff] text-[#18181b] placeholder:text-[#71717a] border-[#e5e7eb] dark:bg-[#18181b] dark:text-[#f4f4f5] dark:placeholder:text-[#a1a1aa] dark:border-[#232326]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input }
