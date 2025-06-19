import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface GlosasTabProps {
  glosas?: any[];
}

const GlosasTab = ({ glosas = [] }: GlosasTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredData = glosas.filter(glosa => 
    searchTerm === "" || 
    glosa.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    glosa.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    glosa.motivo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      field: 'descricao', 
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
      field: 'motivo', 
      headerName: 'Motivo', 
      width: 200,
      renderCell: (params: any) => (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {params.value}
        </Badge>
      )
    },
    { 
      field: 'valorGlosa', 
      headerName: 'Valor Glosa', 
      width: 130,
      type: 'number',
      renderCell: (params: any) => (
        <div className="font-medium text-destructive">
          {formatCurrency(params.value)}
        </div>
      )
    }
  ];

  const totalGlosado = filteredData.reduce((acc, glosa) => acc + (glosa.valorGlosa || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Glosas Identificadas</h2>
          <p className="text-sm text-muted-foreground">
            Total glosado: {formatCurrency(totalGlosado)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar glosas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtrar</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataGrid
            rows={filteredData}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            className="min-h-[500px]"
            getRowClassName={() => "hover:bg-destructive/5 transition-colors"}
          />
          {filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Nenhuma glosa encontrada</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? "Tente ajustar seus filtros de busca"
                  : "Não há glosas registradas nos últimos 30 dias"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GlosasTab;
