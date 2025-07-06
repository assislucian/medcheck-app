import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ComparisonDetail {
  id: string;
  codigo: string;
  descricao: string;
  qtd: number;
  valorCbhpm: number;
  valorPago: number;
  diferenca: number;
  status: string;
  papel: string;
  guia?: string;
  matchStatus?: string;
  beneficiario?: string;
}

interface ComparisonTableProps {
  details: ComparisonDetail[];
  getStatusBadge: (status: string) => React.ReactNode;
  getRoleBadge: (role: string) => React.ReactNode;
  toggleSort: (field: string) => void;
  sortField: string | null;
  getSortIcon: (field: string) => React.ReactNode;
  filter: string;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  details,
  getStatusBadge,
  getRoleBadge,
  toggleSort,
  sortField,
  getSortIcon,
  filter,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => toggleSort('codigo')}>
              <div className="flex items-center">Código {getSortIcon('codigo')}</div>
            </TableHead>
            <TableHead
              className="w-[30%] cursor-pointer"
              onClick={() => toggleSort('descricao')}
            >
              <div className="flex items-center">
                Procedimento {getSortIcon('descricao')}
              </div>
            </TableHead>
            <TableHead>Papel</TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort('guia')}>
              <div className="flex items-center">Guia {getSortIcon('guia')}</div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => toggleSort('valorCbhpm')}
            >
              <div className="flex items-center justify-end">
                Valor CBHPM {getSortIcon('valorCbhpm')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => toggleSort('valorPago')}
            >
              <div className="flex items-center justify-end">
                Valor Pago {getSortIcon('valorPago')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer"
              onClick={() => toggleSort('diferenca')}
            >
              <div className="flex items-center justify-end">
                Diferença {getSortIcon('diferenca')}
              </div>
            </TableHead>
            <TableHead
              className="text-center cursor-pointer"
              onClick={() => toggleSort('status')}
            >
              <div className="flex items-center justify-center">
                Status {getSortIcon('status')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {details.length > 0 ? (
            details.map((detail) => (
              <TableRow
                key={detail.id}
                className={
                  detail.matchStatus === 'não_encontrado'
                    ? 'bg-orange-100/50 dark:bg-orange-950/20'
                    : detail.status === 'não_pago'
                      ? 'bg-red-100/50 dark:bg-red-950/20'
                      : detail.status === 'abaixo'
                        ? 'bg-amber-100/50 dark:bg-amber-950/20'
                        : ''
                }
              >
                <TableCell className="font-medium">{detail.codigo}</TableCell>
                <TableCell>{detail.descricao}</TableCell>
                <TableCell>{getRoleBadge(detail.papel)}</TableCell>
                <TableCell>
                  {detail.matchStatus === 'não_encontrado' ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <Badge
                              variant="outline"
                              className="bg-orange-500/10 text-orange-500"
                            >
                              Não encontrado
                            </Badge>
                            <AlertTriangle className="h-4 w-4 text-orange-500 ml-1" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Procedimento não encontrado nas guias carregadas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    detail.guia || '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  R$ {detail.valorCbhpm.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {detail.status === 'não_pago'
                    ? '-'
                    : `R$ ${detail.valorPago.toFixed(2)}`}
                </TableCell>
                <TableCell className="text-right">
                  {detail.status === 'não_pago' ? (
                    '-'
                  ) : detail.status === 'conforme' ? (
                    '0,00'
                  ) : (
                    <span
                      className={
                        detail.status === 'abaixo' ? 'text-red-500' : 'text-blue-500'
                      }
                    >
                      {detail.status === 'abaixo' ? '-' : '+'} R${' '}
                      {Math.abs(detail.diferenca).toFixed(2)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(detail.status)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhum procedimento encontrado com os filtros atuais.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ComparisonTable;
