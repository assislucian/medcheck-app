/**
 * Procedure Helpers for Supabase
 * Contains helper functions to work with procedures in Supabase
 */
import { supabase } from '@/integrations/supabase/client';
import { MockProcedure } from '@/integrations/mock/mockData';

// Define simplified type for procedure data - same fields as our mock data
export interface ProcedureData {
  id: string;
  analysis_id: string;
  codigo?: string;
  procedimento?: string;
  papel?: string;
  valor_cbhpm?: number;
  valor_pago?: number;
  diferenca?: number;
  pago?: boolean;
  guia?: string;
  beneficiario?: string;
  doctors?: any[];
  user_id?: string;
  created_at?: string;
  [key: string]: any; // Allow for other properties
}

// Interface for response
interface ProcedureResponse {
  data: ProcedureData[] | null;
  error: Error | null;
}

/**
 * Fetch procedures by analysis ID
 * @param analysisId The ID of the analysis to fetch procedures for
 * @returns List of procedures
 */
export async function fetchProceduresByAnalysisId(
  analysisId: string
): Promise<ProcedureData[]> {
  try {
    const response = await supabase
      .from('procedures')
      .select('*')
      .eq('analysis_id', analysisId);

    if (response.error) throw response.error;

    return response.data || [];
  } catch (error) {
    console.error('Error fetching procedures:', error);
    return [];
  }
}
