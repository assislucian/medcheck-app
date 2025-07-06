import { supabase } from '@/integrations/supabase/client';
import { HelpArticle } from '@/types/help';

export async function fetchHelpArticles(
  options: { published?: boolean } = { published: true }
): Promise<HelpArticle[]> {
  try {
    let query = supabase.from('help_articles').select('*');

    if (options.published !== undefined) {
      query = query.eq('published', options.published);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as HelpArticle[];
  } catch (error) {
    console.error('Error fetching help articles:', error);
    return [];
  }
}
