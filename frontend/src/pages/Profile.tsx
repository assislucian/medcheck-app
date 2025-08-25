import axios from 'axios';
import {
  BarChart3,
  Building,
  Calendar,
  Camera,
  CreditCard,
  Eye,
  EyeOff,
  Save,
  Settings,
  Shield,
  Stethoscope,
  TrendingUp,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/auth/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatCurrency } from '../utils/format';

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
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/billing`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/usage-analytics`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/profile`, { headers }),
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
    <>
      {/* Background com Gradiente Médico Consistente */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50/30 via-gray-50/20 to-blue-50/30">
        <AuthenticatedLayout
          title="Meu Perfil"
          description="Dados profissionais e configurações"
        >
          <div className="space-y-12 px-4 sm:px-6 lg:px-8 max-w-full overflow-hidden">
            {/* Header Discreto Seguindo Padrão Dashboard */}
            <section className="text-center space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-blue-100 border border-slate-200/50">
                <User className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-medium text-slate-800">
                  Configurações da conta
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-gray-800 bg-clip-text text-transparent">
                Meu Perfil
              </h1>

              <p className="text-sm text-gray-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Gerencie seus dados profissionais e configurações da plataforma
              </p>
            </section>

            {/* Card de Informações do Usuário - Simplificado */}
            <section className="max-w-7xl mx-auto">
              <Card className="border-0 shadow-sm bg-white/90">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                        Dr(a). {profileData.nome || user?.name || 'Nome não informado'}
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          CRM {user?.crm}/{user?.uf}
                        </span>
                        {profileData.specialty && (
                          <span className="text-sm text-gray-600">
                            • {profileData.specialty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Tabs Simplificadas */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-gray-50/50">
                      <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <User className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Perfil</span>
                      </TabsTrigger>
                      <TabsTrigger value="billing" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Billing</span>
                      </TabsTrigger>
                      <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Analytics</span>
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Settings className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Ajustes</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab: Perfil */}
                    <TabsContent value="profile" className="p-6 space-y-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            Informações Profissionais
                          </h3>
                          <p className="text-sm text-gray-600">
                            Mantenha seus dados atualizados
                          </p>
                        </div>
                        
                        <div className="space-y-4">
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

                        
                        <div className="pt-6 border-t">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Dados de Registro
                              </h4>
                              <p className="text-sm text-gray-500">
                                Informações do conselho profissional
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>CRM {user?.crm}/{user?.uf}</span>
                              <span>•</span>
                              <span>Membro desde 2024</span>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button onClick={handleProfileUpdate} disabled={loading} size="sm">
                              <Save className="w-4 h-4 mr-2" />
                              {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                          </div>
                        </div>
                      </div>
                      </div>
                    </TabsContent>

                    {/* Tab: Billing */}
                    <TabsContent value="billing" className="p-6 space-y-6">
                      {billingInfo ? (
                        <div className="space-y-6">
                          {/* Plano Atual */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  Plano {billingInfo?.current_period?.plan || 'N/A'}
                                </h3>
                                <p className="text-sm text-gray-600">Período atual de faturamento</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Ativo
                              </Badge>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-semibold text-gray-900">
                                  {formatCurrency(
                                    billingInfo?.current_period?.total_cost || 0
                                  )}
                                </span>
                                <span className="text-sm text-gray-600">
                                  de {formatCurrency(spendingLimit)} limite
                                </span>
                              </div>

                              <Progress
                                value={
                                  (billingInfo?.current_period?.total_cost /
                                    spendingLimit) *
                                  100
                                }
                                className="h-2"
                              />

                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                  <p className="text-sm text-gray-600">Guias processadas</p>
                                  <p className="text-lg font-medium">
                                    {billingInfo?.current_period?.guias_processadas || 0}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Demonstrativos</p>
                                  <p className="text-lg font-medium">
                                    {
                                      billingInfo?.current_period
                                        ?.demonstrativos_processados || 0
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Limite de Gastos */}
                          <div className="border-t pt-6">
                            <h4 className="text-base font-medium text-gray-900 mb-4">
                              Limite de Gastos Mensal
                            </h4>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">R$</span>
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
                              <Button onClick={handleSpendingLimitUpdate} size="sm" variant="outline">
                                Atualizar limite
                              </Button>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              Receba alertas ao atingir 80% do limite
                            </p>
                          </div>

                          {/* Próxima Fatura */}
                          <div className="border-t pt-6">
                            <h4 className="text-base font-medium text-gray-900 mb-4">
                              Próxima Fatura
                            </h4>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-semibold text-gray-900">
                                  {formatCurrency(
                                    billingInfo?.current_period?.total_cost || 0
                                  )}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Vencimento:{' '}
                                  {billingInfo?.next_billing_date
                                    ? new Date(
                                      billingInfo.next_billing_date
                                    ).toLocaleDateString('pt-BR')
                                    : 'N/A'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  {billingInfo?.payment_method?.brand || 'Cartão'} •••• {billingInfo?.payment_method?.last4 || '0000'}
                                </p>
                                <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                                  Alterar método
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p>Informações de billing não disponíveis</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Tab: Analytics */}
                    <TabsContent value="analytics" className="p-6 space-y-6">
                      {usageAnalytics ? (
                        <div className="space-y-6">
                          {/* Estatísticas Gerais */}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Estatísticas de Uso
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 rounded">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-2xl font-semibold">
                                      {usageAnalytics.total_procedures_processed}
                                    </p>
                                    <p className="text-sm text-gray-600">Total processado</p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-green-100 rounded">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-2xl font-semibold">
                                      {usageAnalytics.this_month_procedures}
                                    </p>
                                    <p className="text-sm text-gray-600">Este mês</p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-100 rounded">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-2xl font-semibold">
                                      {usageAnalytics.average_procedures_per_day}
                                    </p>
                                    <p className="text-sm text-gray-600">Média/dia</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Score de Eficiência */}
                          <div className="border-t pt-6">
                            <h4 className="text-base font-medium text-gray-900 mb-4">
                              Score de Eficiência
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-semibold">
                                  {usageAnalytics.efficiency_score}%
                                </span>
                                <span className={`text-sm font-medium ${
                                  usageAnalytics.efficiency_score >= 80
                                    ? 'text-green-700'
                                    : 'text-gray-700'
                                }`}>
                                  {usageAnalytics.efficiency_score >= 80
                                    ? 'Excelente'
                                    : 'Bom'}
                                </span>
                              </div>
                              <Progress
                                value={usageAnalytics.efficiency_score}
                                className="h-2 mb-2"
                              />
                              <p className="text-sm text-gray-600">
                                Baseado no volume e consistência de uso
                              </p>
                            </div>
                          </div>

                          {/* Atividade Recente */}
                          <div className="border-t pt-6">
                            <h4 className="text-base font-medium text-gray-900 mb-4">
                              Atividade Recente
                            </h4>
                            <div className="space-y-2">
                              {usageAnalytics.daily_activity
                                .slice(-7)
                                .map((day, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors"
                                  >
                                    <span className="text-sm font-medium text-gray-700">
                                      {day.date}
                                    </span>
                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                      <span>{day.uploads} uploads</span>
                                      <span>{day.procedures} procedimentos</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p>Dados de analytics não disponíveis</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Tab: Configurações */}
                    <TabsContent value="settings" className="p-6 space-y-6">
                      <div className="space-y-6">
                        {/* Segurança */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Segurança
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="new-password" className="text-sm">
                                Alterar senha
                              </Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  id="new-password"
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Nova senha"
                                  className="max-w-xs"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="shrink-0"
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Shield className="w-4 h-4 mr-2" />
                              Atualizar Senha
                            </Button>
                          </div>
                        </div>

                        {/* Notificações */}
                        <div className="border-t pt-6">
                          <h4 className="text-base font-medium text-gray-900 mb-4">
                            Notificações
                          </h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Notificações por E-mail
                                </p>
                                <p className="text-sm text-gray-500">
                                  Updates sobre processamento
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Alertas de Limite
                                </p>
                                <p className="text-sm text-gray-500">
                                  Avisar ao atingir 80% do limite
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Relatórios Mensais
                                </p>
                                <p className="text-sm text-gray-500">
                                  Resumo da atividade mensal
                                </p>
                              </div>
                              <Switch />
                            </div>
                          </div>
                        </div>

                        {/* LGPD */}
                        <div className="border-t pt-6">
                          <h4 className="text-base font-medium text-gray-900 mb-4">
                            Privacidade e Dados
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Seus dados estão protegidos conforme a LGPD. Você pode
                            solicitar relatórios ou exclusão a qualquer momento.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Baixar Meus Dados
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Excluir Conta
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </section>
          </div>
        </AuthenticatedLayout>
      </div>
    </>
  );
};

export default Profile;


