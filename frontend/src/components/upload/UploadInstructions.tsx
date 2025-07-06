import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UploadInstructions = () => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <ul className="list-disc pl-5 space-y-1">
          <li>Faça upload das guias médicas (formato PDF) na área da esquerda</li>
          <li>
            Faça upload dos demonstrativos de pagamento (formato PDF) na área da direita
          </li>
          <li>Para uma análise completa, envie ambos os tipos de documento</li>
          <li>Tamanho máximo por arquivo: 10MB</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default UploadInstructions;
