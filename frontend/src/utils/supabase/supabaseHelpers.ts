/**
 * supabaseHelpers.ts
 *
 * Utility functions for interacting with Supabase data
 */

import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Profile } from '@/types';
import {
  Ticket,
  Message,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '@/components/support/types';

/**
 * Get a user's profile data
 */
export async function getProfile(
  supabaseClient: any,
  userId: string
): Promise<Profile | null> {
  try {
    console.log('Fetching profile data for user:', userId);
    // Tenta buscar por id; se não encontrar, tenta por crm (caso use CRM como chave)
    let { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!data) {
      const alt = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('crm', userId)
        .maybeSingle();
      data = alt.data;
      error = alt.error;
    }

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) {
      console.log('No profile found for user:', userId);
      return null;
    }

    console.log('Profile data retrieved successfully');
    return data as Profile;
  } catch (error) {
    console.error('Exception in getProfile:', error);
    return null;
  }
}

/**
 * Update a user's profile data
 */
export async function updateProfile(
  supabaseClient: any,
  userId: string,
  data: any
): Promise<boolean> {
  try {
    // Primeiro tenta atualizar por id
    let { data: updated, error } = await supabaseClient
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select();

    // Se nada foi atualizado, tenta por crm
    if (!error && (!updated || updated.length === 0)) {
      const res = await supabaseClient
        .from('profiles')
        .update(data)
        .eq('crm', userId)
        .select();
      updated = res.data;
      error = res.error;
    }

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

/**
 * Convert data to JSON for Supabase
 */
export function toJson(data: any): Json {
  return data as Json;
}

/**
 * Fetch procedures by analysis ID
 */
export async function fetchProceduresByAnalysisId(analysisId: string) {
  try {
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .eq('analysis_id', analysisId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching procedures:', error);
    return [];
  }
}

/**
 * Fetch analysis by ID
 */
export async function fetchAnalysisById(analysisId: string) {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('id', analysisId)
      .maybeSingle();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return null;
  }
}

/**
 * Interfaces for ticket and support data
 */
export interface TicketData {
  title: string;
  description: string;
  category: string;
  priority: string;
}

/**
 * Fetch tickets for a user
 */
export async function fetchUserTickets(userId: string) {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
}

/**
 * Fetch messages for a ticket
 */
export async function fetchTicketMessages(ticketId: string) {
  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    return [];
  }
}

/**
 * Create a new support ticket
 */
export async function createSupportTicket(userId: string, ticketData: TicketData) {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    return null;
  }
}

/**
 * Send a message in a support ticket
 */
export async function sendTicketMessage(
  ticketId: string,
  userId: string,
  content: string
) {
  try {
    // First insert the new message
    const { data: message, error: messageError } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        content,
        sent_by_user: true,
        user_id: userId, // Added missing user_id field
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Update the ticket status if needed
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .update({ status: 'cliente_respondeu', updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select()
      .single();

    if (ticketError) throw ticketError;

    return { message, updatedTicket: ticket };
  } catch (error) {
    console.error('Error sending message:', error);
    return { message: null, updatedTicket: null };
  }
}

/**
 * Fetch help articles
 */
export async function fetchHelpArticles(
  options: { published?: boolean } = { published: true }
) {
  try {
    let query = supabase.from('help_articles').select('*');

    if (options.published !== undefined) {
      query = query.eq('published', options.published);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching help articles:', error);
    return [];
  }
}
