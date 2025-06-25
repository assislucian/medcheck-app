import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import ComparisonView from './ComparisonView';
import UploadAlerts from './upload/UploadAlerts';
import ProcessingSection from './upload/ProcessingSection';
import { useFileUpload } from '@/hooks/useFileUpload';
import FileList from './upload/FileList';
import UploadInstructions from './upload/UploadInstructions';
import UploadDropzoneArea from './upload/UploadDropzoneArea';
import UploadActionButtons from './upload/UploadActionButtons';
import UploadContextAlerts from './upload/UploadContextAlerts';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileType } from '@/types/upload';

const UploadSection = () => {
  const navigate = useNavigate();
  const fileUpload = useFileUpload();
  const {
    isUploading,
    progress,
    files,
    hasFile,
    hasGuiaDemonstrativoPair,
    hasValidFilesForProcessing,
    hasInvalidFiles,
    removeFile,
    resetFiles,
    processUploadedFiles,
    showComparison,
    processingStage,
    processingMsg,
    handleFileChangeByType,
  } = fileUpload;

  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const onDropFiles = async (type: FileType, fileList: FileList) => {
    setError(null);
    await handleFileChangeByType(type, fileList);
  };

  const handleProcess = async () => {
    setError(null);

    if (!hasFile('guia') && !hasFile('demonstrativo')) {
      setError('Selecione pelo menos um tipo de arquivo antes de processar.');
      toast.error('Selecione pelo menos um tipo de documento');
      return;
    }

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

  const showGuideAlert = !hasFile('guia') && hasFile('demonstrativo');
  const showDemonstrativoAlert = hasFile('guia') && !hasFile('demonstrativo');

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          <UploadInstructions />
          <UploadDropzoneArea
            handleFileChangeByType={onDropFiles}
            isUploading={isUploading}
            hasFile={hasFile}
          />

          <UploadContextAlerts
            showGuideAlert={showGuideAlert}
            showDemonstrativoAlert={showDemonstrativoAlert}
          />

          <FileList files={files} onRemove={removeFile} disabled={isUploading} />

          <ProcessingSection
            uploading={isUploading}
            progress={progress}
            processingStage={processingStage}
            processingMsg={processingMsg}
          />

          <UploadAlerts
            hasGuiaDemonstrativoPair={hasGuiaDemonstrativoPair()}
            hasInvalidFiles={hasInvalidFiles()}
            hasFile={hasFile}
            hasValidFilesForProcessing={hasValidFilesForProcessing()}
          />
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-3 sm:gap-0">
          <UploadActionButtons
            isUploading={isUploading}
            filesLength={files.length}
            hasGuiaDemonstrativoPair={hasGuiaDemonstrativoPair()}
            hasValidFilesForProcessing={hasValidFilesForProcessing()}
            onProcess={handleProcess}
            onReset={resetFiles}
          />
        </CardFooter>
      </Card>
      {showSuccess && (
        <div className="mt-4 rounded border border-green-300 bg-green-50 text-green-800 px-4 py-3 text-sm flex flex-col gap-2">
          <span>Processamento concluído com sucesso.</span>
          <button
            onClick={handleViewComparison}
            className="underline font-medium text-green-800 text-left hover:text-green-700"
          >
            Ver Comparativo
          </button>
        </div>
      )}
      {showComparison && <ComparisonView analysisId={analysisId} />}
    </div>
  );
};

export default UploadSection;
