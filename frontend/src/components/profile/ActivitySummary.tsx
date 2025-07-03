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
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
              <div className="h-6 w-6 bg-amber-300 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          </h2>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="relative overflow-hidden border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300 to-slate-400 animate-pulse"></div>
              <CardContent className="relative p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-rose-100">
              <TrendingUp className="h-6 w-6 text-red-700" />
            </div>
            Atividade Recente
          </h2>
        </div>

        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
          <CardContent className="relative p-8">
            <ErrorMessage error={error} onRetry={retryDashboard} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
              <TrendingUp className="h-6 w-6 text-amber-700" />
            </div>
            Atividade Recente
          </h2>
        </div>

        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
          <CardContent className="relative p-8">
            <p className="text-amber-700 text-center py-4 font-medium">
              Nenhum dado disponível para exibir.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const taxaGlosa = getTaxaGlosa();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
            <TrendingUp className="h-6 w-6 text-amber-700" />
          </div>
          Atividade Recente
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Resumo das suas atividades médicas dos últimos 30 dias
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Card Procedimentos - Azul */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-sky-600"></div>
          <CardContent className="relative p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-sky-100">
                  <FileText className="h-6 w-6 text-blue-700" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Procedimentos
                </p>
                <p className="text-2xl font-bold text-blue-800 leading-none">
                  {dashboardData.totals.totalProcedimentos}
                </p>
                <p className="text-xs text-blue-600">Analisados no período</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Glosas - Vermelho */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
          <CardContent className="relative p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-rose-100">
                  <AlertTriangle className="h-6 w-6 text-red-700" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Glosas
                </p>
                <p className="text-2xl font-bold text-red-800 leading-none">
                  {dashboardData.totals.glosasDetectadas || 0}
                </p>
                <p className="text-xs text-red-600">Detectadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Taxa de Glosa - Variável */}
        <Card
          className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1`}
        >
          <div
            className={`absolute inset-0 ${
              getTaxaGlosa() > 20
                ? 'bg-gradient-to-br from-red-50 via-rose-50 to-red-100'
                : getTaxaGlosa() > 10
                  ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100'
                  : 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100'
            }`}
          ></div>
          <div
            className={`absolute top-0 left-0 w-full h-1 ${
              getTaxaGlosa() > 20
                ? 'bg-gradient-to-r from-red-500 to-rose-600'
                : getTaxaGlosa() > 10
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600'
            }`}
          ></div>
          <CardContent className="relative p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className={`p-2 rounded-lg ${
                    getTaxaGlosa() > 20
                      ? 'bg-gradient-to-br from-red-100 to-rose-100'
                      : getTaxaGlosa() > 10
                        ? 'bg-gradient-to-br from-amber-100 to-orange-100'
                        : 'bg-gradient-to-br from-emerald-100 to-green-100'
                  }`}
                >
                  <AlertTriangle
                    className={`h-6 w-6 ${
                      getTaxaGlosa() > 20
                        ? 'text-red-700'
                        : getTaxaGlosa() > 10
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                    }`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    getTaxaGlosa() > 20
                      ? 'text-red-600'
                      : getTaxaGlosa() > 10
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                  }`}
                >
                  Taxa de Glosa
                </p>
                <p
                  className={`text-2xl font-bold leading-none ${
                    getTaxaGlosa() > 20
                      ? 'text-red-800'
                      : getTaxaGlosa() > 10
                        ? 'text-amber-800'
                        : 'text-emerald-800'
                  }`}
                >
                  {getTaxaGlosa().toFixed(1)}%
                </p>
                <p
                  className={`text-xs ${
                    getTaxaGlosa() > 20
                      ? 'text-red-600'
                      : getTaxaGlosa() > 10
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                  }`}
                >
                  {getTaxaGlosa() > 20
                    ? 'Alto'
                    : getTaxaGlosa() > 10
                      ? 'Médio'
                      : 'Baixo'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Valor Recebido - Verde */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
          <CardContent className="relative p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100">
                  <DollarSign className="h-6 w-6 text-emerald-700" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Recebido
                </p>
                <p className="text-2xl font-bold text-emerald-800 leading-none">
                  {formatCurrency(dashboardData.totals.totalRecebido)}
                </p>
                <p className="text-xs text-emerald-600">Valor total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Valor Glosado - Vermelho */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
          <CardContent className="relative p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-rose-100">
                  <AlertTriangle className="h-6 w-6 text-red-700" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Glosado
                </p>
                <p className="text-2xl font-bold text-red-800 leading-none">
                  {formatCurrency(dashboardData.totals.totalGlosado)}
                </p>
                <p className="text-xs text-red-600">Valor perdido</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Auditoria Pendente - Âmbar (se houver) */}
        {dashboardData.totals.auditoriaPendente > 0 && (
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
            <CardContent className="relative p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                    <AlertTriangle className="h-6 w-6 text-amber-700" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                    Auditoria
                  </p>
                  <p className="text-2xl font-bold text-amber-800 leading-none">
                    {dashboardData.totals.auditoriaPendente}
                  </p>
                  <p className="text-xs text-amber-600">Pendente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
