import { supabase } from '@/integrations/supabase/client';

export interface MonthlyData {
  name: string;
  recebido: number;
  glosado: number;
}

export async function fetchMonthlyData(): Promise<MonthlyData[]> {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('created_at, summary');

    if (error) {
      console.error('Erro ao buscar dados mensais:', error);
      return [];
    }

    const monthlyData = data.reduce((acc: any, item: any) => {
      const date = new Date(item.created_at);
      const month = date.toLocaleString('pt-BR', { month: 'short' });

      if (!acc[month]) {
        acc[month] = { recebido: 0, glosado: 0 };
      }

      const summary =
        typeof item.summary === 'object' && item.summary !== null ? item.summary : {};
      const summaryObj = summary as any;

      acc[month].recebido += Number(summaryObj?.totalPago || 0);
      acc[month].glosado += Math.abs(Number(summaryObj?.totalDiferenca || 0));

      return acc;
    }, {});

    return Object.entries(monthlyData).map(([name, values]: [string, any]) => ({
      name,
      recebido: Math.round(values.recebido),
      glosado: Math.round(values.glosado),
    }));
  } catch (error) {
    console.error('Erro ao processar dados mensais:', error);
    return [];
  }
}
