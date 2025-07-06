import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Analysis History', () => {
  it('history query returns valid result', async () => {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .limit(10);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data?.length).toBeGreaterThanOrEqual(0);
  });
});
