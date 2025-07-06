import { useAuth } from '@/contexts/AuthContext';
import { useFileList } from './upload/useFileList';
import { useProcessingStatus } from './upload/useProcessingStatus';
import { useFileUploadService } from './upload/useFileUploadService';
import { FileWithStatus, FileType } from '@/types/upload';

/**
 * Custom hook for handling file uploads
 * Combines multiple smaller hooks to provide full upload functionality
 */
export function useFileUpload() {
  const fileList = useFileList();
  const processingStatus = useProcessingStatus();
  const fileUploadService = useFileUploadService();

  /**
   * Process the uploaded files
   * @param crmRegistrado CRM to filter by (optional)
   * @returns Object with success status and analysisId
   */
  const processUploadedFiles = async (crmRegistrado: string = '') => {
    processingStatus.setUploading(true);
    processingStatus.setShowComparison(false);

    if (crmRegistrado) processingStatus.setCrmRegistrado(crmRegistrado);

    // IDs/tipos dos arquivos válidos
    const fileTypes = fileList.getTypesPresent();

    // Process the files
    const result = await fileUploadService.processUploadedFiles(
      fileList.files,
      processingStatus.setProgress,
      processingStatus.setProcessingStage,
      processingStatus.setProcessingMsg,
      crmRegistrado || processingStatus.crmRegistrado,
      fileTypes
    );

    processingStatus.setUploading(false);
    processingStatus.setUploadSuccess(result.success);

    if (result.success) {
      processingStatus.setShowComparison(true);
    }

    return result;
  };

  const resetFiles = () => {
    fileList.clearFiles();
    processingStatus.resetStatus();
  };

  // Handle file change by type
  const handleFileChangeByType = async (type: FileType, files: FileList) => {
    return await fileList.handleFileChangeByType(type, files);
  };

  return {
    ...fileList,
    ...processingStatus,
    determineProcessingMode: () =>
      fileUploadService.determineProcessingMode(fileList.files),
    processUploadedFiles,
    handleFileChangeByType,
    resetFiles,
  };
}
