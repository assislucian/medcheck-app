import { StatusCards } from "./dashboard/StatusCards";
import { AnalyticsChart } from "./dashboard/AnalyticsChart";
import { RecentActivities } from "./dashboard/RecentActivities";
import ComparisonView from "./ComparisonView";
import { Card, CardContent } from "./ui/card";
import { AlertCircle, TrendingUp } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

const Dashboard = () => {
  const { data } = useDashboardStats();
  
  // Calculate actionable insights
  const totalRecovered = data?.totals.totalRecebido || 0;
  const actionableGlosas = data?.totals.auditoriaPendente || 0;
  
  return (
    <div className="space-y-6">
      {/* Insights Message */}
      {totalRecovered > 0 && (
        <Card className="border-primary/20 bg-primary/5 glass-card shadow-2xl animate-fadein transition-all duration-500">
          <CardContent className="p-4 flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-4 shadow-md">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-lg text-gradient">
                Você recuperou R$ {totalRecovered.toLocaleString('pt-BR')} este mês. Excelente!
              </p>
              <p className="text-sm text-muted-foreground">
                Continue acompanhando seus pagamentos para maximizar seus rendimentos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {actionableGlosas > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5 glass-card shadow-2xl animate-fadein transition-all duration-500">
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-500/10 p-2 rounded-full mr-4 shadow-md">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-lg text-gradient">
                Detectamos {actionableGlosas} glosa{actionableGlosas > 1 ? 's' : ''} que {actionableGlosas > 1 ? 'podem' : 'pode'} ser contestada{actionableGlosas > 1 ? 's' : ''} com sucesso.
              </p>
              <p className="text-sm text-muted-foreground">
                Vá até a análise comparativa para gerar as contestações com 1 clique.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Cards de status com métricas importantes */}
      <StatusCards />
      
      {/* Seção com gráficos analíticos e atividades recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsChart />
        <RecentActivities />
      </div>
      
      {/* Visualização de comparativos CBHPM */}
      <div className="pt-4">
        <ComparisonView />
      </div>
    </div>
  );
};

export default Dashboard;
