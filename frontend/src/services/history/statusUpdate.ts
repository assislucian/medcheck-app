import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function updateAnalysisStatus(
  analysisId: string,
  status: string
): Promise<boolean> {
  try {
    console.log('Atualizando status da análise:', { analysisId, status });

    const { error } = await supabase
      .from('analysis_history')
      .update({ status })
      .eq('id', analysisId);

    if (error) {
      console.error('Erro ao atualizar status da análise:', error);
      toast.error('Erro ao atualizar status da análise');
      return false;
    }

    console.log('Status da análise atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao processar atualização de status:', error);
    toast.error('Erro ao processar atualização de status');
    return false;
  }
}
