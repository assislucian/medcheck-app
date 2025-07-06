import { FileWithStatus, FileType } from '@/types/upload';
import { supabase } from '@/integrations/supabase/client';

/**
 * Process uploaded files using the Edge Function
 */
export const processWithEdgeFunction = async (
  files: FileWithStatus[],
  setProgress?: (progress: number) => void,
  setStage?: (stage: string) => void,
  setMsg?: (msg: string) => void,
  crmRegistrado?: string,
  fileTypes?: FileType[]
) => {
  try {
    if (setProgress) setProgress(10);
    if (setStage) setStage('uploading');
    if (setMsg) setMsg('Enviando arquivos para processamento...');

    // Create FormData object to upload the files
    const formData = new FormData();

    // Add each file to FormData
    files.forEach((file, index) => {
      formData.append(`files`, file.file, file.name);
      formData.append(`fileTypes[${index}]`, file.type);
    });

    if (crmRegistrado) {
      formData.append('crmRegistrado', crmRegistrado);
    }

    // Upload files via Edge Function
    const uploadResponse = await supabase.functions.invoke('upload-files', {
      body: formData,
    });

    if (uploadResponse.error) {
      console.error('Edge Function upload error:', uploadResponse.error);
      throw new Error('Edge Function response unsuccessful');
    }

    const uploadIds = uploadResponse.data.map((file: any) => file.id);

    // Process the uploaded files
    if (setProgress) setProgress(50);
    if (setStage) setStage('processing');
    if (setMsg) setMsg('Processando arquivos...');

    // Call the processing Edge Function
    const processingResponse = await supabase.functions.invoke('process-analysis', {
      body: {
        uploadIds,
        fileTypes: fileTypes || [],
        crmRegistrado: crmRegistrado || '',
      },
    });

    if (processingResponse.error) {
      console.error('Edge Function processing error:', processingResponse.error);
      throw new Error('Edge Function processing response unsuccessful');
    }

    if (setProgress) setProgress(100);
    if (setStage) setStage('complete');
    if (setMsg) setMsg('Processamento concluído!');

    return {
      success: true,
      analysisId: processingResponse.data.analysisId,
      message: 'Processamento realizado com sucesso!',
    };
  } catch (error) {
    console.error('Edge Function upload failed:', error);
    throw error;
  }
};
