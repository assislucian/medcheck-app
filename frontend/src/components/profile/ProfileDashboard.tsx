import { useProfile } from '../../hooks/use-profile';
import { ProfileOverview } from './ProfileOverview';
import { ProfileTabs } from './ProfileTabs';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Card, CardContent } from '../../components/ui/card';
import { User, Stethoscope, AlertCircle } from 'lucide-react';

interface ProfileData {
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
}

export const ProfileDashboard = () => {
  const { profile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-12 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border shadow">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Erro ao Carregar Perfil
                </h2>
              </div>
              <ErrorMessage error={error} onRetry={() => window.location.reload()} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Simplificado */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-medium text-sm">
            <Stethoscope className="h-4 w-4" />
            Painel do Profissional Médico
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Gerencie suas informações profissionais e acompanhe sua atividade médica
          </p>
        </div>

        {/* Layout Principal */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">
                Informações Profissionais
              </h2>
            </div>
            <ProfileOverview profile={profile} loading={loading} />
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <Stethoscope className="h-6 w-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
            </div>
            <ProfileTabs />
          </section>
        </div>

        {/* Footer Simplificado */}
        <div className="pt-16 pb-8">
          <div className="h-px bg-gray-200 mb-8"></div>
          <div className="text-center text-gray-500 text-sm">
            <p>
              <strong>MedCheck</strong> - Plataforma profissional para análise de
              demonstrativos médicos
            </p>
            <p className="mt-2">
              Seus dados estão protegidos e em conformidade com a LGPD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
