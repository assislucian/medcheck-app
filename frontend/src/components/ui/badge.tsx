import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 badge-professional',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-blue-600 text-white shadow-sm hover:bg-blue-700',
        secondary:
          'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
        destructive:
          'border-transparent bg-red-500 text-white shadow-sm hover:bg-red-600',
        outline:
          'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700',
        success:
          'border-transparent bg-emerald-500 text-white shadow-sm hover:bg-emerald-600',
        warning:
          'border-transparent bg-amber-500 text-white shadow-sm hover:bg-amber-600',
        info: 'border-transparent bg-blue-500 text-white shadow-sm hover:bg-blue-600',
        medical:
          'border-transparent bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-sm hover:from-blue-600 hover:to-emerald-600',
        pending:
          'border-transparent bg-amber-100 text-amber-800 shadow-sm hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50',
        approved:
          'border-transparent bg-emerald-100 text-emerald-800 shadow-sm hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50',
        rejected:
          'border-transparent bg-red-100 text-red-800 shadow-sm hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50',
        neutral:
          'border-transparent bg-gray-100 text-gray-600 shadow-sm hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
        participacao:
          'border-transparent bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm hover:from-emerald-100 hover:to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 dark:text-emerald-300 dark:border-emerald-700/60',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs rounded-md',
        lg: 'px-3 py-1 text-sm rounded-lg',
        xl: 'px-4 py-1.5 text-base rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)} 
        {...props} 
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
