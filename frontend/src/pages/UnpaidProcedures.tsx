import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { DataGrid } from "../components/ui/data-grid";
import { Button } from "../components/ui/button";
import { AlertCircle, Download, FileX, Filter } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useState } from "react";
import { ResourceDialog } from "../components/unpaid-procedures/ResourceDialog";
import { formatCurrency } from "../utils/format";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../contexts/auth/AuthContext";
import { UserMenu } from "../components/navbar/UserMenu";
import InfoCard from "../components/ui/InfoCard";

// Dados mock de exemplo para a demonstração
const mockUnpaidProcedures = [
  { 
    id: "up1", 
    guia: "10467538", 
    procedimento: "Reconstrução Mamária Com Retalhos Cutâneos Regionais",
    data: "19/04/2025", 
    valorApresentado: 1063.68, 
    motivoNaoPagamento: "Procedimento em auditoria",
    status: "Pendente" 
  },
  { 
    id: "up2", 
    guia: "10467539", 
    procedimento: "Vitrectomia posterior",
    data: "20/04/2025", 
    valorApresentado: 892.44, 
    motivoNaoPagamento: "Documentação incompleta",
    status: "Em recurso" 
  },
  { 
    id: "up3", 
    guia: "10467540", 
    procedimento: "Palpebra - reconstrução total",
    data: "21/04/2025", 
    valorApresentado: 629.75, 
    motivoNaoPagamento: "Procedimento não coberto",
    status: "Negado" 
  }
];

const unpaidColumns = [
  { field: 'guia', headerName: 'Nº Guia', width: 120 },
  { field: 'procedimento', headerName: 'Procedimento', flex: 1 },
  { field: 'data', headerName: 'Data', width: 120 },
  { 
    field: 'valorApresentado', 
    headerName: 'Valor Apresentado', 
    width: 150,
    valueFormatter: (params: any) => formatCurrency(params.value)
  },
  { 
    field: 'motivoNaoPagamento', 
    headerName: 'Motivo', 
    width: 200,
    renderCell: ({ value }: { value: string }) => (
      <Badge variant="destructive" className="bg-red-500/10">
        {value}
      </Badge>
    )
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 150,
    renderCell: ({ value }: { value: string }) => {
      const variant = 
        value === "Pendente" ? "warning" : 
        value === "Em recurso" ? "outline" : 
        "destructive";
      
      return <Badge variant={variant}>{value}</Badge>;
    }
  },
  {
    field: 'actions',
    headerName: 'Ações',
    width: 120,
    renderCell: ({ row }: { row: any }) => (
      <ResourceDialog procedure={row} />
    )
  }
];

const UnpaidProceduresPage = () => {
  const [unpaidProcedures] = useState<any[]>(mockUnpaidProcedures);
  const { userProfile, signOut } = useAuth();

  return (
    <AuthenticatedLayout title="Procedimentos Não Pagos">
      <PageHeader
        title="Procedimentos Não Pagos"
        icon={<FileX size={28} />}
        actions={userProfile ? (
          <UserMenu
            name={userProfile.name || 'Usuário'}
            email={userProfile.email || 'sem-email@exemplo.com'}
            specialty={userProfile.crm || ''}
            avatarUrl={userProfile.avatarUrl || undefined}
            onLogout={signOut}
          />
        ) : null}
      />
      <div className="space-y-6">
        <InfoCard
          icon={<AlertCircle className="h-6 w-6 text-amber-500" />}
          title={`Existem ${unpaidProcedures.filter(p => p.status !== "Negado").length} procedimentos que podem ser contestados`}
          description="Conteste em até 30 dias para garantir a análise pelo convênio"
          variant="warning"
          className="w-full mb-4"
        />
        
        <div className="flex gap-2 self-end">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileX className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Lista de Procedimentos Não Pagos</h3>
            </div>
          </CardHeader>
          <CardContent>
            <DataGrid
              rows={unpaidProcedures}
              columns={unpaidColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              className="min-h-[500px]"
            />
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

export default UnpaidProceduresPage;
