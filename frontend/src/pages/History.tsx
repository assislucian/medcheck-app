import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../contexts/auth/AuthContext';

import { usePageTitle } from '../hooks/usePageTitle';
import { Helmet } from 'react-helmet-async';

// Mock data for demonstration purposes
const mockHistory = [
  {
    id: 'h1',
    date: '2024-10-26',
    description: 'Análise de demonstrativo de outubro',
    status: 'Concluído',
    recoveredValue: 1250.0,
  },
  {
    id: 'h2',
    date: '2024-09-26',
    description: 'Análise de demonstrativo de setembro',
    status: 'Concluído',
    recoveredValue: 980.5,
  },
  {
    id: 'h3',
    date: '2024-08-26',
    description: 'Análise de demonstrativo de agosto',
    status: 'Pendente',
    recoveredValue: 0.0,
  },
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
        currency: 'BRL',
      }).format(params.value);
    },
  },
  {
    field: 'actions',
    headerName: 'Ações',
    width: 150,
    renderCell: () => (
      <Button variant="outline" size="sm">
        Ver Detalhes
      </Button>
    ),
  },
];

const HistoryPage = () => {
  const [history] = useState<any[]>(mockHistory);
  const { userProfile, signOut } = useAuth();

  // SEO e Título Premium
  usePageTitle({
    title: 'Histórico de Análises',
    description:
      'Visualize e gerencie o histórico completo de análises médicas realizadas com rastreabilidade e insights históricos',
    keywords:
      'histórico análises médicas, rastreabilidade auditoria, relatórios históricos, análises realizadas',
  });

  return (
    <>
      <Helmet>
        <title>Histórico de Análises | MedCheck</title>
        <meta
          name="description"
          content="Visualize e gerencie o histórico completo de análises médicas realizadas com rastreabilidade e insights históricos"
        />
        <meta
          name="keywords"
          content="histórico análises médicas, rastreabilidade auditoria, relatórios históricos"
        />

        {/* Open Graph para compartilhamento */}
        <meta property="og:title" content="Histórico de Análises | MedCheck" />
        <meta
          property="og:description"
          content="Visualize e gerencie o histórico completo de análises médicas"
        />
        <meta property="og:type" content="website" />

        {/* Schema.org para SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'MedCheck Histórico',
            description: 'Sistema de histórico e rastreabilidade de análises médicas',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

      <AuthenticatedLayout title="Histórico de Análises">
        <PageHeader
          title="Histórico de Análises"
          icon={<FileText size={28} />}
          description="Rastreabilidade completa de análises e relatórios"
        />
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                Relatório
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
                  <h3 className="font-medium text-base sm:text-lg">
                    Análises Realizadas
                  </h3>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <DataGrid
                  rows={history}
                  columns={historyColumns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  className="min-h-[400px] sm:min-h-[500px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default HistoryPage;
