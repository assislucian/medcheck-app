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
// Card components removidos - usando elementos HTML nativos para melhor performance
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

  // Colunas otimizadas para máximo uso do espaço - SEM SCROLL HORIZONTAL
  const columns = [

    {
      field: 'data',
      headerName: 'Data',
      width: 45,
      flex: 0.5,
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
      field: 'codigo',
      headerName: 'Código',
      width: 65,
      flex: 0.8,
      renderCell: ({ value }) => (
        <span className="font-mono text-xs text-blue-600 font-semibold" title={`Código CBHPM: ${value}`}>{value}</span>
      ),
    },
    {
      field: 'descricao',
      headerName: 'Procedimento',
      width: 140,
      flex: 2,
      renderCell: ({ value }) => (
        <span className="text-xs text-gray-800 font-medium truncate" title={value}>
          {value}
        </span>
      ),
    },
    {
      field: 'papel',
      headerName: 'Papel',
      width: 60,
      flex: 0.7,
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

        return <Badge className={`text-xs px-1 py-0.5 ${color}`} title={value}>{value}</Badge>;
      },
    },
    {
      field: 'valor_cbhpm',
      headerName: 'CBHPM',
      width: 70,
      flex: 0.8,
      renderCell: ({ value, row }) => {
        const estimatedValue = row.estimated_value || 0;
        return (
          <span className="font-mono text-xs text-blue-700 font-bold" title="Valor de referência CBHPM">
            {estimatedValue ? formatCurrency(estimatedValue) : '--'}
          </span>
        );
      },
    },
    {
      field: 'valor_pago',
      headerName: 'Pago',
      width: 60,
      flex: 0.7,
      renderCell: ({ value, row }) => (
        <span className="font-mono text-xs text-red-600 font-bold" title="Valor pago pelo plano">
          R$ 0,00
        </span>
      ),
    },
    {
      field: 'diferenca',
      headerName: 'Prejuízo',
      width: 65,
      flex: 0.8,
      renderCell: ({ value, row }) => {
        const estimatedValue = row.estimated_value || 0;
        return (
          <span className="font-mono text-xs text-red-600 font-bold" title={`Prejuízo de ${formatCurrency(estimatedValue)}`}>
            {formatCurrency(estimatedValue)}
          </span>
        );
      },
    },
    {
      field: 'prazo_contestacao',
      headerName: 'Prazo',
      width: 55,
      flex: 0.6,
      renderCell: ({ value, row }) => {
        const days = row.days_since || 0;
        const prazoRestante = Math.max(0, 60 - days); // Prazo ANS de 60 dias
        
        let badgeColor = 'bg-green-50 text-green-700 border-green-200';
        let icon = <CheckCircle className="h-3 w-3" />;
        
        if (prazoRestante <= 7) {
          badgeColor = 'bg-red-50 text-red-700 border-red-200';
          icon = <AlertTriangle className="h-3 w-3" />;
        } else if (prazoRestante <= 15) {
          badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
          icon = <Clock className="h-3 w-3" />;
        } else if (prazoRestante <= 30) {
          badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
          icon = <CalendarClock className="h-3 w-3" />;
        }
        
        if (prazoRestante === 0) {
          return (
            <Badge variant="destructive" className="gap-0.5 text-xs px-1">
              <TrendingDown className="h-3 w-3" />
              Expirou
            </Badge>
          );
        }
        
        return (
          <Badge className={`text-xs px-1 py-0.5 gap-0.5 ${badgeColor}`} title={`${prazoRestante} dias restantes para contestar`}>
            {icon}
            {prazoRestante}d
          </Badge>
        );
      },
    },
    {
      field: 'acao',
      headerName: 'Ação',
      width: 70,
      flex: 0.9,
      sortable: false,
      renderCell: ({ value, row }) => {
        const days = row.days_since || 0;
        const prazoRestante = Math.max(0, 60 - days);
        const estimatedValue = row.estimated_value || 0;
        
        if (prazoRestante === 0) {
          return (
            <span className="text-xs text-gray-400">Prazo expirado</span>
          );
        }
        
        return (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:from-red-100 hover:to-orange-100 text-red-800 font-medium"
            onClick={() => {
              // Integração com ContestationDialog existente
              console.log('Contestar procedimento:', {
                codigo: row.codigo,
                procedimento: row.descricao,
                valorCBHPM: estimatedValue,
                valorPago: 0,
                diferenca: estimatedValue,
                papel: row.papel
              });
            }}
            title={`Contestar glosa de ${formatCurrency(estimatedValue)}`}
          >
            <FileText className="h-3 w-3 mr-1" />
            Contestar
          </Button>
        );
      },
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
          content="Acompanhe procedimentos realizados que ainda não foram pagos pelos planos de saúde com análise avançada de pendências"
        />
        <meta
          name="keywords"
          content="procedimentos não pagos, pendências, honorários médicos, glosas, acompanhamento pagamentos"
        />

        {/* Open Graph */}
        <meta property="og:title" content="Procedimentos Pendentes | MedCheck" />
        <meta
          property="og:description"
          content="Gestão avançada de procedimentos pendentes de pagamento"
        />
        <meta property="og:type" content="website" />
        
        {/* Schema.org para SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'MedCheck - Procedimentos Pendentes',
            description:
              'Plataforma para gestão e acompanhamento de procedimentos médicos pendentes de pagamento',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

      {/* Background com Gradiente Médico Consistente */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-gray-50/20 to-emerald-50/30">
        <AuthenticatedLayout
          title="Procedimentos Pendentes"
          description="Acompanhe procedimentos que aguardam confirmação de pagamento com análise avançada de pendências"
        >
          <div className="max-w-none space-y-6 px-2 sm:px-4 lg:px-6">
            {/* Header Otimizado - Sem Padding Excessivo */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-orange-100 border border-red-200/50">
                <AlertTriangle className="h-4 w-4 text-red-700" />
                <span className="text-xs font-medium text-red-800">
                  Análise de pendências
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-700 via-orange-600 to-gray-800 bg-clip-text text-transparent">
                Procedimentos Pendentes
              </h1>

              <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
                Acompanhe procedimentos que aguardam confirmação de pagamento
                com insights de urgência
              </p>

              {/* Actions Compactas */}
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1 bg-white/80 text-xs">
                  <Clock className="h-3 w-3 text-red-600" />
                  Controle de Pendências
                </Badge>
                
                {unpaidData && unpaidData.unpaid_procedures > 0 && (
                  <Badge variant="outline" className="gap-1 bg-white/80 text-xs">
                    <span className="text-red-700">
                      {unpaidData.unpaid_procedures} pendentes
                    </span>
                  </Badge>
                )}
                
                {unpaidData && unpaidData.oldest_procedure_days > 90 && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <TrendingDown className="h-3 w-3" />
                    CRÍTICO
                  </Badge>
                )}
              </div>
            </div>
            {/* Container Principal Otimizado - Sem Card Aninhado */}
            <div className="bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 border border-red-200/50 shadow-lg relative overflow-hidden rounded-lg">
              {/* Linha de destaque superior */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-600"></div>
            <div className="pb-4 border-b border-red-100/50 px-6 pt-6">
              <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-red-700 to-orange-700 bg-clip-text text-transparent flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Procedimentos Pendentes
                    {unpaidData && (
                      <Badge className="ml-2 text-xs bg-red-100 text-red-700 border-red-200">
                        {unpaidData.unpaid_procedures} pendentes
                      </Badge>
                    )}
                    {unpaidData && unpaidData.oldest_procedure_days > 30 && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        {unpaidData.oldest_procedure_days > 90 ? 'CRÍTICO' : 'EXPIRADO'}
                      </Badge>
                    )}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
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
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={loadUnpaidData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button
                    onClick={exportToExcel}
                    size="sm"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/50">
              {/* Filtros Otimizados - Layout Flex para Melhor Uso do Espaço */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por paciente, guia ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/80 border-gray-200/60 w-full"
                  />
                </div>

                <div className="w-full sm:w-48">
                  <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                    <SelectTrigger className="bg-white/80 border-gray-200/60 w-full">
                      <SelectValue placeholder="Hospitais" />
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
                </div>

                <div className="w-full sm:w-44">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white/80 border-gray-200/60 w-full">
                      <SelectValue placeholder="Ordem" />
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
              </div>

              {/* Alerta para procedimentos críticos - Estilo aprimorado */}
              {unpaidData && unpaidData.oldest_procedure_days > 90 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-red-100 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="font-medium text-red-800">
                      Atenção: Procedimentos Críticos Detectados
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-2 ml-7">
                    Há procedimentos com mais de 90 dias sem pagamento. Recomenda-se
                    entrar em contato com os convênios.
                  </p>
                </div>
              )}

              {/* DataGrid Otimizado - Container Principal Sem Aninhamento */}
              <DataGrid
                rows={filteredData.map((item, index) => ({ id: index, ...item }))}
                columns={columns}
                pageSize={15}
                className="w-full border border-red-200/50 rounded-lg bg-white shadow-sm"
                paginationLabel="Procedimentos por página:"
                rowsPerPageOptions={[10, 15, 25]}
                disableColumnResize
                autoHeight
                density="compact"
                sx={{
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-cell': {
                    padding: '8px 4px',
                    fontSize: '0.75rem',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#fef2f2',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#fef7f7',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    overflowX: 'hidden',
                  },
                  '& .MuiDataGrid-columnSeparator': {
                    display: 'none',
                  },
                }}
              />

              {/* Estado Vazio Aprimorado */}
              {filteredData.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-b from-green-50 to-emerald-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">
                    Nenhum procedimento pendente
                  </h3>
                  <p className="text-gray-600 max-w-sm mx-auto mb-6">
                    Todos os seus procedimentos foram processados e pagos pelos
                    convênios.
                  </p>
                  <Button 
                    onClick={loadUnpaidData} 
                    variant="outline" 
                    className="border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Verificar novamente
                  </Button>
                </div>
              )}
                        </div>
          </div>
          </div>
        </AuthenticatedLayout>
      </div>
    </>
  );
};

export default UnpaidProceduresPage;
