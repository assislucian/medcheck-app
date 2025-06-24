
import { describe, it, expect } from 'vitest'
import { supabase } from '@/integrations/supabase/client'

describe('Row Level Security', () => {
  it('anon cannot select from procedures table', async () => {
    // Create a new Supabase client without auth
    const anonClient = supabase

    const { data, error } = await anonClient
      .from('procedures')
      .select('*')
      .limit(1)
    
    expect(error).not.toBeNull()
    expect(error?.message).toContain('permission denied')
    expect(data).toBeNull()
  })
})
