import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { Button } from '@/components/ui/button';
import { AlertCircle, Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// Dados mock de exemplo para a demonstração
const mockGlosas = [
  {
    id: 'gl1',
    guia: '10467538',
    procedimento: 'Reconstrução Mamária Com Retalhos Cutâneos Regionais',
    data: '19/04/2025',
    valorGlosado: 1063.68,
    motivoGlosa: 'Procedimento em auditoria',
    contestada: false,
  },
  {
    id: 'gl2',
    guia: '10467539',
    procedimento: 'Vitrectomia posterior',
    data: '20/04/2025',
    valorGlosado: 892.44,
    motivoGlosa: 'Documentação incompleta',
    contestada: true,
  },
  {
    id: 'gl3',
    guia: '10467540',
    procedimento: 'Palpebra - reconstrução total',
    data: '21/04/2025',
    valorGlosado: 629.75,
    motivoGlosa: 'Procedimento não coberto',
    contestada: false,
  },
];

const glosaColumns = [
  { field: 'guia', headerName: 'Nº Guia', width: 120 },
  { field: 'procedimento', headerName: 'Procedimento', flex: 1 },
  { field: 'data', headerName: 'Data', width: 120 },
  {
    field: 'valorGlosado',
    headerName: 'Valor Glosado',
    width: 150,
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
  { field: 'motivoGlosa', headerName: 'Motivo', width: 200 },
  {
    field: 'contestada',
    headerName: 'Status',
    width: 150,
    renderCell: ({ value }: { value: boolean }) => {
      return value ? (
        <Badge variant="warning">Contestada</Badge>
      ) : (
        <Badge variant="destructive">Não Contestada</Badge>
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Ações',
    width: 120,
    renderCell: ({ row }: { row: any }) => {
      return (
        <Button variant="outline" size="sm" disabled={row.contestada}>
          Contestar
        </Button>
      );
    },
  },
];

const GlosasPage = () => {
  const [glosas] = useState<any[]>(mockGlosas);

  return (
    <AuthenticatedLayout
      title="Glosas"
      description="Analise e conteste as glosas dos planos de saúde"
    >
      <div className="min-h-screen bg-gradient-to-br from-medical-50/30 via-brand-50/20 to-mint-50/30">
        <div className="space-y-12 px-4 sm:px-6 lg:px-8">
          {/* Header Humanizado seguindo padrão Dashboard */}
          <div className="text-center space-y-4 pt-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-medical-100 to-brand-100 border border-medical-200/50">
              <AlertCircle className="h-5 w-5 text-medical-700" />
              <span className="text-sm font-medium text-medical-800">
                Glosas & Contestações
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-medical-700 via-brand-600 to-trust-800 bg-clip-text text-transparent">
              Glosas & Contestações
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Defenda seus direitos! Conteste glosas indevidas e recupere valores de forma proativa.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4 flex items-center">
                <div className="bg-amber-500/10 p-2 rounded-full mr-4">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">
                    Existem 2 glosas não contestadas que podem ser recuperadas!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Conteste em até 30 dias para garantir a análise pelo convênio.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <AlertCircle className="w-5 h-5 text-primary mb-2" />
                    <h3 className="font-medium">Procedimentos Glosados</h3>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataGrid
                  rows={glosas}
                  columns={glosaColumns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  className="min-h-[500px]"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default GlosasPage;
