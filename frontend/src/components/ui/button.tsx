import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md active:from-blue-800 active:to-blue-900 focus:ring-blue-500/30 transform hover:scale-[1.01] active:scale-[0.99]',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:from-red-600 hover:to-red-700 hover:shadow-md active:from-red-700 active:to-red-800 focus:ring-red-500/30 transform hover:scale-[1.01] active:scale-[0.99]',
        outline:
          'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:border-gray-400 hover:shadow-md focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transform hover:scale-[1.01] active:scale-[0.99]',
        secondary:
          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:from-gray-300 active:to-gray-400 focus:ring-gray-500/30 dark:from-gray-700 dark:to-gray-800 dark:text-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 transform hover:scale-[1.01] active:scale-[0.99]',
        ghost:
          'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 focus:ring-gray-500/20 transform hover:scale-[1.01] active:scale-[0.99]',
        link: 'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 focus:ring-blue-500/20 dark:text-blue-400 dark:hover:text-blue-300',
        success:
          'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md active:from-emerald-700 active:to-emerald-800 focus:ring-emerald-500/30 transform hover:scale-[1.01] active:scale-[0.99]',
        warning:
          'bg-gradient-to-r from-health-primary to-health-accent text-white shadow-sm hover:from-health-dark hover:to-health-accent hover:shadow-md active:from-health-dark active:to-health-primary focus:ring-health-primary/30 transform hover:scale-[1.01] active:scale-[0.99]',
        medical:
          'bg-gradient-to-r from-health-primary to-health-accent text-white shadow-sm hover:from-health-dark hover:to-health-accent hover:shadow-md active:from-health-dark active:to-health-accent focus:ring-health-primary/30 transform hover:scale-[1.01] active:scale-[0.99]',
        primary:
          'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md active:from-blue-800 active:to-blue-900 focus:ring-blue-500/30 transform hover:scale-[1.01] active:scale-[0.99]',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-6 text-base font-semibold',
        xl: 'h-14 rounded-lg px-8 text-lg font-semibold',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

// Improved ripple effect for medical interfaces
function useRipple(ref: React.RefObject<HTMLButtonElement>) {
  React.useEffect(() => {
    const button = ref.current;
    if (!button) return;

    const handleClick = (e: MouseEvent) => {
      const ripple = document.createElement('span');
      ripple.className = 'medical-ripple';
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      button.appendChild(ripple);

      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.remove();
        }
      }, 600);
    };

    button.addEventListener('click', handleClick);
    return () => button.removeEventListener('click', handleClick);
  }, [ref]);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const innerRef = React.useRef<HTMLButtonElement>(null);
    useRipple(innerRef);
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={(node: any) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
          innerRef.current = node;
        }}
        className={cn(
          buttonVariants({ variant, size, className }),
          'medical-btn-enhanced',
          loading && 'opacity-70 cursor-wait'
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
// CSS para ripple effect (adicionar em index.css):
// .lovable-ripple {
//   position: absolute;
//   border-radius: 50%;
//   background: rgba(0,0,0,0.08);
//   pointer-events: none;
//   transform: scale(0);
//   animation: lovable-ripple 0.6s linear;
//   z-index: 1;
// }
// @keyframes lovable-ripple {
//   to { transform: scale(2.5); opacity: 0; }
// }
