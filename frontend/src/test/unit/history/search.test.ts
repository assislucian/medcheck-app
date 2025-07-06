import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchHistory } from '@/services/history/search';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

const run = process.env.CI === 'true';

(run ? describe : describe.skip)('searchHistory', () => {
  const mockUser: User = {
    id: 'test-user',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    email: 'test@example.com',
    phone: '',
    role: '',
    factors: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when user is not authenticated', async () => {
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await searchHistory('test');
    expect(result).toEqual([]);
  });

  it('applies search filters correctly', async () => {
    const mockData = [
      {
        id: '1',
        date: '2025-01-01',
        type: 'analysis',
        description: 'Test Analysis',
        procedimentos: 5,
        glosados: 2,
        status: 'complete',
      },
    ];

    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const mockLt = vi.fn().mockReturnValue({ order: mockOrder });
    const mockGte = vi.fn().mockReturnValue({ lt: mockLt });
    const mockOr = vi.fn().mockReturnValue({ gte: mockGte });
    const mockEq = vi.fn().mockReturnValue({ or: mockOr });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    // Use vi.mocked to properly type the mock
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await searchHistory('test', '2025-01-01', '2025-01-02', 'complete');
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('description', 'Test Analysis');
  });
});
