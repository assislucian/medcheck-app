import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  AlertTriangle,
  FileX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface SmartPaymentStatus {
  status:
    | 'pago'
    | 'parcialmente_pago'
    | 'glosado'
    | 'nao_pago'
    | 'nao_encontrado'
    | 'sem_demonstrativo';
  reason: string;
  demonstrativo_info?: {
    approved_value: number;
    presented_value: number;
    glosa: number;
    payment_date: string;
    demonstrativo_id: number;
    is_partial_payment: boolean;
    is_full_glosa: boolean;
    glosa_percentage: number;
  };
  has_demonstrativo: boolean;
}

interface SmartPaymentStatusIndicatorProps {
  smartPaymentStatus: SmartPaymentStatus;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function SmartPaymentStatusIndicator({
  smartPaymentStatus,
  className,
  size = 'md',
  showDetails = false,
}: SmartPaymentStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (smartPaymentStatus.status) {
      case 'pago':
        return {
          variant: 'success' as const,
          icon: CheckCircle,
          label: 'Pago',
          description: smartPaymentStatus.reason,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 border-emerald-200',
        };
      case 'parcialmente_pago':
        return {
          variant: 'warning' as const,
          icon: DollarSign,
          label: 'Parcial',
          description: smartPaymentStatus.reason,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-200',
        };
      case 'glosado':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          label: 'Glosado',
          description: smartPaymentStatus.reason,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
        };
      case 'nao_pago':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          label: 'Pendente',
          description: smartPaymentStatus.reason,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
        };
      case 'nao_encontrado':
        return {
          variant: 'outline' as const,
          icon: FileX,
          label: 'Não Encontrado',
          description: smartPaymentStatus.reason,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
        };
      case 'sem_demonstrativo':
        return {
          variant: 'outline' as const,
          icon: AlertCircle,
          label: 'Sem Demo',
          description: smartPaymentStatus.reason,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: AlertCircle,
          label: 'Desconhecido',
          description: 'Status não identificado',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTooltipContent = () => {
    const { demonstrativo_info } = smartPaymentStatus;

    return (
      <div className="space-y-2 max-w-sm">
        <div>
          <p className="font-semibold">{config.label}</p>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>

        {demonstrativo_info && (
          <div className="space-y-1 text-sm border-t pt-2">
            <div className="flex justify-between">
              <span>Apresentado:</span>
              <span className="font-mono">
                {formatCurrency(demonstrativo_info.presented_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Liberado:</span>
              <span className="font-mono text-green-600">
                {formatCurrency(demonstrativo_info.approved_value)}
              </span>
            </div>
            {demonstrativo_info.glosa > 0 && (
              <div className="flex justify-between">
                <span>Glosa:</span>
                <span className="font-mono text-red-600">
                  {formatCurrency(demonstrativo_info.glosa)} (
                  {demonstrativo_info.glosa_percentage.toFixed(1)}%)
                </span>
              </div>
            )}
            {demonstrativo_info.payment_date && (
              <div className="flex justify-between">
                <span>Período:</span>
                <span>{demonstrativo_info.payment_date}</span>
              </div>
            )}
          </div>
        )}

        {!smartPaymentStatus.has_demonstrativo && (
          <div className="text-xs text-amber-600 border-t pt-2">
            💡 Faça upload dos demonstrativos para análise completa
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={config.variant}
            className={cn(
              'flex items-center gap-0.5 sm:gap-1 whitespace-nowrap cursor-help max-w-full',
              'text-xs px-1.5 py-0.5 sm:text-sm sm:px-2 sm:py-1',
              size === 'xs' && 'text-xs px-1 py-0.5',
              size === 'lg' && 'text-sm sm:text-base px-2 py-1 sm:px-3 sm:py-1.5',
              className
            )}
          >
            <Icon className={cn(
              'h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0',
              size === 'xs' && 'h-2 w-2',
              size === 'lg' && 'h-4 w-4'
            )} />
            <span className="truncate">{config.label}</span>
            {smartPaymentStatus.demonstrativo_info?.approved_value > 0 &&
              size !== 'xs' && size !== 'sm' && (
                <span className="ml-0.5 sm:ml-1 font-mono text-xs hidden sm:inline">
                  {formatCurrency(smartPaymentStatus.demonstrativo_info.approved_value)}
                </span>
              )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">{getTooltipContent()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Componente para compatibilidade com o código existente
interface PaymentStatus {
  status: 'paid' | 'unpaid' | 'pending' | 'unknown';
  amount?: number;
  date?: string;
  reference?: string;
}

interface PaymentStatusIndicatorProps {
  paymentStatus?: PaymentStatus;
  smartPaymentStatus?: SmartPaymentStatus;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export default function PaymentStatusIndicator({
  paymentStatus,
  smartPaymentStatus,
  className,
  size = 'md',
  showDetails = false,
}: PaymentStatusIndicatorProps) {
  // Priorizar o novo status inteligente se disponível
  if (smartPaymentStatus) {
    return (
      <SmartPaymentStatusIndicator
        smartPaymentStatus={smartPaymentStatus}
        className={className}
        size={size}
        showDetails={showDetails}
      />
    );
  }

  // Fallback para o componente antigo se apenas paymentStatus for fornecido
  if (!paymentStatus) return null;

  const getStatusConfig = () => {
    switch (paymentStatus.status) {
      case 'paid':
        return {
          variant: 'success' as const,
          icon: CheckCircle,
          label: 'Pago',
          description: 'Procedimento foi pago pelo convênio',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 border-emerald-200',
        };
      case 'unpaid':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          label: 'Não Pago',
          description: 'Procedimento ainda não foi pago',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
        };
      case 'pending':
        return {
          variant: 'warning' as const,
          icon: Clock,
          label: 'Pendente',
          description: 'Aguardando processamento do pagamento',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-200',
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: AlertCircle,
          label: 'Desconhecido',
          description: 'Status do pagamento não identificado',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'flex items-center gap-1 whitespace-nowrap',
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
      {paymentStatus.amount && size !== 'sm' && (
        <span className="ml-1 font-mono">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(paymentStatus.amount)}
        </span>
      )}
    </Badge>
  );
}
