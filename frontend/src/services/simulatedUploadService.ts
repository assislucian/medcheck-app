import { FileWithStatus, FileType } from '@/types/upload';
import { determineProcessingMode } from './uploadModeUtils';

/**
 * Create simulated results for fallback when Edge Function fails
 */
export const createSimulatedResults = async (
  files: FileWithStatus[],
  setProgress?: (progress: number) => void,
  setStage?: (stage: string) => void,
  setMsg?: (msg: string) => void,
  crmRegistrado?: string,
  fileTypes?: FileType[]
) => {
  console.info('Generating fallback data in mode:', determineProcessingMode(files));

  // Simulate file uploads
  const uploadedFiles = files.map((file, index) => ({
    id: file.id || `local-${Date.now()}-${index}`,
    name: file.name,
    status: 'success',
    path: `local/${file.name}`,
    url: file.file ? URL.createObjectURL(file.file) : '',
  }));

  console.info('Files uploaded:', uploadedFiles);

  // Generate a unique ID for the analysis
  const analysisId = `local-${Date.now()}`;

  // Simulate processing steps
  if (setProgress) setProgress(25);
  if (setStage) setStage('extracting');
  if (setMsg) setMsg('Extraindo dados dos arquivos...');

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (setProgress) setProgress(50);
  if (setStage) setStage('analyzing');
  if (setMsg) setMsg('Analisando procedimentos...');

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (setProgress) setProgress(75);
  if (setStage) setStage('comparing');
  if (setMsg) setMsg('Comparando com tabela CBHPM...');

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (setProgress) setProgress(100);
  if (setStage) setStage('complete');
  if (setMsg) setMsg('Processamento concluído!');

  return {
    success: true,
    analysisId,
    message: 'Processamento simulado concluído!',
  };
};
