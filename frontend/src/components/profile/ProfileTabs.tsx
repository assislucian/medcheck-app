import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useProfile } from '@/hooks/use-profile';
import { ProfileForm } from './form/ProfileForm';
import { User } from 'lucide-react';

export const ProfileTabs = () => {
  const { loading } = useProfile();

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-500 to-gray-600"></div>
      <CardHeader className="relative">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-gray-100">
            <User className="h-6 w-6 text-slate-700" />
          </div>
          Configurações do Perfil
        </CardTitle>
        <CardDescription className="text-gray-600">
          Gerencie suas informações pessoais e profissionais para manter seu perfil
          sempre atualizado
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ProfileForm loading={loading} />
      </CardContent>
    </Card>
  );
};
