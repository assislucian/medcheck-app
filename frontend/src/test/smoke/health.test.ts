import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Health Check', () => {
  it('health endpoint returns 200 OK', async () => {
    const { data, error } = await supabase.functions.invoke('health');

    expect(error).toBeNull();
    expect(data).toHaveProperty('status', 'OK');
    expect(data).toHaveProperty('timestamp');
  });
});
