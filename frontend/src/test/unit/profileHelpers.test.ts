import { describe, it, expect, vi } from 'vitest';
import { getProfileData, updateProfile } from '@/utils/supabase/profileHelpers';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('profileHelpers', () => {
  it('fetches profile data successfully', async () => {
    const mockProfile = {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      crm: '12345',
      specialty: 'Cardiologia',
    };

    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: mockProfile, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    // Use vi.mocked to properly type the mock
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await getProfileData('test-id');
    expect(result).toEqual(mockProfile);
  });

  it('returns null when profile not found', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    // Use vi.mocked to properly type the mock
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await getProfileData('non-existent');
    expect(result).toBeNull();
  });
});
