import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { Helmet } from 'react-helmet-async';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
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
  Eye,
  EyeOff,
  Save,
  Shield,
  DollarSign,
  TrendingUp,
  Calendar,
  Camera,
  Building,
  Stethoscope,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { formatCurrency } from '../utils/format';
import { usePageTitle } from '../hooks/usePageTitle';

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

  // SEO e Título Premium
  usePageTitle({
    title: 'Meu Perfil Médico',
    description:
      'Gerencie seu perfil profissional, configurações e estatísticas de uso',
    keywords:
      'perfil médico, configurações médicas, dados profissionais, estatísticas uso',
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
      await axios.patch(
        '/api/v1/billing/spending-limit',
        { limit: spendingLimit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Limite de gastos atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar limite de gastos');
    }
  };

  return (
    <AuthenticatedLayout
      title="Meu Perfil Médico"
      description="Gerencie seus dados profissionais e configurações pessoais"
    >
      <Helmet>
        <title>Meu Perfil Médico | MedCheck</title>
        <meta
          name="description"
          content="Gerencie seu perfil profissional, configurações e estatísticas de uso"
        />
        <meta
          name="keywords"
          content="perfil médico, configurações médicas, dados profissionais, estatísticas uso"
        />

        {/* Open Graph */}
        <meta property="og:title" content="Meu Perfil Médico | MedCheck" />
        <meta
          property="og:description"
          content="Gestão completa do perfil profissional médico"
        />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Background com Gradiente Médico */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50/30 via-gray-50/20 to-blue-50/30">
        <div className="space-y-8 px-4 sm:px-6 lg:px-8">
          {/* Header Discreto Seguindo Padrão Dashboard */}
          <div className="text-center space-y-3 pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-blue-100 border border-slate-200/50">
              <User className="h-4 w-4 text-slate-700" />
              <span className="text-xs font-medium text-slate-800">
                Perfil profissional
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-gray-800 bg-clip-text text-transparent">
              Meu Perfil Médico
            </h1>

            <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
              Gerencie seus dados profissionais, configurações e estatísticas de uso
              da plataforma
            </p>
          </div>
          
          {/* Card Principal com Avatar e Tabs */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-xl">
              <CardHeader className="pb-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center border border-slate-200">
                      <User className="w-10 h-10 text-slate-700" />
                    </div>
                    <Button
                      size="sm"
                      className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 bg-slate-600 hover:bg-slate-700"
                      onClick={() => toast.info('Função de upload de avatar em breve')}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                      Dr(a). {profileData.nome || user?.name || 'Nome não informado'}
                    </CardTitle>
                    <CardDescription className="text-gray-600 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        CRM {user?.crm}/{user?.uf}
                      </Badge>
                      {profileData.specialty && (
                        <Badge variant="secondary" className="text-xs">
                          <Stethoscope className="w-3 h-3 mr-1" />
                          {profileData.specialty}
                        </Badge>
                      )}
                      {profileData.hospital && (
                        <Badge variant="outline" className="text-xs">
                          <Building className="w-3 h-3 mr-1" />
                          {profileData.hospital}
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Tabs Simplificadas */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100/60">
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
                        <CardDescription>
                          Mantenha seus dados profissionais atualizados
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nome">Nome Completo</Label>
                            <Input
                              id="nome"
                              value={profileData.nome}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  nome: e.target.value,
                                }))
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
                                setProfileData((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
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
                                setProfileData((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
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
                              setProfileData((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }))
                            }
                            placeholder="Conte um pouco sobre sua experiência e áreas de atuação..."
                            rows={4}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Dados de Registro
                            </h4>
                            <p className="text-sm text-gray-500">
                              Informações imutáveis por regulamentação médica
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">CRM {user?.crm}</Badge>
                            <Badge variant="outline">UF {user?.uf}</Badge>
                            <Badge variant="secondary">Membro desde 2024</Badge>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={handleProfileUpdate} disabled={loading}>
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                          </Button>
                        </div>
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
                              <CardTitle>
                                Plano {billingInfo.current_period.plan}
                              </CardTitle>
                              <Badge className="bg-green-100 text-green-800">
                                Ativo
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-medium">
                                  {formatCurrency(
                                    billingInfo.current_period.total_cost
                                  )}
                                </span>
                                <span className="text-gray-500">
                                  / {formatCurrency(spendingLimit)} limite mensal
                                </span>
                              </div>

                              <Progress
                                value={
                                  (billingInfo.current_period.total_cost /
                                    spendingLimit) *
                                  100
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
                                    {
                                      billingInfo.current_period
                                        .demonstrativos_processados
                                    }
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
                                onChange={(e) =>
                                  setSpendingLimit(Number(e.target.value))
                                }
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
                                  {formatCurrency(
                                    billingInfo.current_period.total_cost
                                  )}
                                </p>
                                <p className="text-gray-600">
                                  Vencimento:{' '}
                                  {new Date(
                                    billingInfo.next_billing_date
                                  ).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  Método de pagamento
                                </p>
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
                                  {usageAnalytics.efficiency_score >= 80
                                    ? 'Excelente'
                                    : 'Bom'}
                                </Badge>
                              </div>
                              <Progress
                                value={usageAnalytics.efficiency_score}
                                className="w-full"
                              />
                              <p className="text-sm text-gray-600">
                                Baseado no volume de processamento e consistência de
                                uso.
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
                              {usageAnalytics.daily_activity
                                .slice(-7)
                                .map((day, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                                  >
                                    <span className="text-sm font-medium">
                                      {day.date}
                                    </span>
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
                            <p className="text-sm text-gray-600">
                              Resumo mensal da atividade
                            </p>
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
                          Seus dados estão protegidos conforme a LGPD. Você pode
                          solicitar relatórios ou exclusão a qualquer momento.
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
              </CardContent>
            </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Profile;
