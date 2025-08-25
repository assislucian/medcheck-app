/**
 * Página de Relatórios Inteligentes
 * =================================
 *
 * Central de relatórios financeiros focada nas principais dores dos médicos:
 * - Análise de rentabilidade vs CBHPM
 * - Controle de glosas e contestações
 * - Fluxo de caixa e previsibilidade
 * - Performance por convênio
 * - Auditoria de procedimentos não pagos
 * - Indicadores contábeis para gestão
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import {
  BarChart3,
  Download,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  PieChart,
  Target,
  Clock,
  Building,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Calculator,
  CreditCard,
  Receipt,
  Banknote,
  Coins,
  ChartBar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  Eye,
  ArrowUpDown,
  Filter,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatPercentage } from '../utils/format';
import axios from 'axios';
import { usePageTitle } from '../hooks/usePageTitle';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { InfoCard } from '../components/ui/InfoCard';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// Interfaces para tipagem dos dados
interface DemonstrativoData {
  id: number;
  periodo: string;
  total_presented: number;
  total_approved: number;
  total_glosa: number;
  upload_time: string;
}

interface GuideData {
  numero_guia: string;
  codigo: string;
  descricao: string;
  data: string;
  smart_status: string;
  participacao: string;
  cbhpm_value?: number;
  paid_value?: number;
}

interface UnpaidProcedure {
  numero_guia: string;
  codigo: string;
  descricao: string;
  papel: string;
  data: string;
  dias_vencido: number;
  valor_estimado: number;
  urgencia: 'baixa' | 'media' | 'alta' | 'critica';
  motivo: string;
}

interface ReportData {
  demonstrativos: DemonstrativoData[];
  procedures: GuideData[];
  unpaid_procedures: UnpaidProcedure[];
  analytics: {
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
    title: 'Central de Relatórios Inteligentes',
    description:
      'Análise financeira completa focada na gestão de honorários e auditoria médica',
    keywords:
      'relatórios médicos, CBHPM, glosas, fluxo de caixa, auditoria, contabilidade médica',
  });

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rentabilidade');
  const [filterPeriod, setFilterPeriod] = useState('last_3_months');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataIntegrity, setDataIntegrity] = useState(null);

  useEffect(() => {
    loadReportData();
    checkDataIntegrity();
  }, [filterPeriod]);

  const checkDataIntegrity = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/reports/data-integrity`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDataIntegrity(response.data);
    } catch (error) {
      console.warn('Erro ao verificar integridade dos dados:', error);
    }
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Tentar usar o endpoint consolidado primeiro, com fallback para múltiplas chamadas
      try {
        console.log('🔄 Carregando dados do dashboard de relatórios...');
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/reports/dashboard`, 
          { headers }
        );

        if (response.data) {
          console.log('✅ Dados carregados do endpoint consolidado');
          setData({
            demonstrativos: Array.isArray(response.data.demonstrativos) ? response.data.demonstrativos : [],
            procedures: Array.isArray(response.data.procedures) ? response.data.procedures : [],
            unpaid_procedures: Array.isArray(response.data.unpaid_procedures) ? response.data.unpaid_procedures : [],
            analytics: response.data.analytics || {
              total_demonstrativos: 0,
              total_paid_procedures: 0,
              total_glosa_procedures: 0,
              total_partial_payments: 0,
              total_glosa_value: 0,
              total_paid_value: 0,
              crosscheck_coverage: 0,
            },
          });
          return;
        }
      } catch (consolidatedError) {
        console.warn('⚠️ Endpoint consolidado falhou, usando endpoints individuais:', consolidatedError.message);
      }

      // Fallback: Carregar dados em paralelo dos endpoints existentes
      const [demonstrativosRes, guidesRes, unpaidRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/demonstrativos`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/guias?page=1&pageSize=1000`, {
          headers,
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/unpaid-procedures`, {
          headers,
        }),
      ]);

      console.log('✅ Dados carregados via endpoints individuais');

      // O endpoint /api/v1/demonstrativos retorna uma lista direta, não um objeto
      const demonstrativosList = Array.isArray(demonstrativosRes.data)
        ? demonstrativosRes.data
        : [];

      // Verificações defensivas para os outros endpoints
      const guidesProcedures = Array.isArray(guidesRes.data?.procedures)
        ? guidesRes.data.procedures
        : [];

      const unpaidList = Array.isArray(unpaidRes.data?.unpaid_list)
        ? unpaidRes.data.unpaid_list
        : Array.isArray(unpaidRes.data)
          ? unpaidRes.data
          : [];

      setData({
        demonstrativos: demonstrativosList,
        procedures: guidesProcedures,
        unpaid_procedures: unpaidList,
        analytics: guidesRes.data?.payment_analytics || {
          total_demonstrativos: 0,
          total_paid_procedures: 0,
          total_glosa_procedures: 0,
          total_partial_payments: 0,
          total_glosa_value: 0,
          total_paid_value: 0,
          crosscheck_coverage: 0,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao carregar dados dos relatórios:', error);
      toast.error('Erro ao carregar dados dos relatórios');
      
      // Set dados vazios em caso de erro total
      setData({
        demonstrativos: [],
        procedures: [],
        unpaid_procedures: [],
        analytics: {
          total_demonstrativos: 0,
          total_paid_procedures: 0,
          total_glosa_procedures: 0,
          total_partial_payments: 0,
          total_glosa_value: 0,
          total_paid_value: 0,
          crosscheck_coverage: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/reports/export?format=excel`,
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
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Cálculos para análise de rentabilidade usando dados reais do backend
  const calculateRentabilityMetrics = () => {
    if (!data?.analytics) return null;

    // Usar dados calculados no backend com dados reais das guias/demonstrativos
    const analytics = data.analytics;
    
    const totalCBHPM = analytics.total_cbhpm_value || 0;
    const totalPaid = analytics.total_paid_value || 0;
    const totalGlosa = analytics.total_glosa_value || 0;
    const paymentEfficiency = analytics.payment_efficiency || 0;
    const potencialRecuperacao = analytics.potencial_recuperacao || 0;

    return {
      totalCBHPM,
      totalPaid,
      totalGlosa,
      eficienciaPagamento: paymentEfficiency,
      perdasGlosas: totalCBHPM > 0 ? (totalGlosa / totalCBHPM) * 100 : 0,
      margemRealizada: totalPaid - totalGlosa,
      procedimentosPagos: analytics.total_paid_procedures || 0,
      procedimentosGlosados: analytics.total_glosa_procedures || 0,
      procedimentosComCBHPM: analytics.procedimentos_com_cbhpm || 0,
      potencialRecuperacao,
      valorEmRisco: analytics.valor_em_risco || 0,
      tempoMedioRecebimento: analytics.tempo_medio_recebimento_dias || 0,
    };
  };

  // Análise de fluxo de caixa
  const calculateCashFlowMetrics = () => {
    if (!data?.demonstrativos || !Array.isArray(data.demonstrativos)) return null;

    const last3Months = [...data.demonstrativos]
      .sort(
        (a, b) => new Date(b.upload_time).getTime() - new Date(a.upload_time).getTime()
      )
      .slice(0, 3);

    const mediaRecebimento =
      last3Months.reduce((sum, demo) => sum + (demo.total_approved || 0), 0) /
      (last3Months.length || 1);

    const pendentesValor = Array.isArray(data.unpaid_procedures)
      ? data.unpaid_procedures.reduce(
          (sum, proc) => sum + (proc.valor_estimado || 0),
          0
        )
      : 0;

    const previsaoProximoMes = mediaRecebimento * 1.1; // Estimativa conservadora

    return {
      mediaRecebimento,
      pendentesValor,
      previsaoProximoMes,
      tendencia:
        last3Months.length > 1
          ? (last3Months[0]?.total_approved || 0) -
            (last3Months[1]?.total_approved || 0)
          : 0,
    };
  };

  // Análise de urgência dos procedimentos não pagos usando dados calculados no backend
  const categorizeUnpaidByUrgency = () => {
    if (!data?.analytics?.urgency_breakdown) {
      return { critica: 0, alta: 0, media: 0, baixa: 0 };
    }

    // Usar dados já calculados no backend com lógica médica específica
    return data.analytics.urgency_breakdown;
  };

  // Análise de insights médicos específicos
  const getMedicalInsights = () => {
    if (!data?.medical_insights) return null;

    const insights = data.medical_insights;
    return {
      contestationAlerts: insights.contestation_deadline_alerts || [],
      topGlosaProcedures: insights.top_glosa_procedures || [],
      paymentTrends: insights.payment_trends || {},
      hasUrgentContestation: (insights.contestation_deadline_alerts || []).length > 0,
      avgMonthlyRevenue: insights.payment_trends?.last_3_months_avg || 0,
      efficiencyTrend: insights.payment_trends?.efficiency_trend || 'stable'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-cyan-50/30">
        <AuthenticatedLayout
          title="Central de Relatórios"
          description="Carregando análise financeira..."
          isLoading={true}
          loadingMessage="Processando dados financeiros..."
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-cyan-50/30">
        <AuthenticatedLayout
          title="Central de Relatórios"
          description="Análise financeira completa de honorários médicos"
        >
          <div className="space-y-12 px-4 sm:px-6 lg:px-8 max-w-full overflow-hidden">
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Dados Insuficientes para Análise
              </h2>
              <p className="text-gray-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                Para gerar relatórios inteligentes, é necessário ter guias e
                demonstrativos processados.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <a href="/guides">Gerenciar Guias</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/demonstratives">Gerenciar Demonstrativos</a>
                </Button>
              </div>
            </div>
          </div>
        </AuthenticatedLayout>
      </div>
    );
  }

  const rentabilityMetrics = calculateRentabilityMetrics();
  const cashFlowMetrics = calculateCashFlowMetrics();
  const urgencyBreakdown = categorizeUnpaidByUrgency();
  const medicalInsights = getMedicalInsights();

  return (
    <>
      {/* Background com Gradiente Padrão MedCheck */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-cyan-50/30">
        <AuthenticatedLayout
          title="Central de Relatórios"
          description="Análise financeira completa de honorários médicos"
        >
          <div className="space-y-12 px-4 sm:px-6 lg:px-8 max-w-full overflow-hidden">
            {/* Header Discreto Seguindo Padrão Dashboard */}
            <section className="text-center space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200/50">
                <BarChart3 className="h-4 w-4 text-blue-700" />
                <span className="text-xs font-medium text-blue-800">
                  Central de inteligência financeira
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-800 bg-clip-text text-transparent">
                Central de Relatórios Inteligentes
              </h1>

              <p className="text-sm text-gray-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Análise financeira completa focada na gestão de honorários médicos
                com indicadores de rentabilidade e auditoria
              </p>
            </section>

            {/* Seção de Filtros e Ações */}
            <section className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_month">Último mês</SelectItem>
                    <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                    <SelectItem value="last_6_months">Últimos 6 meses</SelectItem>
                    <SelectItem value="last_year">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={loadReportData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button onClick={exportToExcel} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </section>

            {/* Dashboard de Indicadores Principais - Focados nas Dores Médicas */}
            <section className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={<Calculator className="h-6 w-6" />}
            title="Eficiência CBHPM"
            value={formatPercentage(rentabilityMetrics?.eficienciaPagamento || 0)}
            description={`${rentabilityMetrics?.procedimentosComCBHPM || 0} procedimentos analisados`}
            variant={
              (rentabilityMetrics?.eficienciaPagamento || 0) > 85
                ? 'success'
                : (rentabilityMetrics?.eficienciaPagamento || 0) > 75
                  ? 'warning'
                  : 'destructive'
            }
          />

          <InfoCard
            icon={<AlertTriangle className="h-6 w-6" />}
            title="Valor em Glosa"
            value={formatCurrency(rentabilityMetrics?.totalGlosa || 0)}
            description={`Recuperável: ${formatCurrency(rentabilityMetrics?.potencialRecuperacao || 0)}`}
            variant="destructive"
            trend={
              (rentabilityMetrics?.potencialRecuperacao || 0) > 1000
                ? { direction: 'up', percentage: 'Alto potencial' }
                : { direction: 'down', percentage: 'Baixo potencial' }
            }
          />

          <InfoCard
            icon={<Clock className="h-6 w-6" />}
            title="Contestação Urgente"
            value={urgencyBreakdown.critica + urgencyBreakdown.alta}
            description={`${urgencyBreakdown.critica} críticos (>90 dias)`}
            variant="destructive"
          />

          <InfoCard
            icon={<Banknote className="h-6 w-6" />}
            title="Valor em Risco"
            value={formatCurrency(rentabilityMetrics?.valorEmRisco || 0)}
            description={`${data?.unpaid_procedures?.length || 0} procedimentos pendentes`}
            variant={
              (rentabilityMetrics?.valorEmRisco || 0) > 10000 
                ? 'destructive' 
                : (rentabilityMetrics?.valorEmRisco || 0) > 5000 
                  ? 'warning' 
                  : 'success'
            }
          />
            </section>

            {/* Alertas Médicos Críticos */}
            {medicalInsights?.hasUrgentContestation && (
              <section className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      ⚠️ Ação Urgente Necessária - Prazo de Contestação
                    </h3>
                    <p className="text-red-800 mb-4">
                      {medicalInsights.contestationAlerts.length} procedimentos estão próximos ou passaram do prazo de contestação (60+ dias).
                      <strong> Risco de perda definitiva de receita.</strong>
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {medicalInsights.contestationAlerts.slice(0, 4).map((proc, index) => (
                        <div key={index} className="bg-white rounded border border-red-200 p-3">
                          <div className="font-medium text-red-900">
                            {proc.codigo} - Guia {proc.numero_guia}
                          </div>
                          <div className="text-sm text-red-700">
                            {proc.days_since} dias vencido | {formatCurrency(proc.estimated_value)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {medicalInsights.contestationAlerts.length > 4 && (
                      <p className="text-sm text-red-700 mt-2">
                        + {medicalInsights.contestationAlerts.length - 4} outros procedimentos requerem atenção
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Indicador de Qualidade dos Dados */}
            {dataIntegrity && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-6 w-6 ${
                    dataIntegrity.status === 'excellent' || dataIntegrity.status === 'good' 
                      ? 'text-green-600' 
                      : dataIntegrity.status === 'fair' 
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      🔍 Qualidade dos Dados: {dataIntegrity.data_quality.quality_score}%
                    </h3>
                    <p className="text-gray-600 dark:text-slate-300">
                      {dataIntegrity.message}
                    </p>
                  </div>
                </div>
                    
                    <div className="grid gap-3 md:grid-cols-3 mb-4">
                      <InfoCard
                        title="Cobertura Crosscheck"
                        value={`${dataIntegrity.data_quality.crosscheck_coverage}%`}
                        description={`${dataIntegrity.data_quality.procedimentos_com_match} de ${dataIntegrity.data_quality.total_guias} guias`}
                        icon={<CheckCircle className="h-4 w-4 text-blue-600" />}
                        variant="info"
                        size="sm"
                      />
                      
                      <InfoCard
                        title="Códigos CBHPM"
                        value={`${dataIntegrity.data_quality.cbhpm_coverage}%`}
                        description={`${dataIntegrity.data_quality.guias_com_cbhpm} códigos válidos`}
                        icon={<FileText className="h-4 w-4 text-emerald-600" />}
                        variant="success"
                        size="sm"
                      />
                      
                      <InfoCard
                        title="Demonstrativos"
                        value={dataIntegrity.data_quality.demonstrativos_processaveis}
                        description={`de ${dataIntegrity.data_quality.total_demonstrativos} carregados`}
                        icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
                        variant="neutral"
                        size="sm"
                      />
                    </div>

                    {dataIntegrity.issues && dataIntegrity.issues.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">⚠️ Problemas Detectados:</h4>
                        <ul className="text-sm space-y-1">
                          {dataIntegrity.issues.map((issue, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className={issue.type === 'error' ? 'text-red-600' : 'text-yellow-600'}>
                                {issue.type === 'error' ? '❌' : '⚠️'}
                              </span>
                              {issue.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {dataIntegrity.recommendations && dataIntegrity.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">💡 Recomendações:</h4>
                        <ul className="text-sm space-y-1">
                          {dataIntegrity.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600">📋</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
              </section>
            )}

            {/* Insights de Performance Médica */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    📊 Análise de Performance Financeira
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300">
                    Métricas essenciais para gestão financeira médica
                  </p>
                </div>
              </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoCard
                      title="Eficiência de Recebimento"
                      value={formatPercentage(rentabilityMetrics?.eficienciaPagamento || 0)}
                      description={rentabilityMetrics?.eficienciaPagamento > 85 
                        ? '✅ Excelente performance' 
                        : rentabilityMetrics?.eficienciaPagamento > 75 
                          ? '⚠️ Performance boa' 
                          : '🚨 Requer atenção'
                      }
                      icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
                      variant={
                        (rentabilityMetrics?.eficienciaPagamento || 0) > 85
                          ? 'success'
                          : (rentabilityMetrics?.eficienciaPagamento || 0) > 75
                            ? 'warning'
                            : 'danger'
                      }
                      size="sm"
                    />
                    
                    <InfoCard
                      title="Potencial de Recuperação"
                      value={formatCurrency(rentabilityMetrics?.potencialRecuperacao || 0)}
                      description="70% das glosas são contestáveis"
                      icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
                      variant="success"
                      size="sm"
                    />
                    
                    <InfoCard
                      title="Tempo Médio Recebimento"
                      value={`${rentabilityMetrics?.tempoMedioRecebimento || 0} dias`}
                      description="Baseado nos demonstrativos recebidos"
                      icon={<Clock className="h-4 w-4 text-purple-600" />}
                      variant="neutral"
                      size="sm"
                    />
                  </div>
            </section>

            {/* Tabs de Relatórios Especializados */}
            <section>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="rentabilidade">
                    <Calculator className="h-4 w-4 mr-2" />
                    Rentabilidade
                  </TabsTrigger>
                  <TabsTrigger value="glosas">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Glosas
                  </TabsTrigger>
                  <TabsTrigger value="fluxo_caixa">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Fluxo de Caixa
                  </TabsTrigger>
                  <TabsTrigger value="convenios">
                    <Building className="h-4 w-4 mr-2" />
                    Por Convênio
                  </TabsTrigger>
                  <TabsTrigger value="auditoria">
                    <Eye className="h-4 w-4 mr-2" />
                    Auditoria
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Análise de Rentabilidade */}
                <TabsContent value="rentabilidade" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Análise CBHPM vs Realizado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Valor CBHPM Total:</span>
                      <span className="font-medium">
                        {formatCurrency(rentabilityMetrics?.totalCBHPM || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor Recebido:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(rentabilityMetrics?.totalPaid || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Perdas por Glosa:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(rentabilityMetrics?.totalGlosa || 0)}
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Eficiência Geral:</span>
                      <span
                        className={
                          (rentabilityMetrics?.eficienciaPagamento || 0) > 80
                            ? 'text-green-600'
                            : (rentabilityMetrics?.eficienciaPagamento || 0) > 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }
                      >
                        {formatPercentage(rentabilityMetrics?.eficienciaPagamento || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Metas de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taxa de Aprovação</span>
                        <span>
                          {formatPercentage(
                            rentabilityMetrics?.eficienciaPagamento || 0
                          )}
                        </span>
                      </div>
                      <Progress
                        value={rentabilityMetrics?.eficienciaPagamento || 0}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Meta: 85% | Benchmark: 75%
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Controle de Glosas</span>
                        <span>
                          {formatPercentage(
                            100 - (rentabilityMetrics?.perdasGlosas || 0)
                          )}
                        </span>
                      </div>
                      <Progress
                        value={100 - (rentabilityMetrics?.perdasGlosas || 0)}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Meta: 95% | Aceitável: 90%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Indicadores Detalhados */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Executivo - Rentabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard
                    title="Procedimentos Pagos"
                    value={rentabilityMetrics?.procedimentosPagos || 0}
                    icon={<CheckCircle className="h-4 w-4 text-blue-600" />}
                    variant="info"
                    size="sm"
                  />
                  <InfoCard
                    title="Procedimentos Glosados"
                    value={rentabilityMetrics?.procedimentosGlosados || 0}
                    icon={<XCircle className="h-4 w-4 text-red-600" />}
                    variant="danger"
                    size="sm"
                  />
                  <InfoCard
                    title="Margem Líquida"
                    value={formatCurrency(rentabilityMetrics?.margemRealizada || 0)}
                    icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
                    variant="success"
                    size="sm"
                  />
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    💡 Insights Baseados nos Seus Dados Reais
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {(rentabilityMetrics?.eficienciaPagamento || 0) < 75 && (
                      <li>
                        • Eficiência de {formatPercentage(rentabilityMetrics?.eficienciaPagamento || 0)} está abaixo do benchmark de 75% - revisar contratos
                      </li>
                    )}
                    {(rentabilityMetrics?.totalGlosa || 0) > 1000 && (
                      <li>
                        • {formatCurrency(rentabilityMetrics?.totalGlosa || 0)} em glosas detectadas - potencial de recuperação de {formatCurrency(rentabilityMetrics?.potencialRecuperacao || 0)}
                      </li>
                    )}
                    {(urgencyBreakdown.critica + urgencyBreakdown.alta) > 0 && (
                      <li>
                        • {urgencyBreakdown.critica + urgencyBreakdown.alta} procedimentos críticos requerem contestação imediata
                      </li>
                    )}
                    {rentabilityMetrics?.tempoMedioRecebimento > 45 && (
                      <li>
                        • Tempo médio de recebimento de {rentabilityMetrics?.tempoMedioRecebimento} dias - acima do ideal (30 dias)
                      </li>
                    )}
                  </ul>
                </div>

                {/* Top Procedimentos com Glosa - Dados Reais */}
                {medicalInsights?.topGlosaProcedures && medicalInsights.topGlosaProcedures.length > 0 && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-3">
                      🎯 Procedimentos com Maior Impacto de Glosa
                    </h4>
                    <div className="space-y-2">
                      {medicalInsights.topGlosaProcedures.slice(0, 5).map((proc, index) => (
                        <div key={index} className="bg-white rounded border p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">
                                {proc.codigo} - {proc.descricao}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-slate-300">
                                Guia: {proc.numero_guia} | {proc.participacao}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-red-600">
                                Perda: {formatCurrency((proc.cbhpm_value || 0) - (proc.paid_value || 0))}
                              </div>
                              <div className="text-xs text-gray-500">
                                CBHPM: {formatCurrency(proc.cbhpm_value || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Controle de Glosas */}
          <TabsContent value="glosas" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Análise de Glosas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 grid-cols-2">
                    <InfoCard
                      title="Glosas Totais"
                      value={data.analytics.total_glosa_procedures}
                      icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
                      variant="warning"
                      size="sm"
                    />
                    <InfoCard
                      title="Pagamentos Parciais"
                      value={data.analytics.total_partial_payments}
                      icon={<Receipt className="h-4 w-4 text-yellow-600" />}
                      variant="warning"
                      size="sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Valor Total Glosado:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(data.analytics.total_glosa_value)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Potencial de Contestação:</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(data.analytics.total_glosa_value * 0.7)}{' '}
                        {/* 70% est. recuperável */}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Ações Recomendadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {data.analytics.total_glosa_procedures > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800">
                          {data.analytics.total_glosa_procedures} glosas requerem
                          contestação
                        </span>
                      </div>
                    )}

                    {data.analytics.total_partial_payments > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          {data.analytics.total_partial_payments} pagamentos parciais
                          para auditoria
                        </span>
                      </div>
                    )}

                    <div className="mt-4">
                      <Button className="w-full" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Gerar Documentos de Contestação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Glosas Detalhadas */}
            <Card>
              <CardHeader>
                <CardTitle>Procedimentos Glosados - Ação Necessária</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Buscar por código ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(data.procedures) ? (
                    data.procedures
                      .filter((proc) => proc.smart_status === 'glosado')
                      .filter(
                        (proc) =>
                          !searchTerm ||
                          (proc.codigo &&
                            proc.codigo
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())) ||
                          (proc.descricao &&
                            proc.descricao
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()))
                      )
                      .slice(0, 10)
                      .map((proc, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">
                                {proc.codigo} - {proc.descricao}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Guia: {proc.numero_guia} | {proc.participacao}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="destructive">Glosado</Badge>
                              <div className="text-sm font-medium mt-1">
                                {formatCurrency(proc.cbhpm_value || 0)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <FileText className="h-3 w-3 mr-1" />
                              Contestar
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      Nenhum procedimento glosado encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Fluxo de Caixa */}
          <TabsContent value="fluxo_caixa" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Média Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(cashFlowMetrics?.mediaRecebimento || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Baseado nos últimos 3 demonstrativos
                  </p>
                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">Tendência: </span>
                    <span
                      className={
                        (cashFlowMetrics?.tendencia || 0) > 0
                          ? 'text-green-600'
                          : 'text-gray-600 dark:text-slate-300'
                      }
                    >
                      {(cashFlowMetrics?.tendencia || 0) > 0
                        ? '↗ Crescendo'
                        : '→ Estável'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Valores Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(cashFlowMetrics?.pendentesValor || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {data.unpaid_procedures.length} procedimentos não pagos
                  </p>
                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">Prioridade alta: </span>
                    <span className="font-medium text-red-600">
                      {urgencyBreakdown.critica + urgencyBreakdown.alta}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Previsão Próximo Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(cashFlowMetrics?.previsaoProximoMes || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Estimativa conservadora
                  </p>
                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">Confiança: </span>
                    <span className="font-medium text-green-600">Alta</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demonstrativos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Histórico de Recebimentos (Últimos Demonstrativos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(data.demonstrativos) &&
                  data.demonstrativos.length > 0 ? (
                    [...data.demonstrativos]
                      .sort(
                        (a, b) =>
                          new Date(b.upload_time).getTime() -
                          new Date(a.upload_time).getTime()
                      )
                      .slice(0, 8)
                      .map((demo, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center border-b pb-3"
                        >
                          <div>
                            <div className="font-medium">{demo.periodo}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(demo.upload_time).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              {formatCurrency(demo.total_approved)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Glosa: {formatCurrency(demo.total_glosa)}
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      Nenhum demonstrativo encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Performance por Convênio */}
          <TabsContent value="convenios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Análise por Operadora (Em Desenvolvimento)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Relatório por Convênio
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 mb-4 max-w-md mx-auto">
                    Esta funcionalidade está sendo desenvolvida para analisar a
                    performance de pagamento por operadora.
                  </p>
                  <Badge variant="secondary">Próxima atualização</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Auditoria */}
          <TabsContent value="auditoria" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Críticos (+90 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {urgencyBreakdown.critica}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Alta (60-90 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {urgencyBreakdown.alta}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Média (30-60 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {urgencyBreakdown.media}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Baixa (-30 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {urgencyBreakdown.baixa}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Auditoria Detalhada */}
            <Card>
              <CardHeader>
                <CardTitle>Procedimentos Pendentes - Auditoria Detalhada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(data.unpaid_procedures) &&
                  data.unpaid_procedures.length > 0 ? (
                    [...data.unpaid_procedures]
                      .sort((a, b) => (b.dias_vencido || 0) - (a.dias_vencido || 0))
                      .slice(0, 15)
                      .map((proc, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">
                                {proc.codigo} - {proc.descricao}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Guia: {proc.numero_guia} | {proc.papel} | {proc.data}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Motivo: {proc.motivo}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  proc.urgencia === 'critica'
                                    ? 'destructive'
                                    : proc.urgencia === 'alta'
                                      ? 'secondary'
                                      : proc.urgencia === 'media'
                                        ? 'outline'
                                        : 'default'
                                }
                              >
                                {proc.dias_vencido} dias
                              </Badge>
                              <div className="text-sm font-medium mt-1">
                                {formatCurrency(proc.valor_estimado)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      Nenhum procedimento pendente encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
              </Tabs>
            </section>
          </div>
        </AuthenticatedLayout>
      </div>
    </>
  );
};

export default ReportsPage;
