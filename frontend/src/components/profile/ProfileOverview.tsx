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

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      <CardContent className="relative p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar e Badge Premium */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-28 h-28 border-4 border-blue-200 shadow-lg ring-4 ring-blue-50">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-xl font-semibold">
                {profile.name ? (
                  getInitials(profile.name)
                ) : (
                  <User className="h-8 w-8" />
                )}
              </AvatarFallback>
            </Avatar>

            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 text-xs font-semibold px-3 py-1">
              {profile.uf ? `Membro ${profile.uf}` : 'Membro'}
            </Badge>
          </div>

          {/* Informações Principais */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                  {profile.name || 'Nome não informado'}
                </h1>
                <p className="text-lg font-medium text-blue-700">
                  {formatCRM(profile.crm, profile.uf)}
                </p>
                {profile.bio && (
                  <p className="text-sm text-gray-600 max-w-md leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-10 px-6 gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700 hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 transition-all duration-300"
                asChild
              >
                <Link to="/profile/edit">
                  <FileEdit className="h-4 w-4" />
                  Editar Perfil
                </Link>
              </Button>
            </div>

            {/* Cards Premium de Informações Profissionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Especialidade - Verde */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-xl p-4 border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100">
                    <Award className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-800 mb-1 truncate">
                      {profile.specialty || 'Especialidade não informada'}
                    </p>
                    <p className="text-xs text-emerald-600 uppercase tracking-wide">
                      Especialidade
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Hospital - Azul */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 rounded-xl p-4 border border-blue-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-sky-600"></div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100">
                    <Building2 className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-800 mb-1 truncate">
                      {profile.hospital || 'Hospital não informado'}
                    </p>
                    <p className="text-xs text-blue-600 uppercase tracking-wide">
                      Hospital Principal
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Membro Desde - Âmbar */}
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-xl p-4 border border-amber-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                    <CalendarDays className="h-5 w-5 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-800 mb-1">
                      {profile.memberSince
                        ? `Desde ${profile.memberSince}`
                        : 'Data não disponível'}
                    </p>
                    <p className="text-xs text-amber-600 uppercase tracking-wide">
                      Membro desde
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Contato Premium */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
              {profile.email && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300"
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
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-300 transition-all duration-300"
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
