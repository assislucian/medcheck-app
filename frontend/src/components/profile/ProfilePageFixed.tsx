import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileData } from '../../hooks/useProfileData';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { User, FileText, DollarSign, AlertTriangle } from 'lucide-react';

export const ProfilePageFixed: React.FC = () => {
  const navigate = useNavigate();
  const { profile, dashboard, isLoading, error, isAuthError, refetch } =
    useProfileData();

  const handleLogin = () => {
    // Remove token inválido
    localStorage.removeItem('token');
    // Redireciona para login
    navigate('/login');
  };

  const formatCurrency = (value: string) => {
    try {
      // Remove caracteres não numéricos e converte para número
      const num = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(num);
    } catch {
      return value; // Retorna valor original se não conseguir formatar
    }
  };

  // Se houver erro de autenticação, mostra erro específico
  if (isAuthError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <ErrorMessage
          error={error || 'Sessão expirada. Faça login novamente.'}
          isAuthError={true}
          onLogin={handleLogin}
          className="mb-6"
        />
      </div>
    );
  }

  // Se houver erro geral, mostra erro com opção de retry
  if (error && !isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <ErrorMessage error={error} onRetry={refetch} className="mb-6" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Visualize e gerencie suas informações pessoais</p>
      </div>

      {/* Profile Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : profile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <p className="text-gray-900">{profile.nome}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CRM / UF
                </label>
                <p className="text-gray-900">
                  {profile.crm} / {profile.uf}
                </p>
              </div>

              {profile.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
              )}

              {profile.specialty && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidade
                  </label>
                  <p className="text-gray-900">{profile.specialty}</p>
                </div>
              )}

              {profile.hospital && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital/Clínica
                  </label>
                  <p className="text-gray-900">{profile.hospital}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Dados do perfil não disponíveis</p>
              <Button variant="outline" onClick={refetch} className="mt-3">
                Tentar Novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Demonstrativos</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboard?.total_demonstrativos || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Guias</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboard?.total_guias || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Liberado</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className="text-lg font-bold text-gray-900">
                    {dashboard?.valor_total_liberado
                      ? formatCurrency(dashboard.valor_total_liberado)
                      : 'R$ 0,00'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Glosa</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className="text-lg font-bold text-gray-900">
                    {dashboard?.valor_total_glosa
                      ? formatCurrency(dashboard.valor_total_glosa)
                      : 'R$ 0,00'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => navigate('/profile/edit')}
          className="flex-1 md:flex-none"
        >
          Editar Perfil
        </Button>
        <Button variant="outline" onClick={refetch}>
          Atualizar Dados
        </Button>
      </div>
    </div>
  );
};
