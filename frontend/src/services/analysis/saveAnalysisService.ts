import { FileWithStatus, ProcessMode } from '@/types/upload';
import { supabase } from '@/integrations/supabase/client';
import { ProcedureData } from '@/utils/supabase/procedureHelpers';

/**
 * Saves analysis results to database
 */
export async function saveAnalysisToDatabase(
  files: FileWithStatus[],
  processMode: ProcessMode,
  extractedData: any
): Promise<{ success: boolean; analysisId: string | null }> {
  try {
    console.log('Iniciando salvamento dos resultados no banco de dados', {
      processMode,
      fileCount: files.length,
      hospitalName: extractedData.demonstrativoInfo?.hospital,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('Usuário não está autenticado');
      return { success: false, analysisId: null };
    }

    // Preparar o resumo em formato seguro para armazenamento
    const summary = {
      totalCBHPM: extractedData.totais?.valorCBHPM || 0,
      totalPago: extractedData.totais?.valorPago || 0,
      totalDiferenca: extractedData.totais?.diferenca || 0,
      procedimentosTotal: extractedData.procedimentos?.length || 0,
      procedimentosNaoPagos: extractedData.totais?.procedimentosNaoPagos || 0,
    };

    // Since we're using a mock client, we'll just simulate the insertion
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis_results')
      .insert({
        user_id: user.id,
        file_name: files.map((f) => f.name).join(', '),
        file_type: processMode,
        hospital: extractedData.demonstrativoInfo?.hospital || null,
        competencia: extractedData.demonstrativoInfo?.competencia || null,
        numero: extractedData.demonstrativoInfo?.numero || null,
        summary: summary,
        status: 'processed',
      })
      .select('id')
      .single();

    if (analysisError) {
      console.error('Erro ao inserir análise:', analysisError);
      return { success: false, analysisId: null };
    }

    const analysisId = analysisData.id;

    await saveProcedures(analysisId, user.id, extractedData.procedimentos);
    await saveAnalysisHistory(user.id, extractedData, processMode);

    return { success: true, analysisId: analysisData.id };
  } catch (error) {
    console.error('Erro ao salvar no banco de dados:', error);
    return { success: false, analysisId: null };
  }
}

async function saveProcedures(analysisId: string, userId: string, procedures: any[]) {
  if (!procedures?.length) return;

  // Convert procedures to the format expected by our mock database
  const proceduresForInsert = procedures.map((proc) => ({
    analysis_id: analysisId,
    user_id: userId,
    codigo: proc.codigo || '',
    procedimento: proc.procedimento || '',
    papel: proc.papel || '',
    valor_cbhpm: proc.valorCBHPM || 0,
    valor_pago: proc.valorPago || 0,
    diferenca: proc.diferenca || 0,
    pago: proc.pago || false,
    guia: proc.guia || '',
    beneficiario: proc.beneficiario || '',
    doctors: proc.doctors || [],
    created_at: new Date().toISOString(),
    id: `proc-${Math.random().toString(36).substring(2, 9)}`,
  }));

  // Mock insert
  console.log('Procedimentos a serem inseridos:', proceduresForInsert);

  try {
    // In our mock implementation this won't actually add to the data
    const { error } = await supabase.from('procedures').insert(proceduresForInsert);

    if (error) {
      console.error('Erro ao inserir procedimentos:', error);
    }
  } catch (error) {
    console.error('Exceção ao inserir procedimentos:', error);
  }
}

async function saveAnalysisHistory(
  userId: string,
  extractedData: any,
  processMode: ProcessMode
) {
  try {
    const { error: historyError } = await supabase.from('analysis_history').insert({
      user_id: userId,
      type:
        processMode === 'complete'
          ? 'Guia + Demonstrativo'
          : processMode === 'guia-only'
            ? 'Guia'
            : 'Demonstrativo',
      hospital: extractedData.demonstrativoInfo?.hospital || null,
      description: `${extractedData.demonstrativoInfo?.hospital || 'Hospital'} - ${
        extractedData.demonstrativoInfo?.competencia || 'Competência não informada'
      }`,
      procedimentos: extractedData.procedimentos?.length || 0,
      glosados: extractedData.totais?.procedimentosNaoPagos || 0,
      status: 'Analisado',
    });

    if (historyError) {
      console.error('Erro ao inserir no histórico:', historyError);
    }
  } catch (error) {
    console.error('Exceção ao salvar histórico:', error);
  }
}
