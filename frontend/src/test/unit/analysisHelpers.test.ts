import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAnalysisById } from '@/utils/supabase/analysisHelpers';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('analysisHelpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches analysis by id successfully', async () => {
    const mockAnalysis = {
      id: 'test-id',
      summary: { total: 100 },
      created_at: '2025-01-01',
    };

    // Create proper mock implementation
    const mockSingle = vi.fn().mockResolvedValue({ data: mockAnalysis, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    // Use vi.mocked to properly type the mock
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await fetchAnalysisById('test-id');
    expect(result).toEqual(mockAnalysis);
  });

  it('returns null on error', async () => {
    // Create proper mock implementation for error case
    const mockSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Error' } });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    // Use vi.mocked to properly type the mock
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await fetchAnalysisById('test-id');
    expect(result).toBeNull();
  });
});
