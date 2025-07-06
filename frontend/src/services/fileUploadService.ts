import { FileWithStatus, FileType } from '@/types/upload';
import { determineProcessingMode } from './uploadModeUtils';
import { processWithEdgeFunction } from './fileUploadEdge';
import { createSimulatedResults } from './simulatedUploadService';
import axios from 'axios';

/**
 * Service for processing uploaded files
 */
export const FileUploadService = () => {
  /**
   * Process uploaded files
   * Se houver arquivos de demonstrativo, envia todos juntos no campo 'files' (plural), compatível com o backend.
   * Mantém tratamento de progresso, erros e logs.
   */
  const processUploadedFiles = async (
    files: FileWithStatus[],
    setProgress?: (progress: number) => void,
    setStage?: (stage: string) => void,
    setMsg?: (msg: string) => void,
    crmRegistrado?: string,
    fileTypes?: FileType[]
  ) => {
    // Filtra apenas demonstrativos válidos
    const demoFiles = files.filter(
      (f) => f.type === 'demonstrativo' && f.status === 'valid'
    );
    if (!demoFiles.length) {
      if (setMsg) setMsg('Nenhum demonstrativo válido para upload.');
      return [];
    }
    const formData = new FormData();
    demoFiles.forEach((f) => formData.append('files', f.file, f.name));
    if (crmRegistrado) formData.append('crm', crmRegistrado);
    // Adicione outros campos se necessário (ex: periodo, lote)
    try {
      if (setProgress) setProgress(10);
      if (setStage) setStage('uploading');
      if (setMsg) setMsg(`Enviando ${demoFiles.length} demonstrativo(s)...`);
      const response = await axios.post('/api/v1/demonstrativos/upload', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (setProgress) setProgress(100);
      if (setStage) setStage('complete');
      if (setMsg) setMsg('Processamento concluído!');
      // Espera-se que o backend retorne results: [{ filename, success, ... }]
      return response.data;
    } catch (err) {
      if (setStage) setStage('error');
      if (setMsg) setMsg('Erro ao processar demonstrativos');
      return [{ success: false, error: err }];
    }
  };

  return {
    determineProcessingMode,
    processUploadedFiles,
  };
};
