import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

export interface OCRQualityData {
    overall_confidence: number;
    fields_needing_review: number;
    auto_corrections_applied: number;
    critical_issues: number;
    status: 'excellent' | 'good' | 'needs_review' | 'poor';
}

export interface OCRQualityIndicatorProps {
    /** Dados de qualidade do OCR */
    qualityData: OCRQualityData;
    /** Callback para abrir revisão completa */
    onOpenReview?: () => void;
    /** Se deve mostrar sempre ou apenas quando há problemas */
    mode?: 'always' | 'when_needed' | 'minimal';
    /** Classe CSS personalizada */
    className?: string;
}

/**
 * Indicador sutil de qualidade OCR que aparece apenas quando necessário
 * Inspirado em melhores práticas de UX para sistemas profissionais
 */
export function OCRQualityIndicator({
    qualityData,
    onOpenReview,
    mode = 'when_needed',
    className
}: OCRQualityIndicatorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const getStatusConfig = () => {
        switch (qualityData.status) {
            case 'excellent':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    badge: 'success',
                    message: 'Dados em excelente qualidade',
                    showReviewButton: false
                };
            case 'good':
                return {
                    icon: ShieldCheck,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    badge: 'default',
                    message: 'Qualidade boa, algumas correções automáticas aplicadas',
                    showReviewButton: false
                };
            case 'needs_review':
                return {
                    icon: AlertTriangle,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    badge: 'warning',
                    message: 'Alguns campos precisam de verificação rápida',
                    showReviewButton: true
                };
            case 'poor':
                return {
                    icon: AlertTriangle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    badge: 'destructive',
                    message: 'Qualidade baixa, revisão recomendada',
                    showReviewButton: true
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    // Se modo 'when_needed' e status é excelente, não mostrar nada
    if (mode === 'when_needed' && qualityData.status === 'excellent') {
        return null;
    }

    // Se modo 'minimal' e não há problemas críticos, mostrar apenas badge pequeno
    if (mode === 'minimal' && qualityData.critical_issues === 0) {
        return (
            <Badge
                variant={config.badge as any}
                className={cn("text-xs h-5", className)}
            >
                <Icon className="w-3 h-3 mr-1" />
                OCR {qualityData.overall_confidence}%
            </Badge>
        );
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-8 px-2 transition-all duration-200",
                        config.color,
                        config.bgColor,
                        config.borderColor,
                        "border hover:shadow-sm",
                        className
                    )}
                >
                    <Icon className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">
                        {qualityData.status === 'excellent' ? 'OCR OK' :
                            qualityData.status === 'good' ? 'OCR Bom' :
                                qualityData.status === 'needs_review' ? 'Revisar' : 'Verificar'}
                    </span>
                    {qualityData.fields_needing_review > 0 && (
                        <Badge
                            variant="secondary"
                            className="ml-1 h-4 px-1 text-xs"
                        >
                            {qualityData.fields_needing_review}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="end">
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-center space-x-2">
                                <Icon className={cn("w-5 h-5", config.color)} />
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        Qualidade do OCR
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {config.message}
                                    </p>
                                </div>
                            </div>

                            {/* Métricas */}
                            <div className="grid grid-cols-2 gap-3 py-2">
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-900">
                                        {qualityData.overall_confidence}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Confiança Geral
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-900">
                                        {qualityData.fields_needing_review}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Campos p/ Revisar
                                    </div>
                                </div>
                            </div>

                            {/* Detalhes adicionais */}
                            <div className="space-y-2 text-sm">
                                {qualityData.auto_corrections_applied > 0 && (
                                    <div className="flex items-center space-x-2 text-blue-600">
                                        <Zap className="w-3 h-3" />
                                        <span>
                                            {qualityData.auto_corrections_applied} correções automáticas aplicadas
                                        </span>
                                    </div>
                                )}

                                {qualityData.critical_issues > 0 && (
                                    <div className="flex items-center space-x-2 text-red-600">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>
                                            {qualityData.critical_issues} problema(s) crítico(s)
                                        </span>
                                    </div>
                                )}

                                {qualityData.fields_needing_review > 0 && (
                                    <div className="flex items-center space-x-2 text-yellow-600">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            Revisão rápida recomendada (~{qualityData.fields_needing_review * 30}s)
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Ação */}
                            {config.showReviewButton && onOpenReview && (
                                <div className="pt-2 border-t">
                                    <Button
                                        onClick={() => {
                                            onOpenReview();
                                            setIsOpen(false);
                                        }}
                                        size="sm"
                                        className="w-full"
                                        variant={qualityData.status === 'poor' ? 'default' : 'outline'}
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        {qualityData.status === 'poor' ? 'Revisar Agora' : 'Revisar Campos'}
                                    </Button>
                                </div>
                            )}

                            {/* Footer informativo */}
                            <div className="text-xs text-gray-400 pt-1 border-t">
                                💡 Apenas campos com baixa confiança são destacados
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

/**
 * Hook para calcular qualidade OCR de um procedimento usando dados reais do backend
 */
export function useOCRQualityData(guiaId: number): OCRQualityData {
    const [qualityData, setQualityData] = useState<OCRQualityData>({
        overall_confidence: 0,
        fields_needing_review: 0,
        auto_corrections_applied: 0,
        critical_issues: 0,
        status: 'excellent'
    });

    useEffect(() => {
        const fetchOCRQuality = async () => {
            if (!guiaId) return;

            try {
                const response = await fetch('/api/v1/ocr-validation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        guia_id: guiaId,
                        force_reprocess: false
                    })
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar qualidade OCR');
                }

                const data = await response.json();
                setQualityData({
                    overall_confidence: data.overall_confidence,
                    fields_needing_review: data.fields_needing_review,
                    auto_corrections_applied: data.auto_corrections_applied,
                    critical_issues: data.critical_issues,
                    status: data.status
                });
            } catch (error) {
                console.error('Erro ao buscar qualidade OCR:', error);
                // Fallback para dados padrão em caso de erro
                setQualityData({
                    overall_confidence: 75,
                    fields_needing_review: 0,
                    auto_corrections_applied: 0,
                    critical_issues: 0,
                    status: 'good'
                });
            }
        };

        fetchOCRQuality();
    }, [guiaId]);

    return qualityData;
}
