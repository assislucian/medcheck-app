import { DataGrid } from "@/components/ui/data-grid";
import { Badge } from "@/components/ui/badge";
import { Procedure } from "@/types/medical";
import { formatCurrency } from "@/lib/utils";
import { Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProceduresGridProps {
  procedures: Procedure[];
}

export const ProceduresGrid = ({ procedures }: ProceduresGridProps) => {
  const columns = [
    { 
      field: 'codigo', 
      headerName: 'Código', 
      width: 120,
      renderCell: (params: any) => (
        <div className="font-mono text-sm">{params.value}</div>
      )
    },
    { 
      field: 'procedimento', 
      headerName: 'Descrição', 
      flex: 1,
      minWidth: 250,
      renderCell: (params: any) => (
        <div className="flex flex-col">
          <span className="font-medium truncate">{params.value}</span>
          {params.row.beneficiario && (
            <span className="text-xs text-muted-foreground truncate">
              {params.row.beneficiario}
            </span>
          )}
        </div>
      )
    },
    { 
      field: 'papel', 
      headerName: 'Função', 
      width: 130,
      renderCell: (params: any) => (
        <Badge variant="outline" className="capitalize">
          {params.value?.toLowerCase() || 'N/A'}
        </Badge>
      )
    },
    { 
      field: 'pago', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params: any) => {
        if (params.value) {
          return (
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" /> Pago
            </Badge>
          );
        }
        return params.row.diferenca < 0 ? (
          <Badge variant="destructive" className="gap-1">
            <X className="h-3 w-3" /> Glosado
          </Badge>
        ) : (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> Pendente
          </Badge>
        );
      }
    },
    { 
      field: 'valorPago', 
      headerName: 'Valor Pago', 
      width: 130,
      type: 'number',
      renderCell: (params: any) => (
        <div className={cn(
          "font-medium",
          params.value === 0 && "text-muted-foreground"
        )}>
          {formatCurrency(params.value)}
        </div>
      )
    },
    { 
      field: 'valorCBHPM', 
      headerName: 'CBHPM 2015', 
      width: 130,
      type: 'number',
      renderCell: (params: any) => (
        <div className="font-medium">
          {formatCurrency(params.value)}
        </div>
      )
    },
    { 
      field: 'diferenca', 
      headerName: 'Diferença', 
      width: 120,
      type: 'number',
      renderCell: (params: any) => {
        const value = params.value;
        return (
          <div className={cn(
            "font-medium",
            value > 0 && "text-success",
            value < 0 && "text-destructive",
            value === 0 && "text-muted-foreground"
          )}>
            {value > 0 && '+'}
            {value.toFixed(1)}%
          </div>
        );
      }
    }
  ];

  return (
    <DataGrid
      rows={procedures}
      columns={columns}
      pageSize={10}
      rowsPerPageOptions={[10, 25, 50]}
      disableSelectionOnClick
      className="min-h-[500px]"
      getRowClassName={(params: any) => cn(
        "transition-colors",
        params.row.pago ? "hover:bg-success/5" : 
        params.row.diferenca < 0 ? "hover:bg-destructive/5" : 
        "hover:bg-warning/5"
      )}
    />
  );
};
