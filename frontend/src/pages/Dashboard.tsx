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

const DashboardPage = () => {
  const { userProfile, signOut } = useAuth();
  const { data: stats, isLoading, isError } = useDashboardStats();
  // Fallback para mocks se não houver dados reais
  const totals = stats?.totals || {
    totalRecebido: 12597,
    totalGlosado: 1438,
    totalProcedimentos: 284,
    auditoriaPendente: 8
  };
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
        <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
      ) : isError ? (
        <div className="text-center text-red-500">Erro ao carregar dados do dashboard.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <InfoCard
            icon={<ArrowUpRight className="h-6 w-6" />}
            title={<span className="text-xs font-semibold">Total Recebido</span>}
            value={<span className="text-2xl md:text-3xl font-bold">{formatCurrency(totals.totalRecebido)}</span>}
            description={<span className="text-xs">Recebido nos últimos 30 dias</span>}
            variant="success"
          />
          <InfoCard
            icon={<AlertCircle className="h-6 w-6" />}
            title={<span className="text-xs font-semibold">Total Glosado</span>}
            value={<span className="text-2xl md:text-3xl font-bold">{formatCurrency(totals.totalGlosado)}</span>}
            description={<span className="text-xs">Glosado nos últimos 30 dias</span>}
            variant="danger"
          />
          <InfoCard
            icon={<FileText className="h-6 w-6" />}
            title={<span className="text-xs font-semibold">Procedimentos</span>}
            value={<span className="text-2xl md:text-3xl font-bold">{totals.totalProcedimentos}</span>}
            description={<span className="text-xs">Analisados nos últimos 30 dias</span>}
            variant="info"
          />
          <InfoCard
            icon={<ClipboardList className="h-6 w-6" />}
            title={<span className="text-xs font-semibold">Auditorias Pendentes</span>}
            value={<span className="text-2xl md:text-3xl font-bold">{totals.auditoriaPendente}</span>}
            description={<span className="text-xs">Uploads aguardando sua revisão</span>}
            variant="warning"
          />
        </div>
      )}
      <InfoCard
        icon={<TrendingUp className="h-6 w-6" />}
        title={`Você recuperou ${formatCurrency(totals.totalRecebido - totals.totalGlosado)} este mês. Excelente!`}
        description="Continue acompanhando seus pagamentos para maximizar seus rendimentos."
        variant="info"
        className="w-full mb-6"
      />
      <div className="grid gap-6">
        <DashboardTabs procedures={procedures} />
      </div>
    </AuthenticatedLayout>
  );
};

export default DashboardPage;
