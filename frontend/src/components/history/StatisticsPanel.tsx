import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  FileText,
  AlertTriangle,
  DollarSign,
  Calendar,
  Activity,
  Target,
  Clock,
} from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export const StatisticsPanel = () => {
  const { dashboardData, loading, error, retryDashboard } = useProfileData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Estatísticas Históricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorMessage error={error} onRetry={retryDashboard} />
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Estatísticas Históricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum dado histórico disponível.
            <br />
            <span className="text-sm">
              Processe alguns demonstrativos para ver suas estatísticas aqui.
            </span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTaxaGlosa = () => {
    if (!dashboardData?.totals?.taxaGlosa) return 0;
    return dashboardData.totals.taxaGlosa;
  };

  const taxaGlosa = getTaxaGlosa();
  const glosasDetectadas = dashboardData.totals.glosasDetectadas || 0;
  const totalProcedimentos = dashboardData.totals.totalProcedimentos || 0;
  const totalRecebido = dashboardData.totals.totalRecebido || 0;
  const totalGlosado = dashboardData.totals.totalGlosado || 0;

  // Cálculos de insights
  const mediaRecuperacao =
    totalProcedimentos > 0 ? totalRecebido / totalProcedimentos : 0;
  const eficienciaAuditoria =
    totalProcedimentos > 0
      ? ((totalProcedimentos - glosasDetectadas) / totalProcedimentos) * 100
      : 100;

  // Determinar estilo baseado na taxa de glosa
  const getGlosaCardStyle = () => {
    if (taxaGlosa > 20) {
      return {
        cardClass: 'border-red-200 bg-gradient-to-br from-red-50 to-red-100/50',
        textClass: 'text-red-700',
        valueClass: 'text-red-900',
        descClass: 'text-red-600',
        iconBgClass: 'bg-red-100',
        iconClass: 'text-red-600',
      };
    } else if (taxaGlosa > 10) {
      return {
        cardClass:
          'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50',
        textClass: 'text-orange-700',
        valueClass: 'text-orange-900',
        descClass: 'text-orange-600',
        iconBgClass: 'bg-orange-100',
        iconClass: 'text-orange-600',
      };
    } else {
      return {
        cardClass:
          'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50',
        textClass: 'text-emerald-700',
        valueClass: 'text-emerald-900',
        descClass: 'text-emerald-600',
        iconBgClass: 'bg-emerald-100',
        iconClass: 'text-emerald-600',
      };
    }
  };

  const glosaStyle = getGlosaCardStyle();

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Resumo de Atividades
          </h3>
          <p className="text-sm text-muted-foreground">
            Suas estatísticas e performance histórica
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Últimos 30 dias
        </Badge>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Procedimentos */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Procedimentos</p>
                <p className="text-2xl font-bold text-blue-900">{totalProcedimentos}</p>
                <p className="text-xs text-blue-600 mt-1">Analisados</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valor Total Recebido */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Recebido</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(totalRecebido)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Média: {formatCurrency(mediaRecuperacao)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Glosa */}
        <Card className={glosaStyle.cardClass}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${glosaStyle.textClass} font-medium`}>
                  Taxa de Glosa
                </p>
                <p className={`text-2xl font-bold ${glosaStyle.valueClass}`}>
                  {formatPercent(taxaGlosa)}
                </p>
                <p className={`text-xs ${glosaStyle.descClass} mt-1`}>
                  {glosasDetectadas} glosas
                </p>
              </div>
              <div className={`p-3 ${glosaStyle.iconBgClass} rounded-full`}>
                <AlertTriangle className={`h-5 w-5 ${glosaStyle.iconClass}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eficiência */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Eficiência</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatPercent(eficienciaAuditoria)}
                </p>
                <p className="text-xs text-purple-600 mt-1">De aprovação</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de resumo expandido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Análise de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Valor Total Glosado */}
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalGlosado)}
              </div>
              <p className="text-sm text-muted-foreground">Total Glosado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Oportunidade de recuperação
              </p>
            </div>

            {/* Economia Potencial */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalGlosado * 0.7)} {/* 70% de recuperação estimada */}
              </div>
              <p className="text-sm text-muted-foreground">Economia Potencial</p>
              <p className="text-xs text-muted-foreground mt-1">
                Estimativa de recuperação (70%)
              </p>
            </div>

            {/* Tempo Economizado */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ~{Math.round(totalProcedimentos / 10)}h
              </div>
              <p className="text-sm text-muted-foreground">Tempo Economizado</p>
              <p className="text-xs text-muted-foreground mt-1">Vs. auditoria manual</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
