import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAnalysisDetails } from '@/services/history/analysisDetails';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { MockProcedure, mockData } from '@/integrations/mock/mockData';
import { toast } from 'sonner';

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

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

(run ? describe : describe.skip)('fetchAnalysisDetails', () => {
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

  it('returns null when user is not authenticated', async () => {
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await fetchAnalysisDetails('test-id');
    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalled();
  });

  it('returns analysis details with procedures', async () => {
    const mockAnalysis =
      (mockData as any).analysisResults?.[0] ??
      ({ id: 'analysis-id', description: 'Mock', crm: '6091', uf: 'RN' } as any);
    const mockProcedures = mockData.procedures;

    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockSelect = vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockImplementation(() => ({
        maybeSingle: vi.fn().mockResolvedValue({ data: mockAnalysis, error: null }),
        eq: vi.fn().mockResolvedValue({ data: mockProcedures, error: null }),
      })),
    }));

    vi.mocked(supabase.from).mockImplementation((tableName) => {
      return {
        select: mockSelect,
      } as any;
    });

    const result = await fetchAnalysisDetails('test-id');
    expect(result).toBeTruthy();
    expect(result?.procedimentos).toHaveLength(mockProcedures.length);
    if (result && result.procedimentos && result.procedimentos.length > 0) {
      expect(result.procedimentos[0]).toHaveProperty(
        'codigo',
        mockProcedures[0].codigo
      );
    }
  });
});
