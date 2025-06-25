import { supabase } from '@/integrations/supabase/client';
import { getMockData } from '@/integrations/mock/mockData';
import { ProcedureData } from './procedureHelpers';

const { analyses, procedures } = getMockData();

/**
 * Fetch analysis by ID
 * @param analysisId The ID of the analysis to fetch
 * @returns Analysis data or null if not found
 */
export async function fetchAnalysisById(analysisId: string) {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return null;
  }
}

/**
 * Fetch all analyses for the current user
 * @returns Array of analysis data
 */
export async function fetchAllAnalyses() {
  try {
    // Fetch user information
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }
}

/**
 * Fetch procedures for a specific analysis
 * @param analysisId The ID of the analysis
 * @returns Array of procedures
 */
export async function fetchProceduresByAnalysisId(
  analysisId: string
): Promise<ProcedureData[]> {
  try {
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .eq('analysis_id', analysisId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching procedures:', error);
    return [];
  }
}

/**
 * Save a new analysis
 * @param analysisData Analysis data to save
 * @returns The saved analysis data or null on error
 */
export async function saveAnalysis(analysisData: any) {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .insert(analysisData)
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('Error saving analysis:', error);
    return null;
  }
}

/**
 * Save procedures for an analysis
 * @param proceduresData Array of procedure data to save
 * @returns Boolean indicating success or failure
 */
export async function saveProcedures(proceduresData: any[]) {
  try {
    const { error } = await supabase.from('procedures').insert(proceduresData);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving procedures:', error);
    return false;
  }
}

/**
 * Update an existing analysis
 * @param id Analysis ID
 * @param analysisData Updated analysis data
 * @returns The updated analysis data or null on error
 */
export async function updateAnalysis(id: string, analysisData: any) {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .update(analysisData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data ? data[0] : null;
  } catch (error) {
    console.error('Error updating analysis:', error);
    return null;
  }
}

/**
 * Delete an analysis and its related procedures
 * @param id Analysis ID to delete
 * @returns Boolean indicating success or failure
 */
export async function deleteAnalysis(id: string) {
  try {
    // Delete related procedures first
    const { error: procError } = await supabase
      .from('procedures')
      .delete()
      .eq('analysis_id', id);

    if (procError) throw procError;

    // Then delete the analysis
    const { error } = await supabase.from('analysis_results').delete().eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return false;
  }
}

export {
  getProfile,
  updateProfile,
  fetchUserTickets,
  fetchTicketMessages,
  createSupportTicket,
  sendTicketMessage,
} from './supabaseHelpers';
