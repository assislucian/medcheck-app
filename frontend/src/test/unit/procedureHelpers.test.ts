import { describe, it, expect, vi } from 'vitest';
import { fetchProceduresByAnalysisId } from '@/utils/supabase/procedureHelpers';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('procedureHelpers', () => {
  it('fetches procedures by analysis id', async () => {
    const mockProcedures = [
      { id: '1', codigo: 'TEST1', procedimento: 'Test Procedure 1' },
      { id: '2', codigo: 'TEST2', procedimento: 'Test Procedure 2' },
    ];

    const mockEq = vi.fn().mockResolvedValue({ data: mockProcedures, error: null });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    // Use vi.mocked to properly type the mock
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await fetchProceduresByAnalysisId('test-analysis-id');
    expect(result).toEqual(mockProcedures);
  });

  it('returns empty array on error', async () => {
    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Error' } });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

    // Use vi.mocked to properly type the mock
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await fetchProceduresByAnalysisId('test-analysis-id');
    expect(result).toEqual([]);
  });
});
