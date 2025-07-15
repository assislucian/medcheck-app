import { Button } from '@/components/ui/button';
import {
  FileUp,
  AlertCircle,
  FileText,
  Info,
  BarChart3,
  Camera,
  Upload,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileType } from '@/types/upload';
import { useMobileLayout } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type FileDropZoneProps = {
  type: FileType;
  onDropFiles: (type: FileType, files: FileList) => Promise<void>;
  disabled: boolean;
  hasFiles?: boolean;
};

/**
 * FileDropZone Component - Otimizado para Mobile
 *
 * Fornece uma área para upload de documentos PDF, seja guias médicas (TISS)
 * ou demonstrativos de pagamento das operadoras de saúde.
 * Totalmente otimizado para dispositivos móveis médicos.
 *
 * @param type - O tipo de documento para upload ('guia' ou 'demonstrativo')
 * @param onDropFiles - Função para tratar eventos de upload de arquivo
 * @param disabled - Se o componente está desativado (ex: durante uploads)
 * @param hasFiles - Se arquivos deste tipo já foram adicionados
 */
const FileDropZone = ({
  type,
  onDropFiles,
  disabled,
  hasFiles = false,
}: FileDropZoneProps) => {
  const { isMobile, uploadZoneHeight, isTouch } = useMobileLayout();
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

  // Configurações responsivas
  const zoneConfig = {
    height: isMobile ? uploadZoneHeight : 160,
    padding: isMobile ? 'p-4' : 'p-6',
    iconSize: isMobile ? 'h-8 w-8' : 'h-12 w-12',
    innerIconSize: isMobile ? 'h-5 w-5' : 'h-6 w-6',
    titleSize: isMobile ? 'text-base' : 'text-lg',
    subtitleSize: isMobile ? 'text-xs' : 'text-sm',
  };

  // Estilos específicos por tipo
  const typeStyles = isGuia
    ? {
        hoverBg: 'hover:bg-blue-50/80 dark:hover:bg-blue-900/20',
        activeBg: 'bg-blue-50/60 dark:bg-blue-900/15',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconBg: 'bg-blue-100 dark:bg-blue-900/40',
        iconColor: 'text-blue-600 dark:text-blue-400',
        focusRing: 'focus-within:ring-blue-500 focus-within:border-blue-500',
      }
    : {
        hoverBg: 'hover:bg-green-50/80 dark:hover:bg-green-900/20',
        activeBg: 'bg-green-50/60 dark:bg-green-900/15',
        borderColor: 'border-green-200 dark:border-green-800',
        iconBg: 'bg-green-100 dark:bg-green-900/40',
        iconColor: 'text-green-600 dark:text-green-400',
        focusRing: 'focus-within:ring-green-500 focus-within:border-green-500',
      };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border-2 border-dashed rounded-xl relative transition-all duration-200',
        'touch-manipulation select-none', // Mobile optimizations
        zoneConfig.padding,
        disabled
          ? 'bg-gray-50 border-gray-300 cursor-not-allowed opacity-60 dark:bg-gray-800/30 dark:border-gray-700'
          : cn(
              'cursor-pointer',
              hasFiles ? typeStyles.activeBg : 'bg-white dark:bg-gray-800/50',
              hasFiles
                ? typeStyles.borderColor
                : 'border-gray-300 dark:border-gray-600',
              !hasFiles && typeStyles.hoverBg,
              'hover:shadow-lg hover:border-opacity-60',
              typeStyles.focusRing,
              'focus-within:ring-2 focus-within:ring-offset-2'
            )
      )}
      onClick={handleClick}
      style={{
        minHeight: `${zoneConfig.height}px`,
        WebkitTapHighlightColor: 'transparent', // Remove highlight azul no iOS
      }}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={
        isGuia
          ? 'Área de upload de guias médicas TISS'
          : 'Área de upload de demonstrativos de pagamento'
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        type="file"
        id={inputId}
        className="sr-only"
        accept=".pdf"
        multiple
        onChange={handleInputChange}
        disabled={disabled}
        aria-label={
          isGuia
            ? 'Selecionar arquivos de guias médicas em formato PDF'
            : 'Selecionar arquivos de demonstrativos em formato PDF'
        }
      />

      {/* Conteúdo da área de drop */}
      <div className="flex flex-col items-center gap-4 text-center w-full">
        {/* Ícone principal */}
        <div
          className={cn(
            'flex items-center justify-center rounded-full transition-all duration-300',
            zoneConfig.iconSize,
            disabled ? 'bg-gray-200 dark:bg-gray-700' : typeStyles.iconBg,
            !disabled && 'group-hover:scale-110 transform'
          )}
        >
          {isGuia ? (
            <FileText
              className={cn(
                zoneConfig.innerIconSize,
                disabled ? 'text-gray-400' : typeStyles.iconColor
              )}
            />
          ) : (
            <BarChart3
              className={cn(
                zoneConfig.innerIconSize,
                disabled ? 'text-gray-400' : typeStyles.iconColor
              )}
            />
          )}
        </div>

        {/* Textos principais */}
        <div className="space-y-2">
          <h3
            className={cn(
              'font-semibold leading-tight',
              zoneConfig.titleSize,
              disabled
                ? 'text-gray-400 dark:text-gray-600'
                : 'text-gray-900 dark:text-gray-100'
            )}
          >
            {isGuia ? 'Guias Médicas' : 'Demonstrativos'}
          </h3>

          <div
            className={cn(
              'space-y-1',
              zoneConfig.subtitleSize,
              disabled
                ? 'text-gray-400 dark:text-gray-600'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {isMobile ? (
              // Versão mobile simplificada
              <>
                <p className="font-medium">Toque para selecionar PDFs</p>
                {isTouch && (
                  <p className="flex items-center justify-center gap-1">
                    <Camera className="h-3 w-3" />
                    Ou tire foto do documento
                  </p>
                )}
              </>
            ) : (
              // Versão desktop completa
              <>
                <p className="font-medium">
                  Arraste arquivos PDF ou clique para selecionar
                </p>
                <p>Múltiplos arquivos são aceitos</p>
              </>
            )}
          </div>
        </div>

        {/* Indicador de status para arquivos existentes */}
        {hasFiles && (
          <div className="flex items-center gap-2 mt-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isGuia ? 'bg-blue-500' : 'bg-green-500'
              )}
            />
            <span
              className={cn(
                'text-xs font-medium',
                isGuia
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-green-700 dark:text-green-300'
              )}
            >
              Arquivos adicionados
            </span>
          </div>
        )}

        {/* Dicas específicas para mobile */}
        {isMobile && !disabled && (
          <div className="mt-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {isGuia
                ? '💡 Guias TISS em PDF para análise de procedimentos'
                : '💡 Demonstrativos de convênios para comparação de valores'}
            </p>
          </div>
        )}

        {/* Informações técnicas colapsadas para desktop */}
        {!isMobile && (
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
            <p>Formato: PDF • Tamanho máximo: 10MB por arquivo</p>
            <p>
              {isGuia
                ? 'Guias TISS padrão ANS para análise de procedimentos médicos'
                : 'Demonstrativos de pagamento das operadoras de saúde'}
            </p>
          </div>
        )}
      </div>

      {/* Overlay para feedback visual de drag */}
      <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-200 bg-gradient-to-br from-blue-500/10 to-green-500/10" />
    </div>
  );
};

export default FileDropZone;
