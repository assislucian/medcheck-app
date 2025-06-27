import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DataGridProps {
  rows: any[];
  columns: {
    field: string;
    headerName: string;
    width?: number;
    flex?: number;
    type?: string;
    renderCell?: (params: any) => React.ReactNode;
    valueFormatter?: (params: any) => string;
  }[];
  pageSize?: number;
  rowsPerPageOptions?: number[];
  disableSelectionOnClick?: boolean;
  className?: string;
  renderExpandedRow?: (row: any) => React.ReactNode;
  wrapperScrollable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  paginationLabel?: string;
}

export function DataGrid({
  rows,
  columns,
  pageSize = 10,
  className = '',
  renderExpandedRow,
  wrapperScrollable = true,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  paginationLabel = 'Linhas por página:',
}: DataGridProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageRows, setPageRows] = useState(pageSize);

  // Make sure rows is always an array, even if undefined is passed
  const safeRows = Array.isArray(rows) ? rows : [];

  // Pagination calculations
  const totalPages = Math.ceil(safeRows.length / pageRows);
  const startIndex = currentPage * pageRows;
  const endIndex = Math.min(startIndex + pageRows, safeRows.length);
  const currentRows = safeRows.slice(startIndex, endIndex);

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(0);
  const goToLastPage = () => setCurrentPage(totalPages - 1);
  const goToPreviousPage = () => setCurrentPage(Math.max(0, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages - 1, currentPage + 1));

  // Função para obter o valor de uma célula com segurança
  const getCellValue = (row: any, field: string) => {
    if (!row) return null;
    return row[field] !== undefined ? row[field] : null;
  };

  // Get tooltip content for medical headers
  const getTooltipContent = (headerName: string) => {
    const tooltips: Record<string, string> = {
      CBHPM: 'Valor de referência da tabela CBHPM vigente para o procedimento',
      Liberado: 'Valor efetivamente liberado e pago pelo convênio médico',
      Diferença: 'Diferença absoluta entre o valor CBHPM e o valor liberado',
      'Delta %': 'Percentual de diferença em relação ao valor de referência CBHPM',
      Glosa: 'Valor glosado (não pago) pelo convênio médico',
      'Taxa Glosa': 'Percentual de glosa em relação ao valor apresentado',
    };
    return tooltips[headerName];
  };

  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Carregando dados...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Data Table */}
      <div
        className={cn(
          'bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700',
          wrapperScrollable && 'overflow-hidden'
        )}
      >
        <div
          className={cn(
            wrapperScrollable ? 'overflow-x-auto scrollbar-thin' : 'overflow-visible'
          )}
        >
          <Table scrollable={false} className="table-auto w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {columns.map((column) => {
                  const tooltipContent = getTooltipContent(column.headerName);
                  let headerContent = (
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {column.headerName}
                    </span>
                  );

                  if (tooltipContent) {
                    headerContent = (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-2 cursor-help">
                              {column.headerName}
                              <Info className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="max-w-xs text-sm bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                          >
                            {tooltipContent}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }

                  return (
                    <TableHead
                      key={column.field}
                      style={{ width: column.width, flex: column.flex }}
                      className="text-center align-middle py-4 px-4 bg-gray-50 dark:bg-gray-800/50"
                    >
                      {headerContent}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRows.map((row, rowIndex) => {
                const globalIndex = startIndex + rowIndex;
                return [
                  <TableRow
                    key={row?.id || globalIndex}
                    className={cn(
                      'transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50',
                      globalIndex % 2 === 0
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-gray-50/50 dark:bg-gray-800/30',
                      Number(row?.glosa) > 0 &&
                        'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                    )}
                  >
                    {columns.map((column) => {
                      const cellValue = getCellValue(row, column.field);
                      // Alinhamento condicional: numérico à direita, texto à esquerda
                      const isNumeric =
                        ['number', 'currency', 'percent'].includes(column.type) ||
                        /total|valor|quantidade|qtd|delta|percent|glosa|liberado|apresentado|cbhpm|diferença|procedimentos|preco/i.test(
                          column.field
                        );

                      return (
                        <TableCell
                          key={`${row?.id || globalIndex}-${column.field}`}
                          className={cn(
                            'py-3 px-4 transition-colors duration-200',
                            isNumeric
                              ? 'text-right font-mono tabular-nums whitespace-nowrap'
                              : 'text-left',
                            'text-gray-800 dark:text-gray-200'
                          )}
                        >
                          {column.renderCell ? (
                            column.renderCell({ value: cellValue, row })
                          ) : column.valueFormatter ? (
                            column.valueFormatter({ value: cellValue })
                          ) : cellValue !== null && cellValue !== undefined ? (
                            String(cellValue)
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic">
                              —
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>,
                  renderExpandedRow && renderExpandedRow(row),
                ];
              })}
              {currentRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Info className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Tente ajustar os filtros para ver mais resultados
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {safeRows.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200/60 shadow-sm p-4 backdrop-blur-sm dark:bg-gray-800/90 dark:border-gray-700/60">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results info */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Badge
                variant="secondary"
                className="font-mono bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
              >
                {startIndex + 1}-{endIndex} de {safeRows.length}
              </Badge>
              <span>resultados</span>
              <div className="hidden sm:block h-4 w-px bg-gray-300 dark:bg-gray-600" />
              <span className="hidden sm:inline">
                Página {currentPage + 1} de {totalPages}
              </span>
            </div>

            {/* Page size selector */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {paginationLabel}
              </span>
              <Select
                value={String(pageRows)}
                onValueChange={(value) => {
                  setPageRows(Number(value));
                  setCurrentPage(0);
                }}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goToFirstPage}
                disabled={currentPage === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToLastPage}
                disabled={currentPage === totalPages - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
