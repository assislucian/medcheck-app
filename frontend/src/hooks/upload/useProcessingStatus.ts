import { useState } from 'react';
import { ProcessingStage, ProcessMode } from '@/types/upload';

/**
 * Custom hook for managing processing status
 */
export function useProcessingStatus() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [processingMsg, setProcessingMsg] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [processingMode, setProcessingMode] = useState<ProcessMode>('complete');
  const [crmRegistrado, setCrmRegistrado] = useState('');

  /**
   * Reset all status state
   */
  const resetStatus = () => {
    setProgress(0);
    setProcessingStage('idle');
    setProcessingMsg('');
    setUploadSuccess(false);
    setShowComparison(false);
  };

  return {
    isUploading,
    uploading: isUploading, // Alias for UploadSection
    progress,
    processingStage,
    processingMsg,
    processingMode,
    uploadSuccess,
    showComparison,
    crmRegistrado,
    // Return setter functions
    setUploading: setIsUploading,
    setProgress,
    setProcessingStage,
    setProcessingMsg,
    setProcessingMode,
    setUploadSuccess,
    setShowComparison,
    setCrmRegistrado,
    resetStatus,
  };
}
