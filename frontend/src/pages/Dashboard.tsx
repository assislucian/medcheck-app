import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import { DashboardOverview } from "../components/dashboard/DashboardOverview";
import { DashboardAlert } from "../components/dashboard/DashboardAlert";
import { DashboardTabs } from "../components/dashboard/tabs/DashboardTabs";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../contexts/auth/AuthContext";
import { UserMenu } from "../components/navbar/UserMenu";
import { LayoutDashboard, ArrowUpRight, AlertCircle, FileText, ClipboardList, TrendingUp } from "lucide-react";
import InfoCard from "../components/ui/InfoCard";
import { formatCurrency } from "../utils/format";
import { useDashboardStats } from "../hooks/use-dashboard-stats";
import { Loader2 } from "lucide-react";
import { Procedure } from "../types/medical";
import { GamificationCard } from "../components/dashboard/GamificationCard";
import { Button } from "../components/ui/button";
import { SkeletonInfoCard } from "../components/ui/SkeletonInfoCard";
import { RevenuePieChart } from "../components/dashboard/RevenuePieChart";
import { AnimatedNumber } from "../components/ui/AnimatedNumber";

const DashboardPage = () => {
  const { userProfile, signOut } = useAuth();
  const { data: stats, isLoading, isError } = useDashboardStats();
  // Fallback mock caso backend não traga todos campos ainda
  const totals = stats?.totals || {
    totalRecebido: 12597,
    totalGlosado: 1438,
    totalProcedimentos: 284,
    auditoriaPendente: 8,
    potencialRecuperacao: 1438, // default = valor glosado
    taxaSucesso: 0.85 // default value
  };
  // Valor apresentado é a soma do que foi pago + glosado
  const valorApresentado = totals.totalRecebido + totals.totalGlosado;
  const procedures: Procedure[] = stats?.procedures || [];
  return (
    <AuthenticatedLayout 
      title="Dashboard" 
      description="Visão geral de seus procedimentos e pagamentos"
    >
      <PageHeader
        title="Dashboard"
        icon={<LayoutDashboard size={28} />}
        actions={userProfile ? (
          <UserMenu
            name={userProfile.name || 'Usuário'}
            email={userProfile.email || 'sem-email@exemplo.com'}
            specialty={userProfile.crm || ''}
            avatarUrl={userProfile.avatarUrl || undefined}
            onLogout={signOut}
          />
        ) : null}
      />
      {isLoading ? (
        <div className="grid gap-5 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 mb-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonInfoCard key={idx} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-lg font-medium text-red-500">Erro ao carregar dados do dashboard.</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 mb-8">
          <InfoCard
            icon={<ArrowUpRight className="h-6 w-6" />}
            title={<span className="text-xs font-semibold">Valor Apresentado</span>}
            value={<AnimatedNumber value={valorApresentado} format={formatCurrency} className="text-2xl md:text-3xl font-bold" />}
            description={<span className="text-xs">Procedimentos enviados</span>}
            variant="info"
          />
          <InfoCard
            icon={<AlertCircle className="h-6 w-6" />}
            title={<span className="text-xs font-semibold">Valor Pago</span>}
            value={<AnimatedNumber value={totals.totalRecebido} format={formatCurrency} className="text-2xl md:text-3xl font-bold" />}
            description={<span className="text-xs">Últimos 30 dias</span>}
            variant="success"
          />
          <InfoCard
            icon={<FileText className="h-6 w-6" />}
            title={<span className="text-xs font-semibold">Glosa</span>}
            value={<AnimatedNumber value={totals.totalGlosado} format={formatCurrency} className="text-2xl md:text-3xl font-bold" />}
            description={<span className="text-xs">Montante glosado</span>}
            variant="danger"
          />
          <InfoCard
            icon={<ClipboardList className="h-6 w-6" />}
            title={<span className="text-xs font-semibold">Procedimentos</span>}
            value={<AnimatedNumber value={totals.totalProcedimentos || 0} format={(v)=>v.toLocaleString('pt-BR')} className="text-2xl md:text-3xl font-bold" />}
            description={<span className="text-xs">Últimos 30 dias</span>}
            variant="neutral"
          />
          <InfoCard
            icon={<TrendingUp className="h-6 w-6" />}
            title={<span className="text-xs font-semibold">Potencial de Recuperação</span>}
            value={<AnimatedNumber value={totals.potencialRecuperacao ?? totals.totalGlosado} format={formatCurrency} className="text-2xl md:text-3xl font-bold" />}
            description={<span className="text-xs">Valores contestáveis</span>}
            variant="warning"
          />
          <InfoCard
            icon={<ArrowUpRight className="h-6 w-6" />}
            title={<span className="text-xs font-semibold">Taxa de Sucesso</span>}
            value={<AnimatedNumber value={totals.taxaSucesso ?? 0} format={(v)=>`${v.toFixed(0)}%`} className="text-2xl md:text-3xl font-bold" />}
            description={<span className="text-xs">Procedimentos pagos</span>}
            variant="success"
          />
        </div>
      )}
      {/* Gamification progress */}
      {!isError && (
        isLoading ? (
          <div className="mb-6 h-24 w-full animate-pulse rounded-xl bg-muted/20" />
        ) : (
          <GamificationCard
            recovered={totals.totalRecebido - totals.totalGlosado}
            className="mb-6"
          />
        )
      )}
      {/* Distribuição Paid vs Glosa */}
      {!isError && (
        isLoading ? (
          <div className="mb-8 h-[300px] w-full animate-pulse rounded-xl bg-muted/20" />
        ) : (
          <RevenuePieChart
            totalRecebido={totals.totalRecebido}
            totalGlosado={totals.totalGlosado}
            className="mb-8"
          />
        )
      )}
      <div className="grid gap-6">
        <DashboardTabs procedures={procedures} />
      </div>
    </AuthenticatedLayout>
  );
};

export default DashboardPage;
