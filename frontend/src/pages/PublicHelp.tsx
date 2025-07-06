import { PublicLayout } from '@/components/layout/PublicLayout';
import { HelpContent } from '@/components/help/HelpContent';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PublicHelpPage = () => {
  const navigate = useNavigate();

  const handleShowGuides = () => {
    navigate('/login', { state: { redirectTo: '/guides' } });
  };

  const handleShowVideos = () => {
    navigate('/login', { state: { redirectTo: '/help' } });
  };

  const handleContactSupport = () => {
    navigate('/login', { state: { redirectTo: '/support' } });
  };

  return (
    <PublicLayout
      title="Central de Ajuda"
      description="Encontre respostas para suas dúvidas sobre o MedCheck"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Central de Ajuda</h1>
          <p className="text-lg text-muted-foreground">
            Encontre respostas para perguntas frequentes e tutoriais sobre como usar o
            MedCheck.
          </p>
        </div>

        <HelpContent
          onShowGuides={handleShowGuides}
          onShowVideos={handleShowVideos}
          onContactSupport={handleContactSupport}
        />

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Precisa de acesso completo à nossa documentação?
          </p>
          <Button onClick={() => navigate('/login')} size="lg">
            Faça login para acessar
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PublicHelpPage;
