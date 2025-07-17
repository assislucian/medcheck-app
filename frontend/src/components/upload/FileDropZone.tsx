import { Button } from '@/components/ui/button';
import { FileUp, AlertCircle, FileText, Info, BarChart3 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileType } from '@/types/upload';

type FileDropZoneProps = {
  type: FileType;
  onDropFiles: (type: FileType, files: FileList) => Promise<void>;
  disabled: boolean;
  hasFiles?: boolean;
};

/**
 * FileDropZone Component
 *
 * Fornece uma área para upload de documentos PDF, seja guias médicas (TISS)
 * ou demonstrativos de pagamento das operadoras de saúde.
 *
 * @param type - O tipo de documento para upload ('guia' ou 'demonstrativo')
 * @param onFileChange - Função para tratar eventos de seleção de arquivo
 * @param disabled - Se o componente está desativado (ex: durante uploads)
 * @param hasFiles - Se arquivos deste tipo já foram adicionados
 */
const FileDropZone = ({
  type,
  onDropFiles,
  disabled,
  hasFiles = false,
}: FileDropZoneProps) => {
  const isGuia = type === 'guia';
  const inputId = `${type}PdfInput`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    onDropFiles(type, e.target.files);
    e.target.value = '';
  };

  const handleClick = () => {
    if (!disabled) {
      const input = document.getElementById(inputId);
      if (input) {
        input.click();
      }
    }
  };

  return (
    <div
      className={`flex flex-col items-center p-4 sm:p-6 border-2 border-dashed rounded-xl relative transition-all duration-200
      ${
        disabled
          ? 'bg-muted/30 border-muted cursor-not-allowed'
          : 'hover:border-primary/70 hover:shadow-md focus-within:border-primary/80 focus-within:shadow-lg border-border cursor-pointer'
      } 
      ${isGuia ? 'hover:bg-medblue-600/5' : 'hover:bg-green-600/5'}
      ${hasFiles ? (isGuia ? 'bg-medblue-600/10' : 'bg-green-600/10') : ''}`}
      onClick={handleClick}
      style={{ zIndex: 1, minHeight: '140px' }}
      tabIndex={0}
      role="button"
      aria-label={
        isGuia ? 'Área de upload de guias médicas' : 'Área de upload de demonstrativos'
      }
    >
      <input
        type="file"
        id={inputId}
        className="hidden"
        accept=".pdf"
        multiple
        onChange={handleInputChange}
        disabled={disabled}
        aria-label={
          isGuia
            ? 'Selecionar guias médicas em PDF'
            : 'Selecionar demonstrativos em PDF'
        }
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />

      <label
        htmlFor={inputId}
        className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const input = document.getElementById(inputId);
          if (input) {
            input.click();
          }
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            {isGuia ? (
              <FileText className="h-6 w-6 text-medblue-600" />
            ) : (
              <BarChart3 className="h-6 w-6 text-green-600" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isGuia ? 'Adicionar Guias' : 'Adicionar Demonstrativos'}
            </p>
            <p className="text-xs text-muted-foreground">
              Arraste arquivos PDF ou clique para selecionar
            </p>
          </div>
        </div>
      </label>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mt-2"
              tabIndex={0}
              type="button"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sr-only">
                Informações sobre {isGuia ? 'guias' : 'demonstrativos'}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center" className="max-w-xs">
            <p>
              {isGuia
                ? 'Guias TISS: Documentos que contêm os procedimentos realizados com detalhes como códigos, valores e informações do paciente.'
                : 'Demonstrativos: Relatórios financeiros que mostram valores apresentados, liberados e glosas por período.'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default FileDropZone;
