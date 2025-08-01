/**
 * =============================================================================
 * UNPAID PROCEDURES PAGE - PÁGINA DE PROCEDIMENTOS PENDENTES
 * =============================================================================
 * 
 * Nova implementação da página de procedimentos pendentes seguindo 
 * o padrão de design do software e focada na realidade médica brasileira.
 */

import { useState, useEffect, useCallback } from 'react';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertTriangle,
  Search,
  RefreshCw,
  Shield,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { formatCurrency } from '../utils/format';
import { DataGrid } from '../components/ui/data-grid';
import { ContestationDialog } from '../components/contestation/ContestationDialog';
import { useAuth } from '../contexts/auth/AuthContext';
import { buildApiUrl } from '../config/api';
import axios from 'axios';

// =============================================================================
// INTERFACES E TIPOS
// =============================================================================

interface UnpaidProcedure {
  id: string;
  numero_guia: string;
  data: string;
  beneficiario: string;
  codigo: string;
  descricao: string;
  papel: string;
  qtd: number;
  days_since: number;
  estimated_value: number;
  urgency: 'normal' | 'medium' | 'high' | 'critical';
  prestador?: string;
  crm?: string;
}

interface UnpaidStats {
  total_procedures: number;
  paid_procedures: number;
  unpaid_procedures: number;
  total_patients: number;
  total_estimated_value: number;
  oldest_procedure_days: number;
  unpaid_list: UnpaidProcedure[];
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

const UnpaidProceduresPage = () => {
  // Estados principais
  const [data, setData] = useState<UnpaidStats | null>(null);
  const [filteredData, setFilteredData] = useState<UnpaidProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Estados de contestação
  const [selectedProcedure, setSelectedProcedure] = useState<UnpaidProcedure | null>(null);
  const [contestationOpen, setContestationOpen] = useState(false);

  // Hook de autenticação
  const { session } = useAuth();

  // =============================================================================
  // FUNÇÕES DE CARREGAMENTO
  // =============================================================================

  const loadUnpaidProcedures = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = buildApiUrl('/api/v1/unpaid-procedures');

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(response.data);
      setFilteredData(response.data.unpaid_list || []);
    } catch (error: any) {
      console.error('Erro ao carregar procedimentos pendentes:', error);
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else {
        toast.error('Erro ao carregar procedimentos pendentes');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // =============================================================================
  // EFEITOS
  // =============================================================================

  useEffect(() => {
    loadUnpaidProcedures();
  }, [loadUnpaidProcedures]);

  useEffect(() => {
    if (!data?.unpaid_list) return;

    let filtered = data.unpaid_list;

    // Filtro de busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (proc) =>
          proc.beneficiario.toLowerCase().includes(search) ||
          proc.codigo.toLowerCase().includes(search) ||
          proc.descricao.toLowerCase().includes(search) ||
          proc.numero_guia.toLowerCase().includes(search)
      );
    }

    // Filtro de urgência
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter((proc) => proc.urgency === urgencyFilter);
    }

    // Filtro de status (baseado em dias)
    if (statusFilter === 'expired') {
      filtered = filtered.filter((proc) => proc.days_since > 30);
    } else if (statusFilter === 'critical') {
      filtered = filtered.filter((proc) => proc.days_since > 90);
    }

    setFilteredData(filtered);
  }, [data, searchTerm, urgencyFilter, statusFilter]);

  // =============================================================================
  // FUNÇÕES DE AÇÃO
  // =============================================================================

  const handleContestar = useCallback((procedure: UnpaidProcedure) => {
    setSelectedProcedure(procedure);
    setContestationOpen(true);
  }, []);

  const getUrgencyBadge = (urgency: string, days: number) => {
    const isExpired = days > 30;
    
    if (urgency === 'critical' || days > 90) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-1">
          <AlertCircle className="w-3 h-3 mr-1" />
          Crítico {isExpired && '(Expirado)'}
        </Badge>
      );
    }
    if (urgency === 'high' || days > 60) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-2 py-1">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Alto {isExpired && '(Expirado)'}
        </Badge>
      );
    }
    if (urgency === 'medium' || days > 30) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-2 py-1">
          <Clock className="w-3 h-3 mr-1" />
          Médio {isExpired && '(Expirado)'}
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-1">
        <CheckCircle className="w-3 h-3 mr-1" />
        Normal
      </Badge>
    );
  };

  // =============================================================================
  // CONFIGURAÇÃO DAS COLUNAS DA TABELA
  // =============================================================================

  const columns = [
    {
      field: 'data',
      headerName: 'Data',
      width: 80,
      renderCell: ({ value }: { value: string }) => (
        <span className="text-xs text-gray-600 whitespace-nowrap">
          {value || '-'}
        </span>
      ),
    },
    {
      field: 'codigo',
      headerName: 'Código',
      width: 90,
      renderCell: ({ value }: { value: string }) => (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1 font-mono">
          {value}
        </Badge>
      ),
    },
    {
      field: 'descricao',
      headerName: 'Procedimento',
      width: 220,
      renderCell: ({ value }: { value: string }) => (
        <span className="text-xs text-gray-800 line-clamp-2" title={value}>
          {value.length > 50 ? `${value.substring(0, 47)}...` : value}
        </span>
      ),
    },
    {
      field: 'beneficiario',
      headerName: 'Paciente',
      width: 140,
      renderCell: ({ value }: { value: string }) => (
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-700 truncate" title={value}>
            {value}
          </span>
        </div>
      ),
    },
    {
      field: 'papel',
      headerName: 'Papel',
      width: 80,
      renderCell: ({ value }: { value: string }) => (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs px-2 py-1">
          {value}
        </Badge>
      ),
    },
    {
      field: 'estimated_value',
      headerName: 'Valor Est.',
      width: 90,
      renderCell: ({ value, row }: { value: number; row: UnpaidProcedure }) => (
        <div className="text-xs">
          <span className="font-medium text-green-700">
            {formatCurrency(value * row.qtd)}
          </span>
          {row.qtd > 1 && (
            <div className="text-gray-500">
              {row.qtd}x {formatCurrency(value)}
            </div>
          )}
        </div>
      ),
    },
    {
      field: 'days_since',
      headerName: 'Prazo',
      width: 80,
      renderCell: ({ value }: { value: number }) => {
        const isExpired = value > 30;
        return (
          <div className="flex items-center gap-1">
            <Calendar className={`w-3 h-3 ${isExpired ? 'text-red-500' : 'text-gray-400'}`} />
            <span className={`text-xs ${isExpired ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              {value}d
            </span>
          </div>
        );
      },
    },
    {
      field: 'urgency',
      headerName: 'Status',
      width: 120,
      renderCell: ({ value, row }: { value: string; row: UnpaidProcedure }) => 
        getUrgencyBadge(value, row.days_since),
    },
    {
      field: 'actions',
      headerName: 'Ação',
      width: 90,
      renderCell: ({ row }: { row: UnpaidProcedure }) => {
        const isExpired = row.days_since > 30;
        return (
          <Button
            size="sm"
            variant={isExpired ? "destructive" : "default"}
            onClick={() => handleContestar(row)}
            className="h-7 px-3 text-xs"
            title={isExpired ? "Contestação expirada, mas ainda possível" : "Contestar glosa"}
          >
            <Shield className="w-3 h-3 mr-1" />
            {isExpired ? 'Expirado' : 'Contestar'}
          </Button>
        );
      },
    },
  ];

  // =============================================================================
  // ESTATÍSTICAS CALCULADAS
  // =============================================================================

  const stats = {
    total: data?.unpaid_procedures || 0,
    totalValue: data?.total_estimated_value || 0,
    expired: filteredData.filter(p => p.days_since > 30).length,
    critical: filteredData.filter(p => p.days_since > 90).length,
    patients: data?.total_patients || 0,
    oldestDays: data?.oldest_procedure_days || 0,
  };

  // =============================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // =============================================================================

  return (
    <>
      <Helmet>
        <title>Procedimentos Pendentes - MedCheck</title>
        <meta
          name="description"
          content="Acompanhe procedimentos que aguardam confirmação de pagamento com insights de urgência e ferramentas de contestação"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'MedCheck - Procedimentos Pendentes',
            description: 'Gestão de procedimentos médicos pendentes de pagamento',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

      {/* Background com Gradiente Médico Consistente */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-gray-50/20 to-emerald-50/30">
        <AuthenticatedLayout
          title="Procedimentos Pendentes"
          description="Acompanhe procedimentos que aguardam confirmação de pagamento com insights de urgência"
        >
          <div className="space-y-8 px-4 sm:px-6 lg:px-8">
            
            {/* 1. CARDS DE ESTATÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Pendente */}
              <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200/50 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-red-700">
                      Total Pendente
                    </CardTitle>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900">{stats.total}</div>
                  <p className="text-xs text-red-600 mt-1">
                    {stats.patients} pacientes afetados
                  </p>
                </CardContent>
              </Card>

              {/* Valor Estimado */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-green-700">
                      Valor Estimado
                    </CardTitle>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(stats.totalValue)}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Baseado na tabela CBHPM
                  </p>
                </CardContent>
              </Card>

              {/* Críticos/Expirados */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-orange-700">
                      Expirados (30d+)
                    </CardTitle>
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">{stats.expired}</div>
                  <p className="text-xs text-orange-600 mt-1">
                    {stats.critical} críticos (90d+)
                  </p>
                </CardContent>
              </Card>

              {/* Mais Antigo */}
              <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200/50 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      Mais Antigo
                    </CardTitle>
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.oldestDays}d</div>
                  <p className="text-xs text-gray-600 mt-1">
                    Prazo contestação ANS
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 2. SEÇÃO PRINCIPAL - TABELA E FILTROS */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Análise de Pendências
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Procedimentos em desacordo com a tabela CBHPM ou glosados pelos convênios
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {filteredData.length} pendentes
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadUnpaidProcedures}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por paciente, código ou procedimento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 border-gray-200/60"
                      />
                    </div>
                  </div>
                  <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                    <SelectTrigger className="w-[180px] bg-white/80 border-gray-200/60">
                      <SelectValue placeholder="Filtrar urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas urgências</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-white/80 border-gray-200/60">
                      <SelectValue placeholder="Filtrar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos status</SelectItem>
                      <SelectItem value="expired">Expirados (30d+)</SelectItem>
                      <SelectItem value="critical">Críticos (90d+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Alerta para Procedimentos Críticos */}
                {stats.critical > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">
                          Atenção: Procedimentos Críticos Detectados
                        </h4>
                        <p className="text-sm text-red-700 mt-1">
                          Há {stats.critical} procedimentos com mais de 90 dias sem pagamento. 
                          Recomenda-se entrar em contato com os convênios para contestação imediata.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DataGrid */}
                <div className="border border-gray-200/50 rounded-lg overflow-hidden">
                  <DataGrid
                    rows={filteredData}
                    columns={columns}
                    loading={loading}
                    pageSize={15}
                    autoHeight
                    disableColumnResize
                    sx={{
                      '& .MuiDataGrid-cell': {
                        padding: '8px 4px',
                        fontSize: '0.75rem'
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f8fafc',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      },
                      '& .MuiDataGrid-virtualScroller': {
                        overflowX: 'hidden'
                      },
                      '& .MuiDataGrid-columnSeparator': {
                        display: 'none'
                      }
                    }}
                  />
                </div>

                {/* Mensagem caso não haja dados */}
                {!loading && filteredData.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum procedimento pendente
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || urgencyFilter !== 'all' || statusFilter !== 'all'
                        ? 'Nenhum resultado encontrado com os filtros aplicados.'
                        : 'Todos os procedimentos estão em dia! 🎉'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </AuthenticatedLayout>

        {/* Dialog de Contestação */}
        <ContestationDialog
          isOpen={contestationOpen}
          onClose={() => setContestationOpen(false)}
          procedure={selectedProcedure}
        />
      </div>
    </>
  );
};

export default UnpaidProceduresPage;