import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface UploadContextAlertsProps {
  showGuideAlert: boolean;
  showDemonstrativoAlert: boolean;
}

const UploadContextAlerts = ({
  showGuideAlert,
  showDemonstrativoAlert,
}: UploadContextAlertsProps) => {
  if (!showGuideAlert && !showDemonstrativoAlert) return null;

  return (
    <div className="space-y-3">
      {showGuideAlert && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Recomendamos enviar também as guias médicas para uma análise mais completa.
          </AlertDescription>
        </Alert>
      )}

      {showDemonstrativoAlert && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Recomendamos enviar também os demonstrativos para uma análise mais completa.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UploadContextAlerts;
