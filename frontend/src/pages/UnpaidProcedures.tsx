/**
 * Página de Procedimentos Não Pagos
 * =================================
 *
 * Lista procedimentos adicionados via guias que ainda não foram
 * pagos (não aparecem nos demonstrativos), incluindo glosas e
 * procedimentos expirados (mais de 30 dias).
 */

import React, { useState, useEffect } from 'react';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
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
  Clock,
  Download,
  RefreshCw,
  CheckCircle,
  FileText,
  CalendarClock,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../contexts/auth/AuthContext';
import { formatCurrency } from '../utils/format';
import { usePageTitle } from '../hooks/usePageTitle';
import { Helmet } from 'react-helmet-async';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  urgency?: 'high' | 'medium' | 'low';
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

const UnpaidProceduresPage = () => {
  const [unpaidData, setUnpaidData] = useState<UnpaidStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('urgency_desc');
  const { user } = useAuth();

  // SEO e Título Premium
  usePageTitle({
    title: 'Procedimentos Pendentes',
    description:
      'Acompanhe procedimentos realizados que ainda não foram pagos pelos planos de saúde',
    keywords:
      'procedimentos não pagos, pendências, honorários médicos, glosas, acompanhamento pagamentos',
  });

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
      toast.success('Dados atualizados!', {
        description: `${response.data.unpaid_procedures} procedimentos pendentes encontrados`,
      });
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

      return searchMatch && hospitalMatch;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency_desc':
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          return (
            (urgencyOrder[b.urgency || 'low'] || 0) -
            (urgencyOrder[a.urgency || 'low'] || 0)
          );
        case 'date_desc':
          return new Date(b.data).getTime() - new Date(a.data).getTime();
        case 'date_asc':
          return new Date(a.data).getTime() - new Date(b.data).getTime();
        case 'patient_asc':
          return a.beneficiario.localeCompare(b.beneficiario);
        case 'value_desc':
          return (b.estimated_value || 0) - (a.estimated_value || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [unpaidData, searchTerm, selectedHospital, sortBy]);

  // Obter lista única de hospitais/prestadores
  const hospitals = React.useMemo(() => {
    if (!unpaidData?.unpaid_list) return [];
    const unique = [
      ...new Set(unpaidData.unpaid_list.map((p) => p.prestador).filter(Boolean)),
    ];
    return unique.sort();
  }, [unpaidData]);

  const exportToExcel = async () => {
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
      const link = document.createElement('a');
      link.href = url;
      link.download = `procedimentos-nao-pagos-${
        new Date().toISOString().split('T')[0]
      }.xlsx`;
      link.click();

      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  // Colunas otimizadas para evitar scroll horizontal
  const columns = [
    {
      field: 'numero_guia',
      headerName: 'Guia',
      width: 100,
      renderCell: ({ value }) => (
        <span className="font-mono text-xs text-gray-800">{value}</span>
      ),
    },
    {
      field: 'data',
      headerName: 'Data',
      width: 85,
      renderCell: ({ value }) => {
        try {
          const [day, month, year] = value.split('/');
          const date = new Date(Number(year), Number(month) - 1, Number(day));
          return (
            <span className="text-xs text-gray-600">
              {format(date, 'dd/MM', { locale: ptBR })}
            </span>
          );
        } catch {
          return <span className="text-xs text-gray-400">{value}</span>;
        }
      },
    },
    {
      field: 'beneficiario',
      headerName: 'Paciente',
      width: 150,
      renderCell: ({ value }) => (
        <span className="text-xs text-gray-800 truncate" title={value}>
          {value}
        </span>
      ),
    },
    {
      field: 'codigo',
      headerName: 'Código',
      width: 90,
      renderCell: ({ value }) => (
        <span className="font-mono text-xs text-blue-600">{value}</span>
      ),
    },
    {
      field: 'descricao',
      headerName: 'Procedimento',
      width: 200,
      renderCell: ({ value }) => (
        <span className="text-xs text-gray-700 truncate" title={value}>
          {value}
        </span>
      ),
    },
    {
      field: 'papel',
      headerName: 'Função',
      width: 100,
      renderCell: ({ value }) => {
        const roleColors = {
          Cirurgião: 'bg-blue-50 text-blue-700 border-blue-200',
          Cirurgiao: 'bg-blue-50 text-blue-700 border-blue-200',
          Anestesista: 'bg-green-50 text-green-700 border-green-200',
          'Primeiro Auxiliar': 'bg-amber-50 text-amber-700 border-amber-200',
          '1º Auxiliar': 'bg-amber-50 text-amber-700 border-amber-200',
          Auxiliar: 'bg-amber-50 text-amber-700 border-amber-200',
        };
        const color =
          roleColors[value as keyof typeof roleColors] ||
          'bg-gray-50 text-gray-700 border-gray-200';

        return <Badge className={`text-xs px-2 py-0.5 ${color}`}>{value}</Badge>;
      },
    },
    {
      field: 'estimated_value',
      headerName: 'Valor Est.',
      width: 90,
      renderCell: ({ value }) => (
        <span className="font-mono text-xs text-green-700 font-medium">
          {value ? formatCurrency(value) : '--'}
        </span>
      ),
    },
    {
      field: 'days_since',
      headerName: 'Dias',
      width: 70,
      renderCell: ({ value, row }) => {
        if (!value || value === 0)
          return (
            <Badge variant="outline" className="text-xs">
              --
            </Badge>
          );

        let badgeColor = 'bg-gray-50 text-gray-700 border-gray-200';
        let icon = <Clock className="h-3 w-3" />;

        if (value > 90) {
          badgeColor = 'bg-red-50 text-red-700 border-red-200';
          icon = <AlertTriangle className="h-3 w-3" />;
        } else if (value > 60) {
          badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
          icon = <CalendarClock className="h-3 w-3" />;
        } else if (value > 30) {
          badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
          icon = <Clock className="h-3 w-3" />;
        }

        return (
          <Badge
            className={`text-xs px-2 py-1 gap-1 ${badgeColor}`}
            title={`Há ${value} dias`}
          >
            {icon}
            {value}d
          </Badge>
        );
      },
    },
    {
      field: 'urgency',
      headerName: 'Status',
      width: 90,
      renderCell: ({ value, row }) => {
        const days = row.days_since || 0;

        if (days > 90) {
          return (
            <Badge variant="destructive" className="gap-1 text-xs">
              <TrendingDown className="h-3 w-3" />
              Crítico
            </Badge>
          );
        } else if (days > 60) {
          return (
            <Badge className="gap-1 text-xs bg-orange-50 text-orange-700 border-orange-200">
              <AlertTriangle className="h-3 w-3" />
              Alto
            </Badge>
          );
        } else if (days > 30) {
          return (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Médio
            </Badge>
          );
        } else {
          return (
            <Badge variant="outline" className="gap-1 text-xs">
              <CheckCircle className="h-3 w-3" />
              Normal
            </Badge>
          );
        }
      },
    },
    {
      field: 'prestador',
      headerName: 'Hospital',
      width: 120,
      renderCell: ({ value }) => (
        <span className="text-xs text-gray-600 truncate" title={value}>
          {value || '--'}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Procedimentos Pendentes | MedCheck</title>
          <meta
            name="description"
            content="Acompanhe procedimentos realizados que ainda não foram pagos pelos planos de saúde"
          />
        </Helmet>

        <AuthenticatedLayout
          title="Procedimentos Pendentes"
          description="Controle de pagamentos pendentes"
          isLoading={true}
          loadingMessage="Analisando procedimentos pendentes..."
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Procedimentos Pendentes | MedCheck</title>
        <meta
          name="description"
          content="Acompanhe procedimentos realizados que ainda não foram pagos pelos planos de saúde"
        />
        <meta
          name="keywords"
          content="procedimentos não pagos, pendências, honorários médicos, glosas, acompanhamento pagamentos"
        />

        {/* Open Graph */}
        <meta property="og:title" content="Procedimentos Pendentes | MedCheck" />
        <meta
          property="og:description"
          content="Gestão de procedimentos pendentes de pagamento"
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <AuthenticatedLayout
        title="Procedimentos Pendentes"
        description="Acompanhe procedimentos que aguardam confirmação de pagamento"
      >
        <div className="space-y-6">
          {/* Card Principal */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Procedimentos Pendentes
                    {unpaidData && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {unpaidData.unpaid_procedures} pendentes
                      </Badge>
                    )}
                    {unpaidData && unpaidData.oldest_procedure_days > 30 && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        {unpaidData.oldest_procedure_days > 90 ? 'CRÍTICO' : 'EXPIRADO'}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {filteredData.length} procedimentos encontrados
                    {unpaidData && unpaidData.total_patients > 0 && (
                      <span className="ml-2 text-brand-600">
                        • {unpaidData.total_patients} pacientes
                      </span>
                    )}
                    {unpaidData && unpaidData.total_estimated_value > 0 && (
                      <span className="ml-2 text-trust-600">
                        • {formatCurrency(unpaidData.total_estimated_value)} estimado
                      </span>
                    )}
                    {unpaidData && unpaidData.oldest_procedure_days > 30 && (
                      <span className="ml-2 text-red-600">
                        • Mais antigo: {unpaidData.oldest_procedure_days} dias
                      </span>
                    )}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={loadUnpaidData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button
                    onClick={exportToExcel}
                    size="sm"
                    className="bg-medical-600 hover:bg-medical-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Filtros Simplificados */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Paciente, guia, código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os hospitais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os hospitais</SelectItem>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital} value={hospital}>
                        {hospital}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgency_desc">Prioridade (alta)</SelectItem>
                    <SelectItem value="date_desc">Data (mais recente)</SelectItem>
                    <SelectItem value="date_asc">Data (mais antiga)</SelectItem>
                    <SelectItem value="patient_asc">Paciente (A-Z)</SelectItem>
                    <SelectItem value="value_desc">Valor (maior)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alerta para procedimentos críticos */}
              {unpaidData && unpaidData.oldest_procedure_days > 90 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">
                      Atenção: Procedimentos Críticos Detectados
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Há procedimentos com mais de 90 dias sem pagamento. Recomenda-se
                    entrar em contato com os convênios.
                  </p>
                </div>
              )}

              {/* DataGrid Otimizado */}
              <div className="w-full overflow-hidden border border-gray-200 rounded-lg bg-white">
                <DataGrid
                  rows={filteredData.map((item, index) => ({ id: index, ...item }))}
                  columns={columns}
                  pageSize={20}
                  className="border-0"
                  paginationLabel="Procedimentos por página:"
                  rowsPerPageOptions={[10, 20, 50]}
                />
              </div>

              {/* Estado Vazio */}
              {filteredData.length === 0 && !loading && (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum procedimento pendente
                  </h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Todos os seus procedimentos foram processados e pagos pelos
                    convênios.
                  </p>
                  <Button onClick={loadUnpaidData} variant="outline" className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Verificar novamente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default UnpaidProceduresPage;
