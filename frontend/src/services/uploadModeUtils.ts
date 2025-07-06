import { FileWithStatus, ProcessMode } from '@/types/upload';

/**
 * Determine the processing mode based on the file types present
 */
export const determineProcessingMode = (files: FileWithStatus[]): ProcessMode => {
  const hasGuias = files.some((f) => f.type === 'guia' && f.status === 'valid');
  const hasDemonstrativos = files.some(
    (f) => f.type === 'demonstrativo' && f.status === 'valid'
  );

  if (hasGuias && hasDemonstrativos) {
    return 'complete';
  } else if (hasGuias) {
    return 'guia-only';
  } else {
    return 'demonstrativo-only';
  }
};
