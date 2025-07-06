import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfileAvatar } from '@/hooks/use-profile-avatar';
import { Camera, User } from 'lucide-react';
import { useState } from 'react';
import { useAlert } from '@/utils/alertUtils';

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
}

export const ProfileAvatar = ({
  name,
  avatarUrl,
  onAvatarUpdate,
}: ProfileAvatarProps) => {
  const { uploading, handleAvatarChange } = useProfileAvatar();
  const [isHovering, setIsHovering] = useState(false);
  const { showSuccess, showError } = useAlert();

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const url = await handleAvatarChange(event);
      if (url) {
        onAvatarUpdate(url);
        showSuccess(
          'Avatar atualizado',
          'Sua imagem de perfil foi atualizada com sucesso!'
        );
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showError(
        'Falha ao atualizar avatar',
        'Não foi possível atualizar sua imagem de perfil. Tente novamente.'
      );
    }
  };

  return (
    <div
      className="relative cursor-pointer group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Avatar className="h-24 w-24 border-2 border-muted">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
        ) : (
          <AvatarFallback className="text-lg bg-primary/10 text-primary">
            <User className="h-8 w-8" />
          </AvatarFallback>
        )}
      </Avatar>

      <label
        htmlFor="avatar-upload"
        className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 transition-opacity duration-200 ${isHovering || uploading ? 'opacity-100' : ''}`}
      >
        {uploading ? (
          <div className="h-8 w-8 border-2 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full animate-spin" />
        ) : (
          <Camera className="h-6 w-6 text-white" />
        )}
        <input
          id="avatar-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
};
