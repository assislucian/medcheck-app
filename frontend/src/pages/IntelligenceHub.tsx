import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  FileText,
  RefreshCw,
  Stethoscope,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { InfoCard } from '../components/ui/InfoCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { usePageTitle } from '../hooks/usePageTitle';
import { SmartAlertsSystem } from '../components/intelligence/SmartAlertsSystem';

interface AnalyticsData {
  summary?: {
    total_recebido_historico: number;
    total_glosado_historico: number;
    taxa_recuperacao_media: number;
    projecao_anual: number;
    valor_medio_procedimento: number;
    total_procedimentos_historico: number;
    demonstrativos_processados: number;
  };
  temporal_analytics?: {
    monthly_performance: Array<{
      name: string;
      recebido: number;
      glosado: number;
      taxa_glosa: number;
      procedimentos: number;
    }>;
    melhor_mes?: {
      mes: string;
      recebido: number;
    };
  };
  performance_analytics?: {
    top_procedures: Array<{
      codigo: string;
      descricao: string;
      count: number;
      recebido_total: number;
      glosado_total: number;
    }>;
  };
  alerts?: Array<{
    type: string;
    title: string;
    message: string;
    action: string;
  }>;
  recommendations?: Array<{
    type: string;
    title: string;
    description: string;
    impact: string;
    action: string;
  }>;
}

export default function IntelligenceHub() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // SEO e Título Premium
  usePageTitle({
    title: 'Central de Inteligência',
    description: 'Insights inteligentes e análises avançadas dos seus dados médicos com IA',
    keywords: 'inteligência artificial médica, analytics médicos, insights, análise dados médicos, IA saúde'
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      console.log('Fazendo fetch para /api/v1/analytics...');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/analytics`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Analytics data received:', data);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro ao carregar dados de inteligência: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyLocal = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Central de Inteligência | MedCheck</title>
          <meta name="description" content="Insights inteligentes e análises avançadas dos seus dados médicos com IA" />
        </Helmet>

        {/* Background com Gradiente Médico */}
        <div className="min-h-screen bg-gradient-to-br from-medical-50/30 via-brand-50/20 to-mint-50/30">
          <AuthenticatedLayout
            title="Central de Inteligência"
            description="Processando insights com IA..."
            isLoading={true}
            loadingMessage="Analisando seus dados com inteligência artificial..."
          />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Central de Inteligência | MedCheck</title>
          <meta name="description" content="Insights inteligentes e análises avançadas dos seus dados médicos com IA" />
        </Helmet>

        {/* Background com Gradiente Médico */}
        <div className="min-h-screen bg-gradient-to-br from-medical-50/30 via-brand-50/20 to-mint-50/30">
          <AuthenticatedLayout
            title="Central de Inteligência"
            description="Erro ao carregar dados"
          >
            <div className="space-y-12 px-4 sm:px-6 lg:px-8">
              <Card className="bg-white/80 backdrop-blur-sm border-red-200/60 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Erro ao carregar análises
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {error}
                  </p>
                  <Button onClick={fetchAnalytics} className="bg-medical-600 hover:bg-medical-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            </div>
          </AuthenticatedLayout>
        </div>
      </>
    );
  }

  const summary = analyticsData?.summary;
  const taxaRecuperacao = summary ? (summary.total_recebido_historico / (summary.total_recebido_historico + summary.total_glosado_historico)) * 100 : 0;

  return (
    <>
      <Helmet>
        <title>Central de Inteligência | MedCheck</title>
        <meta name="description" content="Insights inteligentes e análises avançadas dos seus dados médicos com IA" />
        <meta name="keywords" content="inteligência artificial médica, analytics médicos, insights, análise dados médicos, IA saúde" />

        {/* Open Graph */}
        <meta property="og:title" content="Central de Inteligência | MedCheck" />
        <meta property="og:description" content="IA avançada para análise de dados médicos" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Background com Gradiente Médico */}
      <div className="min-h-screen bg-gradient-to-br from-medical-50/30 via-brand-50/20 to-mint-50/30">
        <AuthenticatedLayout
          title="Central de Inteligência"
          description="Insights avançados e análises inteligentes dos seus dados médicos"
        >
          <div className="space-y-12 px-4 sm:px-6 lg:px-8">
            {/* Header Elegante com Badge */}
            <div className="text-center space-y-4 pt-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-medical-100 to-brand-100 border border-medical-200/50">
                <Brain className="h-5 w-5 text-medical-700" />
                <span className="text-sm font-medium text-medical-800">
                  Powered by Inteligência Artificial
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-medical-700 via-brand-600 to-trust-800 bg-clip-text text-transparent">
                Central de Inteligência
              </h1>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Transforme seus dados médicos em insights acionáveis com análises avançadas e inteligência artificial
              </p>
            </div>

            {/* Sistema de Alertas Inteligentes */}
            <SmartAlertsSystem />

            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InfoCard
                title="Valor Total Processado"
                value={formatCurrencyLocal(summary?.total_recebido_historico || 0)}
                subtitle="em demonstrativos históricos"
                icon={<DollarSign className="h-5 w-5 text-trust-600" />}
                trend={{ value: 0, isPositive: true }}
                className="bg-gradient-to-br from-trust-50 to-trust-100 border-trust-200"
              />

              <InfoCard
                title="Taxa de Recuperação"
                value={`${taxaRecuperacao.toFixed(1)}%`}
                subtitle="dos valores apresentados"
                icon={<TrendingUp className="h-5 w-5 text-medical-600" />}
                trend={{ value: 0, isPositive: true }}
                className="bg-gradient-to-br from-medical-50 to-medical-100 border-medical-200"
              />

              <InfoCard
                title="Procedimentos Analisados"
                value={<AnimatedNumber value={summary?.total_procedimentos_historico || 0} />}
                subtitle="com IA avançada"
                icon={<Activity className="h-5 w-5 text-brand-600" />}
                trend={{ value: 0, isPositive: true }}
                className="bg-gradient-to-br from-brand-50 to-brand-100 border-brand-200"
              />

              <InfoCard
                title="Projeção Anual"
                value={formatCurrencyLocal(summary?.projecao_anual || 0)}
                subtitle="baseada em IA"
                icon={<Target className="h-5 w-5 text-mint-600" />}
                trend={{ value: 0, isPositive: true }}
                className="bg-gradient-to-br from-mint-50 to-mint-100 border-mint-200"
              />
            </div>

            {/* Seção Principal com Tabs Premium */}
            <section className="space-y-8">
              {/* Alertas Críticos CBHPM */}
              {analyticsData?.alerts && analyticsData.alerts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Alertas Críticos CBHPM
                  </h2>
                  <div className="grid gap-4">
                    {analyticsData.alerts.map((alert, index) => (
                      <Card
                        key={index}
                        className="border-l-4 border-l-red-500 bg-white shadow-sm"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-red-700 dark:text-red-400">
                                {alert.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {alert.message}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-4 border-red-200 text-red-600 hover:bg-red-50"
                            >
                              {alert.action}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs de Análise Inteligente */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 shadow-sm">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-blue-200"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="procedures"
                    className="flex items-center gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 data-[state=active]:border-emerald-200"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Procedimentos
                  </TabsTrigger>
                  <TabsTrigger
                    value="hospitals"
                    className="flex items-center gap-2 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-600 data-[state=active]:border-cyan-200"
                  >
                    <Building className="h-4 w-4" />
                    Hospitais
                  </TabsTrigger>
                  <TabsTrigger
                    value="temporal"
                    className="flex items-center gap-2 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600 data-[state=active]:border-teal-200"
                  >
                    <Clock className="h-4 w-4" />
                    Temporal
                  </TabsTrigger>
                  <TabsTrigger
                    value="insights"
                    className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-blue-200"
                  >
                    <Zap className="h-4 w-4" />
                    Insights IA
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab - Principais Insights */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Melhor Performance Mensal */}
                    {analyticsData?.temporal_analytics?.melhor_mes && (
                      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-emerald-700">
                            <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                            Melhor Mês CBHPM
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-2xl font-bold text-emerald-700">
                              {analyticsData.temporal_analytics.melhor_mes.mes}
                            </p>
                            <p className="text-gray-700 font-medium">
                              Receita:{' '}
                              {formatCurrencyLocal(
                                analyticsData.temporal_analytics.melhor_mes.recebido
                              )}
                            </p>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              Melhor Performance
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Resumo Geral */}
                    {analyticsData?.summary && (
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-blue-700">
                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Target className="h-4 w-4 text-blue-600" />
                            </div>
                            Resumo Geral
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600 font-medium">Procedimentos</p>
                                <p className="text-lg font-bold text-blue-700">
                                  {analyticsData.summary.total_procedimentos_historico}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 font-medium">
                                  Demonstrativos
                                </p>
                                <p className="text-lg font-bold text-blue-700">
                                  {analyticsData.summary.demonstrativos_processados}
                                </p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-blue-100">
                              <p className="text-2xl font-bold text-blue-700">
                                {formatCurrencyLocal(
                                  analyticsData.summary.total_recebido_historico
                                )}
                              </p>
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 mt-2">
                                Taxa Sucesso:{' '}
                                {formatPercentage(
                                  analyticsData.summary.taxa_recuperacao_media
                                )}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Status Card */}
                    <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-teal-700">
                          <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-teal-600" />
                          </div>
                          Status do Sistema
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="font-semibold text-teal-700">
                            Sistema Operacional
                          </p>
                          <p className="text-gray-600 text-sm">
                            Análise em tempo real ativa
                          </p>
                          <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                            <div className="h-2 w-2 bg-teal-500 rounded-full mr-2 animate-pulse"></div>
                            Conectado
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resumo Executivo CBHPM */}
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-800">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Brain className="h-4 w-4 text-blue-600" />
                        </div>
                        Resumo Executivo CBHPM
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg text-emerald-700">
                            Oportunidades Identificadas
                          </h3>
                          <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                              <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                              </div>
                              <span className="text-gray-700">
                                Procedimentos com alta margem de lucro
                              </span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                              </div>
                              <span className="text-gray-700">
                                Hospitais com baixa taxa de glosa
                              </span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                              </div>
                              <span className="text-gray-700">
                                Períodos de maior eficiência
                              </span>
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg text-blue-700">
                            Pontos de Atenção
                          </h3>
                          <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="text-gray-700">
                                Procedimentos com alta taxa de glosa
                              </span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="text-gray-700">
                                Hospitais com pagamento lento
                              </span>
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="text-gray-700">
                                Valores abaixo da tabela CBHPM
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Procedimentos Tab */}
                <TabsContent value="procedures" className="space-y-6">
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-emerald-700 flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        Análise Detalhada por Procedimento CBHPM
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsData?.performance_analytics?.top_procedures &&
                        analyticsData.performance_analytics.top_procedures.length > 0 ? (
                        <div className="space-y-4">
                          {analyticsData.performance_analytics.top_procedures.map(
                            (proc, index) => (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h3 className="font-semibold text-lg text-blue-700">
                                      {proc.codigo}
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                      {proc.descricao}
                                    </p>
                                  </div>
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    {proc.count} execuções
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                  <div className="bg-emerald-50 rounded-lg p-3">
                                    <p className="text-sm text-emerald-600 font-medium">
                                      Receita Total
                                    </p>
                                    <p className="font-bold text-emerald-700 text-lg">
                                      {formatCurrencyLocal(proc.recebido_total)}
                                    </p>
                                  </div>
                                  <div className="bg-red-50 rounded-lg p-3">
                                    <p className="text-sm text-red-600 font-medium">
                                      Glosas
                                    </p>
                                    <p className="font-bold text-red-700 text-lg">
                                      {formatCurrencyLocal(proc.glosado_total)}
                                    </p>
                                  </div>
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-sm text-blue-600 font-medium">
                                      Taxa de Sucesso
                                    </p>
                                    <p className="font-bold text-blue-700 text-lg">
                                      {formatPercentage(
                                        (proc.recebido_total /
                                          (proc.recebido_total + proc.glosado_total)) *
                                        100
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Stethoscope className="h-8 w-8 text-emerald-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Nenhum Procedimento Analisado
                          </h3>
                          <p className="text-gray-500">
                            Faça upload de guias médicas para ver análises detalhadas dos
                            procedimentos CBHPM
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Outras tabs simplificadas */}
                <TabsContent value="hospitals">
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-cyan-700 flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Performance por Hospital
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <div className="h-16 w-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Building className="h-8 w-8 text-cyan-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          Análise de Hospitais
                        </h3>
                        <p className="text-gray-500">
                          Dados de performance por hospital serão exibidos aqui
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="temporal">
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-teal-700 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Evolução Temporal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsData?.temporal_analytics?.monthly_performance &&
                        analyticsData.temporal_analytics.monthly_performance.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800">
                            Performance Mensal
                          </h3>
                          <div className="grid gap-4">
                            {analyticsData.temporal_analytics.monthly_performance.map(
                              (month, index) => (
                                <div
                                  key={index}
                                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                                >
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-semibold text-gray-800">
                                      {month.name}
                                    </h4>
                                    <Badge className="bg-teal-50 text-teal-700 border-teal-200">
                                      {month.procedimentos} procedimentos
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-emerald-50 rounded-lg p-3">
                                      <p className="text-sm text-emerald-600 font-medium">
                                        Recebido
                                      </p>
                                      <p className="font-bold text-emerald-700">
                                        {formatCurrencyLocal(month.recebido)}
                                      </p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3">
                                      <p className="text-sm text-red-600 font-medium">
                                        Glosado
                                      </p>
                                      <p className="font-bold text-red-700">
                                        {formatCurrencyLocal(month.glosado)}
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3">
                                      <p className="text-sm text-blue-600 font-medium">
                                        Taxa Glosa
                                      </p>
                                      <p className="font-bold text-blue-700">
                                        {formatPercentage(month.taxa_glosa)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-8 w-8 text-teal-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Análise Temporal
                          </h3>
                          <p className="text-gray-500">
                            Evolução dos dados ao longo do tempo será exibida aqui
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="insights">
                  <div className="space-y-6">
                    {analyticsData?.recommendations &&
                      analyticsData.recommendations.length > 0 ? (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Zap className="h-4 w-4 text-blue-600" />
                          </div>
                          Recomendações Inteligentes CBHPM
                        </h2>

                        {analyticsData.recommendations.map((rec, index) => (
                          <Card
                            key={index}
                            className="border-l-4 border-l-blue-500 bg-white shadow-sm"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-blue-700 mb-2">
                                    {rec.title}
                                  </h3>
                                  <p className="text-gray-600 mb-3">{rec.description}</p>
                                  <div className="flex items-center gap-4">
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                      Impacto: {rec.impact}
                                    </Badge>
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                      {rec.type}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  {rec.action}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-white border-gray-200 shadow-sm">
                        <CardContent className="p-12 text-center">
                          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Brain className="h-10 w-10 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            IA Analisando Dados CBHPM
                          </h3>
                          <p className="text-gray-600 mb-8">
                            Carregue mais demonstrativos e guias para receber insights
                            personalizados baseados na tabela CBHPM
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                            <div className="text-center">
                              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <p className="text-sm text-gray-700 font-medium">
                                Upload de Demonstrativos
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Stethoscope className="h-6 w-6 text-emerald-600" />
                              </div>
                              <p className="text-sm text-gray-700 font-medium">
                                Análise de Guias
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Brain className="h-6 w-6 text-cyan-600" />
                              </div>
                              <p className="text-sm text-gray-700 font-medium">
                                Insights com IA
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={fetchAnalytics}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Activity className="h-4 w-4" />
                  Atualizar Análise
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <Download className="h-4 w-4" />
                  Exportar Relatório CBHPM
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <FileText className="h-4 w-4" />
                  Gerar PDF Executivo
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                >
                  <Target className="h-4 w-4" />
                  Plano de Ação
                </Button>
              </div>
            </section>
          </div>
        </AuthenticatedLayout>
      </div>
    </>
  );
};
