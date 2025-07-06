import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReportTotals {
  totalRecebido: number;
  totalGlosado: number;
  totalProcedimentos: number;
  auditoriaPendente: number;
}

export async function fetchReportsTotals(): Promise<ReportTotals> {
  try {
    const { data, error } = await supabase.from('analysis_results').select('summary');

    if (error) {
      console.error('Erro ao buscar dados para relatórios:', error);
      return {
        totalRecebido: 0,
        totalGlosado: 0,
        totalProcedimentos: 0,
        auditoriaPendente: 0,
      };
    }

    const totals = data.reduce(
      (acc, item) => {
        const summary =
          typeof item.summary === 'object' && item.summary !== null ? item.summary : {};
        const summaryObj = summary as any;

        acc.totalRecebido += Number(summaryObj?.totalPago || 0);
        acc.totalGlosado += Number(summaryObj?.totalDiferenca || 0);
        acc.totalProcedimentos += Number(summaryObj?.procedimentosTotal || 0);
        return acc;
      },
      {
        totalRecebido: 0,
        totalGlosado: 0,
        totalProcedimentos: 0,
        auditoriaPendente: 0,
      }
    );

    const { count, error: pendingError } = await supabase
      .from('analysis_history')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pendente');

    if (!pendingError) {
      totals.auditoriaPendente = count || 0;
    }

    return totals;
  } catch (error) {
    console.error('Erro ao processar dados para relatórios:', error);
    return {
      totalRecebido: 0,
      totalGlosado: 0,
      totalProcedimentos: 0,
      auditoriaPendente: 0,
    };
  }
}
