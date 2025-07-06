import { TicketStatus, TicketPriority } from './types';

/**
 * Returns the appropriate CSS class for a ticket status badge
 * @param status - The ticket status
 * @returns CSS class string for styling the badge
 */
export const getStatusClass = (status: TicketStatus): string => {
  switch (status) {
    case 'aberto':
      return 'bg-blue-100 text-blue-800';
    case 'em_andamento':
      return 'bg-yellow-100 text-yellow-800';
    case 'resolvido':
      return 'bg-green-100 text-green-800';
    case 'fechado':
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Returns the appropriate display text for a ticket status
 * @param status - The ticket status
 * @returns Localized status text for display
 */
export const getStatusText = (status: TicketStatus): string => {
  switch (status) {
    case 'aberto':
      return 'Aberto';
    case 'em_andamento':
      return 'Em Andamento';
    case 'resolvido':
      return 'Resolvido';
    case 'fechado':
      return 'Fechado';
  }
};

/**
 * Returns the appropriate CSS class for a ticket priority badge
 * @param priority - The ticket priority
 * @returns CSS class string for styling the badge
 */
export const getPriorityClass = (priority: TicketPriority): string => {
  switch (priority) {
    case 'baixa':
      return 'bg-green-100 text-green-800';
    case 'media':
      return 'bg-blue-100 text-blue-800';
    case 'alta':
      return 'bg-orange-100 text-orange-800';
    case 'critica':
      return 'bg-red-100 text-red-800';
  }
};

/**
 * Returns the appropriate display text for a ticket priority
 * @param priority - The ticket priority
 * @returns Localized priority text for display
 */
export const getPriorityText = (priority: TicketPriority): string => {
  switch (priority) {
    case 'baixa':
      return 'Baixa';
    case 'media':
      return 'Média';
    case 'alta':
      return 'Alta';
    case 'critica':
      return 'Crítica';
  }
};

/**
 * Get color for category badge
 * @param category - Ticket category
 * @returns CSS class string for styling the category badge
 */
export const getCategoryClass = (category: string): string => {
  switch (category) {
    case 'technical':
      return 'bg-purple-100 text-purple-800';
    case 'billing':
      return 'bg-emerald-100 text-emerald-800';
    case 'feature':
      return 'bg-indigo-100 text-indigo-800';
    case 'question':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get localized display text for category
 * @param category - Ticket category
 * @returns Localized category text for display
 */
export const getCategoryText = (category: string): string => {
  switch (category) {
    case 'technical':
      return 'Técnico';
    case 'billing':
      return 'Faturamento';
    case 'feature':
      return 'Funcionalidade';
    case 'question':
      return 'Dúvida';
    default:
      return 'Outro';
  }
};
