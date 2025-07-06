import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { FileWithStatus } from '@/types/upload';

interface UploadStatusProps {
  file: FileWithStatus;
  onRetry?: () => void;
  processingStage?: string;
  showDetails?: boolean;
}

export default function UploadStatus({
  file,
  onRetry,
  processingStage,
  showDetails = false,
}: UploadStatusProps) {
  // Status indicators
  const isProcessing = file.status === 'processing';
  const isValid = file.status === 'valid';
  const isInvalid = file.status === 'invalid';

  // Get detailed status message
  const getStatusMessage = () => {
    if (isProcessing) {
      if (processingStage) {
        switch (processingStage) {
          case 'extracting':
            return 'Extraindo dados...';
          case 'analyzing':
            return 'Analisando conteúdo...';
          case 'comparing':
            return 'Comparando valores...';
          default:
            return 'Processando...';
        }
      }
      return 'Verificando arquivo...';
    }

    if (isInvalid) {
      return 'Arquivo inválido';
    }

    if (isValid) {
      return 'Arquivo válido';
    }

    return 'Status desconhecido';
  };

  // Get status icon
  const StatusIcon = () => {
    if (isProcessing) {
      return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
    }

    if (isInvalid) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }

    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="flex items-center gap-2">
      <StatusIcon />

      {showDetails && (
        <span
          className={`text-xs ${
            isInvalid ? 'text-red-500' : isValid ? 'text-green-500' : 'text-blue-500'
          }`}
        >
          {getStatusMessage()}
        </span>
      )}

      {isInvalid && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
