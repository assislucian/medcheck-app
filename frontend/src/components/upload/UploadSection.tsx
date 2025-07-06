import { Card, CardContent, CardFooter } from '@/components/ui/card';
import ComparisonView from '../ComparisonView';
import UploadAlerts from './UploadAlerts';
import ProcessingSection from './ProcessingSection';
import { useFileUpload } from '@/hooks/useFileUpload';
import FileList from './FileList';
import UploadInstructions from './UploadInstructions';
import UploadDropzoneArea from './UploadDropzoneArea';
import UploadActionButtons from './UploadActionButtons';
import UploadContextAlerts from './UploadContextAlerts';
import UploadSuccess from './UploadSuccess';
import UploadError from './UploadError';
import { useUploadProcessing } from '@/hooks/upload/useUploadProcessing';
import { FileType } from '@/types/upload';
import { toast } from 'sonner';

const UploadSection = () => {
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

  const {
    error,
    showSuccess,
    analysisId,
    handleProcess,
    handleViewComparison,
    setError,
  } = useUploadProcessing(processUploadedFiles);

  const onDropFiles = async (type: FileType, fileList: FileList) => {
    setError(null);
    try {
      await handleFileChangeByType(type, fileList);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('duplicate')) {
          toast.error('Este demonstrativo já foi processado para este CRM/período');
          setError('Este demonstrativo já foi processado para este CRM/período');
        } else {
          toast.error('Erro ao processar arquivo');
          setError(err.message);
        }
      }
    }
  };

  const onProcess = async () => {
    if (!hasFile('guia') && !hasFile('demonstrativo')) {
      setError('Selecione pelo menos um tipo de arquivo antes de processar.');
      toast.error('Selecione pelo menos um tipo de documento');
      return;
    }

    try {
      await handleProcess();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('duplicate')) {
          toast.error('Este demonstrativo já foi processado para este CRM/período');
          setError('Este demonstrativo já foi processado para este CRM/período');
        } else {
          toast.error('Erro ao processar arquivos');
          setError(err.message);
        }
      }
    }
  };

  const showGuideAlert = !hasFile('guia') && hasFile('demonstrativo');
  const showDemonstrativoAlert = hasFile('guia') && !hasFile('demonstrativo');

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <UploadError message={error} />
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
        <CardFooter>
          <UploadActionButtons
            isUploading={isUploading}
            filesLength={files.length}
            hasGuiaDemonstrativoPair={hasGuiaDemonstrativoPair()}
            hasValidFilesForProcessing={hasValidFilesForProcessing()}
            onProcess={onProcess}
            onReset={resetFiles}
          />
        </CardFooter>
      </Card>

      {showSuccess && <UploadSuccess onViewComparison={handleViewComparison} />}
      {showComparison && <ComparisonView analysisId={analysisId} />}
    </div>
  );
};

export default UploadSection;
