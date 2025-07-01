import React from 'react';
import { AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface DashboardAlertProps {
  type: 'info' | 'warning' | 'success' | 'destructive';
  title: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
}

export function DashboardAlert({
  type,
  title,
  message,
  actionLabel,
  actionLink,
}: DashboardAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'destructive':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'info':
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
        };
      case 'warning':
        return {
          border: 'border-orange-200',
          bg: 'bg-orange-50',
          icon: 'text-orange-600',
          title: 'text-orange-800',
          message: 'text-orange-700',
        };
      case 'success':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
        };
      case 'destructive':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
        };
      default:
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
        };
    }
  };

  const colors = getColors();

  return (
    <Card className={`${colors.border} ${colors.bg} border-l-4`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`${colors.icon} flex-shrink-0`}>{getIcon()}</div>
          <div className="flex-1 space-y-2">
            <h4 className={`font-semibold ${colors.title}`}>{title}</h4>
            <p className={`text-sm ${colors.message}`}>{message}</p>
            {actionLabel && actionLink && (
              <div className="pt-2">
                <Button
                  asChild
                  variant={type === 'destructive' ? 'destructive' : 'default'}
                  size="sm"
                >
                  <Link to={actionLink}>{actionLabel}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
