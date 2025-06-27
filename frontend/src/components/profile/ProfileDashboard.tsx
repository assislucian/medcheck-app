import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { ProfileOverview } from './ProfileOverview';
import { ProfileTabs } from './ProfileTabs';
import { ActivitySummary } from './ActivitySummary';
import { Separator } from '../../components/ui/separator';

interface ProfileData {
  name: string;
  specialty: string;
  crm: string;
  uf: string;
  email: string;
  phone?: string;
  hospital?: string;
  bio?: string;
  avatarUrl: string;
  memberSince: string;
}

export const ProfileDashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    specialty: '',
    crm: '',
    uf: '',
    email: '',
    avatarUrl: '',
    memberSince: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setLoading(true);
        try {
          // Buscar dados do perfil da API
          const token = localStorage.getItem('token');
          const response = await fetch('/api/v1/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const profileApiData = await response.json();

            setProfileData({
              name: profileApiData.nome || user.nome || 'Usuário',
              specialty: profileApiData.specialty || 'Especialidade não informada',
              crm: profileApiData.crm || user.crm || 'CRM não informado',
              uf: profileApiData.uf || user.uf || '',
              email: profileApiData.email || user.email || '',
              phone: profileApiData.phone || '',
              hospital: profileApiData.hospital || 'Hospital não informado',
              bio: profileApiData.bio || '',
              avatarUrl: '', // Avatar será gerenciado pelo componente específico
              memberSince: user.exp
                ? new Date(
                    user.exp * 1000 - 365 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'short',
                  })
                : 'Data não disponível',
            });
          } else {
            // Fallback para dados do JWT se a API falhar
            setProfileData({
              name: user.nome || 'Usuário',
              specialty: 'Especialidade não informada',
              crm: user.crm || 'CRM não informado',
              uf: user.uf || '',
              email: user.email || '',
              avatarUrl: '',
              memberSince: 'Data não disponível',
            });
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
          // Fallback para dados do JWT em caso de erro
          setProfileData({
            name: user.nome || 'Usuário',
            specialty: 'Especialidade não informada',
            crm: user.crm || 'CRM não informado',
            uf: user.uf || '',
            email: user.email || '',
            avatarUrl: '',
            memberSince: 'Data não disponível',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  return (
    <div className="space-y-8">
      <ProfileOverview profile={profileData} loading={loading} />
      <ActivitySummary />
      <ProfileTabs />
      <Separator />
      <div className="text-sm text-muted-foreground text-center">
        <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
        <p className="text-xs mt-1">Dados sincronizados com a plataforma MedCheck</p>
      </div>
    </div>
  );
};
