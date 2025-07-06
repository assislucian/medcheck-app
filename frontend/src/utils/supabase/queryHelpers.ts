import { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';

export function hasError<T>(
  response: PostgrestSingleResponse<T>
): response is PostgrestSingleResponse<T> & { error: PostgrestError } {
  return response.error !== null;
}

export function hasData<T>(
  response: PostgrestSingleResponse<T>
): response is PostgrestSingleResponse<T> & { data: T } {
  return response.data !== null;
}

export function extractData<T>(response: PostgrestSingleResponse<T>): T | null {
  if (response.error !== null) {
    console.error('Database error:', response.error);
    return null;
  }
  return response.data;
}

export function toJson(data: any): any {
  return data as any;
}
