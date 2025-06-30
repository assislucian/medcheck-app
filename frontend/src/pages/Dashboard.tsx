import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { DashboardAlert } from '../components/dashboard/DashboardAlert';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../contexts/auth/AuthContext';

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
        <div className="space-y-10">
          {/* Page Header Premium */}
          <PageHeader
            title="Centro de Comando"
            icon={<LayoutDashboard size={32} />}
            description="Visão estratégica de sua performance médica com insights em tempo real"
          />

          {/* Dashboard Content */}
          <div className="space-y-12">
            {isLoading ? (
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonInfoCard key={idx} />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-6 py-16 text-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                    Erro ao carregar dados do dashboard
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Verifique sua conexão e tente novamente
                  </p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <>
                {/* Visão Geral Financeira Premium */}
                <section
                  aria-label="Performance Financeira Global"
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                      <DollarSign className="h-6 w-6 text-green-600" />
                      Performance Financeira Global
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Dados consolidados e métricas de performance em tempo real
                    </p>
                  </div>

                  {/* Grid de Cards Principal */}
                  <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoCard
                      icon={<ArrowUpRight className="h-6 w-6" />}
                      title={
                        <span className="text-sm font-semibold">Total Liberado</span>
                      }
                      value={
                        <span className="text-3xl xl:text-4xl font-bold">
                          {formatCurrency(totals.totalRecebido)}
                        </span>
                      }
                      description={
                        <span className="text-sm">
                          Pagamentos confirmados no sistema
                        </span>
                      }
                      variant="success"
                    />
                    <InfoCard
                      icon={<AlertTriangle className="h-6 w-6" />}
                      title={
                        <span className="text-sm font-semibold">Total Glosado</span>
                      }
                      value={
                        <span className="text-3xl xl:text-4xl font-bold">
                          {formatCurrency(totals.totalGlosado)}
                        </span>
                      }
                      description={
                        <span className="text-sm">Procedimentos contestados</span>
                      }
                      variant="danger"
                    />
                    <InfoCard
                      icon={<Target className="h-6 w-6" />}
                      title={
                        <span className="text-sm font-semibold">Taxa de Sucesso</span>
                      }
                      value={
                        <span className="text-3xl xl:text-4xl font-bold">
                          {formatPercentage(taxaSucesso)}
                        </span>
                      }
                      description={
                        <span className="text-sm">Aprovação vs total apresentado</span>
                      }
                      variant={taxaSucesso >= 85 ? 'success' : 'warning'}
                    />
                    <InfoCard
                      icon={<ClipboardList className="h-6 w-6" />}
                      title={
                        <span className="text-sm font-semibold">Total Analisado</span>
                      }
                      value={
                        <span className="text-3xl xl:text-4xl font-bold">
                          {totals.totalProcedimentos.toLocaleString()}
                        </span>
                      }
                      description={
                        <span className="text-sm">Procedimentos processados</span>
                      }
                      variant="info"
                    />
                  </div>
                </section>

                {/* Alertas e Insights */}
                {(temGlosasCriticas || taxaSucessoBaixa || poucosAnalisados) && (
                  <section aria-label="Alertas Importantes" className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                      Alertas & Insights
                    </h2>

                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                      {temGlosasCriticas && (
                        <DashboardAlert
                          title="Taxa de Glosas Elevada"
                          description={`${formatPercentage(
                            (totals.totalGlosado / valorApresentado) * 100
                          )} dos procedimentos foram glosados`}
                          type="critical"
                          action="Revisar procedimentos"
                          href="/unpaid-procedures"
                        />
                      )}
                      {taxaSucessoBaixa && (
                        <DashboardAlert
                          title="Taxa de Sucesso Baixa"
                          description={`Taxa atual: ${formatPercentage(
                            taxaSucesso
                          )}. Meta recomendada: 85%+`}
                          type="warning"
                          action="Analisar causas"
                          href="/analytics"
                        />
                      )}
                      {poucosAnalisados && (
                        <DashboardAlert
                          title="Poucos Dados Analisados"
                          description="Faça upload de mais demonstrativos para insights precisos"
                          type="info"
                          action="Enviar demonstrativos"
                          href="/demonstratives"
                        />
                      )}
                    </div>
                  </section>
                )}

                {/* Widgets Adicionais */}
                <div className="grid gap-8 grid-cols-1 xl:grid-cols-2">
                  {/* Recovery Progress */}
                  <Card className="p-8">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Progresso de Recuperação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RecoveryProgressCard
                        totalGlosado={totals.totalGlosado}
                        valorRecuperado={totals.totalRecebido * 0.1} // Mock: 10% recuperado
                      />
                    </CardContent>
                  </Card>

                  {/* Revenue Chart */}
                  <Card className="p-8">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <Activity className="h-5 w-5 text-green-600" />
                        Distribuição de Receita
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RevenuePieChart
                        recebido={totals.totalRecebido}
                        glosado={totals.totalGlosado}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <section aria-label="Ações Rápidas" className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <Zap className="h-6 w-6 text-purple-600" />
                    Ações Rápidas
                  </h2>

                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <Link to="/guides" className="group">
                      <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              Enviar Guias
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Upload de novas guias médicas
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>

                    <Link to="/demonstratives" className="group">
                      <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <FileText className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              Demonstrativos
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Analisar demonstrativos
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-green-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>

                    <Link to="/unpaid-procedures" className="group">
                      <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              Glosas Pendentes
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Revisar contestações
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-red-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>

                    <Link to="/reports" className="group">
                      <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <LayoutDashboard className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              Relatórios
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Gerar relatórios
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-purple-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default DashboardPage;
