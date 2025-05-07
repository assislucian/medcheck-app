import { useAuth } from "../contexts/auth/AuthContext";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TicketList } from '../components/support/TicketList';
import { TicketDetail } from '../components/support/TicketDetail';
import { NewTicketForm } from '../components/support/NewTicketForm';
import { useTickets } from '../hooks/useTickets';
import PageHeader from "../components/layout/PageHeader";
import { UserMenu } from "../components/navbar/UserMenu";
import { HelpCircle } from "lucide-react";

const Support = () => {
  const { user, userProfile, signOut } = useAuth();
  
  const {
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
  } = useTickets(user?.id);

  const navigateToNewTicket = () => {
    setActiveTab('new-ticket');
  };

  const handleCreateTicket = async (data: any) => {
    await createTicket(data);
  };

  const TicketsContent = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <TicketList
          loading={loading}
          tickets={tickets}
          selectedTicket={selectedTicket}
          onSelectTicket={setSelectedTicket}
          onCreateTicket={navigateToNewTicket}
        />
      </div>
      
      <div className="lg:col-span-2">
        <TicketDetail
          ticket={selectedTicket}
          messages={messages}
          onSendMessage={sendMessage}
          onCreateTicket={navigateToNewTicket}
        />
      </div>
    </div>
  );

  const NewTicketContent = (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Criar Novo Ticket</h3>
        <p className="text-sm text-muted-foreground">
          Descreva seu problema ou dúvida em detalhes para que possamos ajudar você melhor.
        </p>
      </CardHeader>
      <CardContent>
        <NewTicketForm
          onSubmit={handleCreateTicket}
          submitting={submitting}
        />
      </CardContent>
    </Card>
  );

  return (
    <MainLayout title="Suporte Técnico">
      <PageHeader
        title="Suporte"
        icon={<HelpCircle size={28} />}
        actions={userProfile ? (
          <UserMenu
            name={userProfile.name || 'Usuário'}
            email={userProfile.email || 'sem-email@exemplo.com'}
            specialty={userProfile.crm || ''}
            avatarUrl={userProfile.avatarUrl || undefined}
            onLogout={signOut}
          />
        ) : null}
      />
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="my-tickets" className="flex-1">Meus Tickets</TabsTrigger>
            <TabsTrigger value="new-ticket" className="flex-1">Novo Ticket</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-tickets">
            {TicketsContent}
          </TabsContent>
          
          <TabsContent value="new-ticket">
            {NewTicketContent}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Support;
