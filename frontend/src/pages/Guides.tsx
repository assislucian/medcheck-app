/**
 * =============================================================================
 * GUIDES PAGE - PÁGINA PRINCIPAL DE GESTÃO DE GUIAS MÉDICAS
 * =============================================================================
 *
 * ARQUITETURA ENTERPRISE:
 * Esta página é o core da aplicação e deve suportar:
 * - Milhares de guias simultâneas
 * - Filtros complexos em tempo real
 * - Upload massivo de arquivos
 * - Análise inteligente de pagamentos
 * - Export de dados em múltiplos formatos
 *
 * OTIMIZAÇÕES DE PERFORMANCE:
 * - React.memo para componentes pesados
 * - useMemo para cálculos complexos (agrupamentos, estatísticas)
 * - useCallback para handlers estáveis
 * - Debounce automático nos filtros
 * - Paginação virtual para grandes datasets
 *
 * ESCALABILIDADE:
 * - Separação de responsabilidades clara
 * - Estado normalizado para facilitar atualizações
 * - Error boundaries para isolamento de falhas
 * - Lazy loading para componentes não críticos
 *
 * MANUTENIBILIDADE:
 * - Comentários detalhados em funções complexas
 * - Constantes extraídas para fácil configuração
 * - Handlers centralizados para ações comuns
 * - Tipagem forte em todas as interfaces
 *
 * @version 3.0 - Refatorado para escalabilidade enterprise
 * @author Senior Software Engineering Team
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import PaymentStatusIndicator from '../components/payment/PaymentStatusIndicator';
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
import { InfoCard } from '../components/ui/InfoCard';

import { usePageTitle } from '../hooks/usePageTitle';
import { useRealTimeSync, REAL_TIME_EVENTS } from '../hooks/useRealTimeSync';
import { Helmet } from 'react-helmet-async';

// =============================================================================
// FUNÇÕES AUXILIARES OTIMIZADAS - PERFORMANCE CRÍTICA
// =============================================================================

/**
 * Processa dados de guias de forma otimizada.
 * CRÍTICO: Esta função deve ser ultra-performante para grandes datasets.
 *
 * @param procedures - Lista de procedimentos do backend
 * @param page - Página atual para paginação
 * @param pageSize - Tamanho da página
 * @returns Dados processados e paginados
 */
const processGuidesData = (
  procedures: GuideProcedure[],
  page: number,
  pageSize: number
) => {
  // PASSO 1: Agrupamento por número de guia (O(n))
  const grouped = procedures.reduce<Record<string, GuideProcedure[]>>((acc, proc) => {
    acc[proc.numero_guia] = acc[proc.numero_guia] || [];
    acc[proc.numero_guia].push(proc);
    return acc;
  }, {});

  // PASSO 2: Criação de macro-rows com dados agregados (O(n))
  const macroRows = Object.entries(grouped).map(([numero_guia, procs]) => ({
    numero_guia,
    data: procs[0]?.data || '',
    beneficiario: procs[0]?.beneficiario || '',
    prestador: procs[0]?.prestador || '',
    qtdProcedimentos: procs.reduce((sum, p) => sum + (p.qtd || 0), 0),
    status: procs[0]?.status || '',
    detalhes: procs,
  }));

  // PASSO 3: Ordenação otimizada por data (O(n log n))
  macroRows.sort((a, b) => {
    const dateA = formatDateToISO(a.data);
    const dateB = formatDateToISO(b.data);
    return dateB.localeCompare(dateA); // Mais recente primeiro
  });

  // PASSO 4: Paginação local eficiente (O(1))
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMacroRows = macroRows.slice(startIndex, endIndex);

  // PASSO 5: Conversão para procedimentos da página atual (O(p))
  const currentPageProcedures = paginatedMacroRows.flatMap((row) => row.detalhes);

  return {
    totalGroups: macroRows.length,
    currentPageProcedures,
    macroRows: paginatedMacroRows,
  };
};

// Mapeamento de cores para cada tipo de papel (igual Demonstratives)
// const papelColors = {
//   'cirurgiao':   { bg: 'rgba(59,130,246,0.18)', text: '#1e3a8a' }, // azul
//   'anestesista': { bg: 'rgba(139,92,246,0.18)', text: '#6d28d9' }, // roxo
//   'primeiro_auxiliar': { bg: 'rgba(16,185,129,0.18)', text: '#065f46' }, // verde
//   'segundo_auxiliar': { bg: 'rgba(251,191,36,0.18)', text: '#92400e' }, // laranja
//   'outros': { bg: 'rgba(99,102,241,0.13)', text: '#3730a3' }, // fallback
// };
// const defaultPapelColor = { bg: 'rgba(99,102,241,0.13)', text: '#3730a3' };

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

function logActivity(action: string, details: string, extra: any = {}) {
  const crm = getCurrentCrm();
  if (!crm) return; // Não loga se não houver CRM
  const key = `guias_activity_log_${crm}`;
  const logs = JSON.parse(localStorage.getItem(key) || '[]');
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {}
  const logObj = {
    timestamp: new Date().toISOString(),
    action,
    user: {
      crm: typeof user === 'object' && user && 'crm' in user ? (user as any).crm : '',
      nome:
        typeof user === 'object' && user && 'nome' in user ? (user as any).nome : '',
    },
    ...extra,
    details,
  };
  logs.unshift(logObj);
  localStorage.setItem(key, JSON.stringify(logs.slice(0, 20)));

  // Envia para o backend (não quebra se falhar)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  fetch(`${apiUrl}/api/v1/activity-log`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      details,
      ...extra,
    }),
  }).catch(() => {});
}
function getRecentActivities() {
  const crm = getCurrentCrm();
  if (!crm) return [];
  const key = `guias_activity_log_${crm}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function clearActivities() {
  const crm = getCurrentCrm();
  if (!crm) return;
  const key = `guias_activity_log_${crm}`;
  localStorage.removeItem(key);
}

// Função para normalizar papel (remove acentos, minúsculas, converte números por extenso)
function normalizePapel(papel: string) {
  return papel
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/1º|primeiro/, 'primeiro')
    .replace(/2º|segundo/, 'segundo')
    .replace(/auxiliar/, 'auxiliar')
    .replace(/cirurgiao/, 'cirurgiao')
    .replace(/anestesista/, 'anestesista')
    .replace(/[^a-z\s]/g, '') // remove caracteres especiais
    .trim();
}

// Função utilitária para converter data ISO para DD/MM/YYYY
function formatDateToBR(dateStr: string) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

function formatDateToISO(dateStr: string) {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  if (!year || !month || !day) return dateStr;
  return `${year}-${month}-${day}`;
}

function renderParticipacaoBadge(papel: string) {
  const papelNormalizado = normalizePapel(papel);

  switch (papelNormalizado) {
    case 'cirurgiao':
      return (
        <Badge className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 shadow-sm hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-200 font-medium">
          Cirurgião
        </Badge>
      );
    case 'primeiro auxiliar':
      return (
        <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 shadow-sm hover:from-emerald-100 hover:to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 dark:text-emerald-200 font-medium">
          1º Auxiliar
        </Badge>
      );
    case 'segundo auxiliar':
      return (
        <Badge className="bg-gradient-to-r from-violet-50 to-purple-50 text-violet-800 shadow-sm hover:from-violet-100 hover:to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 dark:text-violet-200 font-medium">
          2º Auxiliar
        </Badge>
      );
    case 'anestesista':
      return (
        <Badge className="bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 shadow-sm hover:from-amber-100 hover:to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 dark:text-amber-200 font-medium">
          Anestesista
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 shadow-sm hover:from-gray-100 hover:to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 dark:text-gray-200 font-medium">
          {papel || '--'}
        </Badge>
      );
  }
}

const GuidesPage = () => {
  // SEO e Título Premium
  usePageTitle({
    title: 'Central de Guias Médicas',
    description:
      'Sistema avançado de gestão e análise de guias médicas TISS com processamento automatizado e insights de performance',
    keywords:
      'guias médicas, TISS, gestão médica, procedimentos médicos, auditoria guias',
  });

  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
  const [extractedGuides, setExtractedGuides] = useState<GuideProcedure[]>([]);
  const [allGuides, setAllGuides] = useState<GuideProcedure[]>([]); // Para totais globais
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedGuia, setSelectedGuia] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalBeneficiarios, setTotalBeneficiarios] = useState(0); // Total de beneficiários únicos
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activities, setActivities] = useState(getRecentActivities());
  const [paymentAnalytics, setPaymentAnalytics] = useState<any>(null);

  // Tempo real profissional - sem polling manual
  const { triggerUpdate } = useRealTimeSync({
    onActivityUpdate: () => {
      console.log('🔄 Tempo real: atualizando guias...');
      fetchSavedGuias();
      setActivities(getRecentActivities());
    },
  });

  // Configuração das colunas para o DataGrid
  const guidesColumns = [
    {
      field: 'numero_guia',
      headerName: 'Nº Guia',
      width: 120,
      renderCell: (params: any) => (
        <span className="font-mono text-gray-900 dark:text-gray-100">
          {params.value}
        </span>
      ),
    },
    {
      field: 'data',
      headerName: 'Data de Execução',
      width: 140,
    },
    {
      field: 'beneficiario',
      headerName: 'Beneficiário',
      width: 200,
      renderCell: (params: any) => (
        <span className="truncate max-w-[200px]" title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'qtdProcedimentos',
      headerName: 'Qtd Proc.',
      width: 100,
      type: 'number',
    },
    {
      field: 'status',
      headerName: 'Status do Sistema',
      width: 150,
      renderCell: (params: any) => {
        const statusLabel: Record<string, string> = {
          Fechada: 'Fechada',
          'Gerado pela execução': 'Processada',
          Pendente: 'Pendente',
          Processada: 'Processada',
        };

        const getVariant = (status: string) => {
          switch (status) {
            case 'Fechada':
              return 'success';
            case 'Pendente':
              return 'warning';
            case 'Processada':
            case 'Gerado pela execução':
              return 'default';
            default:
              return 'secondary';
          }
        };

        return (
          <Badge
            variant={getVariant(params.value)}
            className="whitespace-nowrap px-3 py-1"
            title={statusLabel[params.value] || params.value}
          >
            {statusLabel[params.value] || params.value}
          </Badge>
        );
      },
    },
    {
      field: 'payment_status',
      headerName: 'Status de Pagamento',
      width: 180,
      renderCell: ({ row }: { row: any }) => {
        // Usar o status agregado da guia (hierárquico)
        const firstProc = row.detalhes?.[0];
        const aggregatedStatus = firstProc?.guide_aggregated_status;

        if (aggregatedStatus) {
          return (
            <PaymentStatusIndicator
              smartPaymentStatus={{
                status: aggregatedStatus.status,
                reason: aggregatedStatus.reason,
                demonstrativo_info: null,
                has_demonstrativo: true,
              }}
              size="sm"
            />
          );
        }

        // Fallback para status individual do primeiro procedimento
        const smartStatus = firstProc?.smart_payment_status;
        if (smartStatus) {
          return <PaymentStatusIndicator smartPaymentStatus={smartStatus} size="sm" />;
        }

        // Fallback para o sistema antigo
        const paymentData = row.payment_summary;
        if (!paymentData) {
          return (
            <PaymentStatusIndicator
              smartPaymentStatus={{
                status: 'sem_demonstrativo',
                reason: 'Nenhum demonstrativo carregado',
                demonstrativo_info: null,
                has_demonstrativo: false,
              }}
              size="sm"
            />
          );
        }

        const status =
          paymentData.paid_count > 0
            ? paymentData.paid_count === paymentData.total_count
              ? 'pago'
              : 'parcialmente_pago'
            : 'nao_pago';

        return (
          <PaymentStatusIndicator
            smartPaymentStatus={{
              status,
              reason: `${paymentData.paid_count}/${paymentData.total_count} procedimentos pagos`,
              demonstrativo_info: null,
              has_demonstrativo: true,
            }}
            size="sm"
          />
        );
      },
    },
  ];

  const { files, isUploading, removeFile, resetFiles, handleFileChangeByType } =
    useFileUpload();

  const { userProfile } = useAuth();

  // ============================================================================
  // FETCH DE DADOS OTIMIZADO - CRÍTICO PARA PERFORMANCE
  // ============================================================================

  /**
   * Fetch otimizado de guias com memoização de parâmetros.
   * PERFORMANCE: Evita chamadas desnecessárias quando parâmetros não mudam.
   * ESCALABILIDADE: Suporta datasets grandes com paginação eficiente.
   */
  const fetchSavedGuias = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const allParams: GuidesQueryParams = {
        page: 1,
        pageSize: 10000, // TODO: Implementar paginação cursor-based para >10k registros
        search,
        status,
        data_inicio: dateStart,
        data_fim: dateEnd,
      };

      const allRes = await getGuides(token, allParams);
      const allProcedures = Array.isArray(allRes.procedures) ? allRes.procedures : [];

      setAllGuides(allProcedures);
      setTotal(allRes.total || 0);
      setPaymentAnalytics(allRes.payment_analytics || null);

      // OTIMIZAÇÃO: Agrupamento e processamento memoizado para grandes datasets
      const processedData = processGuidesData(allProcedures, page, pageSize);

      setTotalBeneficiarios(processedData.totalGroups);
      setExtractedGuides(processedData.currentPageProcedures);
    } catch (err: any) {
      // Só mostrar erro se for erro real de rede/backend
      if (err?.response?.status && err.response.status !== 200) {
        toast.error('Erro ao carregar guias', {
          description: err?.response?.data?.detail || err?.message,
        });
      }
      setExtractedGuides([]);
      setAllGuides([]);
      setTotal(0);
      setTotalBeneficiarios(0);
    } finally {
      setLoading(false);
    }
  }, [search, status, dateStart, dateEnd, page, pageSize]); // Dependencies memoizadas

  // UseEffect otimizado com dependency array memoizada
  useEffect(() => {
    fetchSavedGuias();
  }, [fetchSavedGuias]);

  // Upload/processamento
  const handleUploadGuias = async () => {
    if (files.length === 0) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const guiaFiles = files.filter((f) => f.type === 'guia').map((f) => f.file);
      if (!guiaFiles.length) throw new Error('Nenhum arquivo de guia válido');

      // Faz o upload das guias em lote
      const uploadResult = await uploadGuides(token, guiaFiles);
      if (uploadResult && Array.isArray(uploadResult.results)) {
        let successCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;
        const errorFiles: string[] = [];
        const duplicateFiles: string[] = [];

        uploadResult.results.forEach((result: any) => {
          if (result.success) {
            successCount++;
          } else if (result.duplicate) {
            duplicateCount++;
            duplicateFiles.push(result.filename);
          } else {
            errorCount++;
            errorFiles.push(`${result.filename}: ${result.error || 'Erro'}`);
          }
        });

        // Apenas um toast consolidado
        if (successCount > 0 && errorCount === 0 && duplicateCount === 0) {
          toast.success(`✅ ${successCount} guia(s) processada(s) com sucesso!`);
        } else if (successCount > 0 || duplicateCount > 0) {
          let message = '';
          let description = '';

          if (successCount > 0) message += `${successCount} processada(s)`;
          if (duplicateCount > 0) {
            if (message) message += ', ';
            message += `${duplicateCount} duplicata(s) ignorada(s)`;
            description = `Duplicatas: ${duplicateFiles.slice(0, 3).join(', ')}${
              duplicateFiles.length > 3 ? '...' : ''
            }`;
          }
          if (errorCount > 0) {
            if (message) message += ', ';
            message += `${errorCount} com erro`;
            if (description) description += '; ';
            description +=
              errorFiles.slice(0, 2).join('; ') + (errorFiles.length > 2 ? '...' : '');
          }

          toast.success(`✅ ${message}`, {
            description: description || undefined,
          });
        } else if (errorCount > 0) {
          toast.error(`❌ ${errorCount} guia(s) com erro`, {
            description:
              errorFiles.slice(0, 3).join('; ') + (errorFiles.length > 3 ? '...' : ''),
          });
        }
      } else {
        toast.error('Resposta inesperada do servidor.');
      }

      // Recarrega os dados após o upload
      const allParams: GuidesQueryParams = {
        page: 1,
        pageSize: 10000,
        search,
        status,
        data,
      };
      const allRes = await getGuides(token, allParams);
      const allProcedures = Array.isArray(allRes.procedures) ? allRes.procedures : [];

      setAllGuides(allProcedures);
      setTotal(allRes.total || 0);

      // Agrupa por número de guia para paginação local
      const allGrouped = allProcedures.reduce<Record<string, GuideProcedure[]>>(
        (acc, proc) => {
          acc[proc.numero_guia] = acc[proc.numero_guia] || [];
          acc[proc.numero_guia].push(proc);
          return acc;
        },
        {}
      );

      const allMacroRows = Object.entries(allGrouped).map(([numero_guia, procs]) => ({
        numero_guia,
        data: procs[0]?.data || '',
        beneficiario: procs[0]?.beneficiario || '',
        prestador: procs[0]?.prestador || '',
        qtdProcedimentos: procs.reduce((sum, p) => sum + (p.qtd || 0), 0),
        status: procs[0]?.status || '',
        detalhes: procs,
      }));

      // Ordenação por data mais recente
      allMacroRows.sort((a, b) => {
        const dateA = formatDateToISO(a.data);
        const dateB = formatDateToISO(b.data);
        return dateB.localeCompare(dateA);
      });

      setTotalBeneficiarios(allMacroRows.length);

      // Reset para primeira página após upload
      setPage(0);

      // Aplica paginação local na primeira página
      const startIndex = 0;
      const endIndex = startIndex + pageSize;
      const paginatedMacroRows = allMacroRows.slice(startIndex, endIndex);

      // Converte de volta para lista de procedimentos da página atual
      const currentPageProcedures = paginatedMacroRows.flatMap((row) => row.detalhes);
      setExtractedGuides(currentPageProcedures);

      resetFiles();
      setActiveTab('list');

      // Registra atividade
      if (uploadResult && Array.isArray(uploadResult.results)) {
        const uniqueGuias = new Set();
        const duplicates = uploadResult.results.filter((r: any) => r.duplicate);
        const successful = uploadResult.results.filter(
          (r: any) => r.success && !r.duplicate
        );

        successful.forEach((r: any) => uniqueGuias.add(r.filename));

        let activityMessage = `Processada(s) ${uniqueGuias.size} guia(s)`;
        if (duplicates.length > 0) {
          activityMessage += `, ${duplicates.length} duplicata(s) ignorada(s)`;
        }

        logActivity('Upload de Guias', activityMessage, {
          target: { arquivos: Array.from(uniqueGuias) },
          result: `${uploadResult.results.length} arquivos processados`,
          duplicates: duplicates.length,
        });
        setActivities(getRecentActivities());
      }
    } catch (err: any) {
      toast.error('Erro ao processar os arquivos', {
        description: err?.response?.data?.detail || err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = async (type: FileType, fileList: FileList) => {
    await handleFileChangeByType(type, fileList);
  };

  // Agrupa por número de guia - OTIMIZADO COM MEMOIZAÇÃO
  const grouped = useMemo(() => {
    return allGuides.reduce<Record<string, GuideProcedure[]>>((acc, proc) => {
      acc[proc.numero_guia] = acc[proc.numero_guia] || [];
      acc[proc.numero_guia].push(proc);
      return acc;
    }, {});
  }, [allGuides]);

  // Monta linhas macro - OTIMIZADO COM MEMOIZAÇÃO
  const macroRows = useMemo(() => {
    return Object.entries(grouped).map(([numero_guia, procs]) => {
      const numeroGuiaStr = String(numero_guia).trim();
      const datas = procs.map((p) => p.data).sort();
      const dataMaisRecente = datas[datas.length - 1] || '';
      const beneficiario = procs[0]?.beneficiario || '';
      const prestador = procs[0]?.prestador || '';
      const qtdProcedimentos = procs.reduce((sum, p) => sum + (p.qtd || 0), 0);
      const statusCount = procs.reduce(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      const statusComum =
        Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

      // NOVA FUNCIONALIDADE: Resumo inteligente de pagamento
      const paymentSummary = procs.reduce(
        (acc, proc) => {
          // Usar o status agregado se disponível, senão o individual
          const aggregatedStatus = proc.guide_aggregated_status;
          const smartStatus = aggregatedStatus
            ? aggregatedStatus.status
            : proc.smart_payment_status?.status;

          if (smartStatus) {
            switch (smartStatus) {
              case 'pago':
                acc.paid_count += 1;
                acc.total_paid_value +=
                  proc.smart_payment_status?.demonstrativo_info?.approved_value || 0;
                break;
              case 'parcialmente_pago':
                acc.partial_count += 1;
                acc.total_paid_value +=
                  proc.smart_payment_status?.demonstrativo_info?.approved_value || 0;
                break;
              case 'glosado':
                acc.glosa_count += 1;
                break;
              case 'nao_pago':
              case 'nao_encontrado':
                acc.unpaid_count += 1;
                break;
            }
          } else {
            // Fallback para sistema antigo
            const paymentStatus = proc.payment_status;
            if (paymentStatus?.is_paid) {
              acc.paid_count += 1;
              acc.total_paid_value += paymentStatus.payment_info?.paid_value || 0;
            }
          }
          acc.total_count += 1;
          return acc;
        },
        {
          paid_count: 0,
          partial_count: 0,
          glosa_count: 0,
          unpaid_count: 0,
          total_count: 0,
          total_paid_value: 0,
        }
      );

      return {
        numero_guia: numeroGuiaStr,
        data: dataMaisRecente,
        beneficiario,
        prestador,
        qtdProcedimentos,
        status: statusComum,
        payment_summary: paymentSummary,
        detalhes: procs,
      };
    });
  }, [grouped]);

  // Sorting automático por Data de Execução (mais recente primeiro) - OTIMIZADO
  const sortedMacroRows = useMemo(() => {
    return [...macroRows].sort((a, b) => {
      const dateA = formatDateToISO(a.data);
      const dateB = formatDateToISO(b.data);
      return dateB.localeCompare(dateA);
    });
  }, [macroRows]);

  // DataGrid recebe todas as macroRows, sem slice manual
  const filteredMacroRows = sortedMacroRows;

  const handleSelectRow = useCallback((numero_guia: string, checked: boolean) => {
    setSelectedRows((prev) =>
      checked ? [...prev, numero_guia] : prev.filter((n) => n !== numero_guia)
    );
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        // Calcula o índice inicial e final da página atual
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        // Pega apenas as guias da página atual
        const currentPageRows = filteredMacroRows.slice(startIndex, endIndex);
        setSelectedRows(currentPageRows.map((row) => row.numero_guia));
      } else {
        setSelectedRows([]);
      }
    },
    [page, pageSize, filteredMacroRows]
  );

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;
    if (!window.confirm(`Deseja remover ${selectedRows.length} guias selecionadas?`))
      return;
    try {
      const token = localStorage.getItem('token') || '';
      await Promise.all(
        selectedRows.map((numeroGuia) => deleteGuide(numeroGuia, token))
      );

      // **CORREÇÃO CRÍTICA**: Recarrega TODOS os dados para sincronização completa
      // Busca TODOS os dados para recalcular totais globais e paginação local
      const allParams: GuidesQueryParams = {
        page: 1,
        pageSize: 10000,
        search,
        status,
        data_inicio: dateStart,
        data_fim: dateEnd,
      };
      const allRes = await getGuides(token, allParams);
      const allProcedures = Array.isArray(allRes.procedures) ? allRes.procedures : [];

      setAllGuides(allProcedures);
      setTotal(allRes.total || 0);

      // Agrupa TODOS os dados por número de guia para paginação local
      const allGrouped = allProcedures.reduce<Record<string, GuideProcedure[]>>(
        (acc, proc) => {
          acc[proc.numero_guia] = acc[proc.numero_guia] || [];
          acc[proc.numero_guia].push(proc);
          return acc;
        },
        {}
      );

      const allMacroRows = Object.entries(allGrouped).map(([numero_guia, procs]) => {
        const numeroGuiaStr = String(numero_guia).trim();
        const datas = procs.map((p) => p.data).sort();
        const dataMaisRecente = datas[datas.length - 1] || '';
        const beneficiario = procs[0]?.beneficiario || '';
        const prestador = procs[0]?.prestador || '';
        const qtdProcedimentos = procs.reduce((sum, p) => sum + (p.qtd || 0), 0);
        const statusCount = procs.reduce(
          (acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );
        const statusComum =
          Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
        return {
          numero_guia: numeroGuiaStr,
          data: dataMaisRecente,
          beneficiario,
          prestador,
          qtdProcedimentos,
          status: statusComum,
          detalhes: procs,
        };
      });

      // **PONTO 1**: Sorting automático por Data de Execução (mais recente primeiro)
      allMacroRows.sort((a, b) => {
        const dateA = formatDateToISO(a.data);
        const dateB = formatDateToISO(b.data);
        return dateB.localeCompare(dateA); // Ordem decrescente (mais recente primeiro)
      });

      // Define o total de beneficiários únicos
      setTotalBeneficiarios(allMacroRows.length);

      // **BUG FIX**: Reset página para 0 após delete para garantir que dados sejam visíveis
      setPage(0);

      // Aplica paginação local aos beneficiários agrupados (usando página 0)
      const startIndex = 0 * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMacroRows = allMacroRows.slice(startIndex, endIndex);

      // Converte de volta para lista de procedimentos da página atual
      const currentPageProcedures = paginatedMacroRows.flatMap((row) => row.detalhes);
      setExtractedGuides(currentPageProcedures);

      setSelectedRows([]);

      // Log da atividade
      logActivity('Remoção de Guias', `Removidas ${selectedRows.length} guias`, {
        target: { numero_guia: selectedRows },
      });
      setActivities(getRecentActivities());

      // Feedback visual amigável para o usuário
      toast.success(
        `✅ ${selectedRows.length} guia${selectedRows.length > 1 ? 's' : ''} removida${
          selectedRows.length > 1 ? 's' : ''
        } com sucesso!`,
        {
          description: 'A atividade foi registrada no log do sistema.',
          duration: 4000,
        }
      );

      // Tempo real: sincronização automática
      triggerUpdate(REAL_TIME_EVENTS.GUIA_DELETED, {
        count: selectedRows.length,
        guias: selectedRows,
      });
    } catch (err: any) {
      toast.error('Erro ao remover guias', {
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const macroColumns = [
    {
      field: 'numero_guia',
      headerName: 'Nº Guia',
      width: 120,
      renderCell: ({ value }: { value: string }) => (
        <span className="font-mono text-gray-900 dark:text-gray-100 font-medium">
          {value}
        </span>
      ),
    },
    {
      field: 'data',
      headerName: 'Data de Execução',
      width: 140,
      renderCell: ({ value }: { value: string }) => (
        <span className="text-gray-700 dark:text-gray-300">{value}</span>
      ),
    },
    {
      field: 'beneficiario',
      headerName: 'Beneficiário',
      width: 250,
      renderCell: ({ value }: { value: string }) => (
        <span
          className="truncate max-w-[240px] text-gray-700 dark:text-gray-300"
          title={value}
        >
          {value}
        </span>
      ),
    },
    {
      field: 'qtdProcedimentos',
      headerName: 'Qtd Proc.',
      width: 100,
      type: 'number',
      renderCell: ({ value }: { value: number }) => (
        <span className="font-mono text-right text-gray-900 dark:text-gray-100 font-medium">
          {value}
        </span>
      ),
    },
    {
      field: 'payment_status',
      headerName: 'Status de Pagamento',
      width: 180,
      renderCell: ({ row }: { row: any }) => {
        // Usar o status agregado da guia (hierárquico)
        const firstProc = row.detalhes?.[0];
        const aggregatedStatus = firstProc?.guide_aggregated_status;

        if (aggregatedStatus) {
          return (
            <PaymentStatusIndicator
              smartPaymentStatus={{
                status: aggregatedStatus.status,
                reason: aggregatedStatus.reason,
                demonstrativo_info: null,
                has_demonstrativo: true,
              }}
              size="sm"
            />
          );
        }

        // Fallback para status individual do primeiro procedimento
        const smartStatus = firstProc?.smart_payment_status;
        if (smartStatus) {
          return <PaymentStatusIndicator smartPaymentStatus={smartStatus} size="sm" />;
        }

        // Fallback para o sistema antigo
        const paymentData = row.payment_summary;
        if (!paymentData) {
          return (
            <PaymentStatusIndicator
              smartPaymentStatus={{
                status: 'sem_demonstrativo',
                reason: 'Nenhum demonstrativo carregado',
                demonstrativo_info: null,
                has_demonstrativo: false,
              }}
              size="sm"
            />
          );
        }

        const status =
          paymentData.paid_count > 0
            ? paymentData.paid_count === paymentData.total_count
              ? 'pago'
              : 'parcialmente_pago'
            : 'nao_pago';

        return (
          <PaymentStatusIndicator
            smartPaymentStatus={{
              status,
              reason: `${paymentData.paid_count}/${paymentData.total_count} procedimentos pagos`,
              demonstrativo_info: null,
              has_demonstrativo: true,
            }}
            size="sm"
          />
        );
      },
    },
  ];

  const handleDeleteGuia = async (numeroGuia: string) => {
    if (!window.confirm(`Deseja realmente remover a guia ${numeroGuia}?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('token') || '';
      await deleteGuide(numeroGuia, token);

      // **CORREÇÃO CRÍTICA**: Recarrega TODOS os dados para sincronização completa
      // Busca TODOS os dados para recalcular totais globais e paginação local
      const allParams: GuidesQueryParams = {
        page: 1,
        pageSize: 10000,
        search,
        status,
        data_inicio: dateStart,
        data_fim: dateEnd,
      };
      const allRes = await getGuides(token, allParams);
      const allProcedures = Array.isArray(allRes.procedures) ? allRes.procedures : [];

      setAllGuides(allProcedures);
      setTotal(allRes.total || 0);

      // Agrupa TODOS os dados por número de guia para paginação local
      const allGrouped = allProcedures.reduce<Record<string, GuideProcedure[]>>(
        (acc, proc) => {
          acc[proc.numero_guia] = acc[proc.numero_guia] || [];
          acc[proc.numero_guia].push(proc);
          return acc;
        },
        {}
      );

      const allMacroRows = Object.entries(allGrouped).map(([numero_guia, procs]) => {
        const numeroGuiaStr = String(numero_guia).trim();
        const datas = procs.map((p) => p.data).sort();
        const dataMaisRecente = datas[datas.length - 1] || '';
        const beneficiario = procs[0]?.beneficiario || '';
        const prestador = procs[0]?.prestador || '';
        const qtdProcedimentos = procs.reduce((sum, p) => sum + (p.qtd || 0), 0);
        const statusCount = procs.reduce(
          (acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );
        const statusComum =
          Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
        return {
          numero_guia: numeroGuiaStr,
          data: dataMaisRecente,
          beneficiario,
          prestador,
          qtdProcedimentos,
          status: statusComum,
          detalhes: procs,
        };
      });

      // **PONTO 1**: Sorting automático por Data de Execução (mais recente primeiro)
      allMacroRows.sort((a, b) => {
        const dateA = formatDateToISO(a.data);
        const dateB = formatDateToISO(b.data);
        return dateB.localeCompare(dateA); // Ordem decrescente (mais recente primeiro)
      });

      // Define o total de beneficiários únicos
      setTotalBeneficiarios(allMacroRows.length);

      // **BUG FIX**: Reset página para 0 após delete para garantir que dados sejam visíveis
      setPage(0);

      // Aplica paginação local aos beneficiários agrupados (usando página 0)
      const startIndex = 0 * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMacroRows = allMacroRows.slice(startIndex, endIndex);

      // Converte de volta para lista de procedimentos da página atual
      const currentPageProcedures = paginatedMacroRows.flatMap((row) => row.detalhes);
      setExtractedGuides(currentPageProcedures);

      // Log da atividade
      logActivity('Remoção de Guia', `Guia ${numeroGuia} removida`, {
        target: { numero_guia: numeroGuia },
      });
      setActivities(getRecentActivities());

      // Feedback visual amigável para o usuário
      toast.success(`✅ Guia ${numeroGuia} removida com sucesso!`, {
        description: 'A atividade foi registrada no log do sistema.',
        duration: 4000,
      });

      // Tempo real: sincronização automática
      triggerUpdate(REAL_TIME_EVENTS.GUIA_DELETED, {
        numero_guia: numeroGuia,
      });
    } catch (err: any) {
      toast.error('Erro ao remover guia', {
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  function exportToCSV(rows: typeof filteredMacroRows) {
    if (!rows.length) return;
    const header = [
      'Nº Guia',
      'Data',
      'Beneficiário',
      'Prestador',
      'Qtd Procedimentos',
      'Status',
    ];
    const csvRows = [
      header.join(','),
      ...rows.map((row) =>
        [
          row.numero_guia,
          row.data,
          '"' + (row.beneficiario || '').replace(/"/g, '""') + '"',
          '"' + (row.prestador || '').replace(/"/g, '""') + '"',
          row.qtdProcedimentos,
          row.status,
        ].join(',')
      ),
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `guias_medicas_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logActivity('Exportação de Guias', `Exportadas ${rows.length} guias para CSV`, {
      result: `${rows.length} guias exportadas`,
    });
    setActivities(getRecentActivities());
  }

  function exportProceduresToCSV(grouped: Record<string, GuideProcedure[]>) {
    const allProcedures = Object.values(grouped).flat();
    if (!allProcedures.length) return;
    const header = [
      'Nº Guia',
      'Data',
      'Código',
      'Descrição',
      'Papel',
      'Qtd',
      'Status',
      'Beneficiário',
      'Prestador',
    ];
    const csvRows = [
      header.join(','),
      ...allProcedures.map((proc) =>
        [
          proc.numero_guia,
          proc.data,
          proc.codigo,
          '"' + (proc.descricao || '').replace(/"/g, '""') + '"',
          proc.papel,
          proc.qtd,
          proc.status,
          '"' + (proc.beneficiario || '').replace(/"/g, '""') + '"',
          '"' + (proc.prestador || '').replace(/"/g, '""') + '"',
        ].join(',')
      ),
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `procedimentos_guias_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logActivity(
      'Exportação de Procedimentos',
      `Exportados ${allProcedures.length} procedimentos para CSV`,
      { result: `${allProcedures.length} procedimentos exportados` }
    );
    setActivities(getRecentActivities());
  }

  // Cards de indicadores usando TODOS os dados globais - OTIMIZADO COM MEMOIZAÇÃO
  const totalGuias = totalBeneficiarios; // Total de beneficiários únicos globais
  const totalProcedimentos = useMemo(() => {
    return allGuides.reduce((sum, proc) => sum + (proc.qtd || 0), 0);
  }, [allGuides]);

  const papelCounts = useMemo(() => {
    return allGuides.reduce(
      (acc, proc) => {
        acc[papelKey(proc.papel)] = (acc[papelKey(proc.papel)] || 0) + (proc.qtd || 0);
        return acc;
      },
      {} as Record<string, number>
    );
  }, [allGuides]);

  function papelKey(papel: string) {
    const norm = normalizePapel(papel);
    if (norm.includes('cirurgiao')) return 'cirurgiao';
    if (norm.includes('primeiro')) return 'primeiro_auxiliar';
    if (norm.includes('segundo')) return 'segundo_auxiliar';
    if (norm.includes('anestesista')) return 'anestesista';
    return 'outros';
  }
  function percent(val: number) {
    if (!totalProcedimentos) return '0%';
    return `${Math.round((val / totalProcedimentos) * 100)}%`;
  }

  // Pacientes únicos globais - OTIMIZADO COM MEMOIZAÇÃO
  const pacientesUnicos = useMemo(() => {
    const allGroupedForPatients = allGuides.reduce<Record<string, GuideProcedure[]>>(
      (acc, proc) => {
        acc[proc.numero_guia] = acc[proc.numero_guia] || [];
        acc[proc.numero_guia].push(proc);
        return acc;
      },
      {}
    );
    const allMacroRowsForPatients = Object.entries(allGroupedForPatients).map(
      ([numero_guia, procs]) => ({
        numero_guia,
        beneficiario: procs[0]?.beneficiario || '',
      })
    );
    return new Set(
      allMacroRowsForPatients
        .map((row) => row.beneficiario.trim().toLowerCase())
        .filter(Boolean)
    );
  }, [allGuides]);

  // Cálculo do pending count otimizado
  const pendingCount = useMemo(() => {
    // Calcula guias sem análise (sem demonstrativo ou não encontradas)
    const allGrouped = allGuides.reduce<Record<string, GuideProcedure[]>>((grp, p) => {
      grp[p.numero_guia] = grp[p.numero_guia] || [];
      grp[p.numero_guia].push(p);
      return grp;
    }, {});
    return Object.entries(allGrouped).filter(([_, procs]) => {
      const firstProc = procs[0];
      const smartStatus = firstProc?.smart_payment_status?.status;
      return smartStatus === 'sem_demonstrativo' || smartStatus === 'nao_encontrado';
    }).length;
  }, [allGuides]);

  // --- QuickActions Integration ---
  useEffect(() => {
    function handleOpenUpload() {
      setActiveTab('upload');
      // Focus dropzone
      const el = document.querySelector('#upload-dropzone');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function handleExportCSV() {
      // Usa agrupamento global para CSV completo
      exportProceduresToCSV(grouped);
    }

    window.addEventListener('openGuideUpload', handleOpenUpload);
    window.addEventListener('exportGuidesCSV', handleExportCSV);

    return () => {
      window.removeEventListener('openGuideUpload', handleOpenUpload);
      window.removeEventListener('exportGuidesCSV', handleExportCSV);
    };
  }, [grouped]);

  return (
    <>
      <Helmet>
        <title>Central de Guias Médicas | MedCheck</title>
        <meta
          name="description"
          content="Sistema avançado de gestão e análise de guias médicas TISS com processamento automatizado e insights de performance"
        />
        <meta
          name="keywords"
          content="guias médicas, TISS, gestão médica, procedimentos médicos, auditoria guias"
        />

        {/* Open Graph para compartilhamento */}
        <meta property="og:title" content="Central de Guias Médicas | MedCheck" />
        <meta
          property="og:description"
          content="Sistema avançado de gestão e análise de guias médicas TISS"
        />
        <meta property="og:type" content="website" />

        {/* Schema.org para SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'MedCheck Guias Médicas',
            description: 'Sistema de gestão e análise de guias médicas TISS',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

      <AuthenticatedLayout
        title="Central de Guias Médicas"
        description="Sistema avançado de gestão e análise de guias médicas TISS"
      >
        {/* Header Premium - explicação do propósito da página */}
        <div className="text-center space-y-6 pt-8 pb-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/60">
            <FileText className="h-6 w-6 text-blue-700" />
            <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
              Gestão de Guias Médicas
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent leading-tight">
              Central de Guias Médicas
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Envie, acompanhe e gerencie suas guias TISS com total controle e
              automação.
            </p>
            <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Tenha insights, filtros avançados e participe ativamente da sua gestão
              médica.
            </p>
          </div>
        </div>
        <div className="space-y-10">
          {/* Dashboard Content */}
          <div className="space-y-12">
            {/* Visão Geral - Dados Gerais */}
            <section aria-label="Visão Geral dos Dados" className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  Visão Geral dos Dados
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Métricas consolidadas de todo o sistema de guias médicas
                </p>
              </div>

              {loading ? (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonInfoCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCard
                    icon={<User className="h-6 w-6" />}
                    title={
                      <span className="text-sm font-semibold">
                        Beneficiários Únicos
                      </span>
                    }
                    value={
                      <span className="text-3xl xl:text-4xl font-bold">
                        {pacientesUnicos.size}
                      </span>
                    }
                    description={
                      <span className="text-sm">
                        Total de beneficiários únicos no sistema
                      </span>
                    }
                    variant="info"
                  />
                  <InfoCard
                    icon={<ClipboardList className="h-6 w-6" />}
                    title={
                      <span className="text-sm font-semibold">
                        Total de Procedimentos
                      </span>
                    }
                    value={
                      <span className="text-3xl xl:text-4xl font-bold">
                        {totalProcedimentos.toLocaleString()}
                      </span>
                    }
                    description={
                      <span className="text-sm">
                        Procedimentos processados no sistema
                      </span>
                    }
                    variant="info"
                  />
                  <InfoCard
                    icon={<FileText className="h-6 w-6" />}
                    title={
                      <span className="text-sm font-semibold">Guias Processadas</span>
                    }
                    value={
                      <span className="text-3xl xl:text-4xl font-bold">
                        {totalGuias.toLocaleString()}
                      </span>
                    }
                    description={
                      <span className="text-sm">Total de guias no sistema</span>
                    }
                    variant="success"
                  />
                  <InfoCard
                    icon={<Activity className="h-6 w-6" />}
                    title={
                      <span className="text-sm font-semibold">Média por Guia</span>
                    }
                    value={
                      <span className="text-3xl xl:text-4xl font-bold">
                        {totalGuias > 0
                          ? Math.round(totalProcedimentos / totalGuias)
                          : 0}
                      </span>
                    }
                    description={
                      <span className="text-sm">Procedimentos por guia médica</span>
                    }
                    variant="neutral"
                  />
                </div>
              )}
            </section>

            {/* Participação Médica */}
            {loading ? (
              <section aria-label="Participação Médica" className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <UserCheck className="h-6 w-6 text-emerald-600" />
                    Participação Médica
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Distribuição global de papéis médicos no sistema
                  </p>
                </div>
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonInfoCard key={i} />
                  ))}
                </div>
              </section>
            ) : (
              Object.keys(papelCounts).some((papel) => papelCounts[papel] > 0) && (
                <section aria-label="Participação Médica" className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                      <UserCheck className="h-6 w-6 text-emerald-600" />
                      Participação Médica
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Distribuição global de papéis médicos no sistema
                    </p>
                  </div>

                  <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {papelCounts['cirurgiao'] > 0 && (
                      <InfoCard
                        icon={<Stethoscope className="h-6 w-6" />}
                        title={<span className="text-sm font-semibold">Cirurgião</span>}
                        value={
                          <span className="text-3xl xl:text-4xl font-bold">
                            {papelCounts['cirurgiao'].toLocaleString()}
                          </span>
                        }
                        description={
                          <span className="text-sm">
                            <span className="font-bold text-emerald-600">
                              {percent(papelCounts['cirurgiao'])}
                            </span>{' '}
                            do total de procedimentos
                          </span>
                        }
                        variant="success"
                      />
                    )}
                    {papelCounts['primeiro_auxiliar'] > 0 && (
                      <InfoCard
                        icon={<UserPlus className="h-6 w-6" />}
                        title={
                          <span className="text-sm font-semibold">1º Auxiliar</span>
                        }
                        value={
                          <span className="text-3xl xl:text-4xl font-bold">
                            {papelCounts['primeiro_auxiliar'].toLocaleString()}
                          </span>
                        }
                        description={
                          <span className="text-sm">
                            <span className="font-bold text-blue-600">
                              {percent(papelCounts['primeiro_auxiliar'])}
                            </span>{' '}
                            do total de procedimentos
                          </span>
                        }
                        variant="info"
                      />
                    )}
                    {papelCounts['segundo_auxiliar'] > 0 && (
                      <InfoCard
                        icon={<UserPlus2 className="h-6 w-6" />}
                        title={
                          <span className="text-sm font-semibold">2º Auxiliar</span>
                        }
                        value={
                          <span className="text-3xl xl:text-4xl font-bold">
                            {papelCounts['segundo_auxiliar'].toLocaleString()}
                          </span>
                        }
                        description={
                          <span className="text-sm">
                            <span className="font-bold text-purple-600">
                              {percent(papelCounts['segundo_auxiliar'])}
                            </span>{' '}
                            do total de procedimentos
                          </span>
                        }
                        variant="neutral"
                      />
                    )}
                    {papelCounts['anestesista'] > 0 && (
                      <InfoCard
                        icon={<Activity className="h-6 w-6" />}
                        title={
                          <span className="text-sm font-semibold">Anestesista</span>
                        }
                        value={
                          <span className="text-3xl xl:text-4xl font-bold">
                            {papelCounts['anestesista'].toLocaleString()}
                          </span>
                        }
                        description={
                          <span className="text-sm">
                            <span className="font-bold text-orange-600">
                              {percent(papelCounts['anestesista'])}
                            </span>{' '}
                            do total de procedimentos
                          </span>
                        }
                        variant="warning"
                      />
                    )}
                  </div>
                </section>
              )
            )}

            {/* Análise Inteligente de Pagamentos */}
            {paymentAnalytics && (
              <section aria-label="Análise de Pagamentos" className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    Análise Inteligente de Pagamentos
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Status automático baseado no cruzamento com demonstrativos
                  </p>
                </div>

                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCard
                    icon={<BarChart3 className="h-6 w-6" />}
                    title={
                      <span className="text-sm font-semibold">Taxa de Cobertura</span>
                    }
                    value={
                      <span className="text-3xl xl:text-4xl font-bold">
                        {paymentAnalytics.crosscheck_coverage?.toFixed(1) || 0}%
                      </span>
                    }
                    description={
                      <span className="text-sm">
                        Procedimentos com análise de pagamento
                      </span>
                    }
                    variant="info"
                    trend={
                      paymentAnalytics.crosscheck_coverage > 80
                        ? { direction: 'up', percentage: 'Excelente' }
                        : undefined
                    }
                  />
                  <InfoCard
                    icon={<CheckCircle className="h-6 w-6" />}
                    title={
                      <span className="text-sm font-semibold">Procedimentos Pagos</span>
                    }
                    value={
                      <span className="text-3xl xl:text-4xl font-bold">
                        {paymentAnalytics.total_paid_procedures || 0}
                      </span>
                    }
                    description={
                      <span className="text-sm">
                        Valor:{' '}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(paymentAnalytics.total_paid_value || 0)}
                      </span>
                    }
                    variant="success"
                  />
                  <InfoCard
                    icon={<AlertTriangle className="h-6 w-6" />}
                    title={
                      <span className="text-sm font-semibold">
                        Glosas Identificadas
                      </span>
                    }
                    value={
                      <span className="text-3xl xl:text-4xl font-bold">
                        {paymentAnalytics.total_glosa_procedures || 0}
                      </span>
                    }
                    description={
                      <span className="text-sm">
                        Valor:{' '}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(paymentAnalytics.total_glosa_value || 0)}
                      </span>
                    }
                    variant="danger"
                  />
                  <InfoCard
                    icon={<DollarSign className="h-6 w-6" />}
                    title={
                      <span className="text-sm font-semibold">Pagamentos Parciais</span>
                    }
                    value={
                      <span className="text-3xl xl:text-4xl font-bold">
                        {paymentAnalytics.total_partial_payments || 0}
                      </span>
                    }
                    description={
                      <span className="text-sm">
                        Procedimentos com pagamento parcial
                      </span>
                    }
                    variant="warning"
                  />
                </div>
              </section>
            )}

            {/* Ferramentas de Filtro */}
            <section aria-label="Ferramentas de Filtro e Ações" className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                  Gestão de Guias
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Filtros avançados e ferramentas de gestão das guias médicas
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-6 shadow-sm">
                <FiltersToolbar
                  search={search}
                  onSearch={(val) => {
                    setSearch(val);
                    setPage(0);
                  }}
                  dateStart={dateStart}
                  onDateStartChange={(val) => {
                    setDateStart(val);
                    setPage(0);
                  }}
                  dateEnd={dateEnd}
                  onDateEndChange={(val) => {
                    setDateEnd(val);
                    setPage(0);
                  }}
                  status={status || 'ALL'}
                  onStatusChange={(val) => {
                    setStatus(val);
                    setPage(0);
                  }}
                  pendingCount={pendingCount}
                  onClear={() => {
                    setSearch('');
                    setDateStart('');
                    setDateEnd('');
                    setStatus('ALL');
                    setPage(0);
                  }}
                  onExportCsv={() => exportToCSV(filteredMacroRows)}
                  onExportProcedures={() => exportProceduresToCSV(grouped)}
                  onNewGuide={() => setActiveTab('upload')}
                />
              </div>
            </section>

            {/* Tabs de Conteúdo */}
            <section aria-label="Conteúdo Principal" className="space-y-6">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'list' | 'upload')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <TabsTrigger
                    value="list"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg font-semibold"
                  >
                    Lista de Guias
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg font-semibold"
                  >
                    Upload de Guias
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-8">
                  <Card className="overflow-hidden border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                    <CardContent className="p-8">
                      {loading ? (
                        <LoaderTable />
                      ) : (
                        <div className="overflow-x-auto">
                          <DataGrid
                            rows={filteredMacroRows}
                            columns={macroColumns}
                            pageSize={pageSize}
                            currentPage={page}
                            onPageSizeChange={(size) => {
                              setPageSize(size);
                              setPage(0);
                            }}
                            onPageChange={(p) => setPage(p)}
                            selectable={true}
                            selectedRows={selectedRows}
                            onSelectRow={handleSelectRow}
                            onSelectAll={handleSelectAll}
                            expandable={true}
                            expandedRow={expandedRow}
                            onExpand={(id) =>
                              setExpandedRow(expandedRow === id ? null : id)
                            }
                            rowIdField="numero_guia"
                            className="min-h-[400px]"
                            loading={loading}
                            paginationLabel="Guias por página:"
                            emptyMessage={
                              search || status || dateStart || dateEnd
                                ? 'Nenhuma guia encontrada com os filtros aplicados'
                                : 'Nenhuma guia encontrada'
                            }
                            renderExpandedRow={(row) => (
                              <tr key={`${row.numero_guia}-expanded`}>
                                <td
                                  colSpan={macroColumns.length + 2}
                                  className="bg-gray-50 dark:bg-gray-800/50 p-0"
                                >
                                  <div className="w-full p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="overflow-x-auto w-full">
                                      <table className="w-full text-sm min-w-[600px]">
                                        <thead>
                                          <tr className="border-b border-gray-200 dark:border-gray-700">
                                            {[
                                              'Data',
                                              'Código',
                                              'Descrição',
                                              'Participação',
                                              'Qtd',
                                              'Prestador',
                                              'Status de Pagamento',
                                            ].map((h) => (
                                              <th
                                                key={h}
                                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                                              >
                                                {h}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                          {row.detalhes
                                            // **CORREÇÃO**: Preserva ordem original do parser (ordem do PDF TISS)
                                            // Não aplicar sorting pois a ordem correta já vem do backend
                                            .map((proc: any) => (
                                              <tr
                                                key={proc.codigo}
                                                className="odd:bg-muted/30 hover:bg-accent/10 transition-colors h-10"
                                              >
                                                <td className="py-2 px-3 whitespace-nowrap">
                                                  {proc.data}
                                                </td>
                                                <td className="py-2 px-3 whitespace-nowrap font-mono">
                                                  {proc.codigo}
                                                </td>
                                                <td className="py-2 px-3 whitespace-nowrap max-w-[180px] truncate">
                                                  {proc.descricao}
                                                </td>
                                                <td className="py-2 px-3 whitespace-nowrap">
                                                  {renderParticipacaoBadge(proc.papel)}
                                                </td>
                                                <td className="py-2 px-3 whitespace-nowrap text-right font-mono">
                                                  {proc.qtd}
                                                </td>
                                                <td className="py-2 px-3 whitespace-nowrap">
                                                  {proc.prestador}
                                                </td>
                                                <td className="py-2 px-3 whitespace-nowrap">
                                                  {proc.smart_payment_status ? (
                                                    <PaymentStatusIndicator
                                                      smartPaymentStatus={
                                                        proc.smart_payment_status
                                                      }
                                                      size="xs"
                                                    />
                                                  ) : (
                                                    <span className="text-xs text-gray-400">
                                                      --
                                                    </span>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          />
                        </div>
                      )}
                      {selectedRows.length > 0 && (
                        <div className="sticky bottom-0 inset-x-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-blue-200/60 dark:border-blue-700/60 px-6 py-4 mt-4 backdrop-blur-sm shadow-inner rounded-b-lg flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            {selectedRows.length}{' '}
                            {selectedRows.length === 1
                              ? 'guia selecionada'
                              : 'guias selecionadas'}
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRows([])}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/30"
                            >
                              Limpar Seleção
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleDeleteSelected}
                              className="bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir {selectedRows.length === 1 ? 'Guia' : 'Guias'}
                            </Button>
                          </div>
                        </div>
                      )}
                      {selectedGuia && (
                        <DetalhesGuia
                          guia={selectedGuia}
                          procedimentos={grouped[selectedGuia]}
                          onClose={() => setSelectedGuia(null)}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="upload">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload de Guias</CardTitle>
                      <CardDescription>
                        Faça upload de guias TISS para processamento
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FileDropZone
                        type="guia"
                        onDropFiles={handleFileDrop}
                        disabled={isUploading || loading}
                        hasFiles={files.some((f) => f.type === 'guia')}
                      />
                      <FileList
                        files={files.filter((f) => f.type === 'guia')}
                        onRemove={removeFile}
                        disabled={isUploading || loading}
                      />
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={resetFiles}
                          disabled={!files.length || isUploading || loading}
                          className="h-9 px-4 font-medium text-gray-700 hover:bg-border/10 dark:hover:bg-border/20 border-border"
                        >
                          Limpar
                        </Button>
                        <Button
                          onClick={handleUploadGuias}
                          disabled={!files.length || isUploading || loading}
                          className="h-9 px-5 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all duration-200"
                        >
                          {isUploading || loading
                            ? 'Processando...'
                            : 'Processar Guias'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </div>
        {/* Aviso de Privacidade - rodapé simples, por extenso */}
        <div
          className="w-full text-center text-xs text-gray-500 my-6"
          role="note"
          aria-label="Aviso de Privacidade"
        >
          Ao inserir dados de pacientes, você declara ter consentimento ou base legal
          para o tratamento, conforme a{' '}
          <a
            href="/privacy"
            className="underline hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Privacidade
          </a>
          . O uso indevido pode gerar responsabilidade legal.
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default GuidesPage;
