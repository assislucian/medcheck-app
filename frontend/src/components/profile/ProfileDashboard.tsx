import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { ProfileOverview } from './ProfileOverview';
import { ProfileTabs } from './ProfileTabs';
import { ActivitySummary } from './ActivitySummary';
import { Separator } from '../../components/ui/separator';

export const ProfileDashboard = () => {
  const { user, getProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    specialty: '',
    crm: '',
    email: '',
    avatarUrl: '',
    hospitalName: 'Hospital São Paulo',
    memberSince: 'Jan 2023',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setLoading(true);
        try {
          const profile = await getProfile();
          if (profile) {
            let avatarUrl = '';
            if (
              profile.notification_preferences &&
              typeof profile.notification_preferences === 'object' &&
              'avatar_url' in profile.notification_preferences
            ) {
              avatarUrl = (profile.notification_preferences.avatar_url as string) || '';
            }

            setProfileData({
              name: profile.nome || 'Usuário',
              specialty: profile.specialty || 'Especialidade não informada',
              crm: profile.crm || 'CRM não informado',
              email: profile.email || user?.email || '',
              avatarUrl: avatarUrl,
              hospitalName: profile.hospital || 'Hospital não informado',
              memberSince: new Date(
                profile.created_at || Date.now()
              ).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'short',
              }),
            });
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [user, getProfile]);

  return (
    <div className="space-y-8">
      <ProfileOverview profile={profileData} loading={loading} />
      <ActivitySummary />
      <ProfileTabs />
      <Separator />
      <div className="text-sm text-muted-foreground text-center">
        <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
      </div>
    </div>
  );
};
