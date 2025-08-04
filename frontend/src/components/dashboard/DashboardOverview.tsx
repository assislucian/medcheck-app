import { Card, CardContent } from '@/components/ui/card';
import { formatPercentage } from '@/utils/format';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  FileBarChart,
  FileText
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface DashboardData {
  totals: {
    totalRecebido: number;
    totalGlosado: number;
    totalProcedimentos: number;
    auditoriaPendente: number;
    glosasDetectadas: number;
    taxaGlosa: number;
  };
  procedures: any[];
  glosas: any[];
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Não foi possível carregar os dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 animate-pulse"></div>
            <CardContent className="relative p-8">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 w-fit animate-pulse">
                  <div className="h-7 w-7 bg-amber-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-amber-200 rounded animate-pulse"></div>
                  <div className="h-8 bg-amber-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-amber-200 rounded animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4 border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-100 to-rose-100">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">
                  Erro ao carregar dados
                </h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4 border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100">
                <FileText className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Nenhum dado disponível
                </h3>
                <p className="text-gray-600 text-sm">
                  Carregue seus primeiros demonstrativos para ver os dados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { totals } = data;

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Valores Recebidos */}
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
        <CardContent className="relative p-8">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 w-fit">
              <DollarSign className="h-7 w-7 text-emerald-700" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Já Recebido
              </p>
              <p className="text-3xl font-bold text-emerald-800 leading-none">
                <AnimatedNumber value={totals.totalRecebido} prefix="R$ " />
              </p>
              <p className="text-sm text-emerald-600">
                Valores que já estão na sua conta
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Glosas */}
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-rose-500"></div>
        <CardContent className="relative p-8">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 w-fit">
              <AlertTriangle className="h-7 w-7 text-red-700" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                Glosas Detectadas
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-red-800 leading-none">
                  <AnimatedNumber value={totals.totalGlosado} prefix="R$ " />
                </p>
                <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  {formatPercentage(totals.taxaGlosa)}
                </span>
              </div>
              <p className="text-sm text-red-600">Valores contestados pelos planos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Procedimentos */}
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-sky-500"></div>
        <CardContent className="relative p-8">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 w-fit">
              <FileBarChart className="h-7 w-7 text-blue-700" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Procedimentos
              </p>
              <p className="text-3xl font-bold text-blue-800 leading-none">
                <AnimatedNumber value={totals.totalProcedimentos} />
              </p>
              <p className="text-sm text-blue-600">Total de atendimentos analisados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Auditoria Pendente */}
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
        <CardContent className="relative p-8">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 w-fit">
              <Clock className="h-7 w-7 text-amber-700" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                Aguardando Análise
              </p>
              <p className="text-3xl font-bold text-amber-800 leading-none">
                <AnimatedNumber value={totals.auditoriaPendente} />
              </p>
              <p className="text-sm text-amber-600">Casos que precisam de atenção</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
