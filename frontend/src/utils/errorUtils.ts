/**
 * Função para formatar erros de validação retornados pela API
 * Converte objetos e arrays em strings legíveis para o usuário
 */
export const formatValidationError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (Array.isArray(error)) {
    return error
      .map((err) => {
        if (typeof err === 'string') return err;
        if (err.msg) return err.msg;
        if (err.message) return err.message;
        if (err.loc && err.msg) return `${err.loc.join('.')}: ${err.msg}`;
        return JSON.stringify(err);
      })
      .join(', ');
  }

  if (error && typeof error === 'object') {
    if (error.msg) return error.msg;
    if (error.message) return error.message;
    if (error.detail) return formatValidationError(error.detail);

    // Se for um objeto com múltiplos campos de erro
    const errorMessages = Object.values(error).filter((val) => val);
    if (errorMessages.length > 0) {
      return errorMessages
        .map((msg) => (typeof msg === 'string' ? msg : JSON.stringify(msg)))
        .join(', ');
    }
  }

  return 'Erro de validação - verifique os dados inseridos';
};
