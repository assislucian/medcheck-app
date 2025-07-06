import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ticket } from './types';

interface TicketListProps {
  loading: boolean;
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelectTicket: (ticket: Ticket) => void;
  onCreateTicket: () => void;
}

export const TicketList = ({
  loading,
  tickets,
  selectedTicket,
  onSelectTicket,
  onCreateTicket,
}: TicketListProps) => {
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

  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'aberto':
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            Aberto
          </Badge>
        );
      case 'em_andamento':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
          >
            Em Andamento
          </Badge>
        );
      case 'resolvido':
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          >
            Resolvido
          </Badge>
        );
      case 'fechado':
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
          >
            Fechado
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'baixa':
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          >
            Baixa
          </Badge>
        );
      case 'media':
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            Média
          </Badge>
        );
      case 'alta':
        return (
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
          >
            Alta
          </Badge>
        );
      case 'critica':
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          >
            Crítica
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Tickets</CardTitle>
        <CardDescription>{tickets.length} tickets encontrados</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem tickets de suporte.
            </p>
            <Button onClick={onCreateTicket}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Ticket
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'border-primary' : 'hover:border-primary/50'}`}
                  onClick={() => onSelectTicket(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium line-clamp-1">{ticket.title}</h3>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatDate(ticket.created_at)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs capitalize">
                        {ticket.category === 'technical'
                          ? 'Técnico'
                          : ticket.category === 'billing'
                            ? 'Faturamento'
                            : ticket.category === 'feature'
                              ? 'Funcionalidade'
                              : ticket.category === 'question'
                                ? 'Dúvida'
                                : 'Outro'}
                      </span>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
