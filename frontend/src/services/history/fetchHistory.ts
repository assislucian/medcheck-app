import { supabase } from '@/integrations/supabase/client';
import { HistoryItem } from '@/components/history/data';
import { toast } from 'sonner';

export async function fetchHistoryData(): Promise<HistoryItem[]> {
  try {
    console.log('Iniciando busca de histórico completo');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('Usuário não está autenticado');
      toast.error('Você precisa estar autenticado para acessar o histórico');
      return [];
    }

    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico de análises');
      return [];
    }

    console.log(`Foram encontrados ${data?.length || 0} registros no histórico`);

    return data.map((item: any) => ({
      id: item.id,
      date: formatDate(item.date),
      type: item.type,
      description: item.description,
      procedimentos: item.procedimentos || 0,
      glosados: item.glosados || 0,
      status: item.status,
    }));
  } catch (error) {
    console.error('Erro ao processar histórico:', error);
    toast.error('Erro ao processar dados do histórico');
    return [];
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}
