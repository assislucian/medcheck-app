import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSmartOCRValidation } from '@/hooks/useSmartOCRValidation';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    RefreshCw,
    ThumbsUp,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { InlineEdit } from './InlineEdit';

export interface SmartOCRReviewProps {
    /** Dados do procedimento para validar */
    procedure: any;
    /** Índice do procedimento */
    procedureIndex: number;
    /** ID da guia */
    guiaId: number;
    /** Callback quando revisão é concluída */
    onReviewComplete?: (hasChanges: boolean) => void;
    /** Se deve aplicar correções automáticas */
    enableAutoCorrection?: boolean;
}

/**
 * Componente inteligente de revisão OCR
 * Mostra apenas campos que realmente precisam de atenção
 */
export function SmartOCRReview({
    procedure,
    procedureIndex,
    guiaId,
    onReviewComplete,
    enableAutoCorrection = true
}: SmartOCRReviewProps) {
    const [reviewedFields, setReviewedFields] = useState<Set<string>>(new Set());
    const [hasChanges, setHasChanges] = useState(false);
    const [autoCorrectionsApplied, setAutoCorrectionsApplied] = useState(0);

    const {
        validationResults,
        isValidating,
        validateProcedure,
        applyAutoCorrections
    } = useSmartOCRValidation();

    useEffect(() => {
        const runValidation = async () => {
            const results = await validateProcedure(procedure, procedureIndex, guiaId);

            // Aplicar correções automáticas se habilitado
            if (enableAutoCorrection && results.length > 0) {
                const autoCorrections = applyAutoCorrections(results);
                setAutoCorrectionsApplied(Object.keys(autoCorrections).length);

                // TODO: Aplicar correções automaticamente no backend
                // Para cada correção automática, enviar para o endpoint
            }
        };

        runValidation();
    }, [procedure, procedureIndex, guiaId, enableAutoCorrection]);

    const fieldsNeedingReview = validationResults.filter(v => v.requires_review);
    const totalFields = validationResults.length;
    const reviewedCount = reviewedFields.size;
    const progressPercentage = totalFields > 0 ? (reviewedCount / totalFields) * 100 : 100;

    const handleFieldReviewed = (fieldPath: string) => {
        setReviewedFields(prev => new Set([...prev, fieldPath]));
        setHasChanges(true);
    };

    const handleSkipField = (fieldPath: string) => {
        setReviewedFields(prev => new Set([...prev, fieldPath]));
    };

    const handleCompleteReview = () => {
        if (onReviewComplete) {
            onReviewComplete(hasChanges);
        }
    };

    const getFieldLabel = (fieldPath: string): string => {
        if (fieldPath.includes('.codigo')) return 'Código do Procedimento';
        if (fieldPath.includes('.data_execucao')) return 'Data de Execução';
        if (fieldPath.includes('.quantidade')) return 'Quantidade';
        if (fieldPath.includes('.crm')) return 'CRM';
        if (fieldPath.includes('.nome')) return 'Nome do Médico';
        return 'Campo';
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 85) return 'text-green-600';
        if (confidence >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getErrorIcon = (errorType: string) => {
        switch (errorType) {
            case 'low_confidence':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'pattern_mismatch':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'validation_failed':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default:
                return <Eye className="w-4 h-4 text-blue-500" />;
        }
    };

    if (isValidating) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analisando qualidade dos dados OCR...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Se não há campos para revisar, mostrar sucesso
    if (fieldsNeedingReview.length === 0) {
        return (
            <Card className="w-full border-green-200 bg-green-50">
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                            <h3 className="font-semibold text-green-800">
                                Dados OCR em excelente qualidade! ✨
                            </h3>
                            <p className="text-sm text-green-700">
                                Todos os campos foram reconhecidos com alta confiança.
                                {autoCorrectionsApplied > 0 && (
                                    <span className="ml-1">
                                        ({autoCorrectionsApplied} correções automáticas aplicadas)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header com progresso */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <CardTitle className="text-lg text-blue-800">
                                Revisão Rápida - Procedimento {procedureIndex + 1}
                            </CardTitle>
                        </div>

                        {autoCorrectionsApplied > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Zap className="w-3 h-3 mr-1" />
                                {autoCorrectionsApplied} auto-corrigidos
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-blue-700">
                            <span>
                                {fieldsNeedingReview.length} campo(s) precisam de atenção
                            </span>
                            <span>
                                {reviewedCount}/{totalFields} revisados
                            </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </div>
                </CardHeader>
            </Card>

            {/* Lista de campos que precisam de revisão */}
            <div className="space-y-3">
                {fieldsNeedingReview.map((validation, index) => {
                    const isReviewed = reviewedFields.has(validation.field_path);

                    return (
                        <Card
                            key={validation.field_path}
                            className={cn(
                                "transition-all duration-200",
                                isReviewed
                                    ? "border-green-200 bg-green-50 opacity-75"
                                    : "border-yellow-200 bg-yellow-50 shadow-sm"
                            )}
                        >
                            <CardContent className="pt-4">
                                <div className="space-y-3">
                                    {/* Header do campo */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {getErrorIcon(validation.error_type)}
                                            <span className="font-medium text-gray-800">
                                                {getFieldLabel(validation.field_path)}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs", getConfidenceColor(validation.confidence))}
                                            >
                                                {validation.confidence}% confiança
                                            </Badge>
                                        </div>

                                        {isReviewed && (
                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Revisado
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Descrição do problema */}
                                    {validation.validation_error && (
                                        <Alert className="border-yellow-300 bg-yellow-50">
                                            <AlertDescription className="text-sm text-yellow-800">
                                                <strong>Detectado:</strong> {validation.validation_error}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Campo de edição */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                            Valor atual:
                                        </label>

                                        <InlineEdit
                                            value={validation.original_value}
                                            guiaId={guiaId}
                                            fieldType={validation.field_path.includes('participacao') ? 'participacao' : 'procedimento'}
                                            fieldPath={validation.field_path}
                                            placeholder="Clique para corrigir"
                                            canEdit={!isReviewed}
                                            onValueChange={(newValue) => {
                                                if (newValue !== validation.original_value) {
                                                    handleFieldReviewed(validation.field_path);
                                                }
                                            }}
                                            className="border-2 border-dashed border-yellow-300 rounded-lg p-2"
                                        />
                                    </div>

                                    {/* Sugestões automáticas */}
                                    {validation.suggested_corrections && validation.suggested_corrections.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Sugestões automáticas:
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {validation.suggested_corrections.map((suggestion, suggestionIndex) => (
                                                    <Button
                                                        key={suggestionIndex}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => {
                                                            // TODO: Aplicar sugestão
                                                            handleFieldReviewed(validation.field_path);
                                                        }}
                                                    >
                                                        <ThumbsUp className="w-3 h-3 mr-1" />
                                                        {suggestion}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Ações */}
                                    {!isReviewed && (
                                        <div className="flex justify-end space-x-2 pt-2 border-t border-yellow-200">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSkipField(validation.field_path)}
                                                className="text-gray-600"
                                            >
                                                Ignorar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleFieldReviewed(validation.field_path)}
                                                className="border-green-600 text-green-600 hover:bg-green-50"
                                            >
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Marcar como OK
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Footer com ação final */}
            {reviewedCount === totalFields && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-green-800">
                                    Revisão concluída! 🎉
                                </span>
                            </div>

                            <Button
                                onClick={handleCompleteReview}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Finalizar Revisão
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
