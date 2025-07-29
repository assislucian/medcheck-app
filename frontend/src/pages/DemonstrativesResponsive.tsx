import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveLayout,
  useResponsiveClasses,
  DeviceRender,
} from '../components/layout/ResponsiveLayout';
import {
  ResponsiveDataGrid,
  useDemonstrativesGridConfig,
} from '../components/ui/ResponsiveDataGrid';
import { useDevice } from '../hooks/use-device';
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
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  FileText,
  Upload,
  Eye,
  Trash2,
  Search,
  RefreshCw,
  FileBarChart,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  TrendingUp,
  Loader2,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { formatCurrency } from '../utils/format';
import { useFileUpload } from '../hooks/useFileUpload';
import { usePageTitle } from '../hooks/usePageTitle';
import { SkeletonInfoCard } from '../components/ui/skeleton';
import { useAuth } from '../contexts/auth/AuthContext';
import { formatValidationError } from '../utils/errorUtils';

const DemonstrativesResponsivePage = () => {
  const { isMobile, isTablet } = useDevice();
  const { container, grid, card, title: titleClass, spacing } = useResponsiveClasses();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  // SEO otimizado para mobile
  usePageTitle({
    title: isMobile ? 'Demonstrativos' : 'Gestão de Demonstrativos',
    description: isMobile
      ? 'Análise rápida de demonstrativos médicos'
      : 'Central de análise e gerenciamento de demonstrativos de pagamento médico com análise financeira avançada',
    keywords: 'demonstrativos médicos, gestão financeira médica, análise pagamentos',
  });

  // Estados
  const [demonstratives, setDemonstratives] = useState<any[]>([]);
  const [filteredDemonstratives, setFilteredDemonstratives] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  // Configuração do grid responsivo
  const gridConfig = useDemonstrativesGridConfig();

  useEffect(() => {
    fetchDemonstratives();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = demonstratives;

    if (searchTerm) {
      filtered = filtered.filter(
        (demo) =>
          demo.periodo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          demo.filename?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (startDate || endDate) {
      filtered = filtered.filter((demo) => {
        const uploadDate = new Date(demo.upload_time);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-12-31');

        if (endDate) {
          end.setHours(23, 59, 59, 999);
        }

        return uploadDate >= start && uploadDate <= end;
      });
    } else if (selectedPeriod !== 'all') {
      const now = new Date();
      const periods = {
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        '6m': new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
        '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      };

      if (periods[selectedPeriod]) {
        filtered = filtered.filter((demo) => {
          const uploadDate = new Date(demo.upload_time);
          return uploadDate >= periods[selectedPeriod];
        });
      }
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((demo) => {
        const hasGlosa = demo.total_glosa > 0;
        if (selectedStatus === 'glosado') return hasGlosa;
        if (selectedStatus === 'liberado') return !hasGlosa;
        return true;
      });
    }

    setFilteredDemonstratives(filtered);
  }, [demonstratives, searchTerm, selectedPeriod, selectedStatus, startDate, endDate]);

  const fetchDemonstratives = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:8000'
        }/api/v1/demonstrativos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDemonstratives(response.data);
    } catch (error) {
      console.error('Erro ao carregar demonstrativos:', error);
      toast.error('Erro ao carregar demonstrativos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList);
      setUploadFiles(filesArray);
    }
  };

  const handleSimpleUpload = async () => {
    if (!uploadFiles.length) {
      toast.error('Selecione pelo menos um arquivo');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Faça login novamente');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      uploadFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:8000'
        }/api/v1/demonstrativos/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        const results = response.data;
        const successCount = results.filter((r) => r.success).length;

        results.forEach((result) => {
          if (result.success) {
            toast.success(`"${result.filename}" processado com sucesso`);
          } else if (result.duplicate) {
            toast.warning(`"${result.filename}" já foi processado anteriormente`);
          } else {
            toast.error(`Erro em "${result.filename}": ${result.error}`);
          }
        });

        if (successCount > 0) {
          toast.success(`Upload concluído: ${successCount} arquivo(s) processado(s)`);
          await fetchDemonstratives();
          setUploadFiles([]);

          const fileInput = document.getElementById(
            'demo-file-upload'
          ) as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        } else {
          toast.info('Nenhum arquivo novo foi processado');
        }
      } else {
        toast.success('Upload realizado com sucesso');
        await fetchDemonstratives();
        setUploadFiles([]);

        const fileInput = document.getElementById(
          'demo-file-upload'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);

      if (error.response?.status === 422) {
        const formattedError = formatValidationError(
          error.response.data.detail || 'Arquivo inválido'
        );
        toast.error(`Erro de validação: ${formattedError}`);
      } else if (error.response?.status === 401) {
        toast.error('Faça login novamente');
      } else {
        toast.error(`Erro durante o upload: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDemonstrativo = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este demonstrativo?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:8000'
        }/api/v1/demonstrativos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Demonstrativo excluído com sucesso');
      fetchDemonstratives();
    } catch (error) {
      console.error('Erro ao excluir demonstrativo:', error);
      toast.error('Erro ao excluir demonstrativo');
    }
  };

  // Estatísticas globais
  const summaryStats = {
    totalProcessado: demonstratives.reduce(
      (sum, d) => sum + (d.total_approved || 0),
      0
    ),
    totalGlosa: demonstratives.reduce((sum, d) => sum + (d.total_glosa || 0), 0),
    totalProcedimentos: demonstratives.reduce(
      (sum, d) => sum + (d.total_procedures || 0),
      0
    ),
    totalApresentado: demonstratives.reduce(
      (sum, d) => sum + (d.total_presented || 0),
      0
    ),
  };

  // Colunas para o grid (desktop)
  const columns = [
    {
      field: 'periodo',
      headerName: 'Período',
      width: 150,
      renderCell: ({ row }) => {
        const hasGlosa = row.total_glosa > 0;
        return (
          <div className="flex items-center gap-2">
            <span className={hasGlosa ? 'font-medium' : ''}>{row.periodo}</span>
            {hasGlosa && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                Glosa
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      field: 'total_procedures',
      headerName: 'Procedimentos',
      width: 120,
      type: 'number',
    },
    {
      field: 'total_presented',
      headerName: 'Apresentado',
      width: 130,
      type: 'currency',
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'total_approved',
      headerName: 'Liberado',
      width: 130,
      type: 'currency',
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'total_glosa',
      headerName: 'Glosa',
      width: 130,
      type: 'currency',
      renderCell: ({ value }) => {
        const hasGlosa = value > 0;
        return (
          <span className={hasGlosa ? 'text-red-600 font-semibold' : 'text-gray-400'}>
            {formatCurrency(value)}
          </span>
        );
      },
    },
  ];

  // Mobile actions (aparecem no topo em mobile)
  const mobileActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={fetchDemonstratives}
        disabled={loading}
        className="flex-1"
      >
        <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Atualizando...' : 'Atualizar'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={() => {
          // Scroll para seção de upload
          document
            .getElementById('upload-section')
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <Upload className="h-4 w-4 mr-1" />
        Upload
      </Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>
          {isMobile ? 'Demonstrativos' : 'Demonstrativos & Honorários'} - MedCheck
        </title>
        <meta
          name="description"
          content={
            isMobile
              ? 'Análise rápida de demonstrativos médicos'
              : 'Central de análise e gerenciamento de demonstrativos de pagamento médico'
          }
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no"
        />
      </Helmet>

      <ResponsiveLayout
        title="Demonstrativos & Honorários"
        description="Central de análise e gerenciamento de demonstrativos de pagamento médico"
        mobileTitle="Demonstrativos"
        mobileDescription="Análise de honorários médicos"
        showMobileActions={isMobile}
        mobileActions={mobileActions}
        mobileScrollBehavior="sticky-header"
        className="bg-gradient-to-br from-blue-50/30 via-gray-50/20 to-emerald-50/30"
      >
        <div className={spacing}>
          {/* Header Desktop/Mobile Adaptativo */}
          <DeviceRender
            desktop={
              <div className="text-center space-y-3 pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200/50">
                  <FileBarChart className="h-4 w-4 text-emerald-700" />
                  <span className="text-xs font-medium text-emerald-800">
                    Análise financeira avançada
                  </span>
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-gray-800 bg-clip-text text-transparent">
                  Demonstrativos & Honorários
                </h1>

                <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
                  Central de análise e gerenciamento de demonstrativos de pagamento
                  médico com insights de performance
                </p>
              </div>
            }
            mobile={
              <div className="text-center space-y-2">
                <h1 className={titleClass}>Demonstrativos</h1>
                <p className="text-sm text-gray-600">Análise de honorários médicos</p>
              </div>
            }
          />

          {/* Upload Section */}
          <section id="upload-section" className="space-y-4">
            <Card className={card}>
              <CardHeader className={isMobile ? 'pb-3' : undefined}>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-emerald-600" />
                  {isMobile ? 'Upload' : 'Upload de Demonstrativos'}
                </CardTitle>
                <CardDescription>
                  {isMobile
                    ? 'Envie seus demonstrativos para análise'
                    : 'Faça upload dos seus demonstrativos de pagamento para análise financeira automatizada'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <Input
                      id="demo-file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.csv,.xlsx"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="cursor-pointer bg-white/80"
                    />
                  </div>
                  <Button
                    onClick={handleSimpleUpload}
                    disabled={uploadFiles.length === 0 || uploading}
                    className="min-w-[120px] bg-gradient-to-r from-emerald-600 to-emerald-700"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>

                {uploadFiles.length > 0 && (
                  <div className="text-sm text-emerald-700 bg-emerald-100/60 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <strong>{uploadFiles.length} arquivo(s) selecionado(s)</strong>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Cards de Resumo */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-full"></div>
              <h3 className="text-base font-medium text-gray-700">Resumo Financeiro</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>

            {loading ? (
              <div className={grid}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonInfoCard key={i} />
                ))}
              </div>
            ) : (
              <div className={grid}>
                {/* Cards de resumo responsivos */}
                <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                  <CardContent className="relative p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100">
                          <CheckCircle className="h-4 w-4 text-emerald-700" />
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                          Liberado
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                          Total Liberado
                        </p>
                        <p
                          className={`${
                            isMobile ? 'text-lg' : 'text-xl'
                          } font-bold text-emerald-800 leading-none`}
                        >
                          {formatCurrency(summaryStats.totalProcessado)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Repetir para outros cards... */}
                <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
                  <CardContent className="relative p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-rose-100">
                          <AlertCircle className="h-4 w-4 text-red-700" />
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                          Glosas
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                          Total Glosado
                        </p>
                        <p
                          className={`${
                            isMobile ? 'text-lg' : 'text-xl'
                          } font-bold text-red-800 leading-none`}
                        >
                          {formatCurrency(summaryStats.totalGlosa)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-sky-600"></div>
                  <CardContent className="relative p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-sky-100">
                          <FileText className="h-4 w-4 text-blue-700" />
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                          Processados
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Procedimentos
                        </p>
                        <p
                          className={`${
                            isMobile ? 'text-lg' : 'text-xl'
                          } font-bold text-blue-800 leading-none`}
                        >
                          {summaryStats.totalProcedimentos}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                  <CardContent className="relative p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                          <ClipboardList className="h-4 w-4 text-amber-700" />
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                          Analisados
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                          Demonstrativos
                        </p>
                        <p
                          className={`${
                            isMobile ? 'text-lg' : 'text-xl'
                          } font-bold text-amber-800 leading-none`}
                        >
                          {demonstratives.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>

          {/* Filtros - Desktop vs Mobile */}
          <DeviceRender
            mobile={
              <Card className={card}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">
                          Status
                        </Label>
                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="liberado">Liberado</SelectItem>
                            <SelectItem value="glosado">Glosado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-600">
                          Período
                        </Label>
                        <Select
                          value={selectedPeriod}
                          onValueChange={setSelectedPeriod}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="30d">30 dias</SelectItem>
                            <SelectItem value="90d">90 dias</SelectItem>
                            <SelectItem value="6m">6 meses</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {(searchTerm ||
                      selectedStatus !== 'all' ||
                      selectedPeriod !== 'all') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedStatus('all');
                          setSelectedPeriod('all');
                        }}
                        className="w-full"
                      >
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            }
            desktop={
              // Filtros desktop (versão original mais completa)
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full"></div>
                  <h3 className="text-base font-medium text-gray-700">
                    Filtros & Análise
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                </div>

                <Card className="bg-white/40 backdrop-blur-sm border border-gray-200/30 shadow-sm">
                  <CardContent className="p-4 space-y-4">
                    {/* Versão completa dos filtros para desktop */}
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por período, arquivo..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium whitespace-nowrap">
                          Status:
                        </Label>
                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger className="w-[140px] h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="liberado">Liberado</SelectItem>
                            <SelectItem value="glosado">Glosado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Filtros de data para desktop */}
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center bg-gray-50/30 p-3 rounded-lg border border-gray-200/40">
                      <Label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        Período de Upload:
                      </Label>

                      <div className="flex flex-wrap gap-3 items-center flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium whitespace-nowrap">
                            De:
                          </Label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                              setStartDate(e.target.value);
                              if (e.target.value) setSelectedPeriod('all');
                            }}
                            className="w-[140px] h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium whitespace-nowrap">
                            Até:
                          </Label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                              setEndDate(e.target.value);
                              if (e.target.value) setSelectedPeriod('all');
                            }}
                            className="w-[140px] h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm"
                          />
                        </div>

                        <div className="w-px h-6 bg-gray-300"></div>

                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium whitespace-nowrap">
                            Ou selecione:
                          </Label>
                          <Select
                            value={selectedPeriod}
                            onValueChange={(value) => {
                              setSelectedPeriod(value);
                              if (value !== 'all') {
                                setStartDate('');
                                setEndDate('');
                              }
                            }}
                          >
                            <SelectTrigger className="w-[120px] h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="30d">30 dias</SelectItem>
                              <SelectItem value="90d">90 dias</SelectItem>
                              <SelectItem value="6m">6 meses</SelectItem>
                              <SelectItem value="1y">1 ano</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(startDate ||
                          endDate ||
                          selectedPeriod !== 'all' ||
                          selectedStatus !== 'all' ||
                          searchTerm) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setStartDate('');
                              setEndDate('');
                              setSelectedPeriod('all');
                              setSelectedStatus('all');
                              setSearchTerm('');
                            }}
                            className="h-9 text-xs px-3 text-gray-600 hover:text-gray-800"
                          >
                            Limpar Filtros
                          </Button>
                        )}
                      </div>
                    </div>

                    {filteredDemonstratives.length !== demonstratives.length && (
                      <div className="text-xs text-gray-600 bg-blue-50/60 p-2 rounded-lg border border-blue-200/40">
                        Mostrando {filteredDemonstratives.length} de{' '}
                        {demonstratives.length} demonstrativos
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            }
          />

          {/* Grid/Lista Responsiva */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></div>
              <h3 className="text-base font-medium text-gray-700">
                {isMobile ? 'Seus Demonstrativos' : 'Análise Detalhada'}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>

            <ResponsiveDataGrid
              rows={filteredDemonstratives}
              columns={columns}
              loading={loading}
              emptyMessage="Nenhum demonstrativo encontrado"
              className="bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-lg"
              {...gridConfig}
              onAction={(action, data) => {
                if (action === 'view') {
                  // Abrir modal de detalhes ou navegar
                  navigate(`/demonstratives/${data.id}`);
                } else if (action === 'delete') {
                  handleDeleteDemonstrativo(data.id);
                }
              }}
              onRowClick={(row) => {
                if (isMobile) {
                  // Em mobile, clique no card abre detalhes
                  navigate(`/demonstratives/${row.id}`);
                }
              }}
            />
          </section>
        </div>
      </ResponsiveLayout>
    </>
  );
};

export default DemonstrativesResponsivePage;
