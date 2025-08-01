import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Search,
  RefreshCw,
  Calendar,
  User,
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  Shield,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Helmet } from 'react-helmet-async';

interface ActivityLog {
  id: string;
  action: string;
  target: Record<string, any> | null;
  result: string | null;
  details: string | null;
  timestamp: string;
  crm: string;
  ip: string | null;
  risk_level: string | null;
  impact_score: number | null;
  tags: string[] | null;
  duration: number | null;
  compliance_flags: string[] | null;
}

interface ActivityStats {
  total_activities: number;
  today_activities: number;
  high_risk_activities: number;
  failed_activities: number;
  most_common_action: string;
  average_session_duration: number;
}

const NotificationsPage = () => {
  usePageTitle({
    title: 'Atividades do Sistema',
    description: 'Monitoramento em tempo real das atividades do sistema e auditoria de ações',
    keywords: 'log de atividades, auditoria, monitoramento, segurança, atividades sistema',
  });

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Tempo real profissional
  const { isConnected, triggerUpdate } = useRealTimeSync({
    onActivityUpdate: () => {
      console.log('🔄 Tempo real: atualizando atividades...');
      loadActivities(true);
    },
    onDataChange: (event) => {
      if (
        event.type.includes('activity') ||
        event.type.includes('delete') ||
        event.type.includes('upload')
      ) {
        console.log('📡 Evento tempo real recebido:', event.type);
        loadActivities(true);
      }
    },
  });

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, searchTerm, actionFilter, riskFilter, dateFilter, sortOrder]);

  const loadActivities = async (showToast = false) => {
    try {
      setLoading(showToast ? false : true);
      setRefreshing(showToast);

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/activity-logs?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const activityData = response.data.activities || [];
      setActivities(activityData);

      // Calcular estatísticas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const todayActivities = activityData.filter(
        (activity: ActivityLog) => new Date(activity.timestamp) >= today
      );

      const highRiskActivities = activityData.filter(
        (activity: ActivityLog) => activity.risk_level === 'high'
      );

      const failedActivities = activityData.filter(
        (activity: ActivityLog) =>
          activity.result === 'error' || activity.result === 'failed'
      );

      const actionCounts = activityData.reduce(
        (acc: Record<string, number>, activity: ActivityLog) => {
          acc[activity.action] = (acc[activity.action] || 0) + 1;
          return acc;
        },
        {}
      );

      const mostCommonAction = Object.entries(actionCounts).reduce(
        (a, b) => (actionCounts[a[0]] > actionCounts[b[0]] ? a : b),
        ['', 0]
      )[0];

      const avgDuration =
        activityData.reduce(
          (acc: number, activity: ActivityLog) => acc + (activity.duration || 0),
          0
        ) / activityData.length;

      setStats({
        total_activities: activityData.length,
        today_activities: todayActivities.length,
        high_risk_activities: highRiskActivities.length,
        failed_activities: failedActivities.length,
        most_common_action: mostCommonAction,
        average_session_duration: avgDuration || 0,
      });

      if (showToast) {
        toast.success('Atividades atualizadas!', {
          description: `${activityData.length} registros carregados`,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar atividades', {
        description: 'Não foi possível carregar o log de atividades',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.target?.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por ação
    if (actionFilter !== 'all') {
      filtered = filtered.filter((activity) => activity.action === actionFilter);
    }

    // Filtro por risco
    if (riskFilter !== 'all') {
      filtered = filtered.filter((activity) => activity.risk_level === riskFilter);
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = new Date();
      let dateThreshold: Date;

      switch (dateFilter) {
        case 'today':
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = new Date(0);
      }

      filtered = filtered.filter(
        (activity) => new Date(activity.timestamp) >= dateThreshold
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredActivities(filtered);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'upload_guia':
      case 'upload_demonstrativo':
        return <FileText className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'delete_guia':
      case 'delete_demonstrativo':
        return <Trash2 className="h-4 w-4" />;
      case 'view_demonstrativo':
      case 'view_guia':
        return <FileText className="h-4 w-4" />;
      case 'login':
        return <User className="h-4 w-4" />;
      case 'export':
        return <Download className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const renderActivityDetails = (activity: ActivityLog) => {
    const target = activity.target;
    const action = activity.action.toLowerCase();
    
    if (!target || Object.keys(target).length === 0) {
      return getDefaultMessage(action);
    }

    switch (action) {
      case 'upload_guia':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-700">📎 {target.arquivo}</span>
            </div>
            {target.procedimentos && (
              <div className="text-xs text-gray-500">
                {target.procedimentos} procedimento(s) processado(s)
              </div>
            )}
          </div>
        );
        
      case 'upload_demonstrativo':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-700">📊 {target.arquivo}</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              {target.período && <span>📅 {target.período}</span>}
              {target.total_procedimentos && <span>🔢 {target.total_procedimentos} procedimentos</span>}
            </div>
          </div>
        );
        
      case 'delete_guia':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-red-700">🗑️ Guia #{target.guia}</span>
              {target.resultado === 'success' && (
                <Badge className="bg-red-100 text-red-800 text-xs">Excluída</Badge>
              )}
            </div>
          </div>
        );
        
      case 'login_success':
        return (
          <span className="text-green-600 font-medium">🎉 Bem-vindo ao sistema!</span>
        );
        
      case 'login_failed':
        return (
          <span className="text-red-600 font-medium">⚠️ Credenciais inválidas</span>
        );
        
      case 'register':
        return (
          <span className="text-blue-600 font-medium">🎊 Conta criada com sucesso!</span>
        );
        
      default:
        if (typeof activity.details === 'string') {
          return activity.details;
        }
        return target.arquivo ? (
          <span className="font-medium text-gray-700">📁 {target.arquivo}</span>
        ) : (
          getDefaultMessage(action)
        );
    }
  };

  const getDefaultMessage = (action: string) => {
    switch (action) {
      case 'login':
      case 'login_success':
        return '🔐 Sessão iniciada com segurança';
      case 'login_failed':
        return '🚫 Tentativa de acesso negada';
      case 'register':
        return '📝 Novo usuário registrado';
      default:
        return '✨ Atividade realizada com sucesso';
    }
  };

  const getResultBadge = (activity: ActivityLog) => {
    const isFailure = activity.action.includes('failed') || activity.result === 'error';
    const isSuccess = activity.result === 'success' || activity.action.includes('success');
    const isLogin = activity.action.toLowerCase().includes('login');
    const isUpload = activity.action.toLowerCase().includes('upload');
    const isDelete = activity.action.toLowerCase().includes('delete');
    
    if (isFailure) {
      return (
        <Badge variant="destructive" className="text-xs">
          ❌ Falha
        </Badge>
      );
    }
    
    if (isSuccess || isLogin) {
      return (
        <Badge className="bg-green-100 text-green-800 text-xs">
          ✅ Sucesso
        </Badge>
      );
    }
    
    if (isUpload) {
      return (
        <Badge className="bg-blue-100 text-blue-800 text-xs">
          📤 Enviado
        </Badge>
      );
    }
    
    if (isDelete) {
      return (
        <Badge className="bg-orange-100 text-orange-800 text-xs">
          🗑️ Removido
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-xs">
        ℹ️ Info
      </Badge>
    );
  };

  const formatActionName = (action: string) => {
    const actionMap: Record<string, string> = {
      upload_guia: '📄 Guia médica enviada',
      upload_demonstrativo: '📊 Demonstrativo enviado',
      delete_guia: '🗑️ Guia médica excluída',
      delete_demonstrativo: '🗑️ Demonstrativo excluído',
      view_demonstrativo: '👀 Demonstrativo visualizado',
      view_guia: '👀 Guia médica visualizada',
      login: '✅ Login realizado',
      login_success: '✅ Acesso autorizado',
      login_failed: '❌ Falha no login',
      export: '📤 Dados exportados',
      register: '👤 Novo cadastro realizado',
      validate: '✅ Dados validados',
      crosscheck: '🔄 Cruzamento realizado',
    };

    return (
      actionMap[action] ||
      action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setRiskFilter('all');
    setDateFilter('all');
  };

  const uniqueActions = Array.from(new Set(activities.map((a) => a.action)));

  const headerActions = (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => loadActivities(true)}
        disabled={refreshing}
        className="bg-white/80 backdrop-blur-sm border-gray-200/60"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
    </div>
  );

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Atividades do Sistema | MedCheck</title>
          <meta
            name="description"
            content="Monitoramento em tempo real das atividades do sistema e auditoria de ações"
          />
        </Helmet>

        <AuthenticatedLayout
          title="Atividades do Sistema"
          description="Monitoramento e auditoria de ações"
          isLoading={true}
          loadingMessage="Carregando log de atividades..."
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Atividades do Sistema | MedCheck</title>
        <meta
          name="description"
          content="Monitoramento em tempo real das atividades do sistema e auditoria de ações"
        />
        <meta
          name="keywords"
          content="log de atividades, auditoria, monitoramento, segurança, atividades sistema"
        />

        {/* Open Graph */}
        <meta property="og:title" content="Atividades do Sistema | MedCheck" />
        <meta
          property="og:description"
          content="Monitoramento e auditoria de atividades"
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <AuthenticatedLayout
        title="Atividades do Sistema"
        description="Monitoramento e auditoria de ações realizadas no sistema"
      >
        <div className="space-y-6">
          {/* Card Principal */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-medical-600" />
                    Log de Atividades
                    {stats && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {stats.total_activities} registros
                      </Badge>
                    )}
                    {isConnected && (
                      <div className="flex items-center gap-1 ml-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-700">Tempo Real</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {filteredActivities.length} atividades encontradas
                    {stats && stats.today_activities > 0 && (
                      <span className="ml-2 text-brand-600">
                        • {stats.today_activities} hoje
                      </span>
                    )}
                  </CardDescription>
                </div>

                <Button
                  onClick={() => loadActivities(true)}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                  />
                  Atualizar
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Filtros Simplificados */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar atividades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    <SelectItem value="upload">Upload</SelectItem>
                    <SelectItem value="download">Download</SelectItem>
                    <SelectItem value="delete">Exclusão</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todo período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo período</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Atividades */}
              <div className="space-y-3">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            {getActionIcon(activity.action)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatActionName(activity.action)}
                            </p>
                            <div className="text-sm text-gray-600">
                              {renderActivityDetails(activity)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                          <div className="mt-1">
                            {getResultBadge(activity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma atividade encontrada
                    </h3>
                    <p className="text-gray-600">
                      Tente ajustar os filtros ou aguarde novas atividades do sistema.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default NotificationsPage;
