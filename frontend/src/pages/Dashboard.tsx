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
  Upload,
  BarChart3,
  FileBarChart,
  Search,
  Plus,
  Eye,
  Heart,
  Shield,
  TrendingDown,
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
    title: 'Minha Prática Médica',
    description:
      'Acompanhe seus honorários, glosas e demonstrativos de forma clara e organizada. Sua gestão médica simplificada.',
    keywords:
      'honorários médicos, glosas planos de saúde, demonstrativos pagamento, gestão médica, auditoria médica',
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

  // Status e alertas inteligentes - ajustados para realidade brasileira
  const temGlosasCriticas = totals.totalGlosado > totals.totalRecebido * 0.15; // > 15%
  const taxaSucessoBaixa = taxaSucesso < 85;
  const poucosAnalisados = totals.totalProcedimentos < 5;
  const needsAttention = temGlosasCriticas || taxaSucessoBaixa || poucosAnalisados;

  return (
    <>
      <Helmet>
        <title>Minha Prática Médica | MedCheck</title>
        <meta
          name="description"
          content="Acompanhe seus honorários, glosas e demonstrativos de forma clara e organizada. Sua gestão médica simplificada."
        />
        <meta
          name="keywords"
          content="honorários médicos, glosas planos de saúde, demonstrativos pagamento, gestão médica, auditoria médica"
        />

        {/* Open Graph para compartilhamento */}
        <meta property="og:title" content="Minha Prática Médica | MedCheck" />
        <meta
          property="og:description"
          content="Gestão médica simplificada - acompanhe seus honorários e demonstrativos"
        />
        <meta property="og:type" content="website" />

        {/* Schema.org para SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'MedCheck - Gestão Médica',
            description:
              'Plataforma para acompanhamento de honorários médicos e análise de demonstrativos de planos de saúde',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

      <AuthenticatedLayout
        title="Minha Prática Médica"
        description={`Bem-vindo de volta, ${
          userProfile?.nome || 'Dr(a)'
        }! Aqui está o resumo dos seus honorários e pendências.`}
      >
        <div className="space-y-10">
          {/* Page Header Premium */}
          <PageHeader
            title="Minha Prática Médica"
            icon={<Heart size={32} className="text-blue-600" />}
            description={`Acompanhe seus honorários e demonstrativos de forma simples e organizada. ${
              needsAttention
                ? 'Você tem algumas pendências que merecem atenção.'
                : 'Tudo funcionando bem!'
            }`}
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
                    Ops! Não conseguimos carregar seus dados
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Verifique sua conexão com a internet e tente novamente
                  </p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <>
                {/* Visão Geral dos Honorários */}
                <section aria-label="Resumo dos Seus Honorários" className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                      <DollarSign className="h-6 w-6 text-green-600" />
                      Resumo dos Seus Honorários
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Acompanhe o que você já recebeu, o que está pendente e quais
                      procedimentos foram glosados pelos planos
                    </p>
                  </div>

                  {/* Grid de Cards Principal */}
                  <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoCard
                      icon={<ArrowUpRight className="h-6 w-6" />}
                      title={
                        <span className="text-sm font-semibold">
                          Recebido este Período
                        </span>
                      }
                      value={
                        <span className="text-3xl xl:text-4xl font-bold">
                          {formatCurrency(totals.totalRecebido)}
                        </span>
                      }
                      description={
                        <span className="text-sm">
                          Honorários já pagos pelos planos
                        </span>
                      }
                      variant="success"
                    />
                    <InfoCard
                      icon={<TrendingDown className="h-6 w-6" />}
                      title={
                        <span className="text-sm font-semibold">
                          Glosas e Pendências
                        </span>
                      }
                      value={
                        <span className="text-3xl xl:text-4xl font-bold">
                          {formatCurrency(totals.totalGlosado)}
                        </span>
                      }
                      description={
                        <span className="text-sm">
                          Valores glosados ou em contestação
                        </span>
                      }
                      variant={temGlosasCriticas ? 'destructive' : 'warning'}
                    />
                    <InfoCard
                      icon={<CheckCircle className="h-6 w-6" />}
                      title={
                        <span className="text-sm font-semibold">Taxa de Aprovação</span>
                      }
                      value={
                        <span className="text-3xl xl:text-4xl font-bold">
                          {formatPercentage(taxaSucesso)}
                        </span>
                      }
                      description={
                        <span className="text-sm">
                          {taxaSucesso >= 90
                            ? 'Excelente índice!'
                            : taxaSucesso >= 80
                              ? 'Boa performance'
                              : 'Precisa atenção'}
                        </span>
                      }
                      variant={
                        taxaSucesso >= 85
                          ? 'success'
                          : taxaSucesso >= 70
                            ? 'warning'
                            : 'destructive'
                      }
                    />
                    <InfoCard
                      icon={<FileText className="h-6 w-6" />}
                      title={
                        <span className="text-sm font-semibold">
                          Procedimentos Analisados
                        </span>
                      }
                      value={
                        <span className="text-3xl xl:text-4xl font-bold">
                          <AnimatedNumber value={totals.totalProcedimentos} />
                        </span>
                      }
                      description={
                        <span className="text-sm">
                          {poucosAnalisados
                            ? 'Adicione mais demonstrativos'
                            : 'Total de procedimentos verificados'}
                        </span>
                      }
                      variant={poucosAnalisados ? 'warning' : 'default'}
                    />
                  </div>
                </section>

                {/* Ações Rápidas Reorganizadas */}
                <section className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                      <Zap className="h-6 w-6 text-blue-600" />
                      Próximos Passos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Ações importantes para manter sua gestão em dia e recuperar
                      valores
                    </p>
                  </div>

                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {/* Guias Médicas - Ação primária */}
                    <Link
                      to="/guides"
                      className="group col-span-1 md:col-span-2 xl:col-span-1"
                    >
                      <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/20">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">Guias Médicas</h4>
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 hover:bg-green-200"
                              >
                                Workflow principal
                              </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              Visualize suas guias TISS e acompanhe o status dos
                              procedimentos realizados
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>

                    {/* Demonstrativos - Segunda prioridade */}
                    <Link to="/demonstratives" className="group">
                      <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Upload className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">Demonstrativos</h4>
                              {totals.totalProcedimentos < 5 && (
                                <Badge
                                  variant="outline"
                                  className="border-blue-500 text-blue-700"
                                >
                                  Carregue mais dados
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              Faça upload dos demonstrativos dos planos para acompanhar
                              seus pagamentos
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>

                    {/* Glosas Pendentes - Terceira prioridade */}
                    <Link to="/unpaid-procedures" className="group">
                      <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-900/20">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <AlertTriangle className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">
                                Glosas e Pendências
                              </h4>
                              {temGlosasCriticas && (
                                <Badge variant="destructive">Atenção necessária</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              Acompanhe e conteste glosas para recuperar seus honorários
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>

                    {/* Linha inferior - Ações complementares */}

                    {/* Relatórios Personalizados */}
                    <Link to="/reports" className="group">
                      <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/20">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <FileBarChart className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">Relatórios</h4>
                              <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-700"
                              >
                                Analytics
                              </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              Gere relatórios detalhados de performance e lucratividade
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>

                    {/* Intelligence Hub */}
                    <Link to="/intelligence" className="group">
                      <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-50/50 to-transparent dark:from-cyan-900/20">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                            <Brain className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">
                                Intelligence Hub
                              </h4>
                              <Badge
                                variant="secondary"
                                className="bg-cyan-100 text-cyan-700"
                              >
                                IA Médica
                              </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              Insights inteligentes sobre sua prática e tendências do
                              mercado
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>

                    {/* Análise de Performance */}
                    <Link to="/compare" className="group">
                      <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/20">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <BarChart3 className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">
                                Análise Comparativa
                              </h4>
                              <Badge
                                variant="secondary"
                                className="bg-emerald-100 text-emerald-700"
                              >
                                Benchmarking
                              </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              Compare sua performance com referências do mercado médico
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                      </Card>
                    </Link>
                  </div>
                </section>

                {/* Alertas Contextuais */}
                {(temGlosasCriticas || taxaSucessoBaixa || poucosAnalisados) && (
                  <section className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Shield className="h-5 w-5 text-amber-600" />
                        Recomendações Personalizadas
                      </h3>
                    </div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      {temGlosasCriticas && (
                        <DashboardAlert
                          type="warning"
                          title="Taxa de glosas acima do esperado"
                          message="Você tem uma alta taxa de glosas. Revise os procedimentos contestados e considere recursos de glosa para recuperar esses valores."
                          actionLabel="Ver glosas pendentes"
                          actionLink="/unpaid-procedures"
                        />
                      )}

                      {taxaSucessoBaixa && (
                        <DashboardAlert
                          type="info"
                          title="Oportunidade de melhoria"
                          message="Sua taxa de aprovação pode melhorar. Verifique se as guias estão sendo preenchidas corretamente antes do envio."
                          actionLabel="Verificar guias"
                          actionLink="/guides"
                        />
                      )}

                      {poucosAnalisados && (
                        <DashboardAlert
                          type="info"
                          title="Carregue mais demonstrativos"
                          message="Para ter uma análise mais completa, adicione mais demonstrativos dos seus atendimentos recentes."
                          actionLabel="Carregar demonstrativos"
                          actionLink="/demonstratives"
                        />
                      )}
                    </div>
                  </section>
                )}

                {/* Fim do conteúdo principal */}
              </>
            )}
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default DashboardPage;
