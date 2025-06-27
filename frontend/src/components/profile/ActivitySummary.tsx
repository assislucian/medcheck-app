import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  TrendingUp,
  FileText,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardData {
  totals: {
    totalRecebido: number;
    totalGlosado: number;
    totalProcedimentos: number;
    auditoriaPendente: number;
  };
  procedures: any[];
  glosas: any[];
}

export const ActivitySummary = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

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
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Não foi possível carregar o resumo de atividades');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateDivergenceRate = () => {
    if (!data) return 0;
    const total = data.totals.totalRecebido + data.totals.totalGlosado;
    if (total === 0) return 0;
    return Math.round((data.totals.totalGlosado / total) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resumo de Atividades (últimos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resumo de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resumo de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhum dado disponível para exibir.
          </p>
        </CardContent>
      </Card>
    );
  }

  const divergenceRate = calculateDivergenceRate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Resumo de Atividades (últimos 30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Procedimentos Analisados:
            </dt>
            <dd className="font-semibold text-blue-600">
              {data.totals.totalProcedimentos}
            </dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Glosas Detectadas:
            </dt>
            <dd className="font-semibold text-orange-600">{data.glosas.length}</dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Taxa de Glosa:
            </dt>
            <dd
              className={`font-semibold ${
                divergenceRate > 20
                  ? 'text-red-600'
                  : divergenceRate > 10
                    ? 'text-orange-600'
                    : 'text-green-600'
              }`}
            >
              {divergenceRate}%
            </dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Valor Total Recebido:
            </dt>
            <dd className="font-semibold text-green-600">
              {formatCurrency(data.totals.totalRecebido)}
            </dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Valor Total Glosado:
            </dt>
            <dd className="font-semibold text-red-600">
              {formatCurrency(data.totals.totalGlosado)}
            </dd>
          </div>

          {data.totals.auditoriaPendente > 0 && (
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <dt className="font-medium flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4" />
                Auditorias Pendentes:
              </dt>
              <dd className="font-semibold text-yellow-800 dark:text-yellow-200">
                {data.totals.auditoriaPendente}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
          <p>Dados baseados nos últimos 30 dias de atividade</p>
        </div>
      </CardContent>
    </Card>
  );
};
