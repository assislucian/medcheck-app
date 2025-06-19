import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LabelList } from 'recharts';
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useMemo } from "react";

export function AnalyticsChart() {
  const { data, isLoading } = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Encontrar o mês de maior recuperação
  const monthlyData = data?.monthlyData || [];
  const bestMonth = useMemo(() => {
    if (!monthlyData.length) return null;
    return monthlyData.reduce((max, item) => (item.recebido > max.recebido ? item : max), monthlyData[0]);
  }, [monthlyData]);

  return (
    <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50/60 via-white/80 to-blue-100/60 backdrop-blur-xl shadow-2xl border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Evolução dos valores recuperados</CardTitle>
            <CardDescription>Veja como sua recuperação de glosas evoluiu mês a mês</CardDescription>
          </div>
          <BarChart2 className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[320px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                <XAxis dataKey="name" className="text-muted-foreground text-xs" />
                <YAxis 
                  tickFormatter={(value) => `R$${value/1000}k`} 
                  domain={['auto', 'auto']} 
                  className="text-muted-foreground text-xs"
                />
                <Tooltip
                  formatter={(value: number, key: string, props: any) => [formatCurrency(value), key === 'recebido' ? 'Recuperado' : 'Glosado']}
                  labelFormatter={(label) => `Mês: ${label}`}
                  contentStyle={{ 
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '0.75rem',
                    border: '1px solid #e0e7ef',
                    boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.10)'
                  }}
                  itemStyle={{ fontWeight: 500 }}
                />
                <ReferenceLine y={0} stroke="#e0e7ef" />
                <Bar 
                  dataKey="recebido" 
                  name="Recuperado" 
                  fill="url(#recuperado-gradient)"
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={48} 
                  animationDuration={1800}
                  isAnimationActive={true}
                >
                  <LabelList 
                    dataKey="recebido"
                    position="top"
                    formatter={formatCurrency}
                    content={({ x, y, value, index }) => {
                      if (!bestMonth || monthlyData[index]?.name !== bestMonth.name) return null;
                      return (
                        <g>
                          <text x={x} y={y - 12} fill="#2563eb" fontWeight="bold" fontSize="13" textAnchor="middle">
                            <tspan>{formatCurrency(value)}</tspan>
                          </text>
                          <Award x={x - 16} y={y - 32} width={18} height={18} color="#f59e42" />
                          <text x={x + 12} y={y - 22} fill="#f59e42" fontWeight="bold" fontSize="11" textAnchor="start">Melhor mês</text>
                        </g>
                      );
                    }}
                  />
                </Bar>
                <Bar 
                  dataKey="glosado" 
                  name="Glosado" 
                  fill="url(#glosado-gradient)"
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={48} 
                  animationDuration={1800}
                  isAnimationActive={true}
                />
                <defs>
                  <linearGradient id="recuperado-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="glosado-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#fca5a5" stopOpacity={0.6} />
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
