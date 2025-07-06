import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  Award,
  CalendarDays,
  Mail,
  FileEdit,
  User,
  Phone,
  Building2,
} from 'lucide-react';
import { Label } from '../ui/label';

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
  } | null;
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
      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-300 to-indigo-400 animate-pulse"></div>
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-blue-200 animate-pulse"></div>
              <div className="h-6 w-20 bg-blue-200 rounded animate-pulse"></div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="h-8 w-64 bg-blue-200 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-blue-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-blue-200 rounded animate-pulse"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="h-16 w-full bg-blue-200 rounded animate-pulse"></div>
                <div className="h-16 w-full bg-blue-200 rounded animate-pulse"></div>
                <div className="h-16 w-full bg-blue-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
        <CardContent className="relative p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-rose-100">
              <User className="h-8 w-8 text-red-700" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">
              Perfil não encontrado
            </h3>
            <p className="text-red-600">
              Não foi possível carregar as informações do perfil.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-neutral-200 shadow-sm bg-white">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6 sm:gap-8">
          {/* Avatar e Badge */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-28 h-28 border-2 border-neutral-200">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="bg-neutral-100 text-neutral-700 text-xl font-medium">
                {profile.name ? (
                  getInitials(profile.name)
                ) : (
                  <User className="h-8 w-8" />
                )}
              </AvatarFallback>
            </Avatar>

            <Badge
              variant="outline"
              className="text-neutral-600 border-neutral-300 bg-neutral-50"
            >
              {profile.specialty || 'Médico'}
            </Badge>
          </div>

          {/* Informações do Perfil */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-1">
                {profile.name}
              </h2>
              <p className="text-neutral-600">
                CRM {profile.crm} - {profile.uf}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-neutral-500 text-sm">Email</Label>
                <p className="text-neutral-700">{profile.email}</p>
              </div>
              {profile.phone && (
                <div>
                  <Label className="text-neutral-500 text-sm">Telefone</Label>
                  <p className="text-neutral-700">{profile.phone}</p>
                </div>
              )}
              {profile.hospital && (
                <div>
                  <Label className="text-neutral-500 text-sm">Hospital</Label>
                  <p className="text-neutral-700">{profile.hospital}</p>
                </div>
              )}
              <div>
                <Label className="text-neutral-500 text-sm">Membro desde</Label>
                <p className="text-neutral-700">{profile.memberSince}</p>
              </div>
            </div>

            {profile.bio && (
              <div>
                <Label className="text-neutral-500 text-sm">Bio</Label>
                <p className="text-neutral-700 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
