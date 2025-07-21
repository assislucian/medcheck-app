import React from 'react';
import { AuthenticatedLayout } from './AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface StandardPageLayoutProps {
  title: string;
  description?: string;
  category?: string;
  categoryIcon?: React.ReactNode;
  categoryColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const categoryStyles = {
  blue: 'from-blue-50 to-cyan-50 border-blue-200/60 text-blue-700',
  green: 'from-green-50 to-emerald-50 border-green-200/60 text-green-700',
  purple: 'from-purple-50 to-violet-50 border-purple-200/60 text-purple-700',
  orange: 'from-orange-50 to-amber-50 border-orange-200/60 text-orange-700',
  red: 'from-red-50 to-rose-50 border-red-200/60 text-red-700',
  gray: 'from-gray-50 to-slate-50 border-gray-200/60 text-gray-700',
};

export const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  title,
  description,
  category,
  categoryIcon,
  categoryColor = 'blue',
  children,
  actions,
  className,
}) => {
  return (
    <AuthenticatedLayout>
      <div className={cn("min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-green-50/20", className)}>
        {/* Header Premium com Backdrop Blur */}
        <div className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-gray-200/60">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                {/* Category Badge */}
                {category && (
                  <div className={cn(
                    "inline-flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-sm",
                    categoryStyles[categoryColor]
                  )}>
                    {categoryIcon && <span className="h-5 w-5">{categoryIcon}</span>}
                    <span className="text-sm font-semibold uppercase tracking-wide">
                      {category}
                    </span>
                  </div>
                )}
                
                {/* Title and Description */}
                <div className="space-y-2">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              {actions && (
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 py-8">
          {children}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}; 