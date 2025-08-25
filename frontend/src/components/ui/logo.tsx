import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
  variant?: 'default' | 'sidebar' | 'header';
  collapsed?: boolean;
}

const sizeClasses = {
  xs: {
    logo: 'h-6 w-6',
    text: 'text-sm',
  },
  sm: {
    logo: 'h-8 w-8',
    text: 'text-lg',
  },
  md: {
    logo: 'h-10 w-10',
    text: 'text-xl',
  },
  lg: {
    logo: 'h-12 w-12',
    text: 'text-2xl',
  },
  xl: {
    logo: 'h-16 w-16',
    text: 'text-3xl md:text-4xl',
  },
};

const variantClasses = {
  default: {
    text: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent',
  },
  sidebar: {
    text: 'bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent',
  },
  header: {
    text: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent',
  },
};

export function Logo({ 
  size = 'md', 
  showText = true, 
  className,
  textClassName,
  variant = 'default',
  collapsed = false 
}: LogoProps) {
  const sizeConfig = sizeClasses[size];
  const variantConfig = variantClasses[variant];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo Image */}
      <div className="flex-shrink-0">
        <img
          src="/logo/Medcheck.png"
          alt="MedCheck Logo"
          className={cn(
            sizeConfig.logo,
            'object-contain'
          )}
        />
      </div>

      {/* Text */}
      {showText && !collapsed && (
        <span 
          className={cn(
            sizeConfig.text,
            'font-bold',
            variantConfig.text,
            textClassName
          )}
        >
          MedCheck
        </span>
      )}
    </div>
  );
}

export default Logo;

