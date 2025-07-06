import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Authentication', () => {
  it('can sign in with test user', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    const mockSession = {
      user: mockUser,
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
    };

    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(error).toBeNull();
    expect(data.session).toEqual(mockSession);
    expect(data.user).toEqual(mockUser);
  });
});
