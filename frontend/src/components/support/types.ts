/**
 * Ticket status types
 *
 * - aberto: Ticket is newly created and awaiting response
 * - em_andamento: Ticket is being processed and has had responses
 * - resolvido: Ticket has been resolved but not closed
 * - fechado: Ticket has been closed and cannot be reopened
 */
export type TicketStatus = 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';

/**
 * Ticket priority levels
 *
 * - baixa: Low priority, non-urgent issues
 * - media: Medium priority, standard issues
 * - alta: High priority, urgent issues
 * - critica: Critical priority, immediate attention required
 */
export type TicketPriority = 'baixa' | 'media' | 'alta' | 'critica';

/**
 * Ticket category types
 *
 * - technical: Technical issues with the application
 * - billing: Payment and billing related issues
 * - feature: Feature requests or suggestions
 * - question: General questions about the application
 * - other: Any other category not covered above
 */
export type TicketCategory = 'technical' | 'billing' | 'feature' | 'question' | 'other';

/**
 * Ticket interface
 *
 * Represents a support ticket in the system
 */
export interface Ticket {
  /** Unique identifier for the ticket */
  id: string;

  /** Ticket title/subject */
  title: string;

  /** Detailed description of the issue */
  description: string;

  /** Current status of the ticket */
  status: TicketStatus;

  /** Priority level of the ticket */
  priority: TicketPriority;

  /** Category of the ticket */
  category: TicketCategory;

  /** Date and time when the ticket was created */
  created_at: string;

  /** Date and time when the ticket was last updated */
  updated_at: string;

  /** Date and time when the ticket was resolved, if applicable */
  resolved_at?: string | null;

  /** ID of the user who created the ticket */
  user_id: string;
}

/**
 * Message interface
 *
 * Represents a message within a support ticket
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;

  /** ID of the ticket this message belongs to */
  ticket_id: string;

  /** Content/text of the message */
  content: string;

  /** Whether the message was sent by the user (true) or support staff (false) */
  sent_by_user: boolean;

  /** Date and time when the message was created */
  created_at: string;
}
