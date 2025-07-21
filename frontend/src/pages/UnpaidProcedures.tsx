/**
 * Página de Procedimentos Não Pagos
 * =================================
 *
 * Lista procedimentos adicionados via guias que ainda não foram
 * pagos (não aparecem nos demonstrativos), permitindo ao médico
 * acompanhar quais procedimentos estão pendentes de pagamento.
 */

import React, { useState, useEffect } from 'react';
import { StandardPageLayout } from '../components/layout/StandardPageLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { DataGrid } from '../components/ui/data-grid';
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
  FileText,
  Calendar,
  User,
  Building2,
  DollarSign,
  Clock,
  Download,
  RefreshCw,
  Eye,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../contexts/auth/AuthContext';
import PaymentStatusIndicator from '../components/payment/PaymentStatusIndicator';

interface UnpaidProcedure {
  numero_guia: string;
  data: string;
  beneficiario: string;
  codigo: string;
  descricao: string;
  papel: string;
  prestador: string;
  qtd: number;
  crm: string;
  nome_medico?: string;
  dt_inicio?: string;
  dt_fim?: string;
  status_part?: string;
  days_since?: number;
  estimated_value?: number;
  hospital?: string;
  urgency?: 'high' | 'medium' | 'low';
}

interface UnpaidStats {
  total_procedures: number;
  total_patients: number;
  total_estimated_value: number;
  oldest_procedure_days: number;
  unpaid_list: UnpaidProcedure[];
}

const UnpaidProceduresPage = () => {
  const [unpaidData, setUnpaidData] = useState<UnpaidStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const { user } = useAuth();

  const loadUnpaidData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/unpaid-procedures`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUnpaidData(response.data);
    } catch (error) {
      console.error('Erro ao carregar procedimentos não pagos:', error);
      toast.error('Erro ao carregar dados', {
        description: 'Não foi possível carregar os procedimentos não pagos.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnpaidData();
  }, []);

  // Filtrar e ordenar dados
  const filteredData = React.useMemo(() => {
    if (!unpaidData?.unpaid_list) return [];

    let filtered = unpaidData.unpaid_list.filter((proc) => {
      const searchMatch =
        searchTerm === '' ||
        proc.beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.numero_guia.includes(searchTerm) ||
        proc.codigo.includes(searchTerm) ||
        proc.descricao.toLowerCase().includes(searchTerm.toLowerCase());

      const hospitalMatch =
        selectedHospital === 'all' ||
        (proc.prestador || '').toLowerCase().includes(selectedHospital.toLowerCase());

      const urgencyMatch =
        selectedUrgency === 'all' || proc.urgency === selectedUrgency;

      return searchMatch && hospitalMatch && urgencyMatch;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.data).getTime() - new Date(a.data).getTime();
        case 'date_asc':
          return new Date(a.data).getTime() - new Date(b.data).getTime();
        case 'patient_asc':
          return a.beneficiario.localeCompare(b.beneficiario);
        case 'value_desc':
          return (b.estimated_value || 0) - (a.estimated_value || 0);
        case 'urgency_desc':
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          return (
            (urgencyOrder[b.urgency || 'low'] || 0) -
            (urgencyOrder[a.urgency || 'low'] || 0)
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [unpaidData, searchTerm, selectedHospital, selectedUrgency, sortBy]);

  // Obter lista única de hospitais/prestadores
  const hospitals = React.useMemo(() => {
    if (!unpaidData?.unpaid_list) return [];
    const unique = [
      ...new Set(unpaidData.unpaid_list.map((p) => p.prestador).filter(Boolean)),
    ];
    return unique.sort();
  }, [unpaidData]);

  // Estatísticas dos dados filtrados
  const filteredStats = React.useMemo(() => {
    const totalValue = filteredData.reduce(
      (sum, proc) => sum + (proc.estimated_value || 0),
      0
    );
    const uniquePatients = new Set(filteredData.map((p) => p.beneficiario)).size;
    const oldestDays = Math.max(...filteredData.map((p) => p.days_since || 0), 0);

    return {
      total_procedures: filteredData.length,
      total_patients: uniquePatients,
      total_estimated_value: totalValue,
      oldest_procedure_days: oldestDays,
    };
  }, [filteredData]);

  // Configuração das colunas
  const columns = [
    {
      field: 'urgency',
      headerName: 'Urgência',
      width: 80,
      renderCell: (params: any) => {
        const urgency = params.value || 'low';
        const config = {
          high: { color: 'bg-red-100 text-red-800', icon: '🔴', label: 'Alta' },
          medium: {
            color: 'bg-yellow-100 text-yellow-800',
            icon: '🟡',
            label: 'Média',
          },
          low: { color: 'bg-green-100 text-green-800', icon: '🟢', label: 'Baixa' },
        };
        const { color, icon, label } = config[urgency as keyof typeof config];

        return (
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        );
      },
    },
    {
      field: 'numero_guia',
      headerName: 'Nº Guia',
      width: 120,
      renderCell: (params: any) => (
        <span className="font-mono text-blue-600 dark:text-blue-400">
          {params.value}
        </span>
      ),
    },
    {
      field: 'data',
      headerName: 'Data',
      width: 100,
      renderCell: (params: any) => {
        const daysAgo = params.row.days_since || 0;
        return (
          <div className="text-center">
            <div className="text-sm font-medium">{params.value}</div>
            {daysAgo > 0 && (
              <div
                className={`text-xs ${
                  daysAgo > 90
                    ? 'text-red-600'
                    : daysAgo > 30
                      ? 'text-yellow-600'
                      : 'text-gray-500'
                }`}
              >
                {daysAgo} dias
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'beneficiario',
      headerName: 'Paciente',
      width: 200,
      renderCell: (params: any) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="truncate" title={params.value}>
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: 'codigo',
      headerName: 'Código',
      width: 100,
      renderCell: (params: any) => (
        <span className="font-mono text-gray-700 dark:text-gray-300">
          {params.value}
        </span>
      ),
    },
    {
      field: 'descricao',
      headerName: 'Procedimento',
      width: 250,
      renderCell: (params: any) => (
        <span className="truncate" title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'papel',
      headerName: 'Papel',
      width: 120,
      renderCell: (params: any) => {
        const papelColors = {
          Cirurgiao: 'bg-blue-100 text-blue-800',
          Anestesista: 'bg-purple-100 text-purple-800',
          'Primeiro Auxiliar': 'bg-green-100 text-green-800',
          'Segundo Auxiliar': 'bg-orange-100 text-orange-800',
        };
        const color =
          papelColors[params.value as keyof typeof papelColors] ||
          'bg-gray-100 text-gray-800';

        return <Badge className={`${color} text-xs`}>{params.value}</Badge>;
      },
    },
    {
      field: 'prestador',
      headerName: 'Hospital/Prestador',
      width: 200,
      renderCell: (params: any) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="truncate" title={params.value}>
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: 'estimated_value',
      headerName: 'Valor Est.',
      width: 120,
      renderCell: (params: any) => {
        const value = params.value || 0;
        return (
          <div className="flex items-center gap-1 text-green-700 dark:text-green-400 font-medium">
            <DollarSign className="h-3 w-3" />
            R$ {value.toFixed(2).replace('.', ',')}
          </div>
        );
      },
    },
  ];

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/reports/generate?format=excel`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `procedimentos-nao-pagos-${
        new Date().toISOString().split('T')[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  if (loading) {
    return (
      <StandardPageLayout
        title="Procedimentos Não Pagos"
        description="Carregando dados..."
        category="Gestão Crítica"
        categoryIcon={<AlertTriangle className="h-5 w-5" />}
        categoryColor="orange"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Carregando procedimentos não pagos...</p>
            </div>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-3">
      <Button
        onClick={loadUnpaidData}
        variant="outline"
        size="sm"
        className="bg-white/80 backdrop-blur-sm border-gray-200/60"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Atualizar
      </Button>
      <Button
        onClick={handleExportExcel}
        size="sm"
        className="bg-orange-600 hover:bg-orange-700 text-white"
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar Excel
      </Button>
    </div>
  );

  return (
    <StandardPageLayout
      title="Procedimentos Não Pagos"
      description="Acompanhe os procedimentos que ainda não receberam pagamento dos convênios"
      category="Gestão Crítica"
      categoryIcon={<AlertTriangle className="h-5 w-5" />}
      categoryColor="orange"
      actions={headerActions}
      className="from-orange-50/30 via-white to-red-50/20"
    >
      <div className="space-y-8">

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Procedimentos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredStats.total_procedures}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pacientes Afetados</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredStats.total_patients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Estimado</p>
                  <p className="text-2xl font-bold text-green-600">
                    R${' '}
                    {filteredStats.total_estimated_value.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mais Antigo</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredStats.oldest_procedure_days} dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Paciente, guia, código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hospital/Prestador</label>
                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital} value={hospital}>
                        {hospital}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Urgência</label>
                <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ordenar por</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Data (mais recente)</SelectItem>
                    <SelectItem value="date_asc">Data (mais antigo)</SelectItem>
                    <SelectItem value="patient_asc">Paciente (A-Z)</SelectItem>
                    <SelectItem value="value_desc">Valor (maior)</SelectItem>
                    <SelectItem value="urgency_desc">Urgência (alta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lista de Procedimentos Não Pagos
            </CardTitle>
            <CardDescription>
              {filteredData.length > 0
                ? `${filteredData.length} procedimento(s) encontrado(s)`
                : 'Nenhum procedimento não pago encontrado'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataGrid
              rows={filteredData}
              columns={columns}
              pageSize={50}
              loading={loading}
              emptyMessage="Nenhum procedimento não pago encontrado"
            />
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default UnpaidProceduresPage;
