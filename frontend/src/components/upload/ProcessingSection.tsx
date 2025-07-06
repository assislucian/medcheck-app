import { ProcessingStage } from '@/types/upload';
import { CheckCircle, Loader2 } from 'lucide-react';
import UploadProgress from './UploadProgress';

interface ProcessingSectionProps {
  uploading: boolean;
  progress: number;
  processingStage: ProcessingStage;
  processingMsg: string;
}

const ProcessingSection = ({
  uploading,
  progress,
  processingStage,
  processingMsg,
}: ProcessingSectionProps) => {
  if (!uploading) return null;

  return (
    <div className="rounded-lg border p-4 bg-muted/30">
      <h5 className="font-medium flex items-center gap-2 mb-2">
        {processingStage === 'complete' ? (
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Processamento concluído
          </span>
        ) : processingStage === 'error' ? (
          <span className="flex items-center gap-1.5 text-red-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Erro no processamento
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Processando documentos
          </span>
        )}
      </h5>
      <div className="text-sm text-muted-foreground mb-3">{processingMsg}</div>
      <UploadProgress progress={progress} show={true} stage={processingStage} />
    </div>
  );
};

export default ProcessingSection;
