import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { DataGrid } from '../components/ui/data-grid';
import { Button } from '../components/ui/button';
import {
  FileText,
  Upload,
  Eye,
  Trash2,
  HelpCircle,
  ClipboardList,
  User,
  AlertCircle,
  BarChart3,
  UserCheck,
  Stethoscope,
  UserPlus,
  UserPlus2,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import PaymentStatusIndicator from '../components/payment/PaymentStatusIndicator';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import FileDropZone from '../components/upload/FileDropZone';
import { useFileUpload } from '../hooks/useFileUpload';
import { FileType } from '../types/upload';
import FileList from '../components/upload/FileList';
import { toast } from 'sonner';
import {
  getGuides,
  deleteGuide,
  uploadGuides,
  GuidesQueryParams,
} from '../services/guides';
import DetalhesGuia from '../components/guides/DetalhesGuia';
import { GuideProcedure } from '../types/medical';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../components/ui/tooltip';
import { Link } from 'react-router-dom';
import LoaderTable from '../components/ui/LoaderTable';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/card';
import { SkeletonInfoCard, SkeletonDashboard } from '../components/ui/skeleton';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../contexts/auth/AuthContext';

import { FiltersToolbar } from '../components/guides/FiltersToolbar';
import { InfoCard, InfoCardGrid } from '../components/ui/InfoCard';

import { usePageTitle } from '../hooks/usePageTitle';
import { useRealTimeSync, REAL_TIME_EVENTS } from '../hooks/useRealTimeSync';
import { Helmet } from 'react-helmet-async';
import { useMobileLayout } from '../hooks/use-mobile';

// PADRÃO DE CORES GLOBAL PARA KPIs
// Glosa: variant="danger", text-red-700, bg-red-50
// Sucesso: variant="success", text-green-700, bg-green-50
// Informação: variant="info", text-blue-700, bg-blue-50
// Alerta: variant="warning", text-amber-700, bg-amber-50
// Neutro: variant="neutral", text-gray-700, bg-body

function getCurrentCrm() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user && user.crm ? user.crm : '';
  } catch {
    return '';
  }
}

function GuidesPage() {
  const { userProfile } = useAuth();
  const { isMobile, shouldStackCards, maxTableColumns } = useMobileLayout();

  // Estados principais
  const [guides, setGuides] = useState<GuideProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<GuideProcedure | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 5 : 10);
  const [activeTab, setActiveTab] = useState('overview');

  // Estados para filtros
  const [filters, setFilters] = useState({
    procedimento: '',
    medico: '',
    especialidade: '',
    status: '',
    periodo: '',
    convenio: '',
  });

  // Upload de arquivos
  const {
    files,
    isUploading,
    progress,
    handleFileChangeByType,
    removeFile,
    resetFiles,
  } = useFileUpload();

  // Real-time sync
  useRealTimeSync([REAL_TIME_EVENTS.GUIDE_PROCESSED, REAL_TIME_EVENTS.GUIDE_UPLOADED]);

  // SEO
  usePageTitle({
    title: 'Guias Médicas',
    description: 'Gerencie e analise suas guias médicas TISS de forma inteligente',
    keywords: 'guias médicas, TISS, procedimentos, honorários médicos',
  });

  // Dados calculados
  const stats = {
    totalGuias: guides.length,
    totalProcedimentos: guides.reduce(
      (sum, guide) => sum + (guide.procedimentos?.length || 0),
      0
    ),
    valorTotal: guides.reduce((sum, guide) => sum + (guide.valorTotal || 0), 0),
    valorPago: guides.reduce((sum, guide) => sum + (guide.valorPago || 0), 0),
    valorGlosado: guides.reduce((sum, guide) => sum + (guide.valorGlosado || 0), 0),
  };

  const taxaSucesso =
    stats.valorTotal > 0 ? (stats.valorPago / stats.valorTotal) * 100 : 0;

  // Configuração das colunas para DataGrid (mobile-aware)
  const columns = [
    {
      field: 'numeroGuia',
      headerName: 'Número',
      width: isMobile ? 80 : 120,
      priority: 'high' as const,
      mobileLabel: 'Guia',
    },
    {
      field: 'paciente',
      headerName: 'Paciente',
      width: isMobile ? 120 : 180,
      priority: 'high' as const,
      mobileLabel: 'Paciente',
    },
    {
      field: 'dataAtendimento',
      headerName: 'Data',
      width: isMobile ? 90 : 120,
      priority: 'medium' as const,
      mobileLabel: 'Data',
      renderCell: (params: any) =>
        params.value ? new Date(params.value).toLocaleDateString('pt-BR') : '—',
    },
    {
      field: 'valorTotal',
      headerName: 'Valor Total',
      width: isMobile ? 100 : 130,
      type: 'currency',
      priority: 'high' as const,
      mobileLabel: 'Valor',
      renderCell: (params: any) =>
        params.value
          ? `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : 'R$ 0,00',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: isMobile ? 90 : 120,
      priority: 'medium' as const,
      mobileLabel: 'Status',
      renderCell: (params: any) => (
        <PaymentStatusIndicator
          status={params.value || 'pendente'}
          compact={isMobile}
        />
      ),
    },
    ...(isMobile
      ? []
      : [
          {
            field: 'medico',
            headerName: 'Médico',
            width: 150,
            priority: 'low' as const,
          },
          {
            field: 'especialidade',
            headerName: 'Especialidade',
            width: 140,
            priority: 'low' as const,
          },
          {
            field: 'convenio',
            headerName: 'Convênio',
            width: 130,
            priority: 'low' as const,
          },
        ]),
  ];

  // Carregar dados
  useEffect(() => {
    loadGuides();
  }, [filters, currentPage, pageSize]);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const queryParams: GuidesQueryParams = {
        page: currentPage + 1,
        limit: pageSize,
        crm: getCurrentCrm(),
        ...filters,
      };

      const response = await getGuides(queryParams);
      setGuides(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar guias:', error);
      toast.error('Erro ao carregar guias médicas');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleUploadComplete = () => {
    resetFiles();
    loadGuides();
    toast.success('Guias processadas com sucesso!');
  };

  const handleViewDetails = (guide: GuideProcedure) => {
    setSelectedGuide(guide);
    setShowDetails(true);
  };

  const handleDeleteGuide = async (id: string) => {
    try {
      await deleteGuide(id);
      await loadGuides();
      toast.success('Guia excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir guia');
    }
  };

  const mobileCardTitle = (row: any) => `Guia ${row.numeroGuia || 'N/A'}`;

  const mobileCardSubtitle = (row: any) =>
    `${row.paciente || 'Paciente'} • ${
      row.valorTotal ? `R$ ${row.valorTotal.toLocaleString('pt-BR')}` : 'R$ 0,00'
    }`;

  return (
    <>
      <Helmet>
        <title>Guias Médicas | MedCheck</title>
        <meta
          name="description"
          content="Gerencie suas guias médicas TISS, acompanhe procedimentos e monitore seus honorários de forma inteligente."
        />
      </Helmet>

      <AuthenticatedLayout
        title="Guias Médicas"
        description="Gerencie e analise suas guias TISS"
        isLoading={loading && guides.length === 0}
        loadingMessage="Carregando suas guias médicas..."
      >
        <div className={`space-y-${isMobile ? '6' : '8'}`}>
          {/* Header Mobile */}
          {isMobile && (
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Guias Médicas
                </h1>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.totalGuias > 0
                  ? `${stats.totalGuias} guias • ${stats.totalProcedimentos} procedimentos`
                  : 'Envie suas primeiras guias médicas'}
              </p>
            </div>
          )}

          {/* Tabs adaptativas */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList
              className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}
            >
              <TabsTrigger value="overview" className={isMobile ? 'text-xs' : ''}>
                {isMobile ? 'Resumo' : 'Visão Geral'}
              </TabsTrigger>
              <TabsTrigger value="upload" className={isMobile ? 'text-xs' : ''}>
                {isMobile ? 'Upload' : 'Enviar Guias'}
              </TabsTrigger>
              {!isMobile && (
                <TabsTrigger value="analysis">Análise Detalhada</TabsTrigger>
              )}
            </TabsList>

            {/* Tab: Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPIs Responsivos */}
              <InfoCardGrid
                columns={{
                  mobile: 1,
                  tablet: 2,
                  desktop: 4,
                }}
              >
                <InfoCard
                  icon={<FileText className="h-5 w-5" />}
                  title="Total de Guias"
                  mobileLabel="Guias"
                  value={stats.totalGuias}
                  description={`${stats.totalProcedimentos} procedimentos total`}
                  variant="info"
                  compact={isMobile}
                  actions={[
                    {
                      label: 'Nova Guia',
                      onClick: () => setActiveTab('upload'),
                      icon: <Upload className="h-4 w-4" />,
                    },
                  ]}
                />

                <InfoCard
                  icon={<DollarSign className="h-5 w-5" />}
                  title="Valor Total"
                  mobileLabel="Total"
                  value={`R$ ${stats.valorTotal.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}`}
                  description="Valor apresentado"
                  variant="neutral"
                  compact={isMobile}
                  trend={
                    stats.valorTotal > 0
                      ? { value: 8, isPositive: true, label: 'mensal' }
                      : undefined
                  }
                />

                <InfoCard
                  icon={<CheckCircle className="h-5 w-5" />}
                  title="Valor Pago"
                  mobileLabel="Pago"
                  value={`R$ ${stats.valorPago.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}`}
                  description="Efetivamente recebido"
                  variant="success"
                  compact={isMobile}
                  trend={
                    stats.valorPago > 0
                      ? { value: 12, isPositive: true, label: 'crescimento' }
                      : undefined
                  }
                />

                <InfoCard
                  icon={<AlertTriangle className="h-5 w-5" />}
                  title="Taxa de Sucesso"
                  mobileLabel="Sucesso"
                  value={`${taxaSucesso.toFixed(1)}%`}
                  description="Percentual de pagamento"
                  variant={
                    taxaSucesso >= 85
                      ? 'success'
                      : taxaSucesso >= 70
                        ? 'warning'
                        : 'danger'
                  }
                  compact={isMobile}
                  trend={
                    taxaSucesso > 0
                      ? {
                          value: 3,
                          isPositive: taxaSucesso >= 85,
                          label: 'vs. anterior',
                        }
                      : undefined
                  }
                />
              </InfoCardGrid>

              {/* Filtros e Tabela */}
              <Card>
                <CardHeader className={isMobile ? 'pb-3' : ''}>
                  <div
                    className={`flex ${
                      isMobile ? 'flex-col space-y-3' : 'items-center justify-between'
                    }`}
                  >
                    <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
                      Lista de Guias
                    </CardTitle>

                    {/* Filtros móveis simplificados */}
                    {isMobile ? (
                      <div className="flex gap-2">
                        <Select
                          value={filters.status}
                          onValueChange={(value) =>
                            setFilters((prev) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger className="flex-1 h-9 text-xs">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="glosado">Glosado</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={filters.periodo}
                          onValueChange={(value) =>
                            setFilters((prev) => ({ ...prev, periodo: value }))
                          }
                        >
                          <SelectTrigger className="flex-1 h-9 text-xs">
                            <SelectValue placeholder="Período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="30">30 dias</SelectItem>
                            <SelectItem value="90">90 dias</SelectItem>
                            <SelectItem value="180">6 meses</SelectItem>
                          </SelectContent>
                        </Select>

                        {Object.values(filters).some((v) => v) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setFilters({
                                procedimento: '',
                                medico: '',
                                especialidade: '',
                                status: '',
                                periodo: '',
                                convenio: '',
                              })
                            }
                            className="h-9 px-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <FiltersToolbar filters={filters} onFiltersChange={setFilters} />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <DataGrid
                    rows={guides}
                    columns={columns}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    loading={loading}
                    emptyMessage="Nenhuma guia encontrada"
                    expandable
                    onExpand={handleViewDetails}
                    rowIdField="id"
                    mobileCardView={true}
                    mobileTitle={mobileCardTitle}
                    mobileSubtitle={mobileCardSubtitle}
                    className="border-0"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Upload */}
            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader className={isMobile ? 'pb-3' : ''}>
                  <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
                    Enviar Guias Médicas
                  </CardTitle>
                  <CardDescription className={isMobile ? 'text-xs' : ''}>
                    Faça upload das suas guias TISS para análise automática
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <FileDropZone
                    type="guia"
                    onDropFiles={handleFileChangeByType}
                    disabled={isUploading}
                  />

                  {files.length > 0 && (
                    <FileList
                      files={files}
                      onRemove={removeFile}
                      disabled={isUploading}
                    />
                  )}

                  {files.length > 0 && (
                    <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
                      <Button
                        onClick={handleUploadComplete}
                        disabled={isUploading}
                        className={`${isMobile ? 'w-full' : 'flex-1'}`}
                      >
                        {isUploading ? 'Processando...' : 'Processar Guias'}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={resetFiles}
                        disabled={isUploading}
                        className={`${isMobile ? 'w-full' : ''}`}
                      >
                        Limpar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Análise Detalhada (somente desktop) */}
            {!isMobile && (
              <TabsContent value="analysis" className="space-y-6">
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição por Especialidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Análise detalhada em desenvolvimento...
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Glosas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Análise detalhada em desenvolvimento...
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Modal de Detalhes */}
          {showDetails && selectedGuide && (
            <DetalhesGuia
              guide={selectedGuide}
              isOpen={showDetails}
              onClose={() => setShowDetails(false)}
              compact={isMobile}
            />
          )}
        </div>
      </AuthenticatedLayout>
    </>
  );
}

export default GuidesPage;
