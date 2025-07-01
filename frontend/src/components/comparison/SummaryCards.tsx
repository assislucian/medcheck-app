import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertCircle,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileX,
} from 'lucide-react';

interface SummaryCardsProps {
  totalCBHPM: number;
  totalPago: number;
  totalDiferenca: number;
  procedimentosNaoPagos: number;
}

export const SummaryCards = ({
  totalCBHPM,
  totalPago,
  totalDiferenca,
  procedimentosNaoPagos,
}: SummaryCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Valor CBHPM */}
      <Card className="border-0 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/10 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Valor total baseado na tabela CBHPM 2015 para todos os procedimentos
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
              Valor CBHPM
            </p>
            <p className="text-2xl font-bold text-blue-800">
              {formatCurrency(totalCBHPM)}
            </p>
            <p className="text-xs text-blue-600">Valor de referência oficial</p>
          </div>
        </CardContent>
      </Card>

      {/* Valor Pago */}
      <Card className="border-0 bg-gradient-to-br from-emerald-50/60 to-green-50/60 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">
              Valor Pago
            </p>
            <p className="text-2xl font-bold text-emerald-800">
              {formatCurrency(totalPago)}
            </p>
            <p className="text-xs text-emerald-600">Valor efetivamente recebido</p>
          </div>
        </CardContent>
      </Card>

      {/* Diferença */}
      <Card
        className={`border-0 shadow-lg ${
          totalDiferenca < 0
            ? 'bg-gradient-to-br from-red-50/60 to-rose-50/60'
            : 'bg-gradient-to-br from-amber-50/60 to-orange-50/60'
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-xl ${
                totalDiferenca < 0 ? 'bg-red-500/10' : 'bg-amber-500/10'
              }`}
            >
              {totalDiferenca < 0 ? (
                <TrendingDown
                  className={`h-6 w-6 ${
                    totalDiferenca < 0 ? 'text-red-600' : 'text-amber-600'
                  }`}
                />
              ) : (
                <TrendingUp className="h-6 w-6 text-amber-600" />
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Diferença entre o valor CBHPM 2015 e o valor efetivamente pago pelo
                    plano
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2">
            <p
              className={`text-sm font-medium uppercase tracking-wide ${
                totalDiferenca < 0 ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              Diferença
            </p>
            <p
              className={`text-2xl font-bold ${
                totalDiferenca < 0 ? 'text-red-800' : 'text-amber-800'
              }`}
            >
              {totalDiferenca < 0 ? '' : '+'}
              {formatCurrency(totalDiferenca)}
            </p>
            <p
              className={`text-xs ${
                totalDiferenca < 0 ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              {totalDiferenca < 0 ? 'Valor perdido' : 'Valor adicional'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Procedimentos Não Pagos */}
      <Card
        className={`border-0 shadow-lg ${
          procedimentosNaoPagos > 0
            ? 'bg-gradient-to-br from-red-50/60 to-rose-50/60'
            : 'bg-gradient-to-br from-emerald-50/60 to-green-50/60'
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-xl ${
                procedimentosNaoPagos > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'
              }`}
            >
              <FileX
                className={`h-6 w-6 ${
                  procedimentosNaoPagos > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Procedimentos que constam na guia mas não foram pagos pelo plano
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2">
            <p
              className={`text-sm font-medium uppercase tracking-wide ${
                procedimentosNaoPagos > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              Não Pagos
            </p>
            <p
              className={`text-2xl font-bold ${
                procedimentosNaoPagos > 0 ? 'text-red-800' : 'text-emerald-800'
              }`}
            >
              {procedimentosNaoPagos}
            </p>
            <p
              className={`text-xs ${
                procedimentosNaoPagos > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {procedimentosNaoPagos > 0 ? 'Procedimentos glosados' : 'Todos pagos'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
