import React from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline';
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: 'default' | 'compact';
  priority?: 'high' | 'medium' | 'low';
}

export function FeatureCard({
  title,
  description,
  icon,
  badge,
  badgeVariant = 'outline',
  href,
  onClick,
  className = '',
  size = 'default',
  priority = 'medium'
}: FeatureCardProps) {
  
  const getColorClasses = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'from-blue-50 via-indigo-50 to-blue-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 group-hover:from-blue-100 group-hover:via-indigo-100 group-hover:to-blue-200 dark:group-hover:from-slate-700 dark:group-hover:via-slate-600 dark:group-hover:to-slate-700',
          accent: 'from-blue-500 to-indigo-600',
          iconBg: 'from-blue-100 to-indigo-100 dark:from-slate-600 dark:to-slate-600',
          iconColor: 'text-blue-700 dark:text-blue-400',
          titleColor: 'text-blue-800 dark:text-blue-300',
          descColor: 'text-blue-600 dark:text-blue-400',
          actionColor: 'text-blue-700 dark:text-blue-400',
          badgeColor: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
        };
      case 'medium':
        return {
          bg: 'from-emerald-50 via-green-50 to-emerald-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 group-hover:from-emerald-100 group-hover:via-green-100 group-hover:to-emerald-200 dark:group-hover:from-slate-700 dark:group-hover:via-slate-600 dark:group-hover:to-slate-700',
          accent: 'from-emerald-500 to-green-600',
          iconBg: 'from-emerald-100 to-green-100 dark:from-slate-600 dark:to-slate-600',
          iconColor: 'text-emerald-700 dark:text-emerald-400',
          titleColor: 'text-emerald-800 dark:text-emerald-300',
          descColor: 'text-emerald-600 dark:text-emerald-400',
          actionColor: 'text-emerald-700 dark:text-emerald-400',
          badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700'
        };
      case 'low':
        return {
          bg: 'from-gray-50 via-slate-50 to-gray-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 group-hover:from-gray-100 group-hover:via-slate-100 group-hover:to-gray-200 dark:group-hover:from-slate-700 dark:group-hover:via-slate-600 dark:group-hover:to-slate-700',
          accent: 'from-gray-400 to-slate-500',
          iconBg: 'from-gray-100 to-slate-100 dark:from-slate-600 dark:to-slate-600',
          iconColor: 'text-gray-700 dark:text-slate-300',
          titleColor: 'text-gray-800 dark:text-slate-200',
          descColor: 'text-gray-600 dark:text-slate-400',
          actionColor: 'text-gray-700 dark:text-slate-300',
          badgeColor: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
        };
      default:
        return {
          bg: 'from-gray-50 via-slate-50 to-gray-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 group-hover:from-gray-100 group-hover:via-slate-100 group-hover:to-gray-200 dark:group-hover:from-slate-700 dark:group-hover:via-slate-600 dark:group-hover:to-slate-700',
          accent: 'from-gray-400 to-slate-500',
          iconBg: 'from-gray-100 to-slate-100 dark:from-slate-600 dark:to-slate-600',
          iconColor: 'text-gray-700 dark:text-slate-300',
          titleColor: 'text-gray-800 dark:text-slate-200',
          descColor: 'text-gray-600 dark:text-slate-400',
          actionColor: 'text-gray-700 dark:text-slate-300',
          badgeColor: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
        };
    }
  };

  const colors = getColorClasses(priority);
  const isCompact = size === 'compact';

  const CardComponent = (
    <Card className={`relative overflow-hidden border-0 shadow-md hover:shadow-lg dark:shadow-slate-900/50 transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} transition-all duration-300`}></div>
      {priority === 'high' && (
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.accent}`}></div>
      )}
      <CardContent className={`relative ${isCompact ? 'p-4' : 'p-6'}`}>
        <div className={`space-y-${isCompact ? '3' : '4'}`}>
          <div className="flex items-center justify-between">
            <div className={`${isCompact ? 'p-2' : 'p-3'} rounded-lg bg-gradient-to-br ${colors.iconBg} group-hover:scale-110 transition-transform duration-300`}>
              <div className={`${isCompact ? 'h-4 w-4' : 'h-5 w-5'} ${colors.iconColor}`}>
                {icon}
              </div>
            </div>
            {badge && (
              <Badge variant={badgeVariant} className={colors.badgeColor}>
                {badge}
              </Badge>
            )}
          </div>
          <div className={`space-y-${isCompact ? '1' : '2'}`}>
            <h3 className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold ${colors.titleColor}`}>
              {title}
            </h3>
            <p className={`${isCompact ? 'text-xs' : 'text-sm'} ${colors.descColor} leading-relaxed`}>
              {description}
            </p>
          </div>
          {(href || onClick) && (
            <div className={`flex items-center gap-2 ${colors.actionColor} font-medium group-hover:gap-3 transition-all duration-300 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              <span>Acessar</span>
              <ChevronRight className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link to={href}>
        {CardComponent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick}>
        {CardComponent}
      </div>
    );
  }

  return CardComponent;
} 