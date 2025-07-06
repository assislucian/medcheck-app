import { useProfile } from '@/hooks/use-profile';
import { ProfileHeader } from './ProfileHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCog, Lock, Bell } from 'lucide-react';
import { ProfileForm } from './form/ProfileForm';
import { SecurityForm } from './security/SecurityForm';
import { NotificationsTab } from './tabs/NotificationsTab';

export const ProfileContainer = () => {
  const { loading, updateProfile, updateNotificationPreferences } = useProfile();

  return (
    <div className="space-y-6">
      <ProfileHeader />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto gap-4">
          <TabsTrigger value="profile" className="gap-2">
            <UserCog className="h-4 w-4" />
            <span>Informações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            <span>Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span>Notificações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <ProfileForm loading={loading} />
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <SecurityForm />
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab
            loading={loading}
            onSubmit={updateNotificationPreferences}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
