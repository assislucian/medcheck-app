import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface RevenuePieChartProps {
  totalRecebido: number;
  totalGlosado: number;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const COLORS = ["#22c55e", "#f87171"];

/**
 * RevenuePieChart – mostra proporção de Valor Pago x Glosa
 */
export const RevenuePieChart = ({
  totalRecebido,
  totalGlosado,
  width = '100%',
  height = 280,
  className
}: RevenuePieChartProps) => {
  const total = totalRecebido + totalGlosado;
  const data = [
    { name: 'Pago', value: totalRecebido },
    { name: 'Glosado', value: totalGlosado },
  ];

  const hasData = totalRecebido > 0 || totalGlosado > 0;

  return (
    <div className={cn('w-full rounded-xl border bg-card p-4 shadow-sm', className)}>
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">Distribuição de Pagamentos</h3>
      {hasData ? (
        <ResponsiveContainer width={width} height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val:number)=>`R$ ${val.toLocaleString('pt-BR',{minimumFractionDigits:2})}`} />
            <Legend verticalAlign="bottom" height={36} />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-base font-semibold"
            >
              R$ {total.toLocaleString('pt-BR')}
            </text>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-sm text-muted-foreground">Sem dados suficientes</p>
      )}
    </div>
  );
}; 