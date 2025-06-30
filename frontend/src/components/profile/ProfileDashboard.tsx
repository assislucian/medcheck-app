import { useProfileData } from '@/hooks/useProfileData';
import { useAuth } from '../../contexts/auth/AuthContext';
import { ProfileOverview } from './ProfileOverview';
import { ProfileTabs } from './ProfileTabs';
import { Separator } from '../../components/ui/separator';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Skeleton } from '../../components/ui/skeleton';

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
  const { profileData, loading, error, retryProfile } = useProfileData();

  // Prepara os dados formatados para o ProfileOverview
  const formattedProfileData: ProfileData = {
    name: profileData?.nome || user?.nome || 'Usuário',
    specialty: profileData?.specialty || 'Especialidade não informada',
    crm: profileData?.crm || user?.crm || 'CRM não informado',
    uf: profileData?.uf || user?.uf || '',
    email: profileData?.email || user?.email || '',
    phone: profileData?.phone || '',
    hospital: profileData?.hospital || 'Hospital não informado',
    bio: profileData?.bio || '',
    avatarUrl: '', // Avatar será gerenciado pelo componente específico
    memberSince: user?.exp
      ? new Date(user.exp * 1000 - 365 * 24 * 60 * 60 * 1000).toLocaleDateString(
          'pt-BR',
          {
            year: 'numeric',
            month: 'short',
          }
        )
      : 'Data não disponível',
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <ErrorMessage error={error} onRetry={retryProfile} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header do Perfil */}
      <ProfileOverview profile={formattedProfileData} loading={loading} />

      {/* Seção de Configurações Premium */}
      <ProfileTabs />

      <Separator />

      {/* Footer informativo */}
      <div className="text-sm text-muted-foreground text-center">
        <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
        <p className="text-xs mt-1">Dados sincronizados com a plataforma MedCheck</p>
      </div>
    </div>
  );
};
