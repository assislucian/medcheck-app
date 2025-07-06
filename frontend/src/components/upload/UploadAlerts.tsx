import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { FileType } from '@/types/upload';

interface UploadAlertsProps {
  hasGuiaDemonstrativoPair: boolean;
  hasInvalidFiles: boolean;
  hasFile: (type: FileType) => boolean;
  hasValidFilesForProcessing: boolean;
}

const UploadAlerts = ({
  hasGuiaDemonstrativoPair,
  hasInvalidFiles,
  hasFile,
  hasValidFilesForProcessing,
}: UploadAlertsProps) => {
  if (!hasFile('guia') && !hasFile('demonstrativo')) return null;

  return (
    <div className="space-y-3">
      {hasInvalidFiles && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Alguns arquivos são inválidos e foram removidos. Por favor, verifique o
            formato e tamanho dos arquivos.
          </AlertDescription>
        </Alert>
      )}

      {!hasValidFilesForProcessing && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum arquivo válido para processamento. Por favor, adicione arquivos
            válidos.
          </AlertDescription>
        </Alert>
      )}

      {hasGuiaDemonstrativoPair && hasValidFilesForProcessing && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ótimo! Você tem guias e demonstrativos prontos para análise comparativa.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UploadAlerts;
