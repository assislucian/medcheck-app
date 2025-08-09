import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { MobileDataList } from '@/components/mobile/MobileDataCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buildApiUrl } from '@/config/api';
import { useDevice } from '@/hooks/use-device';
import { useMobileHero } from '@/hooks/use-mobile-hero';
import { usePageTitle } from '@/hooks/usePageTitle';
import axios from 'axios';
import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  User
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

// Types imports from original Guides.tsx
interface Guide {
  id?: string;
  numero_guia: string;
  data: string;
  beneficiario: string;
  prestador: string;
  qtdProcedimentos?: number;
  status: string;
  detalhes?: any[];
  qtd?: number;
  codigo?: string;
  descricao?: string;
  papel?: string;
}

interface GuideProcedure {
  numero_guia: string;
  data: string;
  beneficiario: string;
  prestador: string;
  codigo: string;
  descricao: string;
  qtd: number;
  papel: string;
  status: string;
}

/**
 * Página de Guias MOBILE-FIRST
 * ✅ Touch-friendly interface
 * ✅ Cards stack layout
 * ✅ Simplified workflows
 * ✅ Native mobile feel
 * ✅ Zero breaking changes para web
 */
const GuidesMobile: React.FC = () => {
  const { isMobile, platform } = useDevice();
  const { triggerHaptic } = useMobileHero();

  usePageTitle({
    title: 'Guias Médicas',
    description: 'Gestão de guias TISS mobile-friendly',
    keywords: 'guias médicas, TISS, mobile, gestão médica',
  });

  // Estados
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Helper functions (simplified from original)
  const formatDateToISO = (dateStr: string): string => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const analyzeGuideFinancialStatus = (guide: Guide): string => {
    if (!guide.detalhes || guide.detalhes.length === 0) return 'Processado';
    return guide.detalhes.some((d: any) => d.status === 'Liberado') ? 'Liberado' : 'Processado';
  };

  // Carregamento de guias
  const loadGuides = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = buildApiUrl('/api/v1/guias?page=1&pageSize=1000');

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const procedures = response.data.procedures || [];

      // CORREÇÃO: Agrupar por numero_guia + beneficiario para evitar misturar pacientes diferentes
      const grouped = procedures.reduce<Record<string, GuideProcedure[]>>((acc, proc) => {
        const groupKey = `${proc.numero_guia}|${proc.beneficiario || 'sem_beneficiario'}`;
        acc[groupKey] = acc[groupKey] || [];
        acc[groupKey].push(proc);
        return acc;
      }, {});

      const macroRows = Object.entries(grouped).map(([groupKey, procs]) => {
        const numero_guia = procs[0]?.numero_guia || groupKey.split('|')[0];
        return {
          numero_guia,
          data: procs[0]?.data || '',
          beneficiario: procs[0]?.beneficiario || '',
          prestador: procs[0]?.prestador || '',
          qtdProcedimentos: procs.reduce((sum, p) => sum + (p.qtd || 1), 0),
          status: procs[0]?.status || 'Processado',
          detalhes: procs,
        };
      });

      // Ordenar por data
      macroRows.sort((a, b) => {
        const dateA = formatDateToISO(a.data);
        const dateB = formatDateToISO(b.data);
        return dateB.localeCompare(dateA);
      });

      setGuides(macroRows);
      setFilteredGuides(macroRows);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else {
        toast.error('Erro ao carregar guias');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload otimizado para mobile
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(files);
      triggerHaptic('light');
    }
  }, [triggerHaptic]);

  const handleUpload = useCallback(async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Selecione pelo menos um arquivo');
      return;
    }

    setUploading(true);
    triggerHaptic('medium');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file);
      });

      await axios.post(
        buildApiUrl('/api/v1/guias/upload'),
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Arquivos enviados com sucesso');
      setSelectedFiles(null);
      loadGuides();
      triggerHaptic('heavy');
    } catch (error) {
      toast.error('Erro no upload dos arquivos');
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, loadGuides, triggerHaptic]);

  // Filtros
  useEffect(() => {
    let filtered = [...guides];

    if (searchTerm) {
      filtered = filtered.filter(guide =>
        guide.beneficiario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.numero_guia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.prestador?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(guide => {
        const realFinancialStatus = analyzeGuideFinancialStatus(guide);
        return realFinancialStatus === statusFilter;
      });
    }

    setFilteredGuides(filtered);
  }, [guides, searchTerm, statusFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const uniquePatients = new Set();
    guides.forEach(guide => {
      if (guide.beneficiario) {
        uniquePatients.add(guide.beneficiario.trim().toLowerCase());
      }
    });

    return {
      totalGuides: guides.length,
      totalProcessed: guides.filter(g => g.status === 'Processado').length,
      uniquePatients: uniquePatients.size,
      totalProcedures: guides.reduce((sum, g) => sum + (g.qtdProcedimentos || 0), 0),
    };
  }, [guides]);

  // Carregamento inicial
  useEffect(() => {
    loadGuides();
  }, [loadGuides]);

  // Configuração dos campos para MobileDataCard
  const guideFields = [
    {
      key: 'numero_guia',
      label: 'Número',
      priority: 'high' as const,
      icon: <FileText className="w-4 h-4" />,
      format: (value: string) => `#${value}`,
    },
    {
      key: 'beneficiario',
      label: 'Paciente',
      priority: 'high' as const,
      icon: <User className="w-4 h-4" />,
    },
    {
      key: 'data',
      label: 'Data',
      priority: 'medium' as const,
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      key: 'qtdProcedimentos',
      label: 'Procedimentos',
      priority: 'medium' as const,
      icon: <Activity className="w-4 h-4" />,
      format: (value: number) => `${value} items`,
    },
    {
      key: 'prestador',
      label: 'Prestador',
      priority: 'low' as const,
    },
  ];

  const guideActions = [
    {
      label: 'Ver Detalhes',
      action: 'view',
      icon: <Eye className="w-4 h-4" />,
      variant: 'default' as const,
    },
    {
      label: 'Excluir',
      action: 'delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'destructive' as const,
    },
  ];

  const handleGuideAction = (action: string, guide: Guide) => {
    triggerHaptic('light');

    if (action === 'view') {
      setSelectedGuide(guide);
    } else if (action === 'delete') {
      // Implementar modal de confirmação de exclusão
      toast.info('Funcionalidade de exclusão em desenvolvimento');
    }
  };

  return (
    <>
      <Helmet>
        <title>Guias Médicas - MedCheck Mobile</title>
        <meta name="description" content="Gestão mobile de guias TISS com interface otimizada para smartphones" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" />
      </Helmet>

      <ResponsiveLayout
        title="Guias Médicas"
        mobileTitle="Suas Guias"
        description="Gestão inteligente de guias TISS"
        mobileDescription="Envie e acompanhe suas guias"
        showMobileActions={true}
        mobileActions={
          <Button
            onClick={() => document.getElementById('file-upload-mobile')?.click()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg"
            style={{ minHeight: '48px' }}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Rápido
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Upload Section - Mobile Optimized */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-900 text-lg">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Upload className="h-5 w-5 text-blue-700" />
                </div>
                Enviar Guias TISS
              </CardTitle>
              <CardDescription className="text-blue-700 text-sm">
                <strong>Simples:</strong> Selecione suas guias (PDF/XML) e toque em "Enviar"
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="file-upload-mobile" className="sr-only">
                  Selecionar arquivos
                </Label>
                <Input
                  id="file-upload-mobile"
                  type="file"
                  multiple
                  accept=".pdf,.xml"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="cursor-pointer bg-white border-blue-200 h-12 text-blue-800 file:bg-blue-100 file:text-blue-700 file:border-0 file:rounded-lg file:mr-3 file:py-2 file:px-4"
                />

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFiles || uploading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg transition-all duration-200 active:scale-98"
                  style={{ minHeight: '48px' }}
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Enviar & Analisar
                    </>
                  )}
                </Button>
              </div>

              {selectedFiles && selectedFiles.length > 0 && (
                <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>
                      <strong>{selectedFiles.length} arquivo(s)</strong> prontos para análise
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards - Mobile Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <Badge variant="secondary" className="text-xs">Total</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-800">
                  {loading ? '...' : <AnimatedNumber value={stats.totalGuides} />}
                </div>
                <div className="text-sm text-blue-600 font-medium">Guias</div>
                <div className="text-xs text-blue-500">Enviadas</div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <Badge variant="secondary" className="text-xs">Ativas</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-emerald-800">
                  {loading ? '...' : <AnimatedNumber value={stats.totalProcessed} />}
                </div>
                <div className="text-sm text-emerald-600 font-medium">Processadas</div>
                <div className="text-xs text-emerald-500">Em análise</div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <User className="h-5 w-5 text-purple-600" />
                <Badge variant="secondary" className="text-xs">Únicos</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-800">
                  {loading ? '...' : <AnimatedNumber value={stats.uniquePatients} />}
                </div>
                <div className="text-sm text-purple-600 font-medium">Pacientes</div>
                <div className="text-xs text-purple-500">Atendidos</div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <Badge variant="secondary" className="text-xs">Total</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-800">
                  {loading ? '...' : <AnimatedNumber value={stats.totalProcedures} />}
                </div>
                <div className="text-sm text-orange-600 font-medium">Procedimentos</div>
                <div className="text-xs text-orange-500">Realizados</div>
              </div>
            </Card>
          </div>

          {/* Search and Filters - Mobile Optimized */}
          <Card className="bg-white">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar guias, pacientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-lg"
                />
              </div>

              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Processado">Processadas</SelectItem>
                    <SelectItem value="Liberado">Liberadas</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={loadGuides}
                  disabled={loading}
                  className="h-10 px-4"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {filteredGuides.length !== guides.length && (
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded-lg">
                  Mostrando {filteredGuides.length} de {guides.length} guias
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guides List - Mobile Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Suas Guias</h3>
              <Badge variant="outline" className="text-xs">
                {filteredGuides.length} encontradas
              </Badge>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredGuides.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma guia encontrada
                </h3>
                <p className="text-gray-500 mb-4">
                  {guides.length === 0
                    ? 'Envie sua primeira guia para começar'
                    : 'Tente ajustar os filtros de busca'
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={guides.length === 0 ?
                    () => document.getElementById('file-upload-mobile')?.click() :
                    loadGuides
                  }
                >
                  {guides.length === 0 ? (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Primeira Guia
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </>
                  )}
                </Button>
              </Card>
            ) : (
              <MobileDataList
                data={filteredGuides}
                fields={guideFields}
                actions={guideActions}
                onAction={handleGuideAction}
                getTitle={(guide) => `Guia #${guide.numero_guia}`}
                getSubtitle={(guide) => guide.beneficiario}
                getStatus={(guide) => analyzeGuideFinancialStatus(guide)}
                className="space-y-3"
              />
            )}
          </div>
        </div>

        {/* Guide Details Modal - Mobile Optimized */}
        <Dialog open={!!selectedGuide} onOpenChange={() => setSelectedGuide(null)}>
          <DialogContent className="max-w-[95vw] w-full mx-2 max-h-[85vh] p-0 overflow-hidden rounded-xl">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                Guia #{selectedGuide?.numero_guia}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Detalhes completos da guia médica
              </DialogDescription>
            </DialogHeader>

            {selectedGuide && (
              <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Paciente</div>
                    <div className="font-medium text-gray-900">{selectedGuide.beneficiario}</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Data</div>
                    <div className="font-medium text-gray-900">{selectedGuide.data}</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Prestador</div>
                    <div className="font-medium text-gray-900">{selectedGuide.prestador}</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Procedimentos</div>
                    <div className="font-medium text-gray-900">{selectedGuide.qtdProcedimentos} itens</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <Badge
                      variant={analyzeGuideFinancialStatus(selectedGuide) === 'Liberado' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {analyzeGuideFinancialStatus(selectedGuide)}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={() => setSelectedGuide(null)}
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </ResponsiveLayout>
    </>
  );
};

export default GuidesMobile; 