import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface RevenuePieChartProps {
  totalRecebido: number;
  totalGlosado: number;
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
  totalRecebido,
  totalGlosado,
  width = '100%',
  height = 300,
  className,
}: RevenuePieChartProps) => {
  const total = totalRecebido + totalGlosado;
  const percentualGlosado = total > 0 ? ((totalGlosado / total) * 100).toFixed(1) : 0;

  const data = [
    { name: 'Recebido', value: totalRecebido, color: COLORS[0] },
    { name: 'Glosado', value: totalGlosado, color: COLORS[1] },
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
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-800">{data.name}</p>
          <p className="text-sm text-slate-600">{formatCurrency(data.value)}</p>
          <p className="text-xs text-slate-500">
            {((data.value / total) * 100).toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg p-6 shadow-sm border border-slate-200',
        className
      )}
    >
      {/* Header simples */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Análise Financeira</h3>
        <p className="text-sm text-slate-600">
          Taxa de Glosa:{' '}
          <span className="font-medium text-red-600">{percentualGlosado}%</span>
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
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-sm text-slate-600">Total Recebido</div>
          <div className="font-semibold text-emerald-600">
            {formatCurrency(totalRecebido)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-slate-600">Total Glosado</div>
          <div className="font-semibold text-red-600">
            {formatCurrency(totalGlosado)}
          </div>
        </div>
      </div>
    </div>
  );
};
