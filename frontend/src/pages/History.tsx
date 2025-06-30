import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { Button } from '@/components/ui/button';
import { FileText, Download, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { StatisticsPanel } from '@/components/history/StatisticsPanel';
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
    type: 'Demonstrativo',
    procedures: 32,
    glosas: 3,
    hospital: 'Liga Norteriog Cancer Policlinic',
  },
  {
    id: 'h2',
    date: '2024-09-26',
    description: 'Análise de demonstrativo de setembro',
    status: 'Concluído',
    recoveredValue: 980.5,
    type: 'Demonstrativo',
    procedures: 28,
    glosas: 2,
    hospital: 'Liga Norteriog Cancer Policlinic',
  },
  {
    id: 'h3',
    date: '2024-08-26',
    description: 'Análise de demonstrativo de agosto',
    status: 'Pendente',
    recoveredValue: 0.0,
    type: 'Demonstrativo',
    procedures: 24,
    glosas: 0,
    hospital: 'Liga Norteriog Cancer Policlinic',
  },
  {
    id: 'h4',
    date: '2024-07-15',
    description: 'Auditoria de guias de julho',
    status: 'Concluído',
    recoveredValue: 750.25,
    type: 'Guia',
    procedures: 18,
    glosas: 1,
    hospital: 'Liga Norteriog Cancer Policlinic',
  },
];

const historyColumns = [
  {
    field: 'date',
    headerName: 'Data',
    width: 120,
    valueFormatter: (params: any) => {
      return new Date(params.value).toLocaleDateString('pt-BR');
    },
  },
  {
    field: 'type',
    headerName: 'Tipo',
    width: 120,
    renderCell: (params: any) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value === 'Demonstrativo'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        {params.value}
      </span>
    ),
  },
  { field: 'description', headerName: 'Descrição', flex: 1 },
  {
    field: 'procedures',
    headerName: 'Procedimentos',
    width: 120,
    align: 'center',
  },
  {
    field: 'glosas',
    headerName: 'Glosas',
    width: 100,
    align: 'center',
    renderCell: (params: any) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params: any) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value === 'Concluído'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: 'recoveredValue',
    headerName: 'Valor Recuperado',
    width: 150,
    align: 'right',
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
  const [history] = useState(mockHistory);
  usePageTitle('Histórico de Análises | MedCheck');

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
          description="Rastreabilidade completa e estatísticas de suas análises médicas"
        />

        <div className="space-y-8">
          {/* Painel de Estatísticas */}
          <section aria-label="Estatísticas e Performance">
            <StatisticsPanel />
          </section>

          {/* Controles e Filtros */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
                <BarChart3 className="w-4 h-4" />
                Relatório Completo
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
          </div>

          {/* Tabela de Histórico */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-base sm:text-lg">
                      Análises Realizadas
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Histórico completo de demonstrativos e guias processadas
                  </p>
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
                  paginationLabel="Análises por página:"
                  emptyMessage="Nenhuma análise encontrada no histórico"
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
