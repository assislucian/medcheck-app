import { FileWithStatus } from '@/types/upload';
import { toast } from 'sonner';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

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
        description: 'Por favor, selecione arquivos para processar.',
      });
      return { success: false };
    }
    if (!files.some((file) => file.status === 'valid')) {
      toast.error('Arquivos inválidos', {
        description:
          'Todos os arquivos selecionados são inválidos. Por favor, selecione arquivos válidos.',
      });
      return { success: false };
    }
    try {
      setProgress(0);
      setProcessingStage('extracting');
      setProcessingMsg('Enviando arquivos...');

      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // Função utilitária com retry exponencial simples
      const uploadWithRetry = async (url: string, data: FormData, maxRetries = 3) => {
        let attempt = 0;
        while (attempt < maxRetries) {
          try {
            return await axios.post(url, data, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (err: any) {
            attempt += 1;
            if (attempt >= maxRetries) throw err;
            // backoff exponencial simples
            await new Promise((res) => setTimeout(res, 500 * 2 ** (attempt - 1)));
          }
        }
      };

      // Upload de guias (mantém compatibilidade)
      const guiaFiles = files.filter((f) => f.type === 'guia' && f.status === 'valid');
      if (guiaFiles.length) {
        const formData = new FormData();
        guiaFiles.forEach((f) => formData.append('files', f.file, f.name));
        const res = await uploadWithRetry(`${apiUrl}/api/v1/guias/upload`, formData);
        setProgress(100);
        setProcessingStage('complete');
        setProcessingMsg('Processamento concluído!');
        toast.success('Guias processadas!');
        // Atualizar cache com invalidação inteligente
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        queryClient.invalidateQueries({ queryKey: ['demonstrativos'] });
        queryClient.invalidateQueries({ queryKey: ['guias'] });

        // Força refetch imediato para dados críticos
        queryClient.refetchQueries({
          queryKey: ['dashboardStats'],
          type: 'active',
        });

        // Dispara evento para sincronização automática
        window.dispatchEvent(new CustomEvent('uploadComplete'));

        return { success: true, data: res.data };
      }
      // Upload de demonstrativos (em lote)
      const demoFiles = files.filter(
        (f) => f.type === 'demonstrativo' && f.status === 'valid'
      );
      if (demoFiles.length) {
        const formData = new FormData();
        demoFiles.forEach((f) => formData.append('files', f.file, f.name));
        const res = await uploadWithRetry(
          `${apiUrl}/api/v1/demonstrativos/upload`,
          formData
        );
        setProgress(100);
        setProcessingStage('complete');
        setProcessingMsg('Processamento concluído!');
        // Feedback consolidado para demonstrativos
        if (res.data && Array.isArray(res.data.results)) {
          let successCount = 0;
          let errorCount = 0;
          const errorFiles: string[] = [];

          res.data.results.forEach((result: any) => {
            if (result.success) {
              successCount++;
            } else {
              errorCount++;
              errorFiles.push(
                `${result.filename}: ${result.error || 'Erro desconhecido'}`
              );
            }
          });

          // Apenas um toast de resumo
          if (successCount > 0 && errorCount === 0) {
            toast.success(
              `✅ ${successCount} demonstrativo(s) processado(s) com sucesso!`
            );
          } else if (successCount > 0 && errorCount > 0) {
            toast.warning(`${successCount} processado(s), ${errorCount} com erro`, {
              description:
                errorFiles.length <= 3
                  ? errorFiles.join('; ')
                  : `${errorFiles.slice(0, 2).join('; ')}... e mais ${errorCount - 2}`,
            });
          } else if (errorCount > 0) {
            toast.error(`❌ ${errorCount} demonstrativo(s) com erro`, {
              description:
                errorFiles.length <= 3
                  ? errorFiles.join('; ')
                  : `${errorFiles.slice(0, 2).join('; ')}... e mais ${errorCount - 2}`,
            });
          }
        } else {
          toast.error('Resposta inesperada do servidor.');
        }
        // Atualizar dashboard e lista de demonstrativos com invalidação inteligente
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        queryClient.invalidateQueries({ queryKey: ['demonstrativos'] });
        queryClient.invalidateQueries({ queryKey: ['guias'] });
        queryClient.invalidateQueries({ queryKey: ['activity-logs'] });

        // Força refetch imediato para dados críticos
        queryClient.refetchQueries({
          queryKey: ['dashboardStats'],
          type: 'active',
        });

        // Dispara evento para sincronização automática
        window.dispatchEvent(new CustomEvent('uploadComplete'));

        return { success: true, data: res.data };
      }
      toast.error('Nenhum arquivo válido para upload.');
      return { success: false };
    } catch (error: any) {
      console.error('Erro ao processar arquivos:', error);
      setProcessingStage('error');
      setProcessingMsg('Erro ao processar os arquivos');

      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao processar os arquivos';
      let errorDescription = 'Por favor, tente novamente ou contate o suporte.';

      if (error.response) {
        // Erro do servidor
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMessage = 'Arquivo inválido';
          errorDescription =
            data?.detail || 'Verifique o formato e tamanho do arquivo.';
        } else if (status === 401) {
          errorMessage = 'Sessão expirada';
          errorDescription = 'Faça login novamente.';
        } else if (status === 413) {
          errorMessage = 'Arquivo muito grande';
          errorDescription = 'O arquivo excede o tamanho máximo permitido.';
        } else if (status === 500) {
          errorMessage = 'Erro interno do servidor';
          errorDescription = 'Tente novamente em alguns minutos.';
        }
      } else if (error.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão';
        errorDescription = 'Verifique sua conexão com a internet.';
      }

      toast.error(errorMessage, {
        description: errorDescription,
      });
      return { success: false };
    }
  };

  return {
    processUploadedFiles,
    determineProcessingMode: (files: FileWithStatus[]) => {
      const hasGuias = files.some((f) => f.type === 'guia' && f.status === 'valid');
      const hasDemonstrativos = files.some(
        (f) => f.type === 'demonstrativo' && f.status === 'valid'
      );
      if (hasGuias && hasDemonstrativos) return 'complete';
      if (hasGuias) return 'guia-only';
      return 'demonstrativo-only';
    },
  };
}
