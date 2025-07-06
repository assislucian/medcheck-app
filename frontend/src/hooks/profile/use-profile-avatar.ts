/**
 * use-profile-avatar.ts
 *
 * Custom hook para gerenciar o upload e atualização do avatar do usuário.
 * Lida com o armazenamento de imagens no Supabase Storage.
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { getProfile, updateProfile } from '@/utils/supabase';

/**
 * Hook que fornece funcionalidades para gerenciar o avatar do perfil do usuário
 * @returns Objeto com estados e funções para manipulação de avatar
 */
export const useProfileAvatar = () => {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  /**
   * Faz upload de um arquivo de avatar para o armazenamento do Supabase
   * @param file Arquivo de imagem para upload
   * @returns URL pública do avatar ou null em caso de erro
   */
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      // Verifica se o usuário está autenticado
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Não autenticado');
      }

      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${userId}/profile-${Date.now()}.${fileExt}`;

      // Verifica se o bucket de armazenamento existe e cria se necessário
      const { data: buckets } = await supabase.storage.listBuckets();
      const profilesBucketExists = buckets?.some((b) => b.name === 'profiles');

      if (!profilesBucketExists) {
        await supabase.storage.createBucket('profiles', {
          public: true,
        });
      }

      // Faz upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obtém a URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  return {
    loading,
    avatarUrl,
    uploadAvatar,
  };
};
