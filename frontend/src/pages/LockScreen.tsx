import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lock } from 'lucide-react';

const LockScreen = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Ativar Trial | MedCheck</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Acesso Bloqueado</CardTitle>
            <CardDescription className="text-lg mt-2">
              Você ainda não iniciou seu teste grátis de 7 dias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Button size="lg" className="w-full" onClick={() => navigate('/welcome')}>
                Iniciar Teste Grátis
              </Button>
              <p className="text-sm text-muted-foreground">
                Desbloqueie todas as funcionalidades por 7 dias gratuitamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LockScreen;
