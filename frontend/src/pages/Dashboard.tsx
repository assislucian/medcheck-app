import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import { DashboardOverview } from "../components/dashboard/DashboardOverview";
import { DashboardAlert } from "../components/dashboard/DashboardAlert";
import { DashboardTabs } from "../components/dashboard/tabs/DashboardTabs";
import PageHeader from "../components/layout/PageHeader";
import { LayoutDashboard } from "lucide-react";

const DashboardPage = () => {
  return (
    <AuthenticatedLayout 
      title="Dashboard" 
      description="Visão geral de seus procedimentos e pagamentos"
    >
      <PageHeader title="Dashboard" icon={<LayoutDashboard size={24} />} />
      <div className="grid gap-6">
        <DashboardOverview />
        <DashboardAlert />
        <DashboardTabs />
      </div>
    </AuthenticatedLayout>
  );
};

export default DashboardPage;
