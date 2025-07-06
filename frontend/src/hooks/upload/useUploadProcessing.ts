import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { FileType } from '@/types/upload';

export function useUploadProcessing(processUploadedFiles: () => Promise<any>) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const handleProcess = async () => {
    setError(null);

    try {
      const result = await processUploadedFiles();

      if (result && typeof result === 'object') {
        setShowSuccess(result.success || false);
        setAnalysisId(result.analysisId || null);

        if (!result.success) {
          setError('Erro ao processar os arquivos.');
        }
      } else {
        setError('Resultado inesperado do processamento.');
        setShowSuccess(false);
      }
    } catch (error) {
      console.error('Erro durante o processamento:', error);
      setError('Ocorreu um erro durante o processamento. Por favor, tente novamente.');
      setShowSuccess(false);
      toast.error('Erro ao processar arquivos');
    }
  };

  const handleViewComparison = () => {
    if (analysisId) {
      navigate(`/compare?analysisId=${analysisId}`);
    } else {
      toast.error('ID de análise não disponível');
    }
  };

  return {
    error,
    showSuccess,
    analysisId,
    handleProcess,
    handleViewComparison,
    setError,
  };
}
