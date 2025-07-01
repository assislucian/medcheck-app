import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SupportLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  ticketsContent: ReactNode;
  newTicketContent: ReactNode;
}

/**
 * SupportLayout Component
 *
 * Provides the layout structure for the support page with tabs for tickets and new ticket creation.
 *
 * @param activeTab - Currently active tab ('my-tickets' or 'new-ticket')
 * @param onTabChange - Function to handle tab changes
 * @param ticketsContent - Content to display in the tickets tab
 * @param newTicketContent - Content to display in the new ticket tab
 */
export const SupportLayout = ({
  activeTab,
  onTabChange,
  ticketsContent,
  newTicketContent,
}: SupportLayoutProps) => {
  return (
    <>
      <Helmet>
        <title>Suporte | MedCheck</title>
      </Helmet>
      <MainLayout
        title="Suporte Técnico"
        description="Central de atendimento e suporte ao usuário"
      >
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="my-tickets">Meus Tickets</TabsTrigger>
            <TabsTrigger value="new-ticket">Novo Ticket</TabsTrigger>
          </TabsList>

          <TabsContent value="my-tickets">{ticketsContent}</TabsContent>

          <TabsContent value="new-ticket">{newTicketContent}</TabsContent>
        </Tabs>
      </MainLayout>
    </>
  );
};
