import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const spacingClasses = {
  sm: 'space-y-6',
  md: 'space-y-8',
  lg: 'space-y-10',
  xl: 'space-y-12',
};

export function PageContainer({
  children,
  className,
  maxWidth = '7xl',
  spacing = 'lg',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        maxWidthClasses[maxWidth],
        spacingClasses[spacing],
        // Padding bottom adequado para evitar footer "colado"
        'pb-8 sm:pb-12 lg:pb-16',
        className
      )}
    >
      {children}
    </div>
  );
}
