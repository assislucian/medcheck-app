import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart2, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useMemo } from 'react';

export function AnalyticsChart() {
  const { data, isLoading } = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Encontrar o mês de maior recuperação
  const monthlyData = data?.monthlyData || [];
  const bestMonth = useMemo(() => {
    if (!monthlyData.length) return null;
    return monthlyData.reduce(
      (max, item) => (item.recebido > max.recebido ? item : max),
      monthlyData[0]
    );
  }, [monthlyData]);

  return (
    <Card className="border-0 bg-white shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Progresso de Recuperação
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Evolução mensal dos valores recuperados vs glosados
            </CardDescription>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-2xl">
            <BarChart2 className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[380px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500"></div>
                <p className="text-gray-500">Carregando dados...</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
                barCategoryGap={32}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 13, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number, key: string) => [
                    formatCurrency(value),
                    key === 'recebido' ? 'Recuperado' : 'Glosado',
                  ]}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    background: 'rgba(255,255,255,0.98)',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                  }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <ReferenceLine y={0} stroke="#e5e7eb" />

                {/* Barra de Recuperado */}
                <Bar
                  dataKey="recebido"
                  name="Recuperado"
                  fill="url(#recuperado-gradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                  animationDuration={1500}
                  isAnimationActive={true}
                >
                  <LabelList
                    dataKey="recebido"
                    position="top"
                    formatter={formatCurrency}
                    content={({ x, y, value, index }) => {
                      if (!bestMonth || monthlyData[index]?.name !== bestMonth.name)
                        return null;
                      return (
                        <g>
                          <rect
                            x={x - 35}
                            y={y - 45}
                            width={70}
                            height={25}
                            rx={12}
                            fill="#f59e0b"
                          />
                          <text
                            x={x}
                            y={y - 28}
                            fill="white"
                            fontWeight="600"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            Melhor mês
                          </text>
                        </g>
                      );
                    }}
                  />
                </Bar>

                {/* Barra de Glosado */}
                <Bar
                  dataKey="glosado"
                  name="Glosado"
                  fill="url(#glosado-gradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                  animationDuration={1500}
                  isAnimationActive={true}
                />

                <defs>
                  <linearGradient id="recuperado-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="glosado-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
