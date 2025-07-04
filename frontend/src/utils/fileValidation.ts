import { FileWithStatus } from '@/types/upload';
import { toast } from 'sonner';

// Maximum allowed file size in MB
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert to bytes

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'text/csv',
  'application/json',
  'application/xml',
  'text/xml',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
];

// Use dynamic import to load pdfjs-dist only when necessary, enabling tree-shaking/code-splitting.
// This prevents the ~550 kB library from being bundled into the initial chunk.

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

/**
 * Lazily loads pdfjs-dist and sets the workerSrc once.
 * Returns the cached module on subsequent calls.
 */
const loadPdfJs = async () => {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((pdfjs) => {
      // Configure the CDN worker once the module is available.
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      return pdfjs;
    });
  }
  return pdfjsPromise;
};

/**
 * Validates individual files based on type and size
 * @param file The file to validate
 * @returns Boolean indicating if the file is valid
 */
export const validateFile = async (file: File): Promise<boolean> => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    console.error(`File ${file.name} exceeds maximum size of ${MAX_FILE_SIZE_MB}MB`);
    return false;
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    // For PDFs, do an additional check for files that might be PDFs but have wrong MIME type
    if (file.name.toLowerCase().endsWith('.pdf')) {
      return true; // Accept PDF files even with wrong MIME type
    }
    console.error(`File ${file.name} has unsupported type: ${file.type}`);
    return false;
  }

  return true;
};

/**
 * Validates array of files and updates their status
 * @param filesWithStatus Array of files with status
 * @returns Array of files with updated status
 */
export const validateFiles = async (
  filesWithStatus: FileWithStatus[]
): Promise<FileWithStatus[]> => {
  // Create a copy of the files array to modify
  const validatedFiles = [...filesWithStatus];

  // Array to track invalid files
  const invalidFiles: string[] = [];

  // Process each file
  for (let i = 0; i < validatedFiles.length; i++) {
    const file = validatedFiles[i];
    const isValid = await validateFile(file.file);

    // Update file status
    validatedFiles[i] = {
      ...file,
      status: isValid ? 'valid' : 'invalid',
    };

    // Track invalid files
    if (!isValid) {
      invalidFiles.push(file.name);
    }
  }

  // Notify about invalid files
  if (invalidFiles.length > 0) {
    if (invalidFiles.length === 1) {
      toast.error(`Arquivo inválido: ${invalidFiles[0]}`, {
        description: `Apenas arquivos de até ${MAX_FILE_SIZE_MB}MB nos formatos permitidos são aceitos.`,
      });
    } else {
      toast.error(`${invalidFiles.length} arquivos inválidos`, {
        description: `Alguns arquivos não poderão ser processados. Verifique o formato e tamanho.`,
      });
    }
  }

  return validatedFiles;
};

/**
 * Gets a descriptive error message for an invalid file
 * @param file The file that failed validation
 * @returns Error message
 */
export const getFileValidationErrorMessage = (file: File): string => {
  if (file.size > MAX_FILE_SIZE) {
    return `O arquivo excede o tamanho máximo de ${MAX_FILE_SIZE_MB}MB.`;
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `Formato de arquivo não suportado. Use PDF, Excel, CSV, XML ou documentos Word.`;
  }

  return 'O arquivo não pode ser validado.';
};

export async function isValidDemonstrativo(file: File): Promise<boolean> {
  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    const text = (textContent.items as any[]).map((item) => item.str).join(' ');
    return text.includes('[PM] HONORÁRIOS') && text.includes('Período:');
  } catch (e) {
    console.error('Erro ao validar demonstrativo:', e);
    return false;
  }
}

export async function isValidGuia(file: File): Promise<boolean> {
  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    const text = (textContent.items as any[]).map((item) => item.str).join(' ');
    return text.includes('Guia') && text.includes('Beneficiário');
  } catch (e) {
    console.error('Erro ao validar guia:', e);
    return false;
  }
}
