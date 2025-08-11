import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, History } from 'lucide-react';
import { InlineEdit } from './InlineEdit';

export interface ProcedureData {
    guia: string;
    data_execucao: string;
    codigo: string;
    descricao: string;
    quantidade: number;
    beneficiario?: string;
    prestador?: string;
    participacoes?: Array<{
        papel: string;
        crm: string;
        nome: string;
        inicio: string;
        fim: string;
        status: string;
    }>;
}

export interface ProcedureEditFormProps {
    /** Dados do procedimento */
    procedure: ProcedureData;
    /** ID da guia */
    guiaId: number;
    /** Índice do procedimento na lista */
    procedureIndex: number;
    /** Se pode editar */
    canEdit?: boolean;
    /** Callback quando dados são alterados */
    onDataChange?: (updatedProcedure: ProcedureData) => void;
    /** Classe CSS */
    className?: string;
}

// Opções para o campo de papel nas participações
const PAPEL_OPTIONS = [
    { value: 'Cirurgiao', label: 'Cirurgião' },
    { value: 'Anestesista', label: 'Anestesista' },
    { value: 'Primeiro Auxiliar', label: 'Primeiro Auxiliar' },
    { value: 'Segundo Auxiliar', label: 'Segundo Auxiliar' },
    { value: 'Auxiliar', label: 'Auxiliar' }
];

/**
 * Formulário de edição para dados de procedimentos extraídos por OCR
 */
export function ProcedureEditForm({
    procedure,
    guiaId,
    procedureIndex,
    canEdit = true,
    onDataChange,
    className
}: ProcedureEditFormProps) {

    // Validadores para diferentes campos
    const validateCodigo = (value: string): string | null => {
        if (!value.trim()) {
            return 'Código é obrigatório';
        }
        if (!/^\d{8}$/.test(value.trim())) {
            return 'Código deve ter exatamente 8 dígitos';
        }
        return null;
    };

    const validateQuantidade = (value: string): string | null => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) {
            return 'Quantidade deve ser um número maior que 0';
        }
        if (num > 999) {
            return 'Quantidade muito alta (máximo 999)';
        }
        return null;
    };

    const validateCRM = (value: string): string | null => {
        if (!value.trim()) {
            return 'CRM é obrigatório';
        }
        if (!/^\d{4,6}$/.test(value.trim())) {
            return 'CRM deve ter entre 4 e 6 dígitos';
        }
        return null;
    };

    const validateData = (value: string): string | null => {
        if (!value.trim()) {
            return 'Data é obrigatória';
        }
        // Aceita formatos DD/MM/YYYY ou YYYY-MM-DD
        const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
        if (!dateRegex.test(value.trim())) {
            return 'Data deve estar no formato DD/MM/YYYY ou YYYY-MM-DD';
        }
        return null;
    };

    const handleValueChange = (field: string, newValue: string, participacaoIndex?: number) => {
        if (!onDataChange) return;

        const updatedProcedure = { ...procedure };

        if (participacaoIndex !== undefined) {
            // Edição de participação
            if (updatedProcedure.participacoes && updatedProcedure.participacoes[participacaoIndex]) {
                (updatedProcedure.participacoes[participacaoIndex] as any)[field] = newValue;
            }
        } else {
            // Edição do procedimento
            (updatedProcedure as any)[field] = field === 'quantidade' ? parseInt(newValue) : newValue;
        }

        onDataChange(updatedProcedure);
    };

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                        Procedimento {procedureIndex + 1}
                        {procedure.guia && (
                            <Badge variant="outline" className="ml-2">
                                Guia: {procedure.guia}
                            </Badge>
                        )}
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        {!canEdit && (
                            <Badge variant="secondary" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Somente leitura
                            </Badge>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                        >
                            <History className="w-4 h-4 mr-1" />
                            Histórico
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Dados básicos do procedimento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Código do Procedimento
                        </label>
                        <InlineEdit
                            value={procedure.codigo}
                            guiaId={guiaId}
                            fieldType="procedimento"
                            fieldPath={`procedimentos[${procedureIndex}].codigo`}
                            inputType="text"
                            placeholder="Ex: 31001017"
                            canEdit={canEdit}
                            validate={validateCodigo}
                            onValueChange={(newValue) => handleValueChange('codigo', newValue)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Data de Execução
                        </label>
                        <InlineEdit
                            value={procedure.data_execucao}
                            guiaId={guiaId}
                            fieldType="procedimento"
                            fieldPath={`procedimentos[${procedureIndex}].data_execucao`}
                            inputType="text"
                            placeholder="DD/MM/YYYY"
                            canEdit={canEdit}
                            validate={validateData}
                            onValueChange={(newValue) => handleValueChange('data_execucao', newValue)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Quantidade
                        </label>
                        <InlineEdit
                            value={procedure.quantidade}
                            guiaId={guiaId}
                            fieldType="procedimento"
                            fieldPath={`procedimentos[${procedureIndex}].quantidade`}
                            inputType="number"
                            placeholder="1"
                            canEdit={canEdit}
                            validate={validateQuantidade}
                            onValueChange={(newValue) => handleValueChange('quantidade', newValue)}
                        />
                    </div>
                </div>

                {/* Descrição do procedimento */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Descrição do Procedimento
                    </label>
                    <InlineEdit
                        value={procedure.descricao}
                        guiaId={guiaId}
                        fieldType="procedimento"
                        fieldPath={`procedimentos[${procedureIndex}].descricao`}
                        inputType="textarea"
                        placeholder="Descrição do procedimento médico"
                        canEdit={canEdit}
                        onValueChange={(newValue) => handleValueChange('descricao', newValue)}
                    />
                </div>

                {/* Dados do beneficiário e prestador */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Beneficiário
                        </label>
                        <InlineEdit
                            value={procedure.beneficiario || ''}
                            guiaId={guiaId}
                            fieldType="beneficiario"
                            fieldPath="nome"
                            inputType="text"
                            placeholder="Nome do beneficiário"
                            canEdit={canEdit}
                            onValueChange={(newValue) => handleValueChange('beneficiario', newValue)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Prestador
                        </label>
                        <InlineEdit
                            value={procedure.prestador || ''}
                            guiaId={guiaId}
                            fieldType="prestador"
                            fieldPath="nome"
                            inputType="text"
                            placeholder="Nome do prestador"
                            canEdit={canEdit}
                            onValueChange={(newValue) => handleValueChange('prestador', newValue)}
                        />
                    </div>
                </div>

                {/* Participações médicas */}
                {procedure.participacoes && procedure.participacoes.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
                            Participações Médicas
                        </h4>

                        {procedure.participacoes.map((participacao, participacaoIndex) => (
                            <div key={participacaoIndex} className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h5 className="font-medium text-gray-700">
                                        Participação {participacaoIndex + 1}
                                    </h5>
                                    <Badge variant="outline">
                                        {participacao.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">Papel</label>
                                        <InlineEdit
                                            value={participacao.papel}
                                            guiaId={guiaId}
                                            fieldType="participacao"
                                            fieldPath={`participacoes[${participacaoIndex}].papel`}
                                            inputType="select"
                                            selectOptions={PAPEL_OPTIONS}
                                            canEdit={canEdit}
                                            onValueChange={(newValue) => handleValueChange('papel', newValue, participacaoIndex)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">CRM</label>
                                        <InlineEdit
                                            value={participacao.crm}
                                            guiaId={guiaId}
                                            fieldType="participacao"
                                            fieldPath={`participacoes[${participacaoIndex}].crm`}
                                            inputType="text"
                                            placeholder="Ex: 12345"
                                            canEdit={canEdit}
                                            validate={validateCRM}
                                            onValueChange={(newValue) => handleValueChange('crm', newValue, participacaoIndex)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">Nome do Médico</label>
                                        <InlineEdit
                                            value={participacao.nome}
                                            guiaId={guiaId}
                                            fieldType="participacao"
                                            fieldPath={`participacoes[${participacaoIndex}].nome`}
                                            inputType="text"
                                            placeholder="Nome completo"
                                            canEdit={canEdit}
                                            onValueChange={(newValue) => handleValueChange('nome', newValue, participacaoIndex)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">Início</label>
                                        <InlineEdit
                                            value={participacao.inicio}
                                            guiaId={guiaId}
                                            fieldType="participacao"
                                            fieldPath={`participacoes[${participacaoIndex}].inicio`}
                                            inputType="text"
                                            placeholder="DD/MM/YYYY HH:MM"
                                            canEdit={canEdit}
                                            onValueChange={(newValue) => handleValueChange('inicio', newValue, participacaoIndex)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">Fim</label>
                                        <InlineEdit
                                            value={participacao.fim}
                                            guiaId={guiaId}
                                            fieldType="participacao"
                                            fieldPath={`participacoes[${participacaoIndex}].fim`}
                                            inputType="text"
                                            placeholder="DD/MM/YYYY HH:MM"
                                            canEdit={canEdit}
                                            onValueChange={(newValue) => handleValueChange('fim', newValue, participacaoIndex)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
