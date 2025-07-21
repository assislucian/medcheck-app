import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import {
  FileBarChart,
  Download,
  DollarSign,
  FileText,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Clock,
  Building,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  Database,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatPercentage } from '@/utils/format';
import axios from 'axios';
import { SkeletonInfoCard, SkeletonDashboard } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoCard } from '@/components/ui/InfoCard';

interface ReportsData {
  summary: {
    total_procedures: number;
    paid_procedures: number;
    unpaid_procedures: number;
    payment_rate: number;
    total_value: number;
    paid_value: number;
    glossed_value: number;
  };
  paid_procedures: Array<{
    guia: string;
    codigo: string;
    descricao: string;
    periodo: string;
    financial: {
      presented_value: number;
      approved_value: number;
      glosa: number;
    };
    participacoes: Array<{
      papel: string;
      valor_cbhpm: number;
    }>;
  }>;
  unpaid_procedures: Array<{
    numero_guia: string;
    codigo: string;
    descricao: string;
    papel: string;
    valor_estimado: number;
    motivo: string;
  }>;
}

interface GuideAnalytics {
  payment_analytics: {
    total_demonstrativos: number;
    total_paid_procedures: number;
    total_glosa_procedures: number;
    total_partial_payments: number;
    total_glosa_value: number;
    total_paid_value: number;
    crosscheck_coverage: number;
  };
}

const ReportsPage = () => {
  usePageTitle({
    title: 'Relatórios Financeiros',
    description:
      'Análise completa de procedimentos, pagamentos e glosas com base nos dados reais processados',
    keywords:
      'relatórios médicos, análise financeira, procedimentos pagos, glosas, demonstrativos',
  });

  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [guideAnalytics, setGuideAnalytics] = useState<GuideAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Carregar dados dos relatórios
      const [reportsResponse, guidesResponse] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/reports/generate?format=json`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/guias?page=1&pageSize=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setReportsData(reportsResponse.data);
      setGuideAnalytics(guidesResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      toast.error('Erro ao carregar dados dos relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/reports/generate?format=excel`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_medcheck_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout
        title="Relatórios Financeiros"
        description="Carregando análise completa de procedimentos e pagamentos..."
        isLoading={true}
        loadingMessage="Processando dados financeiros..."
      >
        <SkeletonDashboard />
      </AuthenticatedLayout>
    );
  }

  if (!reportsData?.summary) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Relatórios Financeiros
              </h1>
              <p className="text-muted-foreground">
                Nenhum dado disponível. Faça upload de guias e demonstrativos primeiro.
              </p>
            </div>
            <Button onClick={loadReportsData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Dados Insuficientes
              </h3>
              <p className="text-yellow-700 mb-4">
                Para gerar relatórios, é necessário ter guias e demonstrativos
                processados.
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild variant="outline">
                  <a href="/guides?tab=upload">Upload de Guias</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/demonstratives?tab=upload">Upload de Demonstrativos</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  const summary = reportsData.summary;
  const analytics = guideAnalytics?.payment_analytics;

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-medical-50/30 via-brand-50/20 to-mint-50/30">
        <div className="space-y-12 px-4 sm:px-6 lg:px-8">
          {/* Header Humanizado seguindo padrão Dashboard */}
          <div className="text-center space-y-4 pt-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-medical-100 to-brand-100 border border-medical-200/50">
              <BarChart3 className="h-5 w-5 text-medical-700" />
              <span className="text-sm font-medium text-medical-800">
                Análise financeira detalhada
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-medical-700 via-brand-600 to-trust-800 bg-clip-text text-transparent">
              Relatórios Financeiros
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Análise completa de procedimentos, pagamentos e glosas com base nos dados reais processados.
            </p>
          </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Relatórios Financeiros
            </h1>
            <p className="text-muted-foreground">
              Análise detalhada baseada nos seus dados processados
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={loadReportsData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              onClick={handleExportExcel}
              disabled={exportLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {exportLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={<FileText className="h-6 w-6" />}
            title="Total de Procedimentos"
            value={summary.total_procedures.toLocaleString('pt-BR')}
            description="Procedimentos nas guias cadastradas"
            variant="info"
          />

          <InfoCard
            icon={<CheckCircle className="h-6 w-6" />}
            title="Procedimentos Pagos"
            value={summary.paid_procedures.toLocaleString('pt-BR')}
            description={`${formatPercentage(summary.payment_rate)} da base total`}
            variant="success"
            trend={
              summary.payment_rate > 80
                ? { direction: 'up', percentage: 'Excelente' }
                : undefined
            }
          />

          <InfoCard
            icon={<XCircle className="h-6 w-6" />}
            title="Procedimentos Não Pagos"
            value={summary.unpaid_procedures.toLocaleString('pt-BR')}
            description="Aguardando demonstrativo ou glosados"
            variant="destructive"
          />

          <InfoCard
            icon={<DollarSign className="h-6 w-6" />}
            title="Valor Total Recebido"
            value={formatCurrency(summary.paid_value)}
            description="Soma dos valores aprovados"
            variant="success"
          />
        </div>

        {/* Análise de Pagamentos */}
        {analytics && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Cobertura de Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Procedimentos Analisados</span>
                      <span>{formatPercentage(analytics.crosscheck_coverage)}</span>
                    </div>
                    <Progress value={analytics.crosscheck_coverage} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Baseado em {analytics.total_demonstrativos} demonstrativo(s)
                    carregado(s)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Glosas Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {analytics.total_glosa_procedures}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Procedimentos com glosa total
                    </p>
                  </div>
                  <div>
                    <div className="text-lg font-medium">
                      {formatCurrency(analytics.total_glosa_value)}
                    </div>
                    <p className="text-sm text-muted-foreground">Valor total glosado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Pagamentos Parciais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {analytics.total_partial_payments}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Procedimentos pagos parcialmente
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Oportunidade de contestação
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs com Detalhes */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="paid">Procedimentos Pagos</TabsTrigger>
            <TabsTrigger value="unpaid">Não Pagos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Valor Total Apresentado:</span>
                    <span className="font-medium">
                      {formatCurrency(summary.total_value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor Total Aprovado:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(summary.paid_value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor Total Glosado:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(summary.glossed_value)}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Taxa de Aprovação:</span>
                    <span
                      className={
                        summary.payment_rate > 80 ? 'text-green-600' : 'text-yellow-600'
                      }
                    >
                      {formatPercentage(summary.payment_rate)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Pagos</span>
                      </div>
                      <span className="text-sm font-medium">
                        {summary.paid_procedures}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Não Pagos</span>
                      </div>
                      <span className="text-sm font-medium">
                        {summary.unpaid_procedures}
                      </span>
                    </div>
                    {analytics && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span className="text-sm">Glosas</span>
                          </div>
                          <span className="text-sm font-medium">
                            {analytics.total_glosa_procedures}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm">Parciais</span>
                          </div>
                          <span className="text-sm font-medium">
                            {analytics.total_partial_payments}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Procedimentos Pagos ({reportsData.paid_procedures?.length || 0})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Procedimentos que constam nos demonstrativos com pagamento aprovado
                </p>
              </CardHeader>
              <CardContent>
                {reportsData.paid_procedures?.length > 0 ? (
                  <div className="space-y-4">
                    {reportsData.paid_procedures.slice(0, 10).map((proc, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              Guia {proc.guia} - {proc.codigo}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {proc.descricao}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Período: {proc.periodo}
                            </div>
                          </div>
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800"
                          >
                            Pago
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Apresentado:</span>
                            <div className="font-medium">
                              {formatCurrency(proc.financial.presented_value)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Aprovado:</span>
                            <div className="font-medium text-green-600">
                              {formatCurrency(proc.financial.approved_value)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Glosa:</span>
                            <div className="font-medium text-red-600">
                              {formatCurrency(proc.financial.glosa)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {reportsData.paid_procedures.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Mostrando 10 de {reportsData.paid_procedures.length}{' '}
                        procedimentos. Exporte para Excel para ver todos.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum procedimento pago encontrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unpaid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Procedimentos Não Pagos ({reportsData.unpaid_procedures?.length || 0})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Procedimentos que não constam nos demonstrativos ou foram glosados
                </p>
              </CardHeader>
              <CardContent>
                {reportsData.unpaid_procedures?.length > 0 ? (
                  <div className="space-y-4">
                    {reportsData.unpaid_procedures.slice(0, 10).map((proc, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              Guia {proc.numero_guia} - {proc.codigo}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {proc.descricao}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Papel: {proc.papel}
                            </div>
                          </div>
                          <Badge variant="destructive">Não Pago</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Valor Estimado:{' '}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(proc.valor_estimado)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {proc.motivo}
                          </div>
                        </div>
                      </div>
                    ))}
                    {reportsData.unpaid_procedures.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Mostrando 10 de {reportsData.unpaid_procedures.length}{' '}
                        procedimentos. Exporte para Excel para ver todos.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum procedimento não pago encontrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ReportsPage;
