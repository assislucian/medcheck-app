import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  FileText,
  AlertCircle,
  FileBarChart,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/format';

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
      const response = await fetch('/api/v1/dashboard', {
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg animate-pulse">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4 p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4 p-6">
          <div className="flex items-center gap-3 text-gray-600">
            <FileText className="h-5 w-5" />
            <p>Nenhum dado disponível</p>
          </div>
        </Card>
      </div>
    );
  }

  const { totals } = data;
  const total_apresentado = totals.totalRecebido + totals.totalGlosado;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Valor Recebido */}
      <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-emerald-600">Recebido (30 dias)</p>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(totals.totalRecebido)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Glosas */}
      <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600">Glosas Detectadas</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(totals.totalGlosado)}
                </p>
                <span className="text-sm text-red-600">
                  ({formatPercentage(totals.taxaGlosa)})
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total de Procedimentos */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileBarChart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-600">Procedimentos</p>
              <p className="text-2xl font-bold text-blue-700">
                {totals.totalProcedimentos.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auditoria Pendente */}
      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-orange-600">Auditoria Pendente</p>
              <p className="text-2xl font-bold text-orange-700">
                {totals.auditoriaPendente}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
