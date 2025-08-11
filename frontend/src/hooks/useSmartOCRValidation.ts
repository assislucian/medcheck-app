import { useState } from 'react';

export interface OCRFieldValidation {
    field_path: string;
    confidence: number;
    original_value: string;
    suggested_corrections?: string[];
    validation_error?: string;
    requires_review: boolean;
    error_type: 'low_confidence' | 'pattern_mismatch' | 'validation_failed' | 'none';
}

export interface SmartValidationConfig {
    confidence_threshold: number; // Limiar mínimo de confiança (default: 75%)
    auto_fix_threshold: number;   // Confiança para correção automática (default: 95%)
    require_review_threshold: number; // Abaixo disso, força revisão (default: 60%)
}

/**
 * Hook para validação inteligente de dados OCR
 * Baseado em melhores práticas de sistemas profissionais
 */
export function useSmartOCRValidation(config: Partial<SmartValidationConfig> = {}) {
    const [validationResults, setValidationResults] = useState<OCRFieldValidation[]>([]);
    const [isValidating, setIsValidating] = useState(false);

    const defaultConfig: SmartValidationConfig = {
        confidence_threshold: 75,
        auto_fix_threshold: 95,
        require_review_threshold: 60,
        ...config
    };

    /**
     * Valida um campo específico baseado em padrões médicos
     */
    const validateField = (fieldType: string, value: string, confidence: number): OCRFieldValidation => {
        const validation: OCRFieldValidation = {
            field_path: '',
            confidence,
            original_value: value,
            requires_review: false,
            error_type: 'none'
        };

        // 1. Verificar confiança
        if (confidence < defaultConfig.require_review_threshold) {
            validation.requires_review = true;
            validation.error_type = 'low_confidence';
            validation.validation_error = `Confiança muito baixa (${confidence}%)`;
        }

        // 2. Validações específicas por tipo
        switch (fieldType) {
            case 'codigo':
                return validateProcedureCode(value, validation);
            case 'crm':
                return validateCRM(value, validation);
            case 'data':
                return validateDate(value, validation);
            case 'nome':
                return validateName(value, validation);
            case 'quantidade':
                return validateQuantity(value, validation);
            default:
                return validation;
        }
    };

    /**
     * Validação de código de procedimento (8 dígitos)
     */
    const validateProcedureCode = (value: string, validation: OCRFieldValidation): OCRFieldValidation => {
        const cleanValue = value.replace(/\D/g, ''); // Remove não-dígitos

        if (cleanValue.length !== 8) {
            validation.requires_review = true;
            validation.error_type = 'pattern_mismatch';
            validation.validation_error = 'Código deve ter 8 dígitos';

            // Sugerir correções baseadas em erros comuns de OCR
            if (value.length === 8) {
                const suggestions = generateCodeSuggestions(value);
                validation.suggested_corrections = suggestions;
            }
        }

        return validation;
    };

    /**
     * Validação de CRM (4-6 dígitos)
     */
    const validateCRM = (value: string, validation: OCRFieldValidation): OCRFieldValidation => {
        const cleanValue = value.replace(/\D/g, '');

        if (cleanValue.length < 4 || cleanValue.length > 6) {
            validation.requires_review = true;
            validation.error_type = 'pattern_mismatch';
            validation.validation_error = 'CRM deve ter entre 4 e 6 dígitos';

            // Sugerir correções se valor parece ser CRM
            if (value.match(/\d/)) {
                validation.suggested_corrections = [cleanValue];
            }
        }

        return validation;
    };

    /**
     * Validação de data
     */
    const validateDate = (value: string, validation: OCRFieldValidation): OCRFieldValidation => {
        const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;

        if (!dateRegex.test(value)) {
            validation.requires_review = true;
            validation.error_type = 'pattern_mismatch';
            validation.validation_error = 'Formato de data inválido';

            // Tentar sugerir correções para datas
            const suggestions = generateDateSuggestions(value);
            if (suggestions.length > 0) {
                validation.suggested_corrections = suggestions;
            }
        }

        return validation;
    };

    /**
     * Validação de nome (mínimo 2 palavras, apenas letras e espaços)
     */
    const validateName = (value: string, validation: OCRFieldValidation): OCRFieldValidation => {
        const cleanValue = value.trim();
        const words = cleanValue.split(/\s+/);

        if (words.length < 2 || !cleanValue.match(/^[A-ZÀ-ÿ\s]+$/i)) {
            validation.requires_review = true;
            validation.error_type = 'pattern_mismatch';
            validation.validation_error = 'Nome deve ter pelo menos 2 palavras e apenas letras';

            // Sugerir limpeza do nome
            const cleanedName = cleanValue.replace(/[^A-ZÀ-ÿ\s]/gi, '').trim();
            if (cleanedName !== cleanValue) {
                validation.suggested_corrections = [cleanedName];
            }
        }

        return validation;
    };

    /**
     * Validação de quantidade
     */
    const validateQuantity = (value: string, validation: OCRFieldValidation): OCRFieldValidation => {
        const num = parseInt(value);

        if (isNaN(num) || num < 1 || num > 999) {
            validation.requires_review = true;
            validation.error_type = 'validation_failed';
            validation.validation_error = 'Quantidade deve ser entre 1 e 999';

            // Tentar extrair número do texto
            const match = value.match(/\d+/);
            if (match) {
                validation.suggested_corrections = [match[0]];
            }
        }

        return validation;
    };

    /**
     * Gera sugestões para códigos com base em erros comuns de OCR
     */
    const generateCodeSuggestions = (value: string): string[] => {
        const suggestions: string[] = [];

        // Substituições comuns de OCR: O->0, I->1, S->5, etc.
        const ocrReplacements: { [key: string]: string } = {
            'O': '0', 'o': '0',
            'I': '1', 'l': '1',
            'S': '5', 's': '5',
            'Z': '2', 'z': '2',
            'B': '8', 'b': '8',
            'G': '6', 'g': '6'
        };

        let corrected = value;
        for (const [wrong, correct] of Object.entries(ocrReplacements)) {
            corrected = corrected.replace(new RegExp(wrong, 'g'), correct);
        }

        if (corrected !== value && corrected.replace(/\D/g, '').length === 8) {
            suggestions.push(corrected.replace(/\D/g, ''));
        }

        return suggestions;
    };

    /**
     * Gera sugestões para datas com base em padrões comuns
     */
    const generateDateSuggestions = (value: string): string[] => {
        const suggestions: string[] = [];

        // Tentar extrair números e formar data
        const numbers = value.match(/\d+/g);
        if (numbers && numbers.length >= 3) {
            const [day, month, year] = numbers;
            if (day && month && year) {
                // Formato DD/MM/YYYY
                if (day.length <= 2 && month.length <= 2 && year.length === 4) {
                    suggestions.push(`${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`);
                }
                // Formato YYYY-MM-DD
                if (year.length === 4) {
                    suggestions.push(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
                }
            }
        }

        return suggestions;
    };

    /**
     * Valida todos os campos de um procedimento usando dados reais do backend
     */
    const validateProcedure = async (procedure: any, procedureIndex: number, guiaId: number) => {
        setIsValidating(true);

        try {
            // Buscar dados reais de confiança OCR do backend
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
                throw new Error('Erro ao buscar dados de validação OCR');
            }

            const ocrData = await response.json();
            const results: OCRFieldValidation[] = [];

            // Processar dados reais de confiança
            ocrData.field_confidences.forEach((fieldConf: any) => {
                if (fieldConf.needs_review) {
                    const validation = validateField(
                        fieldConf.field_type === 'participacao' ? fieldConf.field_path.includes('crm') ? 'crm' : 'nome' :
                            fieldConf.field_path.includes('codigo') ? 'codigo' :
                                fieldConf.field_path.includes('data') ? 'data' : 'quantidade',
                        fieldConf.field_value,
                        fieldConf.confidence_score
                    );

                    validation.field_path = fieldConf.field_path;

                    if (validation.requires_review || validation.suggested_corrections?.length) {
                        results.push(validation);
                    }
                }
            });

            setValidationResults(results);
            setIsValidating(false);
            return results;

        } catch (error) {
            console.error('Erro ao validar procedimento:', error);

            // Fallback para validação local em caso de erro
            const results: OCRFieldValidation[] = [];
            const fields = [
                { path: `procedimentos[${procedureIndex}].codigo`, type: 'codigo', value: procedure.codigo },
                { path: `procedimentos[${procedureIndex}].data_execucao`, type: 'data', value: procedure.data_execucao },
                { path: `procedimentos[${procedureIndex}].quantidade`, type: 'quantidade', value: procedure.quantidade?.toString() },
            ];

            // Validar participações
            if (procedure.participacoes) {
                procedure.participacoes.forEach((part: any, partIndex: number) => {
                    fields.push(
                        { path: `participacoes[${partIndex}].crm`, type: 'crm', value: part.crm },
                        { path: `participacoes[${partIndex}].nome`, type: 'nome', value: part.nome }
                    );
                });
            }

            for (const field of fields) {
                if (field.value) {
                    // Usar confiança baixa como fallback
                    const validation = validateField(field.type, field.value, 65);
                    validation.field_path = field.path;

                    if (validation.requires_review || validation.suggested_corrections?.length) {
                        results.push(validation);
                    }
                }
            }

            setValidationResults(results);
            setIsValidating(false);
            return results;
        }
    };

    /**
     * Aplicar correção automática para campos com alta confiança
     */
    const applyAutoCorrections = (validations: OCRFieldValidation[]) => {
        const autoCorrections: { [path: string]: string } = {};

        validations.forEach(validation => {
            if (
                validation.confidence >= defaultConfig.auto_fix_threshold &&
                validation.suggested_corrections?.length === 1 &&
                validation.error_type === 'pattern_mismatch'
            ) {
                autoCorrections[validation.field_path] = validation.suggested_corrections[0];
            }
        });

        return autoCorrections;
    };

    return {
        validationResults,
        isValidating,
        validateProcedure,
        validateField,
        applyAutoCorrections,
        config: defaultConfig
    };
}
