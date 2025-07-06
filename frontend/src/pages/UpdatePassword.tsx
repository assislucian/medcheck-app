import { Helmet } from 'react-helmet-async';
import PasswordForm from '@/components/auth/PasswordForm';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UpdatePasswordPage = () => {
  const { updatePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (password: string) => {
    setIsLoading(true);
    try {
      await updatePassword(password);
      navigate('/dashboard'); // Redirect after successful password update
    } catch (error) {
      // Error handling is already done in the updatePassword method via toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Atualizar Senha | MedCheck</title>
      </Helmet>
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Atualizar Senha</h1>
          <PasswordForm onSubmit={handleUpdatePassword} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
};

export default UpdatePasswordPage;
