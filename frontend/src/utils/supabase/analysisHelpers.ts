import { supabase } from '@/integrations/supabase/client';

export async function fetchAnalysisById(analysisId: string) {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return null;
  }
}
