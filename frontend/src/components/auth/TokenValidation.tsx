import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

interface TokenValidationProps {
  isValid: boolean | null;
}

const TokenValidation = ({ isValid }: TokenValidationProps) => {
  const navigate = useNavigate();

  if (isValid === null) {
    return (
      <Card className="w-full max-w-md mx-auto glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-center text-muted-foreground">
              Verificando seu link de redefinição de senha...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isValid) {
    return (
      <Card className="w-full max-w-md mx-auto glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Link inválido
          </CardTitle>
          <CardDescription className="text-center">
            O link de redefinição de senha é inválido ou expirou.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            Por favor, solicite um novo link de redefinição de senha.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/forgot-password')}
          >
            Solicitar novo link
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Voltar para o login
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return null;
};

export default TokenValidation;
