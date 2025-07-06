import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Ticket,
  Message,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '@/components/support/types';
import {
  fetchUserTickets,
  fetchTicketMessages,
  createSupportTicket,
  sendTicketMessage,
  TicketData,
} from '../utils/supabase';

/**
 * Custom hook for managing support tickets
 *
 * Provides functionality to fetch, create, and interact with support tickets
 *
 * @param userId - The current user's ID
 * @returns Object containing ticket state and functions for managing tickets
 */
export const useTickets = (userId: string | undefined) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<string>('my-tickets');

  /**
   * Fetches all tickets for the current user
   */
  const fetchTickets = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const userTickets = await fetchUserTickets(userId);

      // Map DB ticket data to match Ticket interface type with proper type casting
      const mappedTickets: Ticket[] = userTickets.map((ticket: any) => ({
        ...ticket,
        status: ticket.status as TicketStatus,
        priority: ticket.priority as TicketPriority,
        category: ticket.category as TicketCategory,
      }));

      setTickets(mappedTickets);
    } catch (error) {
      console.error('Error in fetchTickets:', error);
      toast.error('Não foi possível carregar seus tickets de suporte');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Fetches messages for a specific ticket
   */
  const fetchMessages = useCallback(async (ticketId: string) => {
    try {
      const ticketMessages = await fetchTicketMessages(ticketId);
      setMessages(ticketMessages as Message[]);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast.error('Não foi possível carregar as mensagens');
    }
  }, []);

  /**
   * Creates a new support ticket
   * @returns The newly created ticket
   */
  const createTicket = useCallback(
    async (formData: TicketData): Promise<Ticket> => {
      if (!userId) throw new Error('Usuário não autenticado');

      setSubmitting(true);

      try {
        const newTicket = await createSupportTicket(userId, formData);

        if (!newTicket) {
          throw new Error('Não foi possível criar o ticket');
        }

        toast.success('Ticket criado com sucesso');

        // Convert the returned ticket to match Ticket interface
        const typedTicket: Ticket = {
          ...newTicket,
          status: newTicket.status as TicketStatus,
          priority: newTicket.priority as TicketPriority,
          category: newTicket.category as TicketCategory,
        };

        setTickets((prev) => [typedTicket, ...prev]);
        setActiveTab('my-tickets');

        return typedTicket;
      } catch (error) {
        console.error('Error in createTicket:', error);
        toast.error('Não foi possível criar o ticket');
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [userId]
  );

  /**
   * Sends a new message in a ticket
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!selectedTicket || !userId) return;

      try {
        const result = await sendTicketMessage(selectedTicket.id, userId, content);

        if (result.message) {
          setMessages((prev) => [...prev, result.message as Message]);
        }

        // Update ticket status if needed
        if (result.updatedTicket) {
          // Convert to proper Ticket type
          const updatedTypedTicket: Ticket = {
            ...result.updatedTicket,
            status: result.updatedTicket.status as TicketStatus,
            priority: result.updatedTicket.priority as TicketPriority,
            category: result.updatedTicket.category as TicketCategory,
          };

          setSelectedTicket(updatedTypedTicket);
          setTickets((prev) =>
            prev.map((t) => (t.id === selectedTicket.id ? updatedTypedTicket : t))
          );
        }
      } catch (error) {
        console.error('Error in sendMessage:', error);
        toast.error('Não foi possível enviar a mensagem');
      }
    },
    [selectedTicket, userId]
  );

  // Load tickets on component mount
  useEffect(() => {
    if (userId) {
      fetchTickets();
    }
  }, [userId, fetchTickets]);

  // Load messages when a ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    } else {
      setMessages([]);
    }
  }, [selectedTicket, fetchMessages]);

  return {
    tickets,
    messages,
    loading,
    submitting,
    selectedTicket,
    setSelectedTicket,
    activeTab,
    setActiveTab,
    createTicket,
    sendMessage,
    fetchTickets,
  };
};
