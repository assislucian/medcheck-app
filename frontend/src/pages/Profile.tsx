import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  User,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Upload,
  Eye,
  EyeOff,
  Save,
  Shield,
  DollarSign,
  TrendingUp,
  Calendar,
  Camera,
  MapPin,
  Mail,
  Phone,
  Building,
  Stethoscope,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

interface BillingInfo {
  current_period: {
    start_date: string;
    end_date: string;
    guias_processadas: number;
    demonstrativos_processados: number;
    total_cost: number;
    plan: string;
    monthly_limit: number;
    usage_percentage: number;
  };
  usage_history: Array<{
    date: string;
    guias: number;
    demonstrativos: number;
    cost: number;
  }>;
  next_billing_date: string;
  payment_method: {
    type: string;
    last4: string;
    brand: string;
  };
}

interface UsageAnalytics {
  total_procedures_processed: number;
  this_month_procedures: number;
  daily_activity: Array<{
    date: string;
    uploads: number;
    procedures: number;
  }>;
  average_procedures_per_day: number;
  most_active_day: string;
  efficiency_score: number;
}

interface ProfileFormData {
  nome: string;
  email: string;
  specialty: string;
  hospital: string;
  phone: string;
  bio: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics | null>(null);
  const [spendingLimit, setSpendingLimit] = useState(30);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    nome: user?.name || '',
    email: user?.email || '',
    specialty: '',
    hospital: '',
    phone: '',
    bio: '',
  });

  // Carregar dados de billing e analytics
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [billingRes, analyticsRes, profileRes] = await Promise.all([
          axios.get('/api/v1/billing', { headers }),
          axios.get('/api/v1/usage-analytics', { headers }),
          axios.get('/api/v1/profile', { headers }),
        ]);

        setBillingInfo(billingRes.data);
        setUsageAnalytics(analyticsRes.data);

        // Atualizar dados do perfil
        setProfileData({
          nome: profileRes.data.nome || user?.name || '',
          email: profileRes.data.email || user?.email || '',
          specialty: profileRes.data.specialty || '',
          hospital: profileRes.data.hospital || '',
          phone: profileRes.data.phone || '',
          bio: profileRes.data.bio || '',
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do perfil');
      }
    };

    loadData();
  }, [user]);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/v1/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSpendingLimitUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/v1/billing/update-limit',
        { limit: spendingLimit },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Limite atualizado para R$ ${spendingLimit}`);
    } catch (error) {
      toast.error('Erro ao atualizar limite');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <AuthenticatedLayout title="Perfil">
      <Helmet>
        <title>Perfil | MedCheck</title>
        <meta
          name="description"
          content="Gerencie seu perfil médico, billing e configurações"
        />
      </Helmet>

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <Button
                size="sm"
                className="absolute -bottom-1 -right-1 rounded-full w-8 h-8"
                onClick={() => toast.info('Função de upload de avatar em breve')}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profileData.nome}</h1>
              <p className="text-gray-600">
                CRM {user?.crm}/{user?.uf}
              </p>
              <Badge variant="secondary" className="mt-2">
                <Stethoscope className="w-4 h-4 mr-1" />
                {profileData.specialty || 'Especialidade não informada'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Perfil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={profileData.nome}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, nome: e.target.value }))
                      }
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                      id="specialty"
                      value={profileData.specialty}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          specialty: e.target.value,
                        }))
                      }
                      placeholder="Ex: Cardiologia, Ortopedia"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hospital">Hospital/Clínica</Label>
                    <Input
                      id="hospital"
                      value={profileData.hospital}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          hospital: e.target.value,
                        }))
                      }
                      placeholder="Sua instituição principal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Biografia Profissional</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Conte um pouco sobre sua experiência e áreas de atuação..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleProfileUpdate} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>

            {/* Informações Imutáveis */}
            <Card>
              <CardHeader>
                <CardTitle>Dados de Registro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>CRM</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      <span className="text-gray-700">{user?.crm}</span>
                    </div>
                  </div>
                  <div>
                    <Label>UF</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      <span className="text-gray-700">{user?.uf}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Membro desde</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      <span className="text-gray-700">2024</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  CRM e UF são dados imutáveis por regulamentação médica.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Billing */}
          <TabsContent value="billing" className="space-y-6">
            {billingInfo && (
              <>
                {/* Plano Atual */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Plano {billingInfo.current_period.plan}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">
                          {formatCurrency(billingInfo.current_period.total_cost)}
                        </span>
                        <span className="text-gray-500">
                          / {formatCurrency(spendingLimit)} limite mensal
                        </span>
                      </div>

                      <Progress
                        value={
                          (billingInfo.current_period.total_cost / spendingLimit) * 100
                        }
                        className="w-full"
                      />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Guias processadas</p>
                          <p className="font-semibold">
                            {billingInfo.current_period.guias_processadas}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Demonstrativos</p>
                          <p className="font-semibold">
                            {billingInfo.current_period.demonstrativos_processados}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Limite de Gastos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Limite de Gastos Mensal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="spending-limit">R$</Label>
                      <Input
                        id="spending-limit"
                        type="number"
                        value={spendingLimit}
                        onChange={(e) => setSpendingLimit(Number(e.target.value))}
                        className="w-32"
                        min="10"
                        max="10000"
                      />
                      <Button onClick={handleSpendingLimitUpdate} size="sm">
                        Atualizar
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Defina um limite mensal para controlar seus gastos com
                      processamento.
                    </p>
                  </CardContent>
                </Card>

                {/* Próxima Fatura */}
                <Card>
                  <CardHeader>
                    <CardTitle>Próxima Fatura</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">
                          {formatCurrency(billingInfo.current_period.total_cost)}
                        </p>
                        <p className="text-gray-600">
                          Vencimento:{' '}
                          {new Date(billingInfo.next_billing_date).toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Método de pagamento</p>
                        <p className="font-medium">
                          {billingInfo.payment_method.brand} ••••{' '}
                          {billingInfo.payment_method.last4}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Tab: Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            {usageAnalytics && (
              <>
                {/* Estatísticas Gerais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {usageAnalytics.total_procedures_processed}
                          </p>
                          <p className="text-gray-600">Total processado</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {usageAnalytics.this_month_procedures}
                          </p>
                          <p className="text-gray-600">Este mês</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {usageAnalytics.average_procedures_per_day}
                          </p>
                          <p className="text-gray-600">Média/dia</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Score de Eficiência */}
                <Card>
                  <CardHeader>
                    <CardTitle>Score de Eficiência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">
                          {usageAnalytics.efficiency_score}%
                        </span>
                        <Badge
                          variant={
                            usageAnalytics.efficiency_score >= 80
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {usageAnalytics.efficiency_score >= 80 ? 'Excelente' : 'Bom'}
                        </Badge>
                      </div>
                      <Progress
                        value={usageAnalytics.efficiency_score}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-600">
                        Baseado no volume de processamento e consistência de uso.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Atividade Recente */}
                <Card>
                  <CardHeader>
                    <CardTitle>Atividade dos Últimos 30 Dias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {usageAnalytics.daily_activity.slice(-7).map((day, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                        >
                          <span className="text-sm font-medium">{day.date}</span>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{day.uploads} uploads</span>
                            <span>{day.procedures} procedimentos</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="settings" className="space-y-6">
            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite uma nova senha"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Atualizar Senha
                </Button>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por E-mail</p>
                    <p className="text-sm text-gray-600">
                      Receber updates sobre processamento
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Limite</p>
                    <p className="text-sm text-gray-600">
                      Avisar quando atingir 80% do limite mensal
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Relatórios Mensais</p>
                    <p className="text-sm text-gray-600">Resumo mensal da atividade</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* LGPD */}
            <Card>
              <CardHeader>
                <CardTitle>Privacidade e Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Seus dados estão protegidos conforme a LGPD. Você pode solicitar
                  relatórios ou exclusão a qualquer momento.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Baixar Meus Dados
                  </Button>
                  <Button variant="outline">Excluir Conta</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default Profile;
