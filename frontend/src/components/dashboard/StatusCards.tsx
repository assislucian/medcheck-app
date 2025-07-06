import { FileText, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { StatusCard } from '@/components/StatusCard';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

export function StatusCards() {
  const { data, isLoading } = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusCard
        title="Total Recebido"
        value={
          isLoading ? 'Carregando...' : formatCurrency(data?.totals.totalRecebido || 0)
        }
        icon={FileText}
        trend={{ value: 8, isPositive: true }}
        description="Pagamentos em 2025"
        variant="success"
      />
      <StatusCard
        title="Total Glosado"
        value={
          isLoading ? 'Carregando...' : formatCurrency(data?.totals.totalGlosado || 0)
        }
        icon={AlertCircle}
        trend={{ value: 12, isPositive: false }}
        variant="error"
        description="Valor glosado em 2025"
        tooltipContent="Este é o valor total glosado pelos planos de saúde que poderia ter sido recebido"
      />
      <StatusCard
        title="Procedimentos"
        value={
          isLoading ? 'Carregando...' : String(data?.totals.totalProcedimentos || 0)
        }
        icon={TrendingUp}
        description="Procedimentos analisados"
        variant="default"
      />
      <StatusCard
        title="Auditorias Pendentes"
        value={
          isLoading ? 'Carregando...' : String(data?.totals.auditoriaPendente || 0)
        }
        icon={Clock}
        variant="warning"
        description="Uploads pendentes"
        tooltipContent="Auditorias que aguardam sua revisão"
      />
    </div>
  );
}
