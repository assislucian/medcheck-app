import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

interface GuidesTableProps {
  rows: any[];
  columns: any[];
  selectedRows: string[];
  onSelectRow: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onExpand: (id: string) => void;
  expandedRow: string | null;
  renderExpandedRow?: (row: any) => React.ReactNode;
}

const statusLabel: Record<string, string> = {
  Fechada: "Fechada",
  "Gerado pela execução": "Gerado pela execução",
  Pendente: "Pendente",
  Processada: "Processada",
  // Adicione outros status se necessário
};

export function GuidesTable({
  rows,
  columns,
  selectedRows,
  onSelectRow,
  onSelectAll,
  onExpand,
  expandedRow,
  renderExpandedRow
}: GuidesTableProps) {
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < rows.length;

  return (
    <ScrollArea className="w-full max-h-[70vh] overflow-x-auto scrollbar-gutter-stable">
      <table className="w-full min-w-full table-auto text-sm">
        <thead>
          <tr className="h-12 th-sticky">
            <th className="w-1/12 text-center" />
            <th className="w-1/12 text-center" />
            <th className="w-2/12 text-center px-4">Nº Guia</th>
            <th className="w-2/12 text-center px-4">Data de Execução</th>
            <th className="w-3/12 text-left px-4">Beneficiário</th>
            <th className="w-1/12 text-center px-4">Qtd Proc.</th>
            <th className="w-2/12 text-center px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => [
            <tr
              key={row.numero_guia}
              className={cn(
                "h-12 transition-colors",
                idx % 2 === 0 && "table-row-even",
                "table-row-hover",
                selectedRows.includes(row.numero_guia) && "bg-primary/10"
              )}
            >
              <td className="w-1/12 text-center p-0 align-middle">
                <Checkbox checked={selectedRows.includes(row.numero_guia)} onCheckedChange={checked => onSelectRow(row.numero_guia, !!checked)} aria-label={`Selecionar guia ${row.numero_guia}`} />
              </td>
              <td className="w-1/12 text-center p-0 align-middle">
                <button
                  type="button"
                  className="flex justify-center items-center w-8 h-8 rounded hover:bg-primary/10 focus:outline-none"
                  onClick={() => onExpand(row.numero_guia)}
                  aria-label={expandedRow === row.numero_guia ? "Colapsar detalhes" : "Expandir detalhes"}
                >
                  <Eye className={cn("w-5 h-5", expandedRow === row.numero_guia ? "text-primary" : "text-gray-500")} />
                </button>
              </td>
              <td className="w-2/12 text-center px-4 font-mono whitespace-nowrap">{row.numero_guia}</td>
              <td className="w-2/12 text-center px-4 whitespace-nowrap">{row.data}</td>
              <td className="w-3/12 truncate text-left px-4" title={row.beneficiario}>{row.beneficiario}</td>
              <td className="w-1/12 text-center px-4">{row.qtdProcedimentos}</td>
              <td className="w-2/12 text-center px-4">
                <Badge variant="success" className="whitespace-nowrap px-3 py-1" title={statusLabel[row.status] || row.status}>
                  {statusLabel[row.status] || row.status}
                </Badge>
              </td>
            </tr>,
            renderExpandedRow && expandedRow === row.numero_guia ? (
              <tr key={row.numero_guia + "-expanded"}>
                <td colSpan={7} className="bg-muted/30 p-0">
                  {renderExpandedRow(row)}
                </td>
              </tr>
            ) : null
          ])}
        </tbody>
      </table>
    </ScrollArea>
  );
} 