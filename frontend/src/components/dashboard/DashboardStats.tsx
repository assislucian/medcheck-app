/**
 * Componente separado para estatísticas do Dashboard
 * Reduz complexidade da página principal
 */
import { Card, CardContent } from '../ui/card';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { ArrowUpRight, AlertTriangle, FileBarChart, Clock } from 'lucide-react';

interface DashboardStatsProps {
  totals: {
    totalRecebido: number;
    totalGlosado: number;
    totalProcedimentos: number;
    auditoriaPendente: number;
  };
}

export function DashboardStats({ totals }: DashboardStatsProps) {
  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Valores Recebidos */}
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
        <CardContent className="relative p-8">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 w-fit">
              <ArrowUpRight className="h-7 w-7 text-emerald-700" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Já Recebido
              </p>
              <p className="text-3xl font-bold text-emerald-800 leading-none">
                <AnimatedNumber
                  value={totals.totalRecebido}
                  prefix="R$ "
                />
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
              <p className="text-3xl font-bold text-red-800 leading-none">
                <AnimatedNumber
                  value={totals.totalGlosado}
                  prefix="R$ "
                />
              </p>
              <p className="text-sm text-red-600">
                Valores contestados pelos planos
              </p>
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
              <p className="text-sm text-blue-600">
                Total de atendimentos analisados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Pendências */}
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
              <p className="text-sm text-amber-600">
                Casos que precisam de atenção
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}