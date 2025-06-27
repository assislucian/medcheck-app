import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Award,
  MapPin,
  CalendarDays,
  Mail,
  FileEdit,
  User,
  Phone,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileOverviewProps {
  profile: {
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
  };
  loading: boolean;
}

export const ProfileOverview = ({ profile, loading }: ProfileOverviewProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatCRM = (crm: string, uf: string) => {
    if (!crm || !uf) return 'CRM não informado';
    return `CRM ${crm}/${uf}`;
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="h-6 w-20" />
            </div>

            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-lg">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {profile.name ? (
                  getInitials(profile.name)
                ) : (
                  <User className="h-8 w-8" />
                )}
              </AvatarFallback>
            </Avatar>

            <Badge variant="outline" className="text-xs">
              {profile.uf ? `Membro ${profile.uf}` : 'Membro'}
            </Badge>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {profile.name || 'Nome não informado'}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {formatCRM(profile.crm, profile.uf)}
                </p>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground max-w-md">
                    {profile.bio}
                  </p>
                )}
              </div>

              <div className="flex justify-center md:justify-end items-center gap-2 mt-4 md:mt-0">
                <Button variant="outline" size="sm" className="h-9 px-4 gap-2" asChild>
                  <Link to="/profile">
                    <FileEdit className="h-4 w-4" />
                    Editar Perfil
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {profile.specialty || 'Especialidade não informada'}
                  </p>
                  <p className="text-xs">Especialidade</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {profile.hospital || 'Hospital não informado'}
                  </p>
                  <p className="text-xs">Hospital Principal</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {profile.memberSince
                      ? `Desde ${profile.memberSince}`
                      : 'Data não disponível'}
                  </p>
                  <p className="text-xs">Membro desde</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
              {profile.email && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  asChild
                >
                  <a href={`mailto:${profile.email}`}>
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </a>
                </Button>
              )}

              {profile.phone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  asChild
                >
                  <a href={`tel:${profile.phone}`}>
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
