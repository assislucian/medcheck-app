import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { InfoCard } from '@/components/ui/InfoCard';
import { useAuth } from '@/contexts/auth/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Activity,
  Hospital,
  User,
  Zap,
  Brain,
  CheckCircle,
  ArrowRight,
  TrendingUpIcon,
  Lightbulb,
  Star,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

interface AnalyticsData {
  summary: {
    total_recebido_historico: number;
    total_glosado_historico: number;
    taxa_recuperacao_media: number;
    projecao_anual: number;
    valor_medio_procedimento: number;
    total_procedimentos_historico: number;
    crescimento_percentual: number;
    demonstrativos_processados: number;
    periodo_analise: string;
  };
  temporal_analytics: {
    monthly_performance: Array<{
      name: string;
      recebido: number;
      glosado: number;
      taxa_glosa: number;
      procedimentos: number;
    }>;
    melhor_mes: {
      mes: string | null;
      recebido: number;
    };
  };
  performance_analytics: {
    top_procedures: Array<{
      codigo: string;
      descricao: string;
      count: number;
      recebido_total: number;
      taxa_sucesso: number;
      hospitais_count: number;
    }>;
    role_performance: Array<{
      papel: string;
      procedimentos: number;
      hospitais_count: number;
      recebido_estimado: number;
    }>;
    hospital_stats: Array<{
      nome: string;
      procedimentos: number;
      codigos_unicos: number;
      taxa_glosa: number;
    }>;
  };
  insights: {
    alerts: Array<{
      type: string;
      title: string;
      message: string;
      action?: string;
    }>;
    recommendations: Array<{
      type: string;
      title: string;
      message: string;
      metric?: string;
    }>;
    key_insights: string[];
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AdvancedAnalytics() {
  const { session } = useAuth();

  const {
    data: analytics,
    isLoading,
    isError,
  } = useQuery<AnalyticsData>({
    queryKey: ['advanced-analytics'],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('Não autenticado');
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || 'https://medcheck-backend.onrender.com';
      const headers = {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${apiUrl}/api/v1/analytics`, { headers });
      if (!res.ok) {
        throw new Error('Erro ao buscar analytics');
      }
      return res.json();
    },
    enabled: !!session?.access_token,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Erro ao Carregar Analytics
          </h3>
          <p className="text-red-700">
            Não foi possível carregar os dados de analytics avançado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const summary = analytics.summary;
  const temporal = analytics.temporal_analytics;
  const performance = analytics.performance_analytics;
  const insights = analytics.insights;

  return (
    <div className="space-y-8">
      {/* Alertas e Recomendações Prioritárias */}
      {(insights.alerts.length > 0 || insights.recommendations.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Alertas */}
          {insights.alerts.length > 0 && (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-amber-900">Atenção Necessária</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-lg border border-amber-200"
                  >
                    <h4 className="font-medium text-amber-900 mb-1">{alert.title}</h4>
                    <p className="text-sm text-amber-700">{alert.message}</p>
                    {alert.action && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {alert.action}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recomendações */}
          {insights.recommendations.length > 0 && (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-900">Oportunidades</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-lg border border-green-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-green-900 mb-1">{rec.title}</h4>
                        <p className="text-sm text-green-700 mb-2">{rec.message}</p>
                        {rec.metric && (
                          <Badge variant="secondary" className="text-xs">
                            {rec.metric}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<DollarSign className="h-6 w-6" />}
          title="Receita Total Histórica"
          value={formatCurrency(summary.total_recebido_historico)}
          description={`${summary.demonstrativos_processados} demonstrativos processados`}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
        />

        <InfoCard
          icon={<TrendingUp className="h-6 w-6" />}
          title="Taxa de Recuperação"
          value={formatPercent(summary.taxa_recuperacao_media)}
          description="Média histórica de pagamentos"
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
        />

        <InfoCard
          icon={<Target className="h-6 w-6" />}
          title="Projeção Anual"
          value={formatCurrency(summary.projecao_anual)}
          description="Baseada no trimestre atual"
          className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200"
        />

        <InfoCard
          icon={<Activity className="h-6 w-6" />}
          title="Valor Médio/Procedimento"
          value={formatCurrency(summary.valor_medio_procedimento)}
          description={`${summary.total_procedimentos_historico} procedimentos`}
          className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
        />
      </div>

      {/* Crescimento e Tendências */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Performance Temporal */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Evolução Temporal
                </CardTitle>
                <CardDescription>
                  Performance mensal dos últimos {summary.periodo_analise}
                </CardDescription>
              </div>
              {temporal.melhor_mes.mes && (
                <Badge variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Melhor: {temporal.melhor_mes.mes}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temporal.monthly_performance}>
                  <defs>
                    <linearGradient id="recebidoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="glosadoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'recebido' ? 'Recebido' : 'Glosado',
                    ]}
                    labelFormatter={(label) => `Período: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="recebido"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#recebidoGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="glosado"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#glosadoGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores de Crescimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Indicadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Crescimento</span>
                <div className="flex items-center gap-1">
                  {summary.crescimento_percentual >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      summary.crescimento_percentual >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatPercent(Math.abs(summary.crescimento_percentual))}
                  </span>
                </div>
              </div>
              <Progress
                value={Math.min(Math.abs(summary.crescimento_percentual), 100)}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comparação primeiros vs últimos 6 meses
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Insights Chave</h4>
              {insights.key_insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Detalhada */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Procedimentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Procedimentos de Destaque
            </CardTitle>
            <CardDescription>Top 5 procedimentos por receita gerada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performance.top_procedures.map((proc, index) => (
                <div
                  key={proc.codigo}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {proc.codigo}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {proc.count}x em {proc.hospitais_count} hospitais
                      </span>
                    </div>
                    <h4 className="font-medium text-sm line-clamp-2">
                      {proc.descricao}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(proc.recebido_total)}
                      </span>
                      <Badge
                        variant={proc.taxa_sucesso >= 90 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {formatPercent(proc.taxa_sucesso)} sucesso
                      </Badge>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-300 ml-4">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance por Hospital */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hospital className="h-5 w-5" />
              Performance Hospitalar
            </CardTitle>
            <CardDescription>Análise de eficiência por instituição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performance.hospital_stats.slice(0, 5).map((hospital, index) => (
                <div
                  key={hospital.nome}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{hospital.nome}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{hospital.procedimentos} procedimentos</span>
                      <span>{hospital.codigos_unicos} códigos únicos</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs">Taxa de Glosa</span>
                        <span className="text-xs font-medium">
                          {formatPercent(hospital.taxa_glosa)}
                        </span>
                      </div>
                      <Progress
                        value={hospital.taxa_glosa}
                        className="h-1.5"
                        aria-label={`Taxa de glosa: ${hospital.taxa_glosa}%`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Papel */}
      {performance.role_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Análise por Função Médica
            </CardTitle>
            <CardDescription>
              Distribuição de atividades por papel desempenhado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {performance.role_performance.map((role, index) => (
                <div
                  key={role.papel}
                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
                >
                  <h4 className="font-semibold text-blue-900 mb-2">{role.papel}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Procedimentos:</span>
                      <span className="font-medium">{role.procedimentos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Hospitais:</span>
                      <span className="font-medium">{role.hospitais_count}</span>
                    </div>
                    {role.recebido_estimado > 0 && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Recebido:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(role.recebido_estimado)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
