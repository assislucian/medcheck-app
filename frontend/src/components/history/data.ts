/**
 * data.ts
 *
 * Define os tipos de dados utilizados nos componentes de histórico.
 * Estes tipos garantem consistência nos dados exibidos na interface.
 */

/**
 * Representa um item do histórico de análises
 */
export interface HistoryItem {
  /**
   * Identificador único da análise
   */
  id: string;

  /**
   * Data de criação da análise (formato DD/MM/YYYY)
   */
  date: string;

  /**
   * Tipo de análise (Guia, Demonstrativo ou combinação)
   */
  type: string;

  /**
   * Descrição ou título da análise
   */
  description: string;

  /**
   * Número total de procedimentos na análise
   */
  procedimentos: number;

  /**
   * Número de procedimentos glosados (não pagos)
   */
  glosados: number;

  /**
   * Status atual da análise (Analisado, Pendente)
   */
  status: string;
}

/**
 * Filtros aplicáveis ao histórico de análises
 */
export interface HistoryFilters {
  /**
   * Termo de busca textual
   */
  searchTerm?: string;

  /**
   * Data inicial para filtro
   */
  startDate?: string;

  /**
   * Data final para filtro
   */
  endDate?: string;

  /**
   * Status para filtrar (todos, analisado, pendente)
   */
  status?: string;
}
