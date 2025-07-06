import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProcedureData } from '@/utils/supabase/procedureHelpers';

export async function fetchAnalysisDetails(analysisId: string) {
  try {
    console.log('Buscando detalhes da análise:', analysisId);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('Usuário não está autenticado');
      toast.error('Você precisa estar autenticado para acessar detalhes da análise');
      return null;
    }

    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('id', analysisId)
      .maybeSingle();

    if (analysisError) {
      console.error('Erro ao buscar detalhes da análise:', analysisError);
      toast.error('Erro ao carregar detalhes da análise');
      return null;
    }

    const { data: proceduresData, error: proceduresError } = await supabase
      .from('procedures')
      .select('*')
      .eq('analysis_id', analysisId);

    if (proceduresError) {
      console.error('Erro ao buscar procedimentos:', proceduresError);
      toast.error('Erro ao carregar procedimentos da análise');
      return null;
    }

    console.log(`Análise encontrada com ${proceduresData.length} procedimentos`);

    return {
      ...analysisData,
      procedimentos: proceduresData.map((proc: ProcedureData) => ({
        id: proc.id,
        codigo: proc.codigo,
        procedimento: proc.procedimento,
        papel: proc.papel,
        valorCBHPM: proc.valor_cbhpm,
        valorPago: proc.valor_pago,
        diferenca: proc.diferenca,
        pago: proc.pago,
        guia: proc.guia,
        beneficiario: proc.beneficiario,
        doctors: proc.doctors || [],
      })),
    };
  } catch (error) {
    console.error('Erro ao processar detalhes da análise:', error);
    toast.error('Erro ao processar detalhes da análise');
    return null;
  }
}
