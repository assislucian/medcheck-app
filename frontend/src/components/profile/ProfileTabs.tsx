import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useProfile } from '@/hooks/use-profile';
import { ProfileForm } from './form/ProfileForm';

export const ProfileTabs = () => {
  const { loading } = useProfile();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          Informações Pessoais
        </CardTitle>
        <CardDescription>
          Atualize suas informações pessoais e profissionais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm loading={loading} />
      </CardContent>
    </Card>
  );
};
