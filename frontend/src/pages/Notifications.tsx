import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
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
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  Filter,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRealTimeSync, REAL_TIME_EVENTS } from '@/hooks/useRealTimeSync';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    title: 'Log de Atividades',
    description:
      'Monitoramento em tempo real das atividades do sistema e auditoria de ações',
    keywords:
      'log de atividades, auditoria, monitoramento, segurança, atividades sistema',
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

      const mostCommonAction =
        Object.entries(actionCounts).length > 0
          ? Object.entries(actionCounts).reduce((a, b) =>
              actionCounts[a[0]] > actionCounts[b[0]] ? a : b
            )[0]
          : 'N/A';

      const avgDuration =
        activityData
          .filter((a: ActivityLog) => a.duration !== null)
          .reduce((acc: number, a: ActivityLog) => acc + (a.duration || 0), 0) /
          activityData.filter((a: ActivityLog) => a.duration !== null).length || 0;

      setStats({
        total_activities: activityData.length,
        today_activities: todayActivities.length,
        high_risk_activities: highRiskActivities.length,
        failed_activities: failedActivities.length,
        most_common_action: mostCommonAction,
        average_session_duration: avgDuration,
      });

      if (showToast) {
        toast.success('Atividades atualizadas com sucesso');
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar log de atividades');
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
        return <Upload className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'delete_guia':
      case 'delete_demonstrativo':
        return <Trash2 className="h-4 w-4" />;
      case 'view_demonstrativo':
      case 'view_guia':
        return <Eye className="h-4 w-4" />;
      case 'login':
        return <User className="h-4 w-4" />;
      case 'export':
        return <Download className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getResultBadge = (result: string | null, riskLevel: string | null) => {
    if (riskLevel === 'high') {
      return (
        <Badge variant="destructive" className="text-xs">
          Alto Risco
        </Badge>
      );
    }

    switch (result) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
            Sucesso
          </Badge>
        );
      case 'error':
      case 'failed':
        return (
          <Badge variant="destructive" className="text-xs">
            Erro
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
            Aviso
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Info
          </Badge>
        );
    }
  };

  const formatActionName = (action: string) => {
    const actionMap: Record<string, string> = {
      upload_guia: 'Upload de Guia',
      upload_demonstrativo: 'Upload de Demonstrativo',
      delete_guia: 'Exclusão de Guia',
      delete_demonstrativo: 'Exclusão de Demonstrativo',
      view_demonstrativo: 'Visualização de Demonstrativo',
      view_guia: 'Visualização de Guia',
      login: 'Login no Sistema',
      export: 'Exportação de Dados',
      validate: 'Validação de Dados',
      crosscheck: 'Cruzamento de Dados',
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
      <StandardPageLayout
        title="Log de Atividades"
        description="Carregando histórico de atividades..."
        category="Sistema & Suporte"
        categoryIcon={<Activity className="h-5 w-5" />}
        categoryColor="blue"
        actions={headerActions}
        className="from-blue-50/30 via-white to-green-50/20"
      >
        <div className="space-y-6">
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-lg text-gray-600">Carregando log de atividades...</p>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title="Log de Atividades"
      description="Monitoramento em tempo real das atividades do sistema e auditoria de ações realizadas"
      category="Sistema & Suporte"
      categoryIcon={<Activity className="h-5 w-5" />}
      categoryColor="blue"
      actions={headerActions}
      className="from-blue-50/30 via-white to-green-50/20"
    >
      <div className="space-y-8">

        {/* Estatísticas */}
        {stats && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total de Atividades</p>
                    <p className="text-2xl font-bold">{stats.total_activities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Hoje</p>
                    <p className="text-2xl font-bold">{stats.today_activities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Alto Risco</p>
                    <p className="text-2xl font-bold">{stats.high_risk_activities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Erros</p>
                    <p className="text-2xl font-bold">{stats.failed_activities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {formatActionName(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os riscos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os riscos</SelectItem>
                  <SelectItem value="low">Baixo risco</SelectItem>
                  <SelectItem value="medium">Médio risco</SelectItem>
                  <SelectItem value="high">Alto risco</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Atividades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Atividades ({filteredActivities.length})</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigas'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredActivities.length > 0 ? (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-gray-100">
                          {getActionIcon(activity.action)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {formatActionName(activity.action)}
                            </h4>
                            {getResultBadge(activity.result, activity.risk_level)}
                          </div>
                          {activity.details && (
                            <p className="text-sm text-muted-foreground">
                              {activity.details}
                            </p>
                          )}
                          {activity.target && (
                            <div className="text-xs text-muted-foreground">
                              {activity.target.tipo && (
                                <span className="font-medium">Tipo: </span>
                              )}
                              {activity.target.tipo}
                              {activity.target.arquivo && (
                                <span className="ml-2">
                                  <span className="font-medium">Arquivo: </span>
                                  {activity.target.arquivo}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                        <div className="text-xs">
                          {new Date(activity.timestamp).toLocaleString('pt-BR')}
                        </div>
                        {activity.duration && (
                          <div className="text-xs">Duração: {activity.duration}ms</div>
                        )}
                      </div>
                    </div>

                    {/* Tags e informações adicionais */}
                    {(activity.tags?.length > 0 ||
                      activity.compliance_flags?.length > 0) && (
                      <div className="flex flex-wrap gap-2">
                        {activity.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {activity.compliance_flags?.map((flag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800"
                          >
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Informações de segurança */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>CRM: {activity.crm}</span>
                        {activity.ip && <span>IP: {activity.ip}</span>}
                        {activity.impact_score !== null && (
                          <span>Impact: {activity.impact_score}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {activities.length === 0
                    ? 'Pronto para registrar suas atividades!'
                    : 'Nenhuma atividade encontrada'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {activities.length === 0
                    ? 'Suas ações no sistema (como upload, exclusão de guias, etc.) aparecerão aqui automaticamente.'
                    : 'Tente ajustar os filtros para ver mais resultados.'}
                </p>
                {activities.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      💡 <strong>Dica:</strong> Experimente fazer upload de uma guia ou
                      demonstrativo para ver como funciona!
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default NotificationsPage;
