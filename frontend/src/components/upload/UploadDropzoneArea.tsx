import React from 'react';
import FileDropZone from './FileDropZone';
import { FileType } from '@/types/upload';
import { useMobileLayout } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface UploadDropzoneAreaProps {
  handleFileChangeByType: (type: FileType, files: FileList) => Promise<void>;
  isUploading: boolean;
  hasFile: (type: FileType) => boolean;
}

const UploadDropzoneArea = ({
  handleFileChangeByType,
  isUploading,
  hasFile,
}: UploadDropzoneAreaProps) => {
  const { isMobile, shouldStackCards } = useMobileLayout();

  return (
    <div className="space-y-4">
      {/* Header informativo para mobile */}
      {isMobile && (
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Enviar Documentos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Faça upload dos seus documentos médicos para análise
          </p>
        </div>
      )}

      {/* Grid adaptativo - vertical em mobile, horizontal em desktop */}
      <div
        className={cn(
          'grid gap-4',
          isMobile || shouldStackCards
            ? 'grid-cols-1 space-y-2'
            : 'grid-cols-1 md:grid-cols-2'
        )}
      >
        <FileDropZone
          type="guia"
          onDropFiles={handleFileChangeByType}
          disabled={isUploading}
          hasFiles={hasFile('guia')}
        />
        <FileDropZone
          type="demonstrativo"
          onDropFiles={handleFileChangeByType}
          disabled={isUploading}
          hasFiles={hasFile('demonstrativo')}
        />
      </div>

      {/* Dicas de uso para mobile */}
      {isMobile && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Dicas para melhor análise:
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Guias TISS: Envie para ver procedimentos realizados</li>
            <li>• Demonstrativos: Envie para comparar valores pagos</li>
            <li>• Ambos juntos: Análise completa de glosas e diferenças</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadDropzoneArea;
