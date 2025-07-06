import { StatusCard } from '@/components/StatusCard';
import { FileText, AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchReportsTotals } from '@/services/reports';

export function StatusCardsSection() {
  const [reportData, setReportData] = useState({
    totalRecebido: 0,
    totalGlosado: 0,
    totalProcedimentos: 0,
    auditoriaPendente: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportsData = async () => {
      const data = await fetchReportsTotals();
      setReportData(data);
      setLoading(false);
    };

    loadReportsData();
  }, []);

  // Formatar os valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatusCard
        title="Total Recebido"
        value={loading ? 'Carregando...' : formatCurrency(reportData.totalRecebido)}
        icon={FileText}
        trend={{ value: 8, isPositive: true }}
        description="Pagamentos recebidos em 2025"
      />
      <StatusCard
        title="Total Glosado"
        value={
          loading ? 'Carregando...' : formatCurrency(Math.abs(reportData.totalGlosado))
        }
        icon={AlertCircle}
        trend={{ value: 12, isPositive: false }}
        className="border-red-500/20"
        description="Valor total glosado em 2025"
      />
      <StatusCard
        title="Procedimentos"
        value={loading ? 'Carregando...' : reportData.totalProcedimentos.toString()}
        icon={FileText}
        description="Total de procedimentos analisados"
      />
      <StatusCard
        title="Auditorias Pendentes"
        value={loading ? 'Carregando...' : reportData.auditoriaPendente.toString()}
        icon={Clock}
        className="border-amber-500/20"
        description="Uploads pendentes de análise"
      />
    </div>
  );
}
