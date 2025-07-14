import { useState, useEffect } from 'react';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  FileText,
  Download,
  Sparkles,
  Calculator,
  CheckCircle,
  Clock,
  Building,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';

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
      const response = await fetch('/api/v1/analytics', {
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

  const formatCurrency = (value: number) => {
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
      <AuthenticatedLayout
        title="Central de Inteligência CBHPM"
        description="Carregando insights inteligentes..."
        isLoading={true}
        loadingMessage="Processando dados com IA..."
      />
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout
        title="Central de Inteligência CBHPM"
        description="Erro ao carregar dados"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Erro ao Carregar Dados
          </h2>
          <p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
          <Button onClick={fetchAnalytics} className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout
      title="Central de Inteligência CBHPM"
      description="Análise inteligente para maximizar sua receita médica"
    >
      {/* Background com Gradiente Âmbar Suave */}
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
        <div className="px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* Header Premium Humanizado */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-full border border-purple-200/60">
              <Brain className="h-6 w-6 text-purple-700" />
              <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                Inteligência Artificial Médica
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent leading-tight">
                Central de Inteligência
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Análise avançada com IA para maximizar sua receita médica. Insights
                inteligentes, predições e recomendações personalizadas.
              </p>

              <div className="flex justify-center">
                <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-200 px-6 py-3 text-base font-semibold rounded-lg">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Premium AI
                </Badge>
              </div>
            </div>
          </div>

          {/* Cards de Resumo Premium */}
          {analyticsData?.summary && (
            <section className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                    <BarChart3 className="h-6 w-6 text-purple-700" />
                  </div>
                  Resumo Inteligente
                </h2>
                <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                  Análise completa dos seus dados médicos com insights gerados por
                  inteligência artificial.
                </p>
              </div>

              {/* Grid de Cards com Gradientes Premium */}
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {/* Card Total Recebido - Verde */}
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100">
                          <DollarSign className="h-7 w-7 text-emerald-700" />
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          Histórico
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                          Total Recebido
                        </p>
                        <p className="text-3xl font-bold text-emerald-800 leading-none">
                          {formatCurrency(
                            analyticsData.summary.total_recebido_historico
                          )}
                        </p>
                        <p className="text-sm text-emerald-600">
                          Valor total histórico recebido
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Glosas - Vermelho */}
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-rose-100">
                          <AlertTriangle className="h-7 w-7 text-red-700" />
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          Perdido
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                          Total Glosado
                        </p>
                        <p className="text-3xl font-bold text-red-800 leading-none">
                          {formatCurrency(
                            analyticsData.summary.total_glosado_historico
                          )}
                        </p>
                        <p className="text-sm text-red-600">
                          Valor total perdido em glosas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Taxa Recuperação - Azul */}
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-sky-600"></div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100">
                          <TrendingUp className="h-7 w-7 text-blue-700" />
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          Performance
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                          Taxa Recuperação
                        </p>
                        <p className="text-3xl font-bold text-blue-800 leading-none">
                          {formatPercentage(
                            analyticsData.summary.taxa_recuperacao_media
                          )}
                        </p>
                        <p className="text-sm text-blue-600">
                          Taxa média de recuperação
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Projeção - Âmbar */}
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                          <Target className="h-7 w-7 text-amber-700" />
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          Projeção
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                          Projeção Anual
                        </p>
                        <p className="text-3xl font-bold text-amber-800 leading-none">
                          {formatCurrency(analyticsData.summary.projecao_anual)}
                        </p>
                        <p className="text-sm text-amber-600">
                          Estimativa baseada em IA
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

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
                            {formatCurrency(
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
                              {formatCurrency(
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
                                    {formatCurrency(proc.recebido_total)}
                                  </p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3">
                                  <p className="text-sm text-red-600 font-medium">
                                    Glosas
                                  </p>
                                  <p className="font-bold text-red-700 text-lg">
                                    {formatCurrency(proc.glosado_total)}
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
                                      {formatCurrency(month.recebido)}
                                    </p>
                                  </div>
                                  <div className="bg-red-50 rounded-lg p-3">
                                    <p className="text-sm text-red-600 font-medium">
                                      Glosado
                                    </p>
                                    <p className="font-bold text-red-700">
                                      {formatCurrency(month.glosado)}
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
      </div>
    </AuthenticatedLayout>
  );
}
