import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UploadActionButtonsProps {
  isUploading: boolean;
  filesLength: number;
  hasGuiaDemonstrativoPair: boolean;
  hasValidFilesForProcessing: boolean;
  onProcess: () => void;
  onReset: () => void;
}

const UploadActionButtons = ({
  isUploading,
  filesLength,
  hasGuiaDemonstrativoPair,
  hasValidFilesForProcessing,
  onProcess,
  onReset,
}: UploadActionButtonsProps) => {
  return (
    <div className="w-full flex flex-col sm:flex-row gap-3">
      <Button
        className="flex-1 bg-primary text-white font-semibold shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-colors text-base h-12 rounded-lg"
        disabled={filesLength === 0 || isUploading || !hasValidFilesForProcessing}
        onClick={onProcess}
        type="button"
        tabIndex={0}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : hasGuiaDemonstrativoPair ? (
          'Analisar e Comparar Documentos'
        ) : (
          'Processar Documentos'
        )}
      </Button>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onReset}
                disabled={filesLength === 0 || isUploading}
              >
                Limpar Arquivos
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove todos os arquivos selecionados</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default UploadActionButtons;
