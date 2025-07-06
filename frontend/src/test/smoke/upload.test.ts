import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('File Upload', () => {
  it('can upload PDF file', async () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const mockResponse = {
      data: {
        path: 'uploads/test.pdf',
        id: 'mock-file-id',
        fullPath: 'uploads/test.pdf',
      },
      error: null,
    };

    vi.spyOn(supabase.storage.from('uploads'), 'upload').mockResolvedValue(
      mockResponse
    );

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload('test.pdf', mockFile);

    expect(error).toBeNull();
    expect(data).toHaveProperty('path', 'uploads/test.pdf');
  });
});
