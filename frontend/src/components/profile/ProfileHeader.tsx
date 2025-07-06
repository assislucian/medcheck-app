import { Card } from '../ui/card';
import { useProfile } from '../../hooks/use-profile';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/badge';
import { ProfileAvatar } from './avatar/ProfileAvatar';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export const ProfileHeader = () => {
  const { fetchProfile } = useProfile();
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    name: '',
    specialty: '',
    crm: '',
    avatarUrl: '',
    email: user?.email || '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      const profileData = await fetchProfile();
      if (profileData) {
        const avatarUrl = profileData.notification_preferences
          ? (profileData.notification_preferences as Record<string, any>)[
              'avatar_url'
            ] || ''
          : '';

        setProfile({
          name: profileData.name || 'Usuário',
          specialty: profileData.specialty || 'Não informado',
          crm: profileData.crm || 'Não informado',
          avatarUrl: avatarUrl,
          email: profileData.email || user?.email || '',
        });
      }
    };

    loadProfile();
  }, [fetchProfile, user]);

  const handleAvatarUpdate = (url: string) => {
    setProfile((prev) => ({ ...prev, avatarUrl: url }));
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ProfileAvatar
            name={profile.name}
            avatarUrl={profile.avatarUrl}
            onAvatarUpdate={handleAvatarUpdate}
          />

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <Badge variant="outline" className="md:self-start">
                  {profile.specialty}
                </Badge>
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              {profile.crm && (
                <p className="text-sm text-muted-foreground">CRM: {profile.crm}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {profile.specialty}
              </Badge>
              <Badge variant="outline">MedCheck Pro</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end md:ml-8 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const res = await fetch('/api/v1/export-data', {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (!res.ok) throw new Error('Erro ao exportar dados');
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'medcheck-dados-usuario.zip';
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success('Exportação iniciada!');
              } catch (e) {
                toast.error('Erro ao exportar dados.');
              }
            }}
          >
            Exportar meus dados
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (
                !window.confirm(
                  'Tem certeza que deseja excluir sua conta e todos os dados? Esta ação é irreversível.'
                )
              )
                return;
              try {
                const res = await fetch('/api/v1/delete-account', {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (!res.ok) throw new Error('Erro ao excluir conta');
                toast.success('Conta excluída com sucesso. Você será deslogado.');
                setTimeout(() => {
                  window.location.href = '/login';
                }, 1500);
              } catch (e) {
                toast.error('Erro ao excluir conta.');
              }
            }}
          >
            Excluir minha conta
          </Button>
        </div>
      </div>
    </Card>
  );
};
