/**
 * Estatísticas dos Demonstrativos
 * Componente focado em exibir métricas principais
 */
import { Card, CardContent } from '../ui/card';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { FileBarChart, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface DemonstrativesStatsProps {
  stats: {
    totalProcessado: number;
    totalGlosa: number;
    totalProcedimentos: number;
    demonstrativosComGlosa: number;
    demonstrativosSemGlosa: number;
    totalApresentado: number;
  };
}

export function DemonstrativesStats({ stats }: DemonstrativesStatsProps) {
  const taxaAprovacao = stats.totalApresentado > 0 
    ? ((stats.totalProcessado / stats.totalApresentado) * 100)
    : 0;

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Processado */}
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
        <CardContent className="relative p-6">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 w-fit">
              <TrendingUp className="h-6 w-6 text-emerald-700" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Total Processado
              </p>
              <p className="text-2xl font-bold text-emerald-800 leading-none">
                <AnimatedNumber value={stats.totalProcessado} prefix="R$ " />
              </p>
              <p className="text-xs text-emerald-600">
                Valores aprovados pelos planos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Glosas */}
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-rose-500"></div>
        <CardContent className="relative p-6">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 w-fit">
              <AlertCircle className="h-6 w-6 text-red-700" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                Total Glosas
              </p>
              <p className="text-2xl font-bold text-red-800 leading-none">
                <AnimatedNumber value={stats.totalGlosa} prefix="R$ " />
              </p>
              <p className="text-xs text-red-600">
                Valores negados/contestados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Procedimentos */}
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-sky-500"></div>
        <CardContent className="relative p-6">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 w-fit">
              <FileBarChart className="h-6 w-6 text-blue-700" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Procedimentos
              </p>
              <p className="text-2xl font-bold text-blue-800 leading-none">
                <AnimatedNumber value={stats.totalProcedimentos} />
              </p>
              <p className="text-xs text-blue-600">
                Total analisados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxa de Aprovação */}
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
        <CardContent className="relative p-6">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 w-fit">
              <CheckCircle className="h-6 w-6 text-purple-700" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                Taxa Aprovação
              </p>
              <p className="text-2xl font-bold text-purple-800 leading-none">
                <AnimatedNumber value={taxaAprovacao} suffix="%" />
              </p>
              <p className="text-xs text-purple-600">
                Eficiência dos pagamentos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}