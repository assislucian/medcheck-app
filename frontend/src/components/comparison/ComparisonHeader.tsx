import { CardDescription, CardTitle } from '@/components/ui/card';
import { BarChart3, Building2, Calendar } from 'lucide-react';

export interface ComparisonHeaderProps {
  totalProcedimentos: number;
  hospital?: string;
  competencia?: string;
}

export const ComparisonHeader = ({
  totalProcedimentos,
  hospital,
  competencia,
}: ComparisonHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Análise Comparativa CBHPM
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Comparação detalhada entre valores CBHPM 2015 e valores pagos pelo plano de
            saúde
          </CardDescription>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 pt-2">
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <span className="text-sm text-blue-600 font-medium">Procedimentos</span>
            <div className="text-lg font-bold text-blue-800">{totalProcedimentos}</div>
          </div>
        </div>

        {hospital && (
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-sm text-emerald-600 font-medium">Hospital</span>
              <div className="text-lg font-bold text-emerald-800">{hospital}</div>
            </div>
          </div>
        )}

        {competencia && (
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl">
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <span className="text-sm text-amber-600 font-medium">Competência</span>
              <div className="text-lg font-bold text-amber-800">{competencia}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
