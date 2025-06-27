import React from 'react';
import { AlertCircle, Wifi, RefreshCw, LogIn } from 'lucide-react';
import { Button } from './button';

interface ErrorMessageProps {
  error: string;
  isAuthError?: boolean;
  isNetworkError?: boolean;
  onRetry?: () => void;
  onLogin?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  isAuthError = false,
  isNetworkError = false,
  onRetry,
  onLogin,
  className = '',
}) => {
  const getIcon = () => {
    if (isAuthError) return <LogIn className="h-5 w-5" />;
    if (isNetworkError) return <Wifi className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  const getIconColor = () => {
    if (isAuthError) return 'text-blue-500';
    if (isNetworkError) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBorderColor = () => {
    if (isAuthError) return 'border-blue-200';
    if (isNetworkError) return 'border-orange-200';
    return 'border-red-200';
  };

  const getBackgroundColor = () => {
    if (isAuthError) return 'bg-blue-50';
    if (isNetworkError) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 ${getBorderColor()} ${getBackgroundColor()} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${getIconColor()}`}>{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-800 mb-1">
            {isAuthError
              ? 'Problema de Autenticação'
              : isNetworkError
                ? 'Problema de Conexão'
                : 'Erro'}
          </h3>

          <p className="text-sm text-gray-600 mb-3">{error}</p>

          <div className="flex gap-2">
            {isAuthError && onLogin && (
              <Button
                size="sm"
                onClick={onLogin}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Fazer Login
              </Button>
            )}

            {!isAuthError && onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="border-gray-300"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Tentar Novamente
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
