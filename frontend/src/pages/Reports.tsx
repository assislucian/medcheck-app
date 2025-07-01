import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusCardsSection } from '@/components/reports/StatusCardsSection';
import { OverviewCharts } from '@/components/reports/OverviewCharts';
import { HospitalsTable } from '@/components/reports/HospitalsTable';
import {
  fetchMonthlyData,
  fetchHospitalData,
  fetchReportsTotals,
} from '@/services/reports';
import {
  exportReportToExcel,
  exportToTissXML,
  exportToFHIR,
} from '@/services/exportService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  FileBarChart,
  Download,
  FileSpreadsheet,
  FileCode,
  Database,
  ClipboardList,
  Clock,
} from 'lucide-react';

const ReportsPage = () => {
  const [currentYear, setCurrentYear] = useState('2025');
  const [monthlyData, setMonthlyData] = useState([]);
  const [hospitalData, setHospitalData] = useState([]);
  const [reportTotals, setReportTotals] = useState({
    totalRecebido: 0,
    totalGlosado: 0,
    totalProcedimentos: 0,
    auditoriaPendente: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, [currentYear]);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      console.log('Loading reports data for year:', currentYear);

      // Run these in parallel for better performance
      const [monthData, hospData, totals] = await Promise.all([
        fetchMonthlyData(),
        fetchHospitalData(),
        fetchReportsTotals(),
      ]);

      console.log('Reports data loaded successfully');
      setMonthlyData(monthData);
      setHospitalData(hospData);
      setReportTotals(totals);
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      toast.error('Erro ao carregar dados', {
        description: 'Não foi possível carregar os dados dos relatórios.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: string) => {
    setCurrentYear(year);
  };

  const handleFilterPeriod = () => {
    toast.info('Função em desenvolvimento', {
      description: 'O filtro por período personalizado estará disponível em breve.',
    });
  };

  const handleExport = (format: 'excel' | 'tiss' | 'fhir' = 'excel') => {
    try {
      const reportData = {
        period: `Ano ${currentYear}`,
        summary: reportTotals,
        hospitalData: hospitalData,
        monthlyData: monthlyData,
        procedureData: [], // Será implementado na próxima versão
      };

      const filename = `relatorio-medcheck-${currentYear}`;

      switch (format) {
        case 'excel':
          exportReportToExcel(reportData, filename);
          toast.success('Relatório exportado em Excel', {
            description: 'O arquivo foi baixado para o seu computador.',
          });
          break;

        case 'tiss':
          exportToTissXML(hospitalData, `${filename}-tiss`);
          toast.success('Relatório exportado em formato TISS (XML)', {
            description: 'O arquivo XML foi baixado para o seu computador.',
          });
          break;

        case 'fhir':
          exportToFHIR(hospitalData, 'Organization', `${filename}-fhir`);
          toast.success('Relatório exportado em formato HL7 FHIR', {
            description: 'O arquivo JSON foi baixado para o seu computador.',
          });
          break;
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar', {
        description: 'Não foi possível exportar o relatório.',
      });
    }
  };

  return (
    <MainLayout
      title="Relatórios"
      isLoading={loading}
      loadingMessage="Carregando relatórios..."
    >
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
        <div className="px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-full border border-purple-200/60">
              <FileBarChart className="h-6 w-6 text-purple-700" />
              <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                Análises & Relatórios
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent leading-tight">
                Relatórios Médicos
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Visualize e exporte resumos detalhados de pagamentos e procedimentos.
                Análises inteligentes para tomada de decisão estratégica.
              </p>

              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      <Download className="h-5 w-5 mr-2" />
                      Exportar Relatórios
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exportar como Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('tiss')}>
                      <FileCode className="h-4 w-4 mr-2" />
                      Exportar como TISS (XML)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('fhir')}>
                      <Database className="h-4 w-4 mr-2" />
                      Exportar como HL7 FHIR
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <section className="space-y-8">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60 rounded-xl p-1">
                <Tabs defaultValue="overview" className="w-full min-w-[600px]">
                  <TabsList className="grid w-full grid-cols-3 bg-transparent">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all duration-300"
                    >
                      Visão Geral
                    </TabsTrigger>
                    <TabsTrigger
                      value="hospitals"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all duration-300"
                    >
                      Por Hospital
                    </TabsTrigger>
                    <TabsTrigger
                      value="procedures"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg font-semibold transition-all duration-300"
                    >
                      Por Procedimento
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-8 mt-8">
                    <OverviewCharts />
                  </TabsContent>

                  <TabsContent value="hospitals" className="mt-8">
                    <HospitalsTable />
                  </TabsContent>

                  <TabsContent value="procedures" className="mt-8">
                    <Card className="relative overflow-hidden border-0 shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                      <CardHeader className="relative">
                        <CardTitle className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                            <ClipboardList className="h-5 w-5 text-amber-700" />
                          </div>
                          Análise por Procedimento
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="text-center py-12 space-y-4">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 w-fit mx-auto">
                            <Clock className="h-8 w-8 text-amber-700" />
                          </div>
                          <p className="text-amber-700 font-medium text-lg">
                            Esta funcionalidade será disponibilizada em breve
                          </p>
                          <p className="text-amber-600">
                            Estamos trabalhando para trazer análises detalhadas por
                            procedimento
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
