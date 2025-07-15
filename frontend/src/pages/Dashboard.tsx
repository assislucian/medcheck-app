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
import { InfoCard, InfoCardGrid } from '../components/ui/InfoCard';
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
import { useMobileLayout } from '../hooks/use-mobile';

const DashboardPage = () => {
  const { userProfile, signOut } = useAuth();
  const { data: stats, isLoading, isError } = useDashboardStats();
  const { isMobile, shouldStackCards, gridCols } = useMobileLayout();

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
          content="Dashboard completo para gestão de honorários médicos, análise de glosas e monitoramento de demonstrativos."
        />
      </Helmet>

      <AuthenticatedLayout
        title="Dashboard"
        description="Visão geral da sua prática médica"
        isLoading={isLoading}
        loadingMessage="Carregando dados da sua prática..."
      >
        <div className={`space-y-${isMobile ? '6' : '8'}`}>
          {/* Header adaptativo para mobile */}
          <div className={`text-center ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Stethoscope
                  className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-blue-600`}
                />
                <h1
                  className={`font-bold text-gray-900 dark:text-gray-100 ${
                    isMobile ? 'text-xl' : 'text-3xl'
                  }`}
                >
                  Olá, Dr(a). {userProfile?.name?.split(' ')[0] || 'Médico'}
                </h1>
              </div>
              {userProfile?.specialty && (
                <Badge
                  variant="secondary"
                  className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}
                >
                  {userProfile.specialty}
                </Badge>
              )}
            </div>
            <p
              className={`text-gray-600 dark:text-gray-400 max-w-2xl mx-auto ${
                isMobile ? 'text-sm' : 'text-base'
              }`}
            >
              {needsAttention
                ? '⚠️ Sua prática precisa de atenção. Verifique as métricas abaixo.'
                : '✅ Sua prática está bem monitorada. Continue acompanhando.'}
            </p>
          </div>

          {/* Métricas Principais - Grid Responsivo */}
          <InfoCardGrid
            columns={{
              mobile: 1,
              tablet: 2,
              desktop: 4,
            }}
          >
            <InfoCard
              icon={<DollarSign className="h-5 w-5" />}
              title="Total Recebido"
              mobileLabel="Recebido"
              value={<AnimatedNumber value={totals.totalRecebido} format="currency" />}
              description="Valores efetivamente pagos"
              variant="success"
              compact={isMobile}
              trend={
                totals.totalRecebido > 0
                  ? { value: 12, isPositive: true, label: 'este mês' }
                  : undefined
              }
              actions={[
                {
                  label: 'Ver Detalhes',
                  onClick: () => console.log('Ver detalhes'),
                  icon: <Eye className="h-4 w-4" />,
                },
              ]}
            />

            <InfoCard
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Total Glosado"
              mobileLabel="Glosado"
              value={<AnimatedNumber value={totals.totalGlosado} format="currency" />}
              description="Valores não pagos pelos convênios"
              variant={totals.totalGlosado > 0 ? 'danger' : 'neutral'}
              compact={isMobile}
              trend={
                totals.totalGlosado > 0
                  ? { value: 8, isPositive: false, label: 'redução' }
                  : undefined
              }
              actions={[
                {
                  label: 'Contestar',
                  onClick: () => console.log('Contestar'),
                  icon: <Shield className="h-4 w-4" />,
                },
              ]}
            />

            <InfoCard
              icon={<FileText className="h-5 w-5" />}
              title="Procedimentos"
              mobileLabel="Procedimentos"
              value={<AnimatedNumber value={totals.totalProcedimentos} />}
              description="Total de procedimentos analisados"
              variant="info"
              compact={isMobile}
              actions={[
                {
                  label: 'Ver Lista',
                  onClick: () => console.log('Ver lista'),
                  icon: <ClipboardList className="h-4 w-4" />,
                },
              ]}
            />

            <InfoCard
              icon={<Target className="h-5 w-5" />}
              title="Taxa de Sucesso"
              mobileLabel="Taxa Sucesso"
              value={formatPercentage(taxaSucesso)}
              description="Percentual de procedimentos pagos"
              variant={
                taxaSucesso >= 85 ? 'success' : taxaSucesso >= 70 ? 'warning' : 'danger'
              }
              compact={isMobile}
              trend={
                taxaSucesso > 0
                  ? { value: 5, isPositive: taxaSucesso >= 85, label: 'melhoria' }
                  : undefined
              }
            />
          </InfoCardGrid>

          {/* Análises Rápidas - Adaptadas para Mobile */}
          <div
            className={`grid gap-${isMobile ? '4' : '6'} ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
            }`}
          >
            {/* Performance Mensal */}
            <Card>
              <CardHeader className={isMobile ? 'pb-3' : ''}>
                <CardTitle
                  className={`flex items-center gap-2 ${
                    isMobile ? 'text-base' : 'text-lg'
                  }`}
                >
                  <BarChart3
                    className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`}
                  />
                  Performance Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-${isMobile ? '3' : '4'}`}>
                <InfoCardGrid
                  columns={{
                    mobile: 2,
                    tablet: 2,
                    desktop: 2,
                  }}
                  className="gap-3"
                >
                  <InfoCard
                    title="Valor Médio"
                    value={formatCurrency(valorMedioRecebido)}
                    variant="neutral"
                    compact
                  />
                  <InfoCard
                    title="Procedimentos Pagos"
                    value={procedimentosPagos}
                    variant="success"
                    compact
                  />
                </InfoCardGrid>
              </CardContent>
            </Card>

            {/* Alertas e Ações */}
            <Card>
              <CardHeader className={isMobile ? 'pb-3' : ''}>
                <CardTitle
                  className={`flex items-center gap-2 ${
                    isMobile ? 'text-base' : 'text-lg'
                  }`}
                >
                  <Brain
                    className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-purple-600`}
                  />
                  Próximas Ações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`space-y-${isMobile ? '2' : '3'}`}>
                  {temGlosasCriticas && (
                    <DashboardAlert
                      type="warning"
                      title="Glosas Críticas"
                      message="Suas glosas estão acima de 15%. Considere revisar os procedimentos."
                      action={
                        <Button size="sm" asChild>
                          <Link to="/unpaid-procedures">Revisar Glosas</Link>
                        </Button>
                      }
                      compact={isMobile}
                    />
                  )}

                  {taxaSucessoBaixa && (
                    <DashboardAlert
                      type="error"
                      title="Taxa de Sucesso Baixa"
                      message="Sua taxa está abaixo de 85%. Analise os demonstrativos."
                      action={
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/demonstratives">Ver Demonstrativos</Link>
                        </Button>
                      }
                      compact={isMobile}
                    />
                  )}

                  {poucosAnalisados && (
                    <DashboardAlert
                      type="info"
                      title="Poucos Dados"
                      message="Envie mais documentos para análises precisas."
                      action={
                        <Button size="sm" asChild>
                          <Link to="/guides">
                            <Upload className="h-4 w-4 mr-1" />
                            Enviar Guias
                          </Link>
                        </Button>
                      }
                      compact={isMobile}
                    />
                  )}

                  {!needsAttention && (
                    <DashboardAlert
                      type="success"
                      title="Tudo em Ordem"
                      message="Sua prática está bem monitorada. Continue assim!"
                      compact={isMobile}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas - Compactas para Mobile */}
          <Card>
            <CardHeader className={isMobile ? 'pb-3' : ''}>
              <CardTitle
                className={`flex items-center gap-2 ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}
              >
                <Zap
                  className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-600`}
                />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`grid gap-${isMobile ? '3' : '4'} ${
                  isMobile ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}
              >
                <Button
                  asChild
                  variant="outline"
                  className={`${isMobile ? 'h-auto py-3 text-xs' : ''} justify-start`}
                >
                  <Link to="/guides" className="flex items-center gap-2">
                    <FileText className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span>Enviar Guias</span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className={`${isMobile ? 'h-auto py-3 text-xs' : ''} justify-start`}
                >
                  <Link to="/demonstratives" className="flex items-center gap-2">
                    <FileBarChart className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span>Demonstrativos</span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className={`${isMobile ? 'h-auto py-3 text-xs' : ''} justify-start`}
                >
                  <Link to="/reports" className="flex items-center gap-2">
                    <BarChart3 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span>Relatórios</span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className={`${isMobile ? 'h-auto py-3 text-xs' : ''} justify-start`}
                >
                  <Link to="/help" className="flex items-center gap-2">
                    <Search className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span>Ajuda</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Componentes avançados mantidos para desktop */}
          {!isMobile && (
            <>
              <DashboardOverview
                totals={totals}
                procedures={procedures}
                glosasRecentes={glosasRecentes}
              />

              <RecoveryProgressCard
                totalRecebido={totals.totalRecebido}
                totalGlosado={totals.totalGlosado}
                taxaSucesso={taxaSucesso}
              />

              <RevenuePieChart
                totalRecebido={totals.totalRecebido}
                totalGlosado={totals.totalGlosado}
              />
            </>
          )}
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default DashboardPage;
