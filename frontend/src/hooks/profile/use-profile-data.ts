/**
 * use-profile-data.ts
 *
 * Custom hook para gerenciar os dados do perfil do usuário.
 * Fornece funcionalidades para buscar e atualizar informações do perfil.
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Profile } from '@/types';
import { toast } from 'sonner';
import { getProfile, updateProfile as updateProfileHelper } from '@/utils/supabase';
import { useProfileAvatar } from './use-profile-avatar';
import { Json } from '@/integrations/supabase/types';

/**
 * Interface que define a estrutura dos dados do perfil
 */
interface ProfileData {
  name: string;
  email: string;
  especialidade?: string;
  [key: string]: any; // Para permitir propriedades adicionais
}

/**
 * Hook que fornece funcionalidades para gerenciar os dados do perfil do usuário
 * @returns Objeto com estados e funções para manipulação do perfil
 */
export const useProfileData = () => {
  const [loading, setLoading] = useState(false);
  const { uploadAvatar } = useProfileAvatar();
  const { user } = useAuth();

  /**
   * Busca os dados do perfil do usuário atual
   * @returns Dados do perfil ou null em caso de erro
   */
  const fetchProfile = async () => {
    try {
      if (!user?.crm) {
        throw new Error('Usuário sem CRM');
      }

      const profileData = await getProfile(supabase, user.crm);
      return profileData as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  /**
   * Atualiza os dados do perfil do usuário
   * @param data Novos dados do perfil
   * @param avatarFile Arquivo de avatar opcional
   * @returns Boolean indicando sucesso ou falha
   */
  const updateProfile = async (
    data: ProfileData,
    avatarFile?: File | null
  ): Promise<boolean> => {
    setLoading(true);
    try {
      if (!user?.crm) {
        throw new Error('Usuário sem CRM');
      }

      // Processa o upload do avatar se fornecido
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
        if (!avatarUrl) {
          throw new Error('Falha ao fazer upload da imagem');
        }
      }

      // Obtém dados atuais do perfil para preservar preferências
      const profileData = await getProfile(supabase, user.crm);

      const currentNotificationPrefs =
        profileData && profileData.notification_preferences
          ? profileData.notification_preferences
          : {};

      // Create properly typed object without spread
      const updatedNotificationPrefs: Record<string, any> = {};

      if (
        typeof currentNotificationPrefs === 'object' &&
        currentNotificationPrefs !== null
      ) {
        // Use Object.entries to safely copy properties
        Object.entries(currentNotificationPrefs as Record<string, any>).forEach(
          ([key, value]) => {
            updatedNotificationPrefs[key] = value;
          }
        );
      }

      // Add avatar_url if available
      if (avatarUrl) {
        updatedNotificationPrefs.avatar_url = avatarUrl;
      }

      // Atualiza o perfil com os novos dados
      const success = await updateProfileHelper(supabase, user.crm, {
        name: data.name,
        email: data.email,
        specialty: data.especialidade,
        notification_preferences: updatedNotificationPrefs as Json,
      });

      if (!success) {
        throw new Error('Erro ao atualizar o perfil');
      }

      // Notifica o usuário sobre o sucesso
      toast.success('Perfil atualizado', {
        description: 'Suas informações foram atualizadas com sucesso.',
      });

      return true;
    } catch (error) {
      // Notifica o usuário sobre o erro
      toast.error('Erro ao atualizar', {
        description: 'Não foi possível atualizar suas informações. Tente novamente.',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchProfile,
    updateProfile,
  };
};
