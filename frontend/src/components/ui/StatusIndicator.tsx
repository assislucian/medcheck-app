import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Activity
} from 'lucide-react';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'pending' | 'processing' | 'active' | 'inactive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dot' | 'badge' | 'pill' | 'glow' | 'minimal';
  label?: string;
  sublabel?: string;
  animated?: boolean;
  pulse?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  value?: string | number;
  className?: string;
  onClick?: () => void;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    period?: string;
  };
  status?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed' | 'premium';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  variant = 'badge',
  label,
  sublabel,
  animated = true,
  pulse = false,
  trend,
  value,
  className,
  onClick,
}) => {
  const getStatusConfig = () => {
    const configs = {
      success: {
        color: 'emerald',
        icon: CheckCircle,
        bg: 'from-emerald-500/20 to-green-500/20',
        border: 'border-emerald-300/40',
        text: 'text-emerald-800',
        glow: 'shadow-emerald-500/30',
      },
      warning: {
        color: 'amber',
        icon: AlertCircle,
        bg: 'from-amber-500/20 to-yellow-500/20',
        border: 'border-amber-300/40',
        text: 'text-amber-800',
        glow: 'shadow-amber-500/30',
      },
      error: {
        color: 'red',
        icon: XCircle,
        bg: 'from-red-500/20 to-rose-500/20',
        border: 'border-red-300/40',
        text: 'text-red-800',
        glow: 'shadow-red-500/30',
      },
      pending: {
        color: 'blue',
        icon: Clock,
        bg: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-300/40',
        text: 'text-blue-800',
        glow: 'shadow-blue-500/30',
      },
      processing: {
        color: 'purple',
        icon: Zap,
        bg: 'from-purple-500/20 to-indigo-500/20',
        border: 'border-purple-300/40',
        text: 'text-purple-800',
        glow: 'shadow-purple-500/30',
      },
      active: {
        color: 'medical',
        icon: Activity,
        bg: 'from-medical-500/20 to-mint-500/20',
        border: 'border-medical-300/40',
        text: 'text-medical-800',
        glow: 'shadow-medical-500/30',
      },
      inactive: {
        color: 'gray',
        icon: Minus,
        bg: 'from-gray-500/20 to-slate-500/20',
        border: 'border-gray-300/40',
        text: 'text-gray-800',
        glow: 'shadow-gray-500/30',
      },
    };
    return configs[status];
  };

  const getSizeConfig = () => {
    const configs = {
      sm: {
        container: 'px-2 py-1 text-xs',
        icon: 'h-3 w-3',
        dot: 'h-2 w-2',
      },
      md: {
        container: 'px-3 py-1.5 text-sm',
        icon: 'h-4 w-4',
        dot: 'h-3 w-3',
      },
      lg: {
        container: 'px-4 py-2 text-base',
        icon: 'h-5 w-5',
        dot: 'h-4 w-4',
      },
      xl: {
        container: 'px-6 py-3 text-lg',
        icon: 'h-6 w-6',
        dot: 'h-5 w-5',
      },
    };
    return configs[size];
  };

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeConfig();
  const Icon = statusConfig.icon;

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();

  const renderDot = () => (
    <motion.div
      className={cn(
        'rounded-full border-2',
        statusConfig.border,
        `bg-gradient-to-br ${statusConfig.bg}`,
        sizeConfig.dot,
        pulse && 'animate-pulse',
        variant === 'glow' && `shadow-lg ${statusConfig.glow}`,
        className
      )}
      animate={animated ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );

  const renderBadge = () => (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border backdrop-blur-sm',
        statusConfig.border,
        `bg-gradient-to-r ${statusConfig.bg}`,
        statusConfig.text,
        sizeConfig.container,
        'font-medium shadow-sm',
        variant === 'glow' && `shadow-lg ${statusConfig.glow}`,
        onClick && 'cursor-pointer hover:scale-105 transition-transform',
        className
      )}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      <Icon className={cn(sizeConfig.icon, pulse && 'animate-pulse')} />
      {label && <span>{label}</span>}
      {value && <span className="font-semibold">{value}</span>}
      {trend && (
        <TrendIcon 
          className={cn(
            sizeConfig.icon,
            trend === 'up' ? 'text-emerald-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          )} 
        />
      )}
    </motion.div>
  );

  const renderPill = () => (
    <motion.div
      className={cn(
        'inline-flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-sm',
        statusConfig.border,
        `bg-gradient-to-r ${statusConfig.bg}`,
        statusConfig.text,
        'shadow-sm',
        variant === 'glow' && `shadow-lg ${statusConfig.glow}`,
        onClick && 'cursor-pointer hover:scale-105 transition-transform',
        className
      )}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      <Icon className={cn(sizeConfig.icon, pulse && 'animate-pulse')} />
      <div className="flex flex-col">
        {label && (
          <span className="font-semibold text-sm leading-tight">{label}</span>
        )}
        {sublabel && (
          <span className="text-xs opacity-80 leading-tight">{sublabel}</span>
        )}
      </div>
      {value && (
        <span className="font-bold text-lg ml-auto">{value}</span>
      )}
    </motion.div>
  );

  const renderMinimal = () => (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full',
          `bg-${statusConfig.color}-500`,
          sizeConfig.dot,
          pulse && 'animate-pulse'
        )}
      />
      {label && (
        <span className={cn('text-sm font-medium', statusConfig.text)}>
          {label}
        </span>
      )}
    </div>
  );

  switch (variant) {
    case 'dot':
      return renderDot();
    case 'pill':
      return renderPill();
    case 'minimal':
      return renderMinimal();
    case 'glow':
    case 'badge':
    default:
      return renderBadge();
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  status = 'neutral',
  icon: Icon,
  loading = false,
  variant = 'default',
  className,
}) => {
  if (loading) {
    return (
      <div className={cn(
        'medical-metric-card p-6 space-y-4',
        className
      )}>
        <div className="medical-skeleton h-4 w-24 rounded" />
        <div className="medical-skeleton h-8 w-32 rounded" />
        <div className="medical-skeleton h-3 w-20 rounded" />
      </div>
    );
  }

  const getStatusColor = () => {
    switch (status) {
      case 'positive':
        return 'text-emerald-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-medical-600';
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const variantClasses = {
    default: 'medical-metric-card',
    compact: 'medical-metric-card p-4',
    detailed: 'medical-metric-card medical-card-glow p-8',
    premium: 'medical-metric-card medical-card-glow p-6 border-2 border-medical-200/40'
  };

  return (
    <motion.div
      className={cn(variantClasses[variant], className)}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-medical-100 to-brand-100 border border-medical-200/40">
              <Icon className="h-5 w-5 text-medical-700" />
            </div>
          )}
          <h3 className="medical-label text-medical-600/80">{title}</h3>
        </div>
        {change && getChangeIcon()}
      </div>

      <div className="space-y-2">
        <div className={cn('medical-value-large', getStatusColor())}>
          {value}
        </div>
        
        {change && (
          <div className="flex items-center gap-2 text-sm">
            <span className={cn(
              'font-semibold',
              change.trend === 'up' ? 'text-emerald-600' : 
              change.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            )}>
              {change.trend === 'up' && '+'}
              {change.value}%
            </span>
            {change.period && (
              <span className="text-gray-500">vs {change.period}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatusIndicator; 