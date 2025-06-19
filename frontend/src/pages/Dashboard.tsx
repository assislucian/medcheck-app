// Forçar build: commit técnico para garantir deploy no lovable.dev
import React from "react";
import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import { PageContainer } from "../components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Activity, 
  ArrowRight,
  Shield,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  TrendingUp,
  Clock,
  ChevronRight,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/auth/AuthContext";
import { useDashboardStats } from "../hooks/use-dashboard-stats";
import { formatCurrency } from "../utils/format";
import { DashboardStats, Procedure } from "../types/medical";
import { PageHeader } from "../components/layout/PageHeader";

interface Procedimento {
  id: number;
  paciente: string;
  procedimento: string;
  valor: number;
  status: string;
  data: string;
}

interface Alerta {
  id: number;
  tipo: string;
  mensagem: string;
  severidade: string;
}

export default function Dashboard() {
  const { userProfile } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const typedStats = stats as DashboardStats | undefined;

  // Dados mockados para demonstração
  const dashboardStats = {
    glosasAbertas: typedStats?.glosas?.length || 23,
    contestacoesVencendo: 5
  };

  const alertasUrgentes = [
    { id: 1, tipo: "Prazo", mensagem: "5 contestações vencem em 2 dias", severidade: "alta" },
    { id: 2, tipo: "Pagamento", mensagem: "Demonstrativo de Dezembro disponível", severidade: "media" },
    { id: 3, tipo: "Sistema", mensagem: "Nova atualização de códigos TUSS", severidade: "baixa" }
  ];

  const procedimentosRecentes = (typedStats?.procedures || []).slice(0, 3).map((proc: Procedure, index: number) => ({
    id: index + 1,
    paciente: proc.beneficiario,
    procedimento: proc.codigo,
    valor: proc.valorPago,
    status: proc.pago ? 'aprovado' : proc.diferenca < 0 ? 'glosado' : 'pendente',
    data: `Guia ${proc.guia}`
  }));

  const procedimentosParaExibir = procedimentosRecentes.length > 0 ? procedimentosRecentes : [
    { id: 1, paciente: "Maria Silva Santos", procedimento: "Consulta Cardiológica", valor: 350.00, status: "aprovado", data: "Hoje, 14:30" },
    { id: 2, paciente: "João Carlos Oliveira", procedimento: "ECG + Laudo", valor: 120.00, status: "pendente", data: "Hoje, 11:15" },
    { id: 3, paciente: "Ana Paula Costa", procedimento: "Holter 24h", valor: 420.00, status: "glosado", data: "Ontem, 16:45" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovado": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pendente": return "bg-amber-50 text-amber-700 border-amber-200";
      case "glosado": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case "alta": return "bg-rose-50 text-rose-700 border-rose-200";
      case "media": return "bg-amber-50 text-amber-700 border-amber-200";
      case "baixa": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <AuthenticatedLayout
      title="Dashboard"
      description="Visão geral de seus procedimentos e pagamentos"
      isLoading={isLoading}
    >
      <PageContainer>
        <PageHeader title="Dashboard" />
        <main className="page-shell">
          <section className="section-spacing">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Bem-vindo, {userProfile?.name || "Doutor(a)"}
              </h1>
              <p className="text-muted-foreground">
                Última atualização: {new Date().toLocaleString('pt-BR', { 
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </section>
          <section className="section-spacing">
            {alertasUrgentes.map((alerta) => (
              <Card key={alerta.id} className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-2 bg-rose-50">
                      <AlertTriangle className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{alerta.mensagem}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={getSeveridadeColor(alerta.severidade)}>
                          {alerta.tipo}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="hover:bg-rose-50" asChild>
                    <Link to="/contestacoes" className="flex items-center gap-2">
                      Ver detalhes
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>
          <section className="section-spacing">
            <div className="card-grid">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Glosas em Aberto
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.glosasAbertas}</div>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      +2 desde ontem
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Contestações Vencendo
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.contestacoesVencendo}</div>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                      Próximos 7 dias
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Valor Recuperado
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(typedStats?.totals?.totalRecuperado || 11159.00)}</div>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      +R$ 2.450 este mês
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
          <section className="section-spacing">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Procedimentos Recentes</CardTitle>
                    <CardDescription>
                      Últimos procedimentos processados
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/procedures" className="flex items-center gap-2">
                      Ver todos
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="content-layout">
                  {procedimentosParaExibir.map((procedimento) => (
                    <div
                      key={procedimento.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{procedimento.paciente}</p>
                          <p className="text-sm text-muted-foreground">{procedimento.procedimento}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium text-foreground">{formatCurrency(procedimento.valor)}</p>
                          <p className="text-sm text-muted-foreground">{procedimento.data}</p>
                        </div>
                        <Badge variant="secondary" className={getStatusColor(procedimento.status)}>
                          {procedimento.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </PageContainer>
    </AuthenticatedLayout>
  );
}
