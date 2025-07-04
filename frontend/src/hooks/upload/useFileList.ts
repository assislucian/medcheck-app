import { useState } from 'react';
import { FileWithStatus, FileType } from '@/types/upload';
import { toast } from 'sonner';
import { validateFiles } from '@/utils/fileValidation';

export function useFileList() {
  const [files, setFiles] = useState<FileWithStatus[]>([]);

  // Mantém os arquivos separados por tipo
  const filesByType = (type: FileType): FileWithStatus[] =>
    files.filter((file) => file.type === type && file.status !== 'invalid');

  const hasFile = (type: FileType): boolean => filesByType(type).length > 0;

  const hasGuiaDemonstrativoPair = (): boolean =>
    hasFile('guia') && hasFile('demonstrativo');

  const hasValidFilesForProcessing = (): boolean =>
    files.some((file) => file.status !== 'invalid');

  const hasInvalidFiles = (): boolean =>
    files.some((file) => file.status === 'invalid');

  // Função para pegar IDs dos arquivos válidos de cada tipo
  const getFileIdsAndTypes = () => {
    const result = files
      .filter((f) => f.status === 'valid')
      .map((f) => ({ id: f.id ?? `temp-${Date.now()}-${f.name}`, type: f.type })); // Use nullish coalescing operator
    return result;
  };

  // Pega os tipos presentes
  const getTypesPresent = (): FileType[] => {
    const types: Set<FileType> = new Set(
      files.filter((f) => f.status === 'valid').map((f) => f.type)
    );
    return Array.from(types);
  };

  // Função para adicionar arquivos de um tipo só
  const handleFileChangeByType = async (type: FileType, fileListInput: FileList) => {
    if (!fileListInput || fileListInput.length === 0) {
      return;
    }

    const list = Array.from(fileListInput).map((file, index) => ({
      id: `local-${Date.now()}-${index}`, // Add id when creating files
      name: file.name,
      file,
      type,
      status: 'processing' as const,
    }));

    try {
      const validatedFiles = await validateFiles(list);
      if (validatedFiles.length > 0) {
        setFiles((prev) => [...prev, ...validatedFiles]);
      }
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
    }
  };

  /**
   * Remove a file from the list
   */
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => setFiles([]);

  return {
    files,
    filesByType,
    hasFile,
    hasGuiaDemonstrativoPair,
    hasValidFilesForProcessing,
    hasInvalidFiles,
    handleFileChangeByType,
    removeFile,
    clearFiles,
    resetFiles: clearFiles,
    getFileIdsAndTypes,
    getTypesPresent,
  };
}
