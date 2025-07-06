import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateAnalysisStatus } from '@/services/history/statusUpdate';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('updateAnalysisStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true on successful status update', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

    // Use vi.mocked to properly type the mock
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await updateAnalysisStatus('test-id', 'complete');
    expect(result).toBe(true);
  });

  it('returns false when update fails', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: new Error('Update failed') });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

    // Use vi.mocked to properly type the mock
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await updateAnalysisStatus('test-id', 'complete');
    expect(result).toBe(false);
  });

  it('returns false on exception', async () => {
    const mockEq = vi.fn().mockRejectedValue(new Error('Network error'));
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

    // Use vi.mocked to properly type the mock
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await updateAnalysisStatus('test-id', 'complete');
    expect(result).toBe(false);
  });
});
