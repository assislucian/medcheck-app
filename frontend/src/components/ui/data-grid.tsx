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
  Eye,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

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
  selectable?: boolean;
  selectedRows?: string[];
  onSelectRow?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  expandable?: boolean;
  expandedRow?: string | null;
  onExpand?: (id: string) => void;
  rowIdField?: string;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
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
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  expandable = false,
  expandedRow = null,
  onExpand,
  rowIdField = 'id',
  currentPage = 0,
  onPageChange,
  onPageSizeChange,
}: DataGridProps) {
  // Make sure rows is always an array, even if undefined is passed
  const safeRows = Array.isArray(rows) ? rows : [];

  // Selection logic
  const allSelected =
    selectable && safeRows.length > 0 && selectedRows.length === safeRows.length;
  const someSelected =
    selectable && selectedRows.length > 0 && selectedRows.length < safeRows.length;

  // Prepare columns with selection and expand columns
  const enhancedColumns = [
    ...(selectable
      ? [
          {
            field: '__select',
            headerName: '',
            width: 50,
            renderCell: () => null, // Handled specially in render
          },
        ]
      : []),
    ...(expandable
      ? [
          {
            field: '__expand',
            headerName: '',
            width: 50,
            renderCell: () => null, // Handled specially in render
          },
        ]
      : []),
    ...columns,
  ];

  // Pagination calculations
  const totalPages = Math.ceil(safeRows.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, safeRows.length);
  const currentRows = safeRows.slice(startIndex, endIndex);

  // Pagination handlers
  const goToFirstPage = () => onPageChange?.(0);
  const goToLastPage = () => onPageChange?.(totalPages - 1);
  const goToPreviousPage = () => onPageChange?.(Math.max(0, currentPage - 1));
  const goToNextPage = () => onPageChange?.(Math.min(totalPages - 1, currentPage + 1));

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
            wrapperScrollable
              ? 'overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-500'
              : 'overflow-visible'
          )}
        >
          <Table
            scrollable={false}
            className="table-auto w-full min-w-[800px] sm:min-w-[900px] lg:min-w-full"
          >
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {enhancedColumns.map((column) => {
                  // Special handling for selection and expand columns
                  if (column.field === '__select') {
                    return (
                      <TableHead
                        key="__select"
                        className="w-[40px] sm:w-[50px] text-center align-middle py-3 sm:py-4 px-2 sm:px-3 md:px-4 bg-gray-50 dark:bg-gray-800/50"
                      >
                        <Checkbox
                          checked={allSelected}
                          {...(someSelected && { 'data-indeterminate': 'true' })}
                          onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                          aria-label="Selecionar todos"
                        />
                      </TableHead>
                    );
                  }

                  if (column.field === '__expand') {
                    return (
                      <TableHead
                        key="__expand"
                        className="w-[40px] sm:w-[50px] text-center align-middle py-3 sm:py-4 px-2 sm:px-3 md:px-4 bg-gray-50 dark:bg-gray-800/50"
                      >
                        {/* Empty header for expand column */}
                      </TableHead>
                    );
                  }

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
                      className="text-center align-middle py-3 sm:py-4 px-2 sm:px-3 md:px-4 bg-gray-50 dark:bg-gray-800/50 min-w-[100px] sm:min-w-[120px]"
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
                return (
                  <React.Fragment key={row?.id || globalIndex}>
                    <TableRow
                      className={cn(
                        'transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50',
                        globalIndex % 2 === 0
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-gray-50/50 dark:bg-gray-800/30',
                        Number(row?.glosa) > 0 &&
                          'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                      )}
                    >
                      {enhancedColumns.map((column) => {
                        const rowId = row[rowIdField];

                        // Special handling for selection column
                        if (column.field === '__select') {
                          return (
                            <TableCell
                              key={`${rowId}-select`}
                              className="w-[40px] sm:w-[50px] text-center py-2 sm:py-3 px-2 sm:px-3 md:px-4"
                            >
                              <Checkbox
                                checked={selectedRows.includes(String(rowId))}
                                onCheckedChange={(checked) =>
                                  onSelectRow?.(String(rowId), !!checked)
                                }
                                aria-label={`Selecionar linha ${rowId}`}
                              />
                            </TableCell>
                          );
                        }

                        // Special handling for expand column
                        if (column.field === '__expand') {
                          return (
                            <TableCell
                              key={`${rowId}-expand`}
                              className="w-[40px] sm:w-[50px] text-center py-2 sm:py-3 px-2 sm:px-3 md:px-4"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onExpand?.(String(rowId))}
                                className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                            </TableCell>
                          );
                        }

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
                              'py-2 sm:py-3 px-2 sm:px-3 md:px-4 transition-colors duration-200',
                              isNumeric
                                ? 'text-right font-mono tabular-nums whitespace-nowrap'
                                : 'text-left',
                              'text-gray-800 dark:text-gray-200 min-w-[80px] sm:min-w-[100px]'
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
                    </TableRow>
                    {/* Renderiza a linha expandida apenas se esta linha estiver selecionada */}
                    {expandable &&
                      expandedRow === String(row[rowIdField]) &&
                      renderExpandedRow &&
                      renderExpandedRow(row)}
                  </React.Fragment>
                );
              })}
              {currentRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={enhancedColumns.length}
                    className="text-center py-12"
                  >
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
                value={String(pageSize)}
                onValueChange={(value) => {
                  onPageSizeChange?.(Number(value));
                  onPageChange?.(0);
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
