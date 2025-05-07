
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { Helmet } from "react-helmet-async";
import { ProfileContainer } from "@/components/profile/ProfileContainer";

const Profile = () => {
  return (
    <AuthenticatedLayout title="Perfil">
      <Helmet>
        <title>Perfil | MedCheck</title>
        <meta name="description" content="Gerencie seu perfil médico e configurações" />
      </Helmet>
      <ProfileContainer />
    </AuthenticatedLayout>
  );
};

export default Profile;
