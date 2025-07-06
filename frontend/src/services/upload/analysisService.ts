/**
 * Analysis service for handling and storing current analysis data
 */

// Secure storage keys with clear naming
const CURRENT_ANALYSIS_ID_KEY = 'currentAnalysisId';
const CURRENT_ANALYSIS_TIMESTAMP_KEY = 'currentAnalysisTimestamp';
const EXTRACTED_DATA_PREFIX = 'extractedData-';

// Expiration time for stored analysis data (24 hours)
const ANALYSIS_EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Set current analysis data (ID and extracted data)
 */
export function setCurrentAnalysis(extractedData: any, analysisId: string) {
  if (!analysisId) {
    console.error('Invalid analysisId provided to setCurrentAnalysis');
    return;
  }

  try {
    console.log('Setting current analysis:', analysisId);

    localStorage.setItem(CURRENT_ANALYSIS_ID_KEY, analysisId);
    localStorage.setItem(CURRENT_ANALYSIS_TIMESTAMP_KEY, Date.now().toString());

    // Store extracted data for local fallback
    if (analysisId.startsWith('local-')) {
      localStorage.setItem(
        `${EXTRACTED_DATA_PREFIX}${analysisId}`,
        JSON.stringify(extractedData)
      );
    }
  } catch (error) {
    console.error('Error storing analysis data:', error);
  }
}

/**
 * Get current analysis ID
 */
export function getCurrentAnalysisId(): string | null {
  try {
    const analysisId = localStorage.getItem(CURRENT_ANALYSIS_ID_KEY);
    const timestamp = localStorage.getItem(CURRENT_ANALYSIS_TIMESTAMP_KEY);

    if (!analysisId || !timestamp) return null;

    // Check if the stored analysis has expired
    const storedTime = parseInt(timestamp, 10);
    if (isNaN(storedTime) || Date.now() - storedTime > ANALYSIS_EXPIRATION_MS) {
      // Clear expired data
      clearCurrentAnalysis();
      return null;
    }

    return analysisId;
  } catch (error) {
    console.error('Error retrieving analysis ID:', error);
    return null;
  }
}

/**
 * Get extracted data for the given analysis ID
 */
export function getExtractedData(analysisId: string): any | null {
  if (!analysisId || !analysisId.startsWith('local-')) return null;

  try {
    const data = localStorage.getItem(`${EXTRACTED_DATA_PREFIX}${analysisId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving extracted data:', error);
    return null;
  }
}

/**
 * Clear current analysis data
 */
export function clearCurrentAnalysis(): void {
  try {
    const analysisId = localStorage.getItem(CURRENT_ANALYSIS_ID_KEY);

    localStorage.removeItem(CURRENT_ANALYSIS_ID_KEY);
    localStorage.removeItem(CURRENT_ANALYSIS_TIMESTAMP_KEY);

    if (analysisId && analysisId.startsWith('local-')) {
      localStorage.removeItem(`${EXTRACTED_DATA_PREFIX}${analysisId}`);
    }
  } catch (error) {
    console.error('Error clearing analysis data:', error);
  }
}

// Helper function to safely get numeric values from JSON data
export function getSafeNumericValue(data: any, property: string): number {
  if (!data || typeof data !== 'object') {
    return 0;
  }

  // Handle array vs object data
  if (Array.isArray(data)) {
    return 0; // Arrays don't have the expected properties
  }

  const value = data[property];

  if (value === undefined || value === null) {
    return 0;
  }

  const numericValue = Number(value);
  return isNaN(numericValue) ? 0 : numericValue;
}
