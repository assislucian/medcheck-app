import { supabase } from '@/integrations/supabase/client';
import { HistoryItem } from '@/components/history/data';
import { toast } from 'sonner';

export async function searchHistory(
  searchText: string,
  startDate?: string,
  endDate?: string,
  status: string = 'todos'
): Promise<HistoryItem[]> {
  try {
    console.log('Iniciando busca filtrada:', {
      searchText,
      startDate,
      endDate,
      status,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('Usuário não está autenticado');
      toast.error('Você precisa estar autenticado para pesquisar o histórico');
      return [];
    }

    let query = supabase.from('analysis_history').select('*').eq('user_id', user.id);

    if (searchText && searchText.trim() !== '') {
      query = query.or(
        `description.ilike.%${searchText}%,type.ilike.%${searchText}%,hospital.ilike.%${searchText}%`
      );
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query.lt('date', nextDay.toISOString());
    }

    if (status && status !== 'todos') {
      query = query.eq('status', status.charAt(0).toUpperCase() + status.slice(1));
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Erro ao pesquisar histórico:', error);
      toast.error('Erro ao pesquisar histórico de análises');
      return [];
    }

    console.log(`Foram encontrados ${data?.length || 0} registros filtrados`);

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
    console.error('Erro ao processar pesquisa de histórico:', error);
    toast.error('Erro ao processar pesquisa do histórico');
    return [];
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}
