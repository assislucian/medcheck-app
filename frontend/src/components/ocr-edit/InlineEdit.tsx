import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useOCREdit, type OCREditRequest } from '@/hooks/useOCREdit';
import { cn } from '@/lib/utils';
import { Check, Edit2, History, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface InlineEditProps {
    /** Valor atual do campo */
    value: string | number;
    /** ID da guia relacionada */
    guiaId: number;
    /** Tipo do campo being edited */
    fieldType: 'procedimento' | 'participacao' | 'beneficiario' | 'prestador';
    /** Caminho do campo (ex: "procedimentos[0].codigo") */
    fieldPath: string;
    /** Tipo de input a ser usado */
    inputType?: 'text' | 'textarea' | 'number' | 'select' | 'date';
    /** Opções para select */
    selectOptions?: Array<{ value: string; label: string }>;
    /** Placeholder para o campo */
    placeholder?: string;
    /** Classe CSS personalizada */
    className?: string;
    /** Se o campo pode ser editado */
    canEdit?: boolean;
    /** Validação personalizada */
    validate?: (value: string) => string | null;
    /** Callback quando o valor é alterado */
    onValueChange?: (newValue: string) => void;
    /** Se deve mostrar botão de histórico */
    showHistory?: boolean;
}

/**
 * Componente de edição inline para dados OCR
 * Permite editar valores com validação e histórico de alterações
 */
export function InlineEdit({
    value,
    guiaId,
    fieldType,
    fieldPath,
    inputType = 'text',
    selectOptions = [],
    placeholder,
    className,
    canEdit = true,
    validate,
    onValueChange,
    showHistory = false
}: InlineEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(String(value || ''));
    const [showReasonDialog, setShowReasonDialog] = useState(false);
    const [editReason, setEditReason] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const { editOCRData, isEditing: isSubmitting } = useOCREdit();

    // Atualizar valor local quando prop value muda
    useEffect(() => {
        setEditValue(String(value || ''));
    }, [value]);

    // Focar no input quando entrar em modo de edição
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = () => {
        if (!canEdit) return;
        setIsEditing(true);
        setEditValue(String(value || ''));
        setValidationError(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditValue(String(value || ''));
        setValidationError(null);
    };

    const handleSaveEdit = () => {
        // Validação
        if (validate) {
            const error = validate(editValue);
            if (error) {
                setValidationError(error);
                return;
            }
        }

        // Verificar se houve mudança
        if (editValue === String(value)) {
            setIsEditing(false);
            return;
        }

        // Se não há mudança significativa, cancelar
        if (editValue.trim() === String(value || '').trim()) {
            setIsEditing(false);
            return;
        }

        // Pedir motivo para mudanças significativas
        setShowReasonDialog(true);
    };

    const handleConfirmEdit = () => {
        const editData: OCREditRequest = {
            guia_id: guiaId,
            field_type: fieldType,
            field_path: fieldPath,
            new_value: editValue.trim(),
            edit_reason: editReason.trim() || undefined
        };

        editOCRData(editData);

        // Atualizar valor local imediatamente para responsividade
        if (onValueChange) {
            onValueChange(editValue.trim());
        }

        setIsEditing(false);
        setShowReasonDialog(false);
        setEditReason('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEdit();
        }
    };

    const renderInput = () => {
        const commonProps = {
            ref: inputRef,
            value: editValue,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setEditValue(e.target.value);
                setValidationError(null);
            },
            onKeyDown: handleKeyDown,
            placeholder,
            className: cn(
                "min-w-0",
                validationError && "border-red-500 focus:border-red-500"
            )
        };

        switch (inputType) {
            case 'textarea':
                return (
                    <Textarea
                        {...commonProps}
                        rows={2}
                        className={cn(commonProps.className, "resize-none")}
                    />
                );

            case 'number':
                return (
                    <Input
                        {...commonProps}
                        type="number"
                        inputMode="numeric"
                    />
                );

            case 'date':
                return (
                    <Input
                        {...commonProps}
                        type="date"
                    />
                );

            case 'select':
                return (
                    <Select value={editValue} onValueChange={setEditValue}>
                        <SelectTrigger className={cn("min-w-0", validationError && "border-red-500")}>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {selectOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            default:
                return <Input {...commonProps} />;
        }
    };

    if (!isEditing) {
        return (
            <div
                className={cn(
                    "group flex items-center gap-1 min-h-[2rem] w-full",
                    canEdit && "cursor-pointer hover:bg-gray-50 rounded px-2 py-1",
                    className
                )}
                onClick={handleStartEdit}
            >
                <span className={cn(
                    "flex-1 min-w-0 break-words",
                    !value && "text-gray-400 italic"
                )}>
                    {value || placeholder || 'Clique para editar'}
                </span>

                {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit();
                            }}
                        >
                            <Edit2 className="h-3 w-3" />
                        </Button>

                        {showHistory && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implementar modal de histórico
                                }}
                            >
                                <History className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <div className={cn("flex items-start gap-2 w-full", className)}>
                <div className="flex-1 min-w-0">
                    {renderInput()}
                    {validationError && (
                        <p className="text-xs text-red-500 mt-1">{validationError}</p>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={handleSaveEdit}
                        disabled={isSubmitting}
                    >
                        <Check className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Dialog para motivo da edição */}
            <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Motivo da Alteração</DialogTitle>
                        <DialogDescription>
                            Por favor, informe o motivo desta correção para auditoria.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <Textarea
                            placeholder="Ex: Correção de erro do OCR, dados incorretos no documento original..."
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowReasonDialog(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirmEdit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Salvando...' : 'Confirmar Alteração'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
