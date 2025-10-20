import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  Row,
  CellContext,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Pagination } from "@/components/ui/pagination";

export type Procedure = {
  codigo: string;
  descricao: string;
  papel_exercido: string;
  qtd: number;
  status: string;
  data_execucao: string;
  horario_in?: string;
  horario_out?: string;
};

interface DataTableProps {
  data: Procedure[];
}

export function DataTable({ data }: DataTableProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const columnHelper = createColumnHelper<Procedure>();

  const columns = React.useMemo<ColumnDef<Procedure, any>[]>(
    () => [
      columnHelper.accessor("codigo", {
        header: "Código",
        cell: (info: CellContext<Procedure, string>) => info.getValue(),
      }),
      columnHelper.accessor("descricao", {
        header: "Descrição",
        cell: (info: CellContext<Procedure, string>) => info.getValue(),
      }),
      columnHelper.accessor("papel_exercido", {
        header: "Papel",
        cell: (info: CellContext<Procedure, string>) => info.getValue(),
      }),
      columnHelper.accessor("qtd", {
        header: "Qtd",
        cell: (info: CellContext<Procedure, number>) => info.getValue(),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info: CellContext<Procedure, string>) => info.getValue(),
      }),
      columnHelper.accessor("data_execucao", {
        header: "Data Execução",
        cell: (info: CellContext<Procedure, string>) => info.getValue(),
        sortingFn: "datetime",
      }),
      columnHelper.accessor(
        (row) => `${row.horario_in || ""} - ${row.horario_out || ""}`,
        {
          id: "horario",
          header: "Horário in/out",
          cell: (info: CellContext<Procedure, string>) => info.getValue(),
        },
      ),
    ],
    [columnHelper],
  );

  const table = useReactTable<Procedure>({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (
      row: Row<Procedure>,
      columnId: string,
      filterValue: string,
    ) => {
      // Filtro por código ou descrição
      if (columnId === "codigo" || columnId === "descricao") {
        return String(row.getValue(columnId))
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      // Filtro global: código ou descrição
      return (
        String(row.getValue("codigo"))
          .toLowerCase()
          .includes(filterValue.toLowerCase()) ||
        String(row.getValue("descricao"))
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    },
    initialState: {
      pagination: { pageSize: 10 },
      sorting: [{ id: "data_execucao", desc: true }],
    },
    debugTable: false,
  });

  return (
    <div className="space-y-2">
      <Input
        placeholder="Filtrar por código ou descrição..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-xs"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Nenhum procedimento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
