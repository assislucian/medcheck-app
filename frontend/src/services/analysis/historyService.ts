import { supabase } from '@/integrations/supabase/client';

/**
 * Retrieves analysis history for current user
 */
export async function getUserAnalysisHistory() {
  try {
    console.log('Buscando histórico de análises do usuário');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('Usuário não está autenticado');
      return [];
    }

    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    console.log(`Encontradas ${data.length} análises no histórico`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}
