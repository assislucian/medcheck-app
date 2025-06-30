import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/use-profile';
import { ProfileForm } from './form/ProfileForm';
import { User, Shield, Bell, Key } from 'lucide-react';

export const ProfileTabs = () => {
  const { loading } = useProfile();

  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto gap-2">
        <TabsTrigger value="personal" className="gap-2 h-11">
          <User className="h-4 w-4" />
          <span>Informações Pessoais</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2 h-11">
          <Shield className="h-4 w-4" />
          <span>Segurança & Privacidade</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2 h-11">
          <Bell className="h-4 w-4" />
          <span>Notificações</span>
        </TabsTrigger>
      </TabsList>

      {/* Aba de Informações Pessoais */}
      <TabsContent value="personal" className="space-y-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados Profissionais
            </CardTitle>
            <CardDescription>
              Mantenha suas informações médicas e de contato sempre atualizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm loading={loading} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba de Segurança */}
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-600" />
              Senha e Autenticação
            </CardTitle>
            <CardDescription>
              Configure sua senha e métodos de autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Senha</h4>
                  <p className="text-sm text-muted-foreground">
                    Última alteração há 2 meses
                  </p>
                </div>
                <button className="text-sm text-primary hover:underline">
                  Alterar senha
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Autenticação em dois fatores</h4>
                  <p className="text-sm text-muted-foreground">
                    Recomendado para maior segurança
                  </p>
                </div>
                <button className="text-sm text-primary hover:underline">
                  Configurar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Privacidade e Dados
            </CardTitle>
            <CardDescription>Controle como seus dados são utilizados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Compartilhamento de dados</h4>
                  <p className="text-sm text-muted-foreground">
                    Para melhorias da plataforma
                  </p>
                </div>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Analytics de uso</h4>
                  <p className="text-sm text-muted-foreground">
                    Dados anônimos para otimizações
                  </p>
                </div>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba de Notificações */}
      <TabsContent value="notifications" className="space-y-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Preferências de Notificação
            </CardTitle>
            <CardDescription>
              Configure como você quer receber atualizações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Email</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Novos demonstrativos processados</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Glosas detectadas</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relatórios semanais</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Aplicativo</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Push notifications</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sons de notificação</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
