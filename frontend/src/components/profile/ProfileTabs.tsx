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
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const ProfileTabs = () => {
  const { loading } = useProfile();

  return (
    <Card className="border border-neutral-200 shadow-sm bg-white">
      <CardHeader className="border-b border-neutral-200 bg-neutral-50">
        <CardTitle className="text-xl font-semibold text-neutral-900 flex items-center gap-3">
          <User className="h-5 w-5 text-neutral-600" />
          Configurações do Perfil
        </CardTitle>
        <CardDescription className="text-neutral-600">
          Gerencie suas informações pessoais e profissionais
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="h-8 w-8 text-neutral-400" />
          </div>
        ) : (
          <ProfileForm />
        )}
      </CardContent>
    </Card>
  );
};
