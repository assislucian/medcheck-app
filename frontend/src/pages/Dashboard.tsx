import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { DashboardAlert } from '../components/dashboard/DashboardAlert';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../contexts/auth/AuthContext';
import { UserMenu } from '../components/navbar/UserMenu';
import {
  LayoutDashboard,
  ArrowUpRight,
  AlertCircle,
  FileText,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  Calendar,
  Target,
  Clock,
  DollarSign,
  Activity,
  Zap,
  AlertTriangle,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { InfoCard } from '../components/ui/InfoCard';
import { formatCurrency, formatPercentage } from '../utils/format';
import { useDashboardStats } from '../hooks/use-dashboard-stats';
import { usePageTitle } from '../hooks/usePageTitle';

import { Loader2 } from 'lucide-react';
import { Procedure } from '../types/medical';
import { RecoveryProgressCard } from '../components/dashboard/RecoveryProgressCard';
import { Button } from '../components/ui/button';
import { SkeletonInfoCard } from '../components/ui/SkeletonInfoCard';
import { RevenuePieChart } from '../components/dashboard/RevenuePieChart';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const DashboardPage = () => {
  const { userProfile, signOut } = useAuth();
  const { data: stats, isLoading, isError } = useDashboardStats();

  // SEO e Título Premium
  usePageTitle({
    title: 'Centro de Comando',
    description:
      'Dashboard executivo com insights de performance médica, análise financeira e métricas estratégicas em tempo real',
    keywords:
      'dashboard médico, performance financeira, auditoria médica, analytics médico, centro de comando',
  });

  const backendTotals = stats?.totals;
  const totals = {
    totalRecebido: backendTotals?.totalRecebido ?? 0,
    totalGlosado: backendTotals?.totalGlosado ?? 0,
    totalProcedimentos: backendTotals?.totalProcedimentos ?? 0,
    auditoriaPendente: backendTotals?.auditoriaPendente ?? 0,
  };

  const valorApresentado = totals.totalRecebido + totals.totalGlosado;
  const taxaSucesso =
    valorApresentado > 0 ? (totals.totalRecebido / valorApresentado) * 100 : 0;

  // Análises inteligentes para insights
  const procedures: Procedure[] = stats?.procedures || [];
  const recentProcedures = procedures.slice(0, 5);
  const glosasRecentes = stats?.glosas?.slice(0, 3) || [];

  // Métricas de performance
  const procedimentosPagos = procedures.filter((p) => p.pago).length;
  const procedimentosGlosados = procedures.filter(
    (p) => !p.pago && totals.totalGlosado > 0
  ).length;
  const valorMedioRecebido =
    procedimentosPagos > 0 ? totals.totalRecebido / procedimentosPagos : 0;

  // Status e alertas inteligentes
  const temGlosasCriticas = totals.totalGlosado > totals.totalRecebido * 0.15; // > 15%
  const taxaSucessoBaixa = taxaSucesso < 85;
  const poucosAnalisados = totals.totalProcedimentos < 10;

  return (
    <>
      <Helmet>
        <title>Centro de Comando | MedCheck</title>
        <meta
          name="description"
          content="Dashboard executivo com insights de performance médica, análise financeira e métricas estratégicas em tempo real"
        />
        <meta
          name="keywords"
          content="dashboard médico, performance financeira, auditoria médica, analytics médico, centro de comando"
        />

        {/* Open Graph para compartilhamento */}
        <meta property="og:title" content="Centro de Comando | MedCheck" />
        <meta
          property="og:description"
          content="Dashboard executivo com insights de performance médica"
        />
        <meta property="og:type" content="website" />

        {/* Schema.org para SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'MedCheck Dashboard',
            description:
              'Dashboard executivo para auditoria médica e análise financeira',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

      <AuthenticatedLayout
        title="Centro de Comando"
        description="Dashboard executivo - Insights e performance de sua prática médica"
      >
        <PageHeader
          title="Centro de Comando"
          icon={<LayoutDashboard size={28} />}
          description="Visão estratégica de sua performance médica"
          actions={
            userProfile ? (
              <UserMenu
                name={userProfile.name || 'Usuário'}
                email={userProfile.email || 'sem-email@exemplo.com'}
                specialty={userProfile.crm || ''}
                avatarUrl={userProfile.avatarUrl || undefined}
                onLogout={signOut}
              />
            ) : null
          }
        />

        <div className="space-y-6">
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonInfoCard key={idx} />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-4 py-8 sm:py-10 text-center">
              <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
              <p className="text-base sm:text-lg font-medium text-red-500">
                Erro ao carregar dados do dashboard.
              </p>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              {/* Visão Geral Financeira Premium */}
              <section aria-label="Performance Financeira Global" className="mb-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Performance Financeira Global
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Dados consolidados e métricas de performance em tempo real
                  </p>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-2">
                  <InfoCard
                    icon={<ArrowUpRight className="h-6 w-6" />}
                    title={
                      <span className="text-xs font-semibold">Total Liberado</span>
                    }
                    value={
                      <span className="text-2xl md:text-3xl font-bold">
                        {formatCurrency(totals.totalRecebido)}
                      </span>
                    }
                    description={
                      <span className="text-xs">Pagamentos confirmados no sistema</span>
                    }
                    variant="success"
                  />
                  <InfoCard
                    icon={<AlertTriangle className="h-6 w-6" />}
                    title={<span className="text-xs font-semibold">Total Glosado</span>}
                    value={
                      <span className="text-2xl md:text-3xl font-bold">
                        {formatCurrency(totals.totalGlosado)}
                      </span>
                    }
                    description={
                      <span className="text-xs">Procedimentos contestados</span>
                    }
                    variant="danger"
                  />
                  <InfoCard
                    icon={<Activity className="h-6 w-6" />}
                    title={<span className="text-xs font-semibold">Procedimentos</span>}
                    value={
                      <span className="text-2xl md:text-3xl font-bold">
                        {totals.totalProcedimentos}
                      </span>
                    }
                    description={
                      <span className="text-xs">Total processados no sistema</span>
                    }
                    variant="info"
                  />
                  <InfoCard
                    icon={<Target className="h-6 w-6" />}
                    title={
                      <span className="text-xs font-semibold">Taxa de Efetividade</span>
                    }
                    value={
                      <span className="text-2xl md:text-3xl font-bold">
                        {formatPercentage(taxaSucesso)}
                      </span>
                    }
                    description={
                      <span className="text-xs">Percentual de aprovação global</span>
                    }
                    variant={
                      taxaSucesso >= 90
                        ? 'success'
                        : taxaSucesso >= 80
                          ? 'warning'
                          : 'danger'
                    }
                  />
                </div>
              </section>

              {/* Intelligence Hub Preview - Seção Premium */}
              <section aria-label="Intelligence Hub" className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Intelligence Hub
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Análise avançada de performance e insights estratégicos
                    </p>
                  </div>
                  <Link to="/intelligence">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 hover:bg-purple-50 border-purple-200"
                    >
                      Ver Análise Completa
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                  <CardContent className="p-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">98.0%</div>
                        <div className="text-sm text-gray-600">Performance Global</div>
                        <Badge
                          variant="outline"
                          className="mt-2 text-xs bg-green-50 text-green-700 border-green-200"
                        >
                          +2.1% vs anterior
                        </Badge>
                      </div>

                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-2xl font-bold text-purple-600">
                          R$ 32.5K
                        </div>
                        <div className="text-sm text-gray-600">Projeção Anual</div>
                        <Badge
                          variant="outline"
                          className="mt-2 text-xs bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Tendência atual
                        </Badge>
                      </div>

                      <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-2xl font-bold text-green-600">+15.3%</div>
                        <div className="text-sm text-gray-600">Crescimento</div>
                        <Badge
                          variant="outline"
                          className="mt-2 text-xs bg-purple-50 text-purple-700 border-purple-200"
                        >
                          6 meses
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Alertas e Insights Inteligentes */}
              {(temGlosasCriticas || taxaSucessoBaixa || poucosAnalisados) && (
                <section aria-label="Alertas Inteligentes" className="mb-6">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-600" />
                      Alertas & Insights
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Recomendações baseadas em análise inteligente dos dados
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {temGlosasCriticas && (
                      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-red-900 dark:text-red-300">
                                Taxa de Glosa Elevada
                              </h4>
                              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                Glosas representam mais de 15% do faturamento.
                                Recomendamos revisão de processos.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {taxaSucessoBaixa && (
                      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-amber-900 dark:text-amber-300">
                                Efetividade Baixa
                              </h4>
                              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                Taxa de sucesso abaixo de 85%. Verifique conformidade de
                                documentação.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {poucosAnalisados && (
                      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900 dark:text-blue-300">
                                Poucos Dados
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                Carregue mais demonstrativos para insights mais
                                precisos.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </section>
              )}

              {/* Procedimentos Recentes */}
              {recentProcedures.length > 0 && (
                <section aria-label="Atividade Recente" className="mb-6">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-indigo-600" />
                      Atividade Recente
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Últimos procedimentos analisados no sistema
                    </p>
                  </div>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {recentProcedures.map((procedure, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  procedure.pago ? 'bg-green-500' : 'bg-red-500'
                                }`}
                              />
                              <div>
                                <p className="font-medium text-sm">
                                  {procedure.codigo}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {procedure.descricao?.slice(0, 50)}...
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm">
                                {formatCurrency(procedure.valor)}
                              </p>
                              <Badge
                                variant={procedure.pago ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {procedure.pago ? 'Pago' : 'Glosado'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}
            </>
          )}
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default DashboardPage;
