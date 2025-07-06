import { useState } from 'react';
import { toast } from 'sonner';

export const useProfileAvatar = () => {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      // Implementation for uploading avatar
      // This is just a placeholder that returns a mock URL
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate upload delay
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return null;

    try {
      setUploading(true);
      const url = await uploadAvatar(file);
      if (url) {
        toast.success('Foto atualizada com sucesso');
        return url;
      }
    } catch (error) {
      toast.error('Erro ao atualizar foto');
    } finally {
      setUploading(false);
    }
    return null;
  };

  return {
    uploading,
    uploadAvatar,
    handleAvatarChange,
  };
};
