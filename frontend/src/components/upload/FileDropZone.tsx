import { Button } from '@/components/ui/button';
import { FileUp, AlertCircle, FileText, Info } from 'lucide-react';
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
    if (!e.target.files || e.target.files.length === 0) return;
    onDropFiles(type, e.target.files);
    e.target.value = '';
  };

  return (
    <div
      className={`flex flex-col items-center p-3 sm:p-4 border border-dashed rounded-lg 
      ${
        disabled
          ? 'bg-muted/30 border-muted cursor-not-allowed'
          : 'hover:border-primary/50 transition-colors border-border cursor-pointer'
      } 
      ${isGuia ? 'hover:bg-medblue-600/5' : 'hover:bg-green-600/5'}
      ${hasFiles ? (isGuia ? 'bg-medblue-600/10' : 'bg-green-600/10') : ''}`}
      onClick={() => {
        if (!disabled) document.getElementById(inputId)?.click();
      }}
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
      />
      {isGuia ? (
        <FileUp
          className={`h-8 w-8 sm:h-10 sm:w-10 ${
            hasFiles ? 'text-medblue-600' : 'text-primary'
          } mb-2`}
        />
      ) : (
        <FileText
          className={`h-8 w-8 sm:h-10 sm:w-10 ${
            hasFiles ? 'text-green-600' : 'text-primary'
          } mb-2`}
        />
      )}
      <label htmlFor={inputId} className="text-center cursor-pointer">
        <span
          className={`font-medium mb-1 block text-sm sm:text-base ${
            disabled ? 'text-muted-foreground' : ''
          }`}
        >
          {isGuia ? 'Guias TISS' : 'Demonstrativos de Pagamento'}
        </span>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {hasFiles
            ? 'Clique para adicionar mais'
            : 'Arraste ou clique para selecionar PDFs'}
        </span>
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
                ? 'Guias TISS: Documentos que contêm os procedimentos realizados com detalhes como código do procedimento, beneficiário, data e médicos participantes. Servem como comprovante do serviço prestado.'
                : 'Demonstrativos: Documentos emitidos pelos planos de saúde que detalham o pagamento realizado para os procedimentos. Contêm informações sobre valores pagos, glosas e códigos dos procedimentos.'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {hasFiles && (
        <div className="mt-1 px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
          Arquivos adicionados
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
