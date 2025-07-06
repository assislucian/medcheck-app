import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send } from 'lucide-react';
import { Ticket, Message } from './types';
import { useState } from 'react';
import {
  getStatusClass,
  getStatusText,
  getPriorityClass,
  getPriorityText,
} from './helpers';

interface TicketDetailProps {
  ticket: Ticket | null;
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onCreateTicket: () => void;
}

/**
 * TicketDetail Component
 *
 * Displays the details of a selected support ticket and its message history.
 * Provides functionality to send new messages if the ticket is still active.
 *
 * @param ticket - The currently selected ticket object or null if none selected
 * @param messages - Array of message objects related to the ticket
 * @param onSendMessage - Function to handle sending a new message
 * @param onCreateTicket - Function to handle creating a new ticket
 */
export const TicketDetail = ({
  ticket,
  messages,
  onSendMessage,
  onCreateTicket,
}: TicketDetailProps) => {
  const [newMessage, setNewMessage] = useState('');

  /**
   * Formats a date string to a localized date-time format
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Handles form submission for sending a new message
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await onSendMessage(newMessage);
    setNewMessage('');
  };

  // Show placeholder when no ticket is selected
  if (!ticket) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center py-12 px-4">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum ticket selecionado</h3>
          <p className="text-muted-foreground mb-6">
            Selecione um ticket para visualizar a conversa ou crie um novo ticket de
            suporte.
          </p>
          <Button onClick={onCreateTicket}>Criar Novo Ticket</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{ticket.title}</CardTitle>
          <Badge variant="outline" className={getStatusClass(ticket.status)}>
            {getStatusText(ticket.status)}
          </Badge>
        </div>
        <CardDescription className="flex items-center justify-between">
          <span>Criado em {formatDate(ticket.created_at)}</span>
          <Badge variant="outline" className={getPriorityClass(ticket.priority)}>
            {getPriorityText(ticket.priority)}
          </Badge>
        </CardDescription>
        <div className="border-t pt-2 mt-2">
          <p className="text-sm">{ticket.description}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-sm font-medium mb-4">Histórico de mensagens</h3>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma mensagem neste ticket ainda.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sent_by_user ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.sent_by_user
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatDate(message.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escreva sua mensagem..."
              disabled={['resolvido', 'fechado'].includes(ticket.status)}
            />
            <Button
              type="submit"
              disabled={
                !newMessage.trim() || ['resolvido', 'fechado'].includes(ticket.status)
              }
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
          {['resolvido', 'fechado'].includes(ticket.status) && (
            <p className="text-xs text-muted-foreground mt-2">
              Este ticket está {ticket.status === 'resolvido' ? 'resolvido' : 'fechado'}{' '}
              e não pode receber novas mensagens.
            </p>
          )}
        </form>
      </CardFooter>
    </Card>
  );
};
