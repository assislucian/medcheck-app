import { useState, useEffect } from 'react';
import { useProfileAvatar } from './profile/use-profile-avatar';
import { useProfileData } from './profile/use-profile-data';
import { useProfileSecurity } from './profile/use-profile-security';
import { useProfileNotifications } from './profile/use-profile-notifications';
import { useAuth } from '../contexts/auth/AuthContext';

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

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const { loading: avatarLoading, avatarUrl, uploadAvatar } = useProfileAvatar();
  const {
    loading: profileLoading,
    fetchProfile,
    updateProfile: updateProfileBase,
  } = useProfileData();
  const { loading: securityLoading, updateSecurity: updateSecurityBase } =
    useProfileSecurity();
  const { loading: notificationsLoading, updateNotificationPreferences } =
    useProfileNotifications();

  const loading =
    avatarLoading || profileLoading || securityLoading || notificationsLoading;

  // Carregar dados do perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.crm) {
          setError('Usuário não autenticado');
          return;
        }

        const profileData = await fetchProfile();
        if (profileData) {
          // Extrair avatar URL das preferências de notificação
          const avatarUrl = profileData.notification_preferences
            ? (profileData.notification_preferences as Record<string, any>)[
                'avatar_url'
              ] || ''
            : '';

          const formattedProfile: ProfileData = {
            name: profileData.name || user.name || 'Usuário',
            specialty: profileData.specialty || 'Não informado',
            crm: profileData.crm || user.crm || 'Não informado',
            uf: profileData.uf || user.uf || 'Não informado',
            email: profileData.email || user.email || '',
            phone: profileData.phone || '',
            hospital: profileData.hospital || '',
            bio: profileData.bio || '',
            avatarUrl: avatarUrl,
            memberSince: profileData.memberSince || '2024',
          };

          setProfile(formattedProfile);
          setError(null);
        } else {
          setError('Não foi possível carregar os dados do perfil');
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError('Erro ao carregar dados do perfil');
      }
    };

    loadProfile();
  }, [user, fetchProfile]);

  // Create wrapper functions that handle the Promise<boolean> to Promise<void> conversion
  const updateProfile = async (data: any, avatarFile?: File | null): Promise<void> => {
    await updateProfileBase(data, avatarFile);
  };

  const updateSecurity = async (data: any): Promise<void> => {
    await updateSecurityBase(data);
  };

  return {
    profile,
    loading,
    error,
    avatarUrl,
    fetchProfile,
    uploadAvatar,
    updateProfile,
    updateSecurity,
    updateNotificationPreferences,
  };
};
