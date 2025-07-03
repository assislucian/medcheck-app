import { useProfile } from '../../hooks/use-profile';
import { ProfileOverview } from './ProfileOverview';
import { ProfileTabs } from './ProfileTabs';
import { ActivitySummary } from './ActivitySummary';
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 p-6">
        {/* Header Premium com Loading */}
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <div className="h-4 w-20 bg-blue-200 rounded animate-pulse"></div>
            </div>
            <div className="h-12 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>

          {/* Loading Cards */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-28 h-28 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-rose-100">
                  <AlertCircle className="h-6 w-6 text-red-700" />
                </div>
                <h2 className="text-2xl font-bold text-red-800">
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Premium */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 font-medium text-sm">
            <Stethoscope className="h-4 w-4" />
            Painel do Profissional Médico
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
            Meu Perfil
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gerencie suas informações profissionais e acompanhe sua atividade médica
          </p>
        </div>

        {/* Layout Principal */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Coluna Principal - Informações do Perfil */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                  <User className="h-6 w-6 text-blue-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Informações Profissionais
                </h2>
              </div>
              <ProfileOverview profile={profile} loading={loading} />
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-slate-100 to-gray-100">
                  <Stethoscope className="h-6 w-6 text-slate-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
              </div>
              <ProfileTabs />
            </section>
          </div>

          {/* Coluna Lateral - Atividade Recente */}
          <div className="space-y-8">
            <section>
              <ActivitySummary />
            </section>
          </div>
        </div>

        {/* Footer Premium */}
        <div className="pt-16 pb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8"></div>
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
