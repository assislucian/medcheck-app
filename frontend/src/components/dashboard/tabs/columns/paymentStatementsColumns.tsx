import { formatCurrency } from '@/utils/formatters';
import { PaymentStatement } from '@/types/medical';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ColumnParams {
  value: any;
  row: PaymentStatement;
}

export const paymentStatementsColumns = [
  { field: 'codigo', headerName: 'Código', width: 120 },
  { field: 'descricao', headerName: 'Descrição', flex: 1 },
  {
    field: 'funcao',
    headerName: 'Função',
    width: 120,
    renderCell: (params: ColumnParams) => {
      const role = params.value?.toLowerCase();
      return (
        <Badge variant="outline" className="capitalize">
          {role === 'cirurgiao'
            ? 'Cirurgião'
            : role === 'aux1'
              ? '1º Auxiliar'
              : role === 'aux2'
                ? '2º Auxiliar'
                : role === 'anestesista'
                  ? 'Anestesista'
                  : params.value}
        </Badge>
      );
    },
  },
  {
    field: 'pago',
    headerName: 'Status',
    width: 100,
    renderCell: (params: ColumnParams) => {
      const isPaid = params.value;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={isPaid ? 'success' : 'destructive'}>
                {isPaid ? 'Pago' : 'Não Pago'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPaid ? 'Pagamento confirmado' : 'Pagamento pendente ou glosado'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    field: 'valorPago',
    headerName: 'Valor Pago',
    width: 130,
    type: 'number',
    valueFormatter: (params: ColumnParams) => formatCurrency(params.value),
  },
  {
    field: 'valorTabela2015',
    headerName: 'Valor CBHPM',
    width: 130,
    type: 'number',
    valueFormatter: (params: ColumnParams) => formatCurrency(params.value),
  },
  {
    field: 'diferenca',
    headerName: 'Δ%',
    width: 100,
    type: 'number',
    renderCell: (params: ColumnParams) => {
      const value = params.value;
      const className =
        value >= 0 ? 'text-success' : value > -10 ? 'text-warning' : 'text-destructive';
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className={className}>
                {value > 0 ? '+' : ''}
                {value.toFixed(1)}%
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {value >= 0
                  ? 'Valor acima ou igual à tabela CBHPM'
                  : value > -10
                    ? 'Valor próximo à tabela CBHPM'
                    : 'Valor significativamente abaixo da tabela CBHPM'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];
