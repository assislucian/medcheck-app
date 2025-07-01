import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { Helmet } from 'react-helmet-async';
import { ProfileDashboard } from '../components/profile/ProfileDashboard';

const Profile = () => {
  return (
    <AuthenticatedLayout title="Perfil">
      <Helmet>
        <title>Perfil | MedCheck</title>
        <meta name="description" content="Gerencie seu perfil médico e configurações" />
      </Helmet>

      {/* Background com Gradiente Âmbar Suave */}
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <ProfileDashboard />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Profile;
