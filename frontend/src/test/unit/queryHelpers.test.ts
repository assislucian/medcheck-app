import { describe, it, expect } from 'vitest';
import { hasError, hasData, extractData } from '@/utils/supabase/queryHelpers';
import { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';

describe('queryHelpers', () => {
  it('detects error in response', () => {
    const response: PostgrestSingleResponse<any> = {
      error: { message: 'Test error' } as PostgrestError,
      data: null,
      count: null,
      status: 400,
      statusText: 'Bad Request',
    };
    expect(hasError(response)).toBe(true);
  });

  it('detects data in response', () => {
    const response: PostgrestSingleResponse<{ test: string }> = {
      error: null,
      data: { test: 'data' },
      count: null,
      status: 200,
      statusText: 'OK',
    };
    expect(hasData(response)).toBe(true);
  });

  it('extracts data correctly', () => {
    const data = { test: 'data' };
    const response: PostgrestSingleResponse<typeof data> = {
      error: null,
      data,
      count: null,
      status: 200,
      statusText: 'OK',
    };
    expect(extractData(response)).toEqual(data);
  });

  it('returns null when error exists', () => {
    const response: PostgrestSingleResponse<any> = {
      error: { message: 'Test error' } as PostgrestError,
      data: null,
      count: null,
      status: 400,
      statusText: 'Bad Request',
    };
    expect(extractData(response)).toBeNull();
  });
});
