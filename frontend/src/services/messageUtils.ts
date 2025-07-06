import { ProcessMode } from '@/types/upload';

/**
 * Determina o modo de processamento com base nos tipos de arquivos disponíveis
 * @param hasGuias Se há guias para processamento
 * @param hasDemonstrativos Se há demonstrativos para processamento
 * @returns O modo de processamento determinado
 */
export function getProcessMode(
  hasGuias: boolean,
  hasDemonstrativos: boolean
): ProcessMode {
  if (hasGuias && hasDemonstrativos) {
    return 'complete';
  } else if (hasGuias) {
    return 'guia-only';
  } else {
    return 'demonstrativo-only';
  }
}

/**
 * Obtém a mensagem de análise baseada no modo de processamento
 * @param processMode O modo de processamento atual
 * @returns Mensagem de análise apropriada
 */
export function getAnalysisMessage(processMode: ProcessMode): string {
  switch (processMode) {
    case 'complete':
      return 'Analisando procedimentos e calculando valores de referência...';
    case 'guia-only':
      return 'Analisando procedimentos das guias médicas...';
    case 'demonstrativo-only':
      return 'Analisando demonstrativos de pagamento...';
    default:
      return 'Analisando documentos...';
  }
}

/**
 * Obtém a mensagem de conclusão baseada no modo de processamento
 * @param processMode O modo de processamento atual
 * @returns Mensagem de conclusão apropriada
 */
export function getCompletionMessage(processMode: ProcessMode): string {
  switch (processMode) {
    case 'complete':
      return 'Análise completa! Agora você pode visualizar a comparação entre valores CBHPM e pagos.';
    case 'guia-only':
      return 'Análise das guias concluída! Você pode visualizar os procedimentos detectados.';
    case 'demonstrativo-only':
      return 'Análise dos demonstrativos concluída! Você pode visualizar os pagamentos detectados.';
    default:
      return 'Processamento concluído com sucesso!';
  }
}

/**
 * Obtém a mensagem de sucesso baseada no modo de processamento
 * @param processMode O modo de processamento atual
 * @returns Mensagem de sucesso apropriada
 */
export function getSuccessMessage(processMode: ProcessMode): string {
  switch (processMode) {
    case 'complete':
      return 'Comparação concluída!';
    case 'guia-only':
      return 'Guias processadas!';
    case 'demonstrativo-only':
      return 'Demonstrativos processados!';
    default:
      return 'Processamento concluído!';
  }
}

/**
 * Obtém a descrição de sucesso baseada no modo de processamento
 * @param processMode O modo de processamento atual
 * @returns Descrição de sucesso apropriada
 */
export function getSuccessDescription(processMode: ProcessMode): string {
  switch (processMode) {
    case 'complete':
      return 'A análise comparativa foi concluída com sucesso e está pronta para visualização.';
    case 'guia-only':
      return 'As guias foram processadas. Para uma análise mais completa, considere enviar demonstrativos também.';
    case 'demonstrativo-only':
      return 'Os demonstrativos foram processados. Para uma análise mais completa, considere enviar guias também.';
    default:
      return 'Os documentos foram processados com sucesso.';
  }
}
