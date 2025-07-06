/**
 * edgeService.ts
 *
 * Serviço para interação com as Edge Functions do Supabase.
 * Gerencia o envio e processamento de arquivos através das funções de borda.
 */

import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FileType, FileWithStatus, ProcessingStage } from '@/types/upload';
import { simulateProcessingStages } from '../processingService';
import { uploadFilesToStorage } from './storageService';
import { setCurrentAnalysis } from './analysisService';
import { generateFallbackData } from '@/utils/uploadUtils';
import { determineProcessingMode } from '@/utils/uploadUtils';

/**
 * Processa os arquivos enviados usando as edge functions do Supabase
 * @param files Arquivos a processar
 * @param setProgress Função para atualizar o progresso
 * @param setProcessingStage Função para atualizar o estágio de processamento
 * @param setProcessingMsg Função para atualizar a mensagem de processamento
 * @param crmRegistrado CRM para filtrar (opcional)
 * @param fileTypes Tipos de arquivos presentes
 * @returns Objeto com sucesso e ID da análise
 */
export async function processFiles(
  files: FileWithStatus[],
  setProgress: (progress: number) => void,
  setProcessingStage: (stage: ProcessingStage) => void,
  setProcessingMsg: (msg: string) => void,
  crmRegistrado: string = '',
  fileTypes: FileType[]
): Promise<{ success: boolean; analysisId: string | null }> {
  try {
    // Determinar modo de processamento baseado nos tipos de arquivos
    const processMode = determineProcessingMode(files);
    console.log(`Processando arquivos no modo: ${processMode}`);

    // Simular etapas de processamento para feedback visual
    await simulateProcessingStages(
      processMode,
      setProgress,
      setProcessingStage,
      setProcessingMsg
    );

    try {
      // Verificar autenticação do usuário
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Erro de autenticação:', sessionError);
        throw new Error('Autenticação necessária para processar arquivos');
      }

      setProgress(25);
      setProcessingStage('uploading');
      setProcessingMsg('Fazendo upload dos arquivos...');

      // Fazer upload dos arquivos válidos
      const uploadedFiles = await uploadFilesToStorage(
        files.filter((f) => f.status === 'valid')
      );
      console.log('Arquivos enviados:', uploadedFiles);

      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error('Nenhum arquivo foi enviado com sucesso');
      }

      const uploadIds = uploadedFiles.map((f) => f.id);

      setProgress(50);
      setProcessingStage('analyzing');
      setProcessingMsg('Processando arquivos...');

      // Invocar a edge function para processar os arquivos
      const { data: processingData, error: processingError } =
        await supabase.functions.invoke('process-analysis', {
          body: {
            uploadIds,
            fileTypes,
            crmRegistrado,
          },
        });

      if (processingError || !processingData?.success) {
        console.error(
          'Erro na função de borda:',
          processingError || 'Erro de processamento desconhecido'
        );
        throw new Error(processingError?.message || 'Erro ao processar arquivos');
      }

      setProgress(100);
      setProcessingStage('complete');
      setProcessingMsg('Processamento concluído!');

      // Armazenar resultados da análise
      setCurrentAnalysis(processingData.extractedData, processingData.analysisId);

      toast.success('Processamento concluído', {
        description: `Foram processados ${processingData.proceduresCount || 0} procedimentos.`,
      });

      return {
        success: true,
        analysisId: processingData.analysisId,
      };
    } catch (backendError) {
      // Se houver erro no backend, usar mecanismo de fallback local
      console.log(
        'Processamento no backend falhou, usando mecanismo de fallback',
        backendError
      );

      const fallbackData = generateFallbackData(processMode, files, crmRegistrado);
      const localAnalysisId = `local-${Date.now()}`;

      setCurrentAnalysis(fallbackData, localAnalysisId);

      toast.warning('Processando localmente', {
        description:
          'Não foi possível conectar ao servidor, usando processamento local.',
      });

      return {
        success: true,
        analysisId: localAnalysisId,
      };
    }
  } catch (error) {
    // Tratar erros gerais do processamento
    console.error('Erro ao processar arquivos:', error);

    setProgress(0);
    setProcessingStage('error');
    setProcessingMsg('Erro ao processar os arquivos');

    toast.error('Erro ao processar os arquivos', {
      description: 'Por favor, tente novamente ou contate o suporte.',
    });

    return {
      success: false,
      analysisId: null,
    };
  }
}
