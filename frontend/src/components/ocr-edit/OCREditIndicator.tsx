import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Edit3, Eye } from 'lucide-react';

export interface OCREditIndicatorProps {
    /** Se os dados podem ser editados */
    canEdit: boolean;
    /** Se os dados foram extraídos por OCR */
    isOCRData?: boolean;
    /** Confiança do OCR (0-100) */
    ocrConfidence?: number;
    /** Se tem edições no histórico */
    hasEdits?: boolean;
    /** Classe CSS personalizada */
    className?: string;
    /** Callback quando clica em editar */
    onEdit?: () => void;
    /** Callback quando clica em visualizar */
    onView?: () => void;
}

/**
 * Indicador visual para dados OCR editáveis
 * Mostra se os dados podem ser editados e sua origem (OCR/manual)
 */
export function OCREditIndicator({
    canEdit,
    isOCRData = true,
    ocrConfidence,
    hasEdits = false,
    className,
    onEdit,
    onView
}: OCREditIndicatorProps) {

    const getConfidenceColor = (confidence?: number) => {
        if (!confidence) return 'gray';
        if (confidence >= 90) return 'green';
        if (confidence >= 70) return 'yellow';
        return 'red';
    };

    const getConfidenceIcon = (confidence?: number) => {
        if (!confidence) return AlertTriangle;
        if (confidence >= 90) return CheckCircle;
        if (confidence >= 70) return AlertTriangle;
        return AlertTriangle;
    };

    const confidenceColor = getConfidenceColor(ocrConfidence);
    const ConfidenceIcon = getConfidenceIcon(ocrConfidence);

    return (
        <TooltipProvider>
            <div className={cn("flex items-center gap-2", className)}>
                {/* Indicador de origem dos dados */}
                {isOCRData && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs h-5",
                                    confidenceColor === 'green' && "border-green-500 text-green-700 bg-green-50",
                                    confidenceColor === 'yellow' && "border-yellow-500 text-yellow-700 bg-yellow-50",
                                    confidenceColor === 'red' && "border-red-500 text-red-700 bg-red-50",
                                    confidenceColor === 'gray' && "border-gray-500 text-gray-700 bg-gray-50"
                                )}
                            >
                                <ConfidenceIcon className="w-3 h-3 mr-1" />
                                OCR
                                {ocrConfidence && ` ${ocrConfidence}%`}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="space-y-1">
                                <p className="font-medium">Dados extraídos por OCR</p>
                                {ocrConfidence && (
                                    <p className="text-sm">
                                        Confiança: {ocrConfidence}%
                                        {ocrConfidence < 70 && ' (recomenda-se verificação)'}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Podem conter erros de leitura
                                </p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Indicador de edições */}
                {hasEdits && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="secondary" className="text-xs h-5">
                                <Edit3 className="w-3 h-3 mr-1" />
                                Editado
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Este dado foi editado manualmente</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Botões de ação */}
                <div className="flex items-center gap-1">
                    {canEdit && onEdit && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                                    onClick={onEdit}
                                >
                                    <Edit3 className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Editar dados OCR</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {onView && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-gray-50"
                                    onClick={onView}
                                >
                                    <Eye className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Visualizar detalhes</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}

/**
 * Hook para gerenciar estado de indicadores OCR
 */
export function useOCRIndicator(
    dataSource: 'ocr' | 'manual' = 'ocr',
    confidence?: number
) {
    const isOCRData = dataSource === 'ocr';
    const needsReview = isOCRData && (confidence === undefined || confidence < 70);
    const isHighConfidence = isOCRData && confidence !== undefined && confidence >= 90;

    return {
        isOCRData,
        needsReview,
        isHighConfidence,
        confidenceLevel: confidence
    };
}
