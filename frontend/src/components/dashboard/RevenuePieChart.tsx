import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface RevenuePieChartProps {
  recebido: number;
  glosado: number;
  width?: number | string;
  height?: number | string;
  className?: string;
}

// Cores profissionais para análise médica
const COLORS = ['#10b981', '#ef4444'];

/**
 * RevenuePieChart – Gráfico limpo para análise de glosas médicas
 */
export const RevenuePieChart = ({
  recebido,
  glosado,
  width = '100%',
  height = 300,
  className,
}: RevenuePieChartProps) => {
  const total = recebido + glosado;
  const percentualGlosado = total > 0 ? ((glosado / total) * 100).toFixed(1) : 0;

  const data = [
    { name: 'Recebido', value: recebido, color: COLORS[0] },
    { name: 'Glosado', value: glosado, color: COLORS[1] },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Tooltip customizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 dark:bg-gray-800 dark:border-gray-600">
          <p className="font-semibold text-slate-800 dark:text-gray-200">{data.name}</p>
          <p className="text-sm text-slate-600 dark:text-gray-400">
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-slate-500 dark:text-gray-500">
            {total > 0 ? ((data.value / total) * 100).toFixed(1) : 0}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  // Se não há dados, mostrar estado vazio
  if (total === 0) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-600',
          className
        )}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-200 mb-2">
            Análise Financeira
          </h3>
          <p className="text-sm text-slate-600 dark:text-gray-400">
            Ainda não há dados suficientes para gerar o gráfico de distribuição de
            receita.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-gray-600',
        className
      )}
    >
      {/* Header simples */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-200">
          Análise Financeira
        </h3>
        <p className="text-sm text-slate-600 dark:text-gray-400">
          Taxa de Glosa:{' '}
          <span className="font-medium text-red-600 dark:text-red-400">
            {percentualGlosado}%
          </span>
        </p>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Resumo numérico */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-gray-700">
        <div className="text-center">
          <div className="text-sm text-slate-600 dark:text-gray-400">
            Total Recebido
          </div>
          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(recebido)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-slate-600 dark:text-gray-400">Total Glosado</div>
          <div className="font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(glosado)}
          </div>
        </div>
      </div>
    </div>
  );
};
