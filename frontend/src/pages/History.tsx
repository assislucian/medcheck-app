import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../contexts/auth/AuthContext";
import { UserMenu } from "../components/navbar/UserMenu";

// Mock data for demonstration purposes
const mockHistory = [
  { 
    id: "h1", 
    date: "2024-10-26", 
    description: "Análise de demonstrativo de outubro", 
    status: "Concluído", 
    recoveredValue: 1250.00 
  },
  { 
    id: "h2", 
    date: "2024-09-26", 
    description: "Análise de demonstrativo de setembro", 
    status: "Concluído", 
    recoveredValue: 980.50 
  },
  { 
    id: "h3", 
    date: "2024-08-26", 
    description: "Análise de demonstrativo de agosto", 
    status: "Pendente", 
    recoveredValue: 0.00 
  }
];

const historyColumns = [
  { field: 'date', headerName: 'Data', width: 150 },
  { field: 'description', headerName: 'Descrição', flex: 1 },
  { field: 'status', headerName: 'Status', width: 150 },
  { 
    field: 'recoveredValue', 
    headerName: 'Valor Recuperado', 
    width: 200,
    valueFormatter: (params: any) => {
      if (params.value === undefined || params.value === null) {
        return 'R$ 0,00';
      }
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(params.value);
    }
  },
  {
    field: 'actions',
    headerName: 'Ações',
    width: 150,
    renderCell: () => (
      <Button variant="outline" size="sm">
        Ver Detalhes
      </Button>
    )
  }
];

const HistoryPage = () => {
  const [history] = useState<any[]>(mockHistory);
  const { userProfile, signOut } = useAuth();

  return (
    <AuthenticatedLayout title="Histórico">
      <PageHeader
        title="Histórico"
        icon={<FileText size={28} />}
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
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Relatório
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <FileText className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-medium">Análises Realizadas</h3>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataGrid
              rows={history}
              columns={historyColumns}
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

export default HistoryPage;
