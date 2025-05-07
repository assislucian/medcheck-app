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

const DashboardPage = () => {
  const { userProfile, signOut } = useAuth();
  return (
    <AuthenticatedLayout 
      title="Dashboard" 
      description="Visão geral de seus procedimentos e pagamentos"
    >
      <PageHeader
        title="Dashboard"
        icon={<LayoutDashboard size={28} />}
        description="Visão geral de seus procedimentos e pagamentos"
        size="lg"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-4 grid-cols-1">
          <InfoCard
            icon={<ArrowUpRight className="h-6 w-6 text-green-500" />}
            title="Total Recebido"
            value={formatCurrency(12597)}
            description="+8% comparado ao mês anterior"
            variant="success"
          />
          <InfoCard
            icon={<AlertCircle className="h-6 w-6 text-red-500" />}
            title="Total Glosado"
            value={formatCurrency(1438)}
            description="12% do valor total apresentado"
            variant="danger"
          />
          <InfoCard
            icon={<FileText className="h-6 w-6 text-blue-500" />}
            title="Procedimentos"
            value={284}
            description="Analisados nos últimos 30 dias"
            variant="info"
          />
          <InfoCard
            icon={<ClipboardList className="h-6 w-6 text-amber-500" />}
            title="Auditorias Pendentes"
            value={8}
            description="Uploads aguardando sua revisão"
            variant="warning"
          />
        </div>
        <InfoCard
          icon={<TrendingUp className="h-6 w-6 text-blue-500" />}
          title="Você recuperou R$ 2.450,00 este mês. Excelente!"
          description="Continue acompanhando seus pagamentos para maximizar seus rendimentos."
          variant="info"
          className="w-full"
        />
        <DashboardOverview />
        <DashboardAlert />
        <DashboardTabs />
      </div>
    </AuthenticatedLayout>
  );
};

export default DashboardPage;
