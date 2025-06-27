import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../contexts/auth/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

interface ProfileSectionProps {
  profileData: {
    name: string;
    specialty?: string;
    crm: string;
    avatarUrl?: string;
  };
  className?: string;
}

export function ProfileSection({ profileData, className }: ProfileSectionProps) {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return 'M';

    return name
      .trim()
      .split(' ')
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = profileData.name || user?.nome || 'Médico';
  const displaySpecialty = profileData.specialty || 'Especialista';

  return (
    <div className={cn('px-3 py-2', className)}>
      <Link
        to="/profile"
        className="flex items-center gap-3 p-3 hover:bg-accent/60 rounded-lg transition-all duration-200 group"
      >
        <Avatar className="h-11 w-11 border-2 border-primary/20 group-hover:border-primary/30 transition-colors">
          {profileData.avatarUrl ? (
            <AvatarImage
              src={profileData.avatarUrl}
              alt={displayName}
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold text-sm">
              {getInitials(displayName)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            CRM {profileData.crm} • {displaySpecialty}
          </p>
        </div>
      </Link>
    </div>
  );
}
