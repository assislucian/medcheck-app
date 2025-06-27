import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { DashboardAlert } from '../components/dashboard/DashboardAlert';
import { DashboardTabs } from '../components/dashboard/tabs/DashboardTabs';
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
} from 'lucide-react';
import { InfoCard } from '../components/ui/InfoCard';
import { formatCurrency, formatPercentage } from '../utils/format';
import { useDashboardStats } from '../hooks/use-dashboard-stats';
import { Loader2 } from 'lucide-react';
import { Procedure } from '../types/medical';
import { RecoveryProgressCard } from '../components/dashboard/RecoveryProgressCard';
import { Button } from '../components/ui/button';
import { SkeletonInfoCard } from '../components/ui/SkeletonInfoCard';
import { RevenuePieChart } from '../components/dashboard/RevenuePieChart';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

const DashboardPage = () => {
  const { userProfile, signOut } = useAuth();
  const { data: stats, isLoading, isError } = useDashboardStats();
  const backendTotals = stats?.totals;
  // Defaults se ainda não houver dados no backend (primeiro uso)
  const totals = {
    totalRecebido: backendTotals?.totalRecebido ?? 0,
    totalGlosado: backendTotals?.totalGlosado ?? 0,
    totalProcedimentos: backendTotals?.totalProcedimentos ?? 0,
    auditoriaPendente: backendTotals?.auditoriaPendente ?? 0,
  };
  const valorApresentado = totals.totalRecebido + totals.totalGlosado;
  const potencialRecuperacao = totals.totalGlosado; // por enquanto
  const taxaSucesso =
    valorApresentado > 0 ? (totals.totalRecebido / valorApresentado) * 100 : 0;
  const procedures: Procedure[] = stats?.procedures || [];
  return (
    <AuthenticatedLayout
      title="Dashboard"
      description="Visão geral de seus procedimentos e pagamentos"
    >
      <PageHeader
        title="Dashboard"
        icon={<LayoutDashboard size={28} />}
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
          /* Seguindo exatamente o mesmo padrão da página de Demonstrativos */
          <section aria-label="Painel de Performance Médica" className="mb-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-2">
              <InfoCard
                icon={<ArrowUpRight className="h-6 w-6" />}
                title={<span className="text-xs font-semibold">Total Recebido</span>}
                value={
                  <span className="text-2xl md:text-3xl font-bold">
                    {formatCurrency(totals.totalRecebido)}
                  </span>
                }
                description={<span className="text-xs">Pagamentos confirmados</span>}
                variant="success"
              />
              <InfoCard
                icon={<AlertCircle className="h-6 w-6" />}
                title={<span className="text-xs font-semibold">Total Glosado</span>}
                value={
                  <span className="text-2xl md:text-3xl font-bold">
                    {formatCurrency(totals.totalGlosado)}
                  </span>
                }
                description={<span className="text-xs">Procedimentos contestados</span>}
                variant="danger"
              />
              <InfoCard
                icon={<FileText className="h-6 w-6" />}
                title={<span className="text-xs font-semibold">Procedimentos</span>}
                value={
                  <span className="text-2xl md:text-3xl font-bold">
                    {totals.totalProcedimentos}
                  </span>
                }
                description={
                  <span className="text-xs">Analisados nos últimos 30 dias</span>
                }
                variant="info"
              />
              <InfoCard
                icon={<TrendingUp className="h-6 w-6" />}
                title={<span className="text-xs font-semibold">Taxa de Aprovação</span>}
                value={
                  <span className="text-2xl md:text-3xl font-bold">
                    {formatPercentage(taxaSucesso)}
                  </span>
                }
                description={<span className="text-xs">Percentual de sucesso</span>}
                variant={
                  taxaSucesso >= 80
                    ? 'success'
                    : taxaSucesso >= 60
                      ? 'warning'
                      : 'danger'
                }
              />
            </div>
          </section>
        )}

        {/* Gamification progress */}
        {!isError &&
          (isLoading ? (
            <div className="mb-4 sm:mb-6 h-20 sm:h-24 w-full animate-pulse rounded-xl bg-muted/20" />
          ) : (
            <RecoveryProgressCard
              presented={valorApresentado}
              received={totals.totalRecebido}
              className="mb-4 sm:mb-6"
            />
          ))}

        {/* Distribuição Paid vs Glosa */}
        {!isError &&
          (isLoading ? (
            <div className="mb-6 sm:mb-8 h-[250px] sm:h-[300px] w-full animate-pulse rounded-xl bg-muted/20" />
          ) : (
            <RevenuePieChart
              totalRecebido={totals.totalRecebido}
              totalGlosado={totals.totalGlosado}
              className="mb-6 sm:mb-8"
            />
          ))}

        <div className="grid gap-4 sm:gap-6">
          <DashboardTabs procedures={procedures} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default DashboardPage;
