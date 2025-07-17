import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & {
    as?: string;
    icon?: React.ReactNode;
    error?: boolean;
    helperText?: string;
    loading?: boolean;
  }
>(({ className, type, as, icon, error, helperText, loading, ...props }, ref) => {
  const Comp = as || 'input';

  return (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <Comp
          type={type}
          className={cn(
            // Base styles with improved visual hierarchy
            'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',

            // Enhanced focus and interaction states
            'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400',
            'shadow-sm hover:shadow-md focus:shadow-md',

            // Icon spacing
            icon && 'pl-10',

            // Error states
            error
              ? 'border-red-300 bg-red-50 text-red-900 placeholder:text-red-400 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 text-gray-900',

            // Dark mode support
            'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400',
            'dark:focus:border-blue-400 dark:hover:border-gray-500',
            error && 'dark:border-red-600 dark:bg-red-900/20 dark:text-red-100',

            // Loading state
            loading && 'opacity-70 cursor-wait',

            // Custom styles for select elements
            as === 'select' && [
              'cursor-pointer appearance-none bg-no-repeat bg-right',
              "bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http://www.w3.org/2000/svg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2024%2024%27%20stroke%3D%27%236b7280%27%3E%3Cpath%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20d%3D%27M19%209l-7%207-7-7%27%3E%3C/path%3E%3C/svg%3E')]",
              'pr-10',
            ],

            className
          )}
          ref={ref}
          disabled={props.disabled || loading}
          {...props}
        />

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500" />
          </div>
        )}
      </div>

      {helperText && (
        <p
          className={cn(
            'mt-1 text-xs transition-colors duration-200',
            error
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };
