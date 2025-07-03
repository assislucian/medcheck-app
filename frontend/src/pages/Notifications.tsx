import React, { useState, useEffect } from 'react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { Button } from '@/components/ui/button';
import {
  Activity,
  CheckCircle,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Trash2,
  Edit,
  UserPlus,
  Settings,
  DollarSign,
  FileBarChart,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  XCircle,
  Info,
  BarChart2,
  User,
  Shield,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';

// Tipos de atividade mais realísticos para sistema médico
type ActivityType =
  | 'upload'
  | 'analysis'
  | 'payment'
  | 'gloss'
  | 'contest'
  | 'export'
  | 'profile'
  | 'settings'
  | 'login'
  | 'system';

interface ActivityLog {
  id: string;
  type: ActivityType;
  action: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details?: string;
  value?: number;
  entity?: string; // guia, demonstrativo, etc
}

interface ActivityLogsResponse {
  activities: ActivityLog[];
  total: number;
  user_crm: string;
  generated_at: string;
}

// Função para obter ícone baseado no tipo de atividade
const getActivityIcon = (type: ActivityType, status: string) => {
  const iconProps = { className: 'h-4 w-4' };

  switch (type) {
    case 'upload':
      return (
        <Upload
          {...iconProps}
          className={`h-4 w-4 ${
            status === 'success' ? 'text-blue-500' : 'text-gray-500'
          }`}
        />
      );
    case 'analysis':
      return (
        <FileBarChart
          {...iconProps}
          className={`h-4 w-4 ${
            status === 'success'
              ? 'text-green-500'
              : status === 'warning'
                ? 'text-amber-500'
                : 'text-blue-500'
          }`}
        />
      );
    case 'payment':
      return <DollarSign {...iconProps} className="h-4 w-4 text-green-500" />;
    case 'gloss':
      return <AlertTriangle {...iconProps} className="h-4 w-4 text-red-500" />;
    case 'contest':
      return <FileText {...iconProps} className="h-4 w-4 text-blue-500" />;
    case 'export':
      return <Download {...iconProps} className="h-4 w-4 text-purple-500" />;
    case 'profile':
      return <Edit {...iconProps} className="h-4 w-4 text-indigo-500" />;
    case 'login':
      return <UserPlus {...iconProps} className="h-4 w-4 text-green-500" />;
    case 'settings':
      return <Settings {...iconProps} className="h-4 w-4 text-gray-500" />;
    case 'system':
      return <Activity {...iconProps} className="h-4 w-4 text-gray-500" />;
    default:
      return <Activity {...iconProps} className="h-4 w-4 text-gray-500" />;
  }
};

// Colunas do DataGrid
const activityColumns = [
  {
    field: 'activity',
    headerName: 'Atividade',
    flex: 1,
    renderCell: ({ row }: { row: ActivityLog }) => (
      <div className="flex items-start gap-3 py-2">
        <div className="mt-1">{getActivityIcon(row.type, row.status)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{row.action}</span>
            <Badge
              variant={
                row.status === 'success'
                  ? 'default'
                  : row.status === 'warning'
                    ? 'secondary'
                    : row.status === 'error'
                      ? 'destructive'
                      : 'outline'
              }
              className="text-xs"
            >
              {row.status === 'success'
                ? 'Sucesso'
                : row.status === 'warning'
                  ? 'Atenção'
                  : row.status === 'error'
                    ? 'Erro'
                    : 'Info'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-1">{row.description}</p>
          {row.details && <p className="text-xs text-gray-500">{row.details}</p>}
          {row.entity && (
            <div className="flex items-center gap-1 mt-1">
              <FileText className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{row.entity}</span>
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    field: 'value',
    headerName: 'Valor',
    width: 120,
    renderCell: ({ row }: { row: ActivityLog }) =>
      row.value ? (
        <div className="text-right">
          <span
            className={`font-medium ${
              row.type === 'payment'
                ? 'text-green-600'
                : row.type === 'gloss'
                  ? 'text-red-600'
                  : 'text-blue-600'
            }`}
          >
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(row.value)}
          </span>
        </div>
      ) : null,
  },
  {
    field: 'timestamp',
    headerName: 'Quando',
    width: 150,
    renderCell: ({ row }: { row: ActivityLog }) => (
      <div className="text-sm text-gray-500">
        <div>
          {formatDistanceToNow(new Date(row.timestamp), {
            addSuffix: true,
            locale: ptBR,
          })}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(row.timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    ),
  },
];

const ActivityLogPage = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // SEO e Título Premium
  usePageTitle({
    title: 'Activity Log',
    description:
      'Log completo de atividades do sistema com rastreabilidade total das operações realizadas',
    keywords:
      'activity log, log atividades, auditoria sistema, rastreabilidade, histórico operações',
  });

  // Buscar dados reais do backend
  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/activity-logs?limit=50', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar logs: ${response.status}`);
      }

      const data: ActivityLogsResponse = await response.json();
      const activitiesArray = Array.isArray(data.activities) ? data.activities : [];
      setActivities(activitiesArray);
    } catch (error) {
      console.error('Erro ao buscar activity logs:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast.error('Erro ao carregar logs de atividade');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  // Função para retry
  const handleRetry = () => {
    fetchActivityLogs();
  };

  // Filtros
  const filteredActivities = activities.filter((activity) => {
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    const matchesSearch =
      searchTerm === '' ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.details &&
        activity.details.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesStatus && matchesSearch;
  });

  // Estatísticas rápidas
  const stats = {
    total: activities.length,
    success: activities.filter((a) => a.status === 'success').length,
    warnings: activities.filter((a) => a.status === 'warning').length,
    errors: activities.filter((a) => a.status === 'error').length,
  };

  return (
    <>
      <Helmet>
        <title>Activity Log | MedCheck</title>
        <meta
          name="description"
          content="Log completo de atividades do sistema com rastreabilidade total"
        />
        <meta
          name="keywords"
          content="activity log, auditoria sistema, rastreabilidade médica"
        />
      </Helmet>

      <AuthenticatedLayout title="Activity Log">
        <div className="space-y-6">
          {/* Header com estatísticas */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-red-700">
                  <XCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Erro ao carregar dados</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Sucessos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.success}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Avisos</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats.warnings}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-600">Erros</p>
                      <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          {!loading && !error && (
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>
                  Filtre as atividades por tipo, status ou busque por palavra-chave
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Atividade</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="upload">Upload</SelectItem>
                        <SelectItem value="analysis">Análise</SelectItem>
                        <SelectItem value="payment">Pagamento</SelectItem>
                        <SelectItem value="gloss">Glosa</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="success">Sucesso</SelectItem>
                        <SelectItem value="warning">Aviso</SelectItem>
                        <SelectItem value="error">Erro</SelectItem>
                        <SelectItem value="info">Informação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Buscar</label>
                    <Input
                      placeholder="Buscar nas atividades..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Log de Atividades */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Log de Atividades
                  {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={loading}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {loading ? 'Carregando...' : 'Atualizar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activities.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
              {!loading && !error && (
                <CardDescription>
                  Exibindo {filteredActivities.length} de {activities.length} atividades
                  encontradas
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    Carregando atividades...
                  </span>
                </div>
              ) : error ? (
                <div className="text-center p-8">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-700 font-medium">
                    Não foi possível carregar as atividades
                  </p>
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                  <Button onClick={handleRetry} variant="outline">
                    Tentar novamente
                  </Button>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center p-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    Nenhuma atividade encontrada
                  </p>
                  <p className="text-gray-500 text-sm">
                    Use o sistema e suas atividades aparecerão aqui.
                  </p>
                </div>
              ) : (
                <DataGrid
                  rows={filteredActivities}
                  columns={activityColumns}
                  pageSize={15}
                  rowsPerPageOptions={[15, 30, 50]}
                  disableSelectionOnClick
                  className="min-h-[600px]"
                  getRowHeight={() => 'auto'}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default ActivityLogPage;
