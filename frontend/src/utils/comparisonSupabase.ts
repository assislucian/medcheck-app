import { supabase } from '@/integrations/supabase/client';
import { getFallbackComparisonData, createSimulationData } from './comparisonFallback';

/**
 * Try to get CBHPM comparison from Edge Function, fallback to DB, then simulation
 */
export async function fetchComparisonData(
  analysisId: string,
  crm: string | null,
  role: string
) {
  if (!analysisId) {
    return null;
  }

  // Local simulation
  if (analysisId.startsWith('local-')) {
    return createSimulationData();
  }

  try {
    // Try edge function
    const { data, error } = await supabase.functions.invoke('generate-compare', {
      body: { analysisId, crm, role },
    });

    if (error) {
      throw new Error(error.message || 'Erro ao buscar dados de comparação');
    }

    return data;
  } catch (e) {
    // Fallback to direct db
    return getFallbackComparisonData(analysisId);
  }
}
