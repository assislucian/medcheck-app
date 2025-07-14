/**
 * Componente de Indicador de Status de Pagamento
 * ===============================================
 *
 * Exibe o status de pagamento de uma guia ou procedimento,
 * indicando visualmente se foi pago, parcialmente pago ou não pago.
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface PaymentStatus {
  guia: string;
  total_procedures: number;
  paid_procedures: number;
  payment_rate: number;
  status: 'pago' | 'parcialmente_pago' | 'nao_pago';
  procedures: Array<{
    codigo: string;
    descricao: string;
    papel: string;
    pago: boolean;
    valor_pago: number;
    data_pagamento?: string;
    motivo_nao_pago?: string;
  }>;
}

interface PaymentStatusIndicatorProps {
  guiaNumber: string;
  compact?: boolean;
  showDetails?: boolean;
  onStatusChange?: (status: PaymentStatus) => void;
}

export function PaymentStatusIndicator({
  guiaNumber,
  compact = false,
  showDetails = false,
  onStatusChange,
}: PaymentStatusIndicatorProps) {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPaymentStatus = async () => {
    if (!guiaNumber) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/payment-status/${guiaNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStatus(response.data);
      if (onStatusChange) {
        onStatusChange(response.data);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || 'Erro ao verificar status de pagamento';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, [guiaNumber]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
        {!compact && (
          <span className="text-sm text-muted-foreground">Verificando...</span>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              {!compact && <span className="text-sm text-orange-600">Erro</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{error}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!status) return null;

  const getStatusIcon = () => {
    switch (status.status) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'parcialmente_pago':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'nao_pago':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'pago':
        return 'success';
      case 'parcialmente_pago':
        return 'warning';
      case 'nao_pago':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'pago':
        return 'Pago';
      case 'parcialmente_pago':
        return 'Parcialmente Pago';
      case 'nao_pago':
        return 'Não Pago';
      default:
        return 'Desconhecido';
    }
  };

  const getTooltipContent = () => {
    return (
      <div className="space-y-2">
        <p>
          <strong>Guia:</strong> {status.guia}
        </p>
        <p>
          <strong>Procedimentos:</strong> {status.paid_procedures}/
          {status.total_procedures} pagos
        </p>
        <p>
          <strong>Taxa de pagamento:</strong> {status.payment_rate}%
        </p>
        {status.status !== 'pago' && (
          <p className="text-xs text-muted-foreground">
            Clique em "Detalhes" para ver procedimentos não pagos
          </p>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={getStatusColor() as any}
              className="flex items-center gap-1"
            >
              {getStatusIcon()}
              {status.payment_rate}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{getTooltipContent()}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge variant={getStatusColor() as any}>{getStatusText()}</Badge>
          <span className="text-sm text-muted-foreground">
            {status.paid_procedures}/{status.total_procedures} procedimentos (
            {status.payment_rate}%)
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPaymentStatus}
          className="h-8"
        >
          Atualizar
        </Button>
      </div>

      {showDetails && status.procedures.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Detalhes dos Procedimentos:</h4>
          <div className="space-y-1">
            {status.procedures.map((proc, index) => (
              <div
                key={index}
                className={`p-2 rounded-md text-xs ${
                  proc.pago
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {proc.codigo} - {proc.papel}
                  </span>
                  <div className="flex items-center gap-1">
                    {proc.pago ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-700">
                          R$ {proc.valor_pago.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-red-600" />
                        <span className="text-red-700">Não pago</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="truncate">{proc.descricao}</p>
                {!proc.pago && proc.motivo_nao_pago && (
                  <p className="text-red-600 mt-1">
                    <strong>Motivo:</strong> {proc.motivo_nao_pago}
                  </p>
                )}
                {proc.pago && proc.data_pagamento && (
                  <p className="text-green-600 mt-1">
                    <strong>Pago em:</strong> {proc.data_pagamento}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
