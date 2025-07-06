/**
 * Procedure Service for Supabase
 * Contains service functions to work with procedures in Supabase
 */
import { supabase } from '@/integrations/supabase/client';

// Define simplified type for procedure data
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
  [key: string]: any; // Allow for other properties
}

// Interface for Supabase response
interface ProcedureResponse {
  data: ProcedureData[] | null;
  error: Error | null;
}

/**
 * Fetch procedures data by analysis ID
 * @param analysisId The ID of the analysis to fetch procedures for
 * @returns List of procedures
 */
export async function fetchProceduresData(
  analysisId: string
): Promise<ProcedureData[]> {
  try {
    // Use type assertion to handle the Supabase response
    const response = (await supabase
      .from('procedures')
      .select('*')
      .eq('analysis_id', analysisId)) as unknown as ProcedureResponse;

    if (response.error) {
      console.error('Error fetching procedures data:', response.error);
      throw response.error;
    }

    return response.data || [];
  } catch (error) {
    console.error('Error in procedure service:', error);
    return [];
  }
}

// Add any other procedure-related functions here
