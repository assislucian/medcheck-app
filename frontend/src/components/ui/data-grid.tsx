import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
}

export function DataGrid({
  rows,
  columns,
  pageSize = 10,
  className = "",
  renderExpandedRow,
}: DataGridProps) {
  // Make sure rows is always an array, even if undefined is passed
  const safeRows = Array.isArray(rows) ? rows : [];
  
  // Função para obter o valor de uma célula com segurança
  const getCellValue = (row: any, field: string) => {
    if (!row) return null;
    return row[field] !== undefined ? row[field] : null;
  };
  
  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.field}
                style={{
                  width: column.width,
                  flex: column.flex
                }}
              >
                {column.headerName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeRows.slice(0, pageSize).map((row, rowIndex) => [
            <TableRow key={row?.id || rowIndex}>
              {columns.map((column) => {
                const cellValue = getCellValue(row, column.field);
                return (
                  <TableCell key={`${row?.id || rowIndex}-${column.field}`}>
                    {column.renderCell ? (
                      column.renderCell({ value: cellValue, row })
                    ) : column.valueFormatter ? (
                      column.valueFormatter({ value: cellValue })
                    ) : (
                      cellValue !== null && cellValue !== undefined ? cellValue : ''
                    )}
                  </TableCell>
                );
              })}
            </TableRow>,
            renderExpandedRow && renderExpandedRow(row)
          ])}
          {safeRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                Nenhum registro encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          disabled={safeRows.length <= pageSize}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={safeRows.length <= pageSize}
        >
          Próximo
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
