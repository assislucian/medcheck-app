import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export interface OCREditRequest {
    guia_id: number;
    field_type: 'procedimento' | 'participacao' | 'beneficiario' | 'prestador';
    field_path: string;
    new_value: string;
    edit_reason?: string;
}

export interface OCREditResponse {
    success: boolean;
    message: string;
    edit_id?: number;
}

/**
 * Hook para gerenciar edições de dados OCR
 */
export function useOCREdit() {
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

    const editMutation = useMutation({
        mutationFn: async (editData: OCREditRequest): Promise<OCREditResponse> => {
            const response = await fetch('/api/v1/ocr-edit', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(editData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Erro ao editar dados OCR');
            }

            return response.json();
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Dados editados com sucesso!');
            // Invalidar queries relacionadas para atualizar a UI
            queryClient.invalidateQueries({ queryKey: ['guias'] });
            queryClient.invalidateQueries({ queryKey: ['demonstrativos'] });
            queryClient.invalidateQueries({ queryKey: ['analysis'] });
            setIsEditing(false);
        },
        onError: (error: Error) => {
            toast.error(`Erro ao editar: ${error.message}`);
            setIsEditing(false);
        }
    });

    const editOCRData = (editData: OCREditRequest) => {
        setIsEditing(true);
        editMutation.mutate(editData);
    };

    return {
        editOCRData,
        isEditing: isEditing || editMutation.isPending,
        error: editMutation.error?.message
    };
}

/**
 * Hook para buscar histórico de edições de uma guia
 */
export function useOCREditHistory(guiaId: number) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = async () => {
        if (!guiaId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/v1/ocr-edit-history/${guiaId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar histórico');
            }

            const data = await response.json();
            setHistory(data.edits || []);
        } catch (error) {
            console.error('Erro ao buscar histórico de edições:', error);
            toast.error('Erro ao carregar histórico de edições');
        } finally {
            setLoading(false);
        }
    };

    return {
        history,
        loading,
        fetchHistory
    };
}
