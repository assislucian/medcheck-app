import { FileWithStatus } from '@/types/upload';
import { toast } from 'sonner';
import axios from 'axios';

// Define the result type
interface ProcessResult {
  success: boolean;
  analysisId?: string | null;
  data?: any;
}

/**
 * Custom hook for file upload service integration
 */
export function useFileUploadService() {
  /**
   * Process the uploaded files
   * @param files Files to process
   * @param setProgress Progress setter function
   * @param setProcessingStage Processing stage setter function
   * @param setProcessingMsg Processing message setter function
   * @param crmRegistrado CRM to filter by (optional)
   * @param fileTypes Lista dos tipos selecionados
   * @returns Success status and analysis ID
   */
  const processUploadedFiles = async (
    files: FileWithStatus[],
    setProgress: (progress: number) => void,
    setProcessingStage: (stage: any) => void,
    setProcessingMsg: (msg: string) => void,
    crmRegistrado: string = '',
    fileTypes: ('guia' | 'demonstrativo')[]
  ): Promise<ProcessResult> => {
    if (files.length === 0) {
      toast.error('Nenhum arquivo selecionado', {
        description: 'Por favor, selecione arquivos para processar.'
      });
      return { success: false };
    }
    if (!files.some(file => file.status === 'valid')) {
      toast.error('Arquivos inválidos', {
        description: 'Todos os arquivos selecionados são inválidos. Por favor, selecione arquivos válidos.'
      });
      return { success: false };
    }
    try {
      setProgress(0);
      setProcessingStage('extracting');
      setProcessingMsg('Enviando arquivos...');
      // Upload de guias (mantém compatibilidade)
      const guiaFiles = files.filter(f => f.type === 'guia' && f.status === 'valid');
      if (guiaFiles.length) {
        const formData = new FormData();
        guiaFiles.forEach(f => formData.append('files', f.file, f.name));
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await axios.post(`${apiUrl}/api/v1/guias/upload`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setProgress(100);
        setProcessingStage('complete');
        setProcessingMsg('Processamento concluído!');
        toast.success('Guias processadas!');
        return { success: true, data: res.data };
      }
      // Upload de demonstrativos (em lote)
      const demoFiles = files.filter(f => f.type === 'demonstrativo' && f.status === 'valid');
      if (demoFiles.length) {
        const formData = new FormData();
        demoFiles.forEach(f => formData.append('files', f.file, f.name));
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await axios.post(`${apiUrl}/api/v1/demonstrativos/upload`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setProgress(100);
        setProcessingStage('complete');
        setProcessingMsg('Processamento concluído!');
        // Feedback por arquivo
        if (res.data && Array.isArray(res.data.results)) {
          res.data.results.forEach((result: any) => {
            if (result.success) {
              toast.success(`Demonstrativo ${result.filename}: OK`);
            } else {
              toast.error(`Demonstrativo ${result.filename}: ${result.error || 'Erro'}`);
            }
          });
        } else {
          toast.error('Resposta inesperada do servidor.');
        }
        return { success: true, data: res.data };
      }
      toast.error('Nenhum arquivo válido para upload.');
      return { success: false };
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      setProcessingStage('error');
      setProcessingMsg('Erro ao processar os arquivos');
      toast.error('Erro ao processar os arquivos', {
        description: 'Por favor, tente novamente ou contate o suporte.'
      });
      return { success: false };
    }
  };

  return {
    processUploadedFiles,
    determineProcessingMode: (files: FileWithStatus[]) => {
      const hasGuias = files.some(f => f.type === 'guia' && f.status === 'valid');
      const hasDemonstrativos = files.some(f => f.type === 'demonstrativo' && f.status === 'valid');
      if (hasGuias && hasDemonstrativos) return 'complete';
      if (hasGuias) return 'guia-only';
      return 'demonstrativo-only';
    },
  };
}
