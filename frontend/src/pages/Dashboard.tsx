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
  Stethoscope,
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

      {/* Background com Gradiente Âmbar Suave */}
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
        <AuthenticatedLayout
          title="Minha Prática Médica"
          description={`Bem-vindo de volta, ${
            userProfile?.nome || 'Dr(a)'
          }! Aqui está o resumo dos seus honorários e pendências.`}
        >
          <div className="space-y-12 px-4 sm:px-6 lg:px-8">
            {/* Header Humanizado para Médicos Brasileiros */}
            <div className="text-center space-y-4 pt-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200/50">
                <Stethoscope className="h-5 w-5 text-amber-700" />
                <span className="text-sm font-medium text-amber-800">
                  Sua prática médica em suas mãos
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 bg-clip-text text-transparent">
                Olá, {userProfile?.nome?.split(' ')[0] || 'Doutor(a)'}!
              </h1>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {needsAttention
                  ? 'Identificamos algumas oportunidades para otimizar seus recebimentos. Vamos analisar juntos?'
                  : 'Seus honorários estão organizados e tudo está funcionando bem. Continue assim!'}
              </p>
            </div>

            {/* Dashboard Content */}
            <div className="space-y-16">
              {isLoading ? (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <SkeletonInfoCard key={idx} />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center gap-6 py-16 text-center">
                  <div className="p-6 rounded-full bg-gradient-to-br from-red-100 to-red-50">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-red-700">
                      Ops! Algo não funcionou como esperado
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Não conseguimos carregar seus dados médicos no momento. Verifique
                      sua conexão e tente novamente.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <>
                  {/* Cards Principais - Jornada do Médico */}
                  <section className="space-y-8">
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                          <DollarSign className="h-6 w-6 text-amber-700" />
                        </div>
                        Resumo Financeiro da Sua Prática
                      </h2>
                      <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        Seus honorários organizados de forma clara: quanto você já
                        recebeu, o que ainda está pendente e onde estão as oportunidades
                        de melhoria.
                      </p>
                    </div>

                    {/* Grid de Cards com Gradientes Âmbar Perfeitos */}
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Card 1: Valores Recebidos */}
                      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
                        <CardContent className="relative p-8">
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 w-fit">
                              <ArrowUpRight className="h-7 w-7 text-emerald-700" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                                Já Recebido
                              </p>
                              <p className="text-3xl font-bold text-emerald-800 leading-none">
                                <AnimatedNumber
                                  value={totals.totalRecebido}
                                  prefix="R$ "
                                />
                              </p>
                              <p className="text-sm text-emerald-600">
                                Valores que já estão na sua conta
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2: Glosas */}
                      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-rose-500"></div>
                        <CardContent className="relative p-8">
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 w-fit">
                              <AlertTriangle className="h-7 w-7 text-red-700" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                                Glosas Detectadas
                              </p>
                              <p className="text-3xl font-bold text-red-800 leading-none">
                                <AnimatedNumber
                                  value={totals.totalGlosado}
                                  prefix="R$ "
                                />
                              </p>
                              <p className="text-sm text-red-600">
                                Valores contestados pelos planos
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 3: Procedimentos */}
                      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-sky-500"></div>
                        <CardContent className="relative p-8">
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 w-fit">
                              <FileBarChart className="h-7 w-7 text-blue-700" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                                Procedimentos
                              </p>
                              <p className="text-3xl font-bold text-blue-800 leading-none">
                                <AnimatedNumber value={totals.totalProcedimentos} />
                              </p>
                              <p className="text-sm text-blue-600">
                                Total de atendimentos analisados
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 4: Pendências */}
                      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                        <CardContent className="relative p-8">
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 w-fit">
                              <Clock className="h-7 w-7 text-amber-700" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                                Aguardando Análise
                              </p>
                              <p className="text-3xl font-bold text-amber-800 leading-none">
                                <AnimatedNumber value={totals.auditoriaPendente} />
                              </p>
                              <p className="text-sm text-amber-600">
                                Casos que precisam de atenção
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </section>

                  {/* Seção de Insights e Ações */}
                  <section className="space-y-8">
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                          <Brain className="h-6 w-6 text-purple-700" />
                        </div>
                        Suas Próximas Ações
                      </h2>
                      <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        Baseado na análise dos seus dados, preparamos as ações mais
                        importantes para otimizar seus recebimentos e reduzir glosas.
                      </p>
                    </div>

                    {/* Cards de Ação - Storytelling */}
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {/* Guias Médicas - Prioridade 1 */}
                      <Link to="/guides">
                        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 group-hover:from-blue-100 group-hover:via-indigo-100 group-hover:to-blue-200 transition-all duration-500"></div>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                          <CardContent className="relative p-8">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:scale-110 transition-transform duration-300">
                                  <Upload className="h-8 w-8 text-blue-700" />
                                </div>
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                  Essencial
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                <h3 className="text-xl font-bold text-blue-800">
                                  Enviar Guias Médicas
                                </h3>
                                <p className="text-blue-600 leading-relaxed">
                                  O primeiro passo para receber seus honorários.
                                  Organize e envie suas guias de forma prática e segura.
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-blue-700 font-medium group-hover:gap-3 transition-all duration-300">
                                <span>Começar agora</span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Demonstrativos - Prioridade 2 */}
                      <Link to="/demonstratives">
                        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 group-hover:from-emerald-100 group-hover:via-green-100 group-hover:to-emerald-200 transition-all duration-500"></div>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                          <CardContent className="relative p-8">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 group-hover:scale-110 transition-transform duration-300">
                                  <FileText className="h-8 w-8 text-emerald-700" />
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                  Importante
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                <h3 className="text-xl font-bold text-emerald-800">
                                  Conferir Demonstrativos
                                </h3>
                                <p className="text-emerald-600 leading-relaxed">
                                  Analise os pagamentos dos planos de saúde e
                                  identifique discrepâncias nos seus honorários.
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-700 font-medium group-hover:gap-3 transition-all duration-300">
                                <span>Analisar pagamentos</span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Glosas Pendentes - Prioridade 3 */}
                      <Link to="/unpaid-procedures">
                        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 group-hover:from-amber-100 group-hover:via-orange-100 group-hover:to-amber-200 transition-all duration-500"></div>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                          <CardContent className="relative p-8">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 group-hover:scale-110 transition-transform duration-300">
                                  <Shield className="h-8 w-8 text-amber-700" />
                                </div>
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                  Urgente
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                <h3 className="text-xl font-bold text-amber-800">
                                  Contestar Glosas
                                </h3>
                                <p className="text-amber-600 leading-relaxed">
                                  Defenda seus direitos! Conteste glosas indevidas e
                                  recupere valores que são seus por direito.
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-amber-700 font-medium group-hover:gap-3 transition-all duration-300">
                                <span>Contestar agora</span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </section>

                  {/* Seção de Ferramentas Adicionais */}
                  <section className="space-y-8">
                    <div className="text-center space-y-3">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Ferramentas Complementares
                      </h2>
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        Recursos adicionais para uma gestão médica ainda mais eficiente
                      </p>
                    </div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                      {/* Relatórios */}
                      <Link to="/reports">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-to-br from-gray-50 to-slate-50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-gray-100 to-slate-100">
                                <BarChart3 className="h-6 w-6 text-gray-700" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-gray-800">
                                  Relatórios
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Análises detalhadas
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Central de Inteligência */}
                      <Link to="/intelligence">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-to-br from-purple-50 to-indigo-50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                                <Brain className="h-6 w-6 text-purple-700" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-purple-800">
                                  Central de Inteligência
                                </h3>
                                <p className="text-sm text-purple-600">
                                  Insights avançados
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-purple-400 ml-auto group-hover:text-purple-600 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Análise Comparativa */}
                      <Link to="/comparison">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100">
                                <Search className="h-6 w-6 text-teal-700" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-teal-800">
                                  Análise Comparativa
                                </h3>
                                <p className="text-sm text-teal-600">Compare tabelas</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-teal-400 ml-auto group-hover:text-teal-600 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </AuthenticatedLayout>
      </div>
    </>
  );
};

export default DashboardPage;
