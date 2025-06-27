import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfileData } from '@/hooks/useProfileData';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, FileText, AlertTriangle, DollarSign } from 'lucide-react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export const ActivitySummary = () => {
  const { dashboardData, loading, error, retryDashboard } = useProfileData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTaxaGlosa = () => {
    if (!dashboardData?.totals?.taxaGlosa) return 0;
    return dashboardData.totals.taxaGlosa;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resumo de Atividades (últimos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resumo de Atividades
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
            <TrendingUp className="h-5 w-5 text-primary" />
            Resumo de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhum dado disponível para exibir.
          </p>
        </CardContent>
      </Card>
    );
  }

  const taxaGlosa = getTaxaGlosa();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Resumo de Atividades (últimos 30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Procedimentos Analisados:
            </dt>
            <dd className="font-semibold text-blue-600">
              {dashboardData.totals.totalProcedimentos}
            </dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Glosas Detectadas:
            </dt>
            <dd className="font-semibold text-orange-600">
              {dashboardData.totals.glosasDetectadas || 0}
            </dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Taxa de Glosa:
            </dt>
            <dd
              className={`font-semibold ${
                getTaxaGlosa() > 20
                  ? 'text-red-600'
                  : getTaxaGlosa() > 10
                    ? 'text-orange-600'
                    : 'text-green-600'
              }`}
            >
              {getTaxaGlosa().toFixed(2)}%
            </dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Valor Total Recebido:
            </dt>
            <dd className="font-semibold text-green-600">
              {formatCurrency(dashboardData.totals.totalRecebido)}
            </dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Valor Total Glosado:
            </dt>
            <dd className="font-semibold text-red-600">
              {formatCurrency(dashboardData.totals.totalGlosado)}
            </dd>
          </div>

          {dashboardData.totals.auditoriaPendente > 0 && (
            <div className="flex justify-between items-center">
              <dt className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Auditoria Pendente:
              </dt>
              <dd className="font-semibold text-yellow-600">
                {dashboardData.totals.auditoriaPendente}
              </dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};
