/**
 * Componentes para edição de dados OCR
 * 
 * Este módulo fornece componentes para permitir a edição
 * de dados extraídos por OCR, com validação e histórico
 * de auditoria.
 */

export { InlineEdit } from './InlineEdit';
export type { InlineEditProps } from './InlineEdit';

export { ProcedureEditForm } from './ProcedureEditForm';
export type { ProcedureData, ProcedureEditFormProps } from './ProcedureEditForm';

export { OCREditIndicator, useOCRIndicator } from './OCREditIndicator';
export type { OCREditIndicatorProps } from './OCREditIndicator';

export { SmartOCRReview } from './SmartOCRReview';
export type { SmartOCRReviewProps } from './SmartOCRReview';

export { OCRQualityIndicator, useOCRQualityData } from './OCRQualityIndicator';
export type { OCRQualityData, OCRQualityIndicatorProps } from './OCRQualityIndicator';

// Hooks
export { useOCREdit, useOCREditHistory } from '../../hooks/useOCREdit';
export type { OCREditRequest, OCREditResponse } from '../../hooks/useOCREdit';

export { useSmartOCRValidation } from '../../hooks/useSmartOCRValidation';
export type { OCRFieldValidation, SmartValidationConfig } from '../../hooks/useSmartOCRValidation';

