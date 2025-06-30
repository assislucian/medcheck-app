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
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
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
  uploadGuide,
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
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../contexts/auth/AuthContext';

import { FiltersToolbar } from '../components/guides/FiltersToolbar';
import { InfoCard } from '../components/ui/InfoCard';
import { GuidesTable } from '../components/guides/GuidesTable';
import { usePageTitle } from '../hooks/usePageTitle';
import { Helmet } from 'react-helmet-async';

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
  fetch('/api/v1/activity-log', {
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalBeneficiarios, setTotalBeneficiarios] = useState(0); // Total de beneficiários únicos
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activities, setActivities] = useState(getRecentActivities());

  const fileUpload = useFileUpload() || {};
  const {
    files = [],
    isUploading = false,
    removeFile = () => {},
    resetFiles = () => {},
    handleFileChangeByType = () => {},
    processUploadedFiles = () => {},
  } = fileUpload;

  const { userProfile, signOut } = useAuth();

  // Carrega guias já salvas
  useEffect(() => {
    const fetchSavedGuias = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        // Busca TODOS os dados para calcular totais globais e fazer paginação local
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

        // Define o total de beneficiários únicos
        setTotalBeneficiarios(allMacroRows.length);

        // Aplica paginação local aos beneficiários agrupados
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedMacroRows = allMacroRows.slice(startIndex, endIndex);

        // Converte de volta para lista de procedimentos da página atual
        const currentPageProcedures = paginatedMacroRows.flatMap((row) => row.detalhes);
        setExtractedGuides(currentPageProcedures);
      } catch (err: any) {
        toast.error('Erro ao carregar guias', {
          description: err?.response?.data?.detail || err?.message,
        });
        setExtractedGuides([]);
        setAllGuides([]);
        setTotal(0);
        setTotalBeneficiarios(0);
      }
    };
    fetchSavedGuias();
  }, [page, pageSize, search, status, data]);

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
      const uploadResult = await uploadGuides(guiaFiles, token);
      if (uploadResult && Array.isArray(uploadResult.results)) {
        uploadResult.results.forEach((result: any) => {
          if (result.success) {
            toast.success(`Guia ${result.filename}: OK`);
          } else {
            toast.error(`Guia ${result.filename}: ${result.error || 'Erro'}`);
          }
        });
      } else {
        toast.error('Resposta inesperada do servidor.');
      }
      // Recarrega os dados do servidor para ter a lista completa e atualizada
      const params: GuidesQueryParams = { page, pageSize, search, status, data };
      const res = await getGuides(token, params);
      setExtractedGuides(Array.isArray(res.procedures) ? res.procedures : []);
      setTotal(res.total || 0);
      resetFiles();
      setActiveTab('list');
      // Registra atividade
      if (uploadResult && Array.isArray(uploadResult.results)) {
        const uniqueGuias = new Set();
        uploadResult.results.forEach((r: any) => uniqueGuias.add(r.filename));
        logActivity('Upload de Guias', `Processada(s) ${uniqueGuias.size} guia(s)`, {
          target: { arquivos: Array.from(uniqueGuias) },
          result: `${uploadResult.results.length} arquivos processados`,
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

  // Agrupa por número de guia
  const grouped = extractedGuides.reduce<Record<string, GuideProcedure[]>>(
    (acc, proc) => {
      acc[proc.numero_guia] = acc[proc.numero_guia] || [];
      acc[proc.numero_guia].push(proc);
      return acc;
    },
    {}
  );

  // Monta linhas macro
  const macroRows = Object.entries(grouped).map(([numero_guia, procs]) => {
    const numeroGuiaStr = String(numero_guia).trim();
    const datas = procs.map((p) => p.data).sort();
    const dataMaisRecente = datas[datas.length - 1] || '';
    const beneficiario = procs[0]?.beneficiario || '';
    const prestador = procs[0]?.prestador || '';
    // Soma o campo qtd
    const qtdProcedimentos = procs.reduce((sum, p) => sum + (p.qtd || 0), 0);
    // Status mais comum
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

  // Usa os dados do backend diretamente (paginação já aplicada)
  // A filtragem é feita no backend através dos parâmetros de pesquisa
  const filteredMacroRows = macroRows;

  const handleSelectRow = (numero_guia: string, checked: boolean) => {
    setSelectedRows((prev) =>
      checked ? [...prev, numero_guia] : prev.filter((n) => n !== numero_guia)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredMacroRows.map((row) => row.numero_guia));
    } else {
      setSelectedRows([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;
    if (!window.confirm(`Deseja remover ${selectedRows.length} guias selecionadas?`))
      return;
    try {
      const token = localStorage.getItem('token') || '';
      await Promise.all(
        selectedRows.map((numeroGuia) => deleteGuide(numeroGuia, token))
      );

      // Recarrega os dados do servidor para ter a lista atualizada
      const params: GuidesQueryParams = { page, pageSize, search, status, data };
      const res = await getGuides(token, params);
      setExtractedGuides(Array.isArray(res.procedures) ? res.procedures : []);
      setTotal(res.total || 0);

      setSelectedRows([]);
      toast.success('Guias removidas!');
      logActivity('Remoção de Guias', `Removidas ${selectedRows.length} guias`, {
        target: { numero_guia: selectedRows },
      });
      setActivities(getRecentActivities());
    } catch (err: any) {
      toast.error('Erro ao remover guias', {
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const macroColumns = [
    {
      field: 'select',
      headerName: '',
      width: 40,
      renderCell: ({ row }: any) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.numero_guia)}
          onChange={(e) => handleSelectRow(row.numero_guia, e.target.checked)}
          aria-label={`Selecionar guia ${row.numero_guia}`}
        />
      ),
    },
    {
      field: 'expand',
      headerName: '',
      width: 40,
      renderCell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const id = String(row.numero_guia).trim();
            console.log('EXPAND BTN', { expandedRow, id });
            setExpandedRow(expandedRow === id ? null : id);
          }}
          aria-label={
            expandedRow === String(row.numero_guia).trim()
              ? 'Colapsar detalhes'
              : 'Expandir detalhes'
          }
        >
          {expandedRow === String(row.numero_guia).trim() ? (
            <Eye className="w-4 h-4 text-primary" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </Button>
      ),
    },
    { field: 'numero_guia', headerName: 'Nº Guia', width: 120 },
    { field: 'data', headerName: 'Data de Execução', width: 140 },
    { field: 'beneficiario', headerName: 'Beneficiário', width: 200 },
    { field: 'qtdProcedimentos', headerName: 'Qtd Procedimentos', width: 140 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: ({ value }: { value: string }) => {
        const variant =
          value === 'Fechada'
            ? 'success'
            : value === 'Pendente'
              ? 'warning'
              : 'default';
        return (
          <Badge
            variant={variant}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 80,
              maxWidth: 120,
              textAlign: 'center',
              display: 'inline-block',
            }}
            title={value || '-'}
          >
            {value || '-'}
          </Badge>
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

      // Recarrega os dados do servidor para ter a lista atualizada
      const params: GuidesQueryParams = { page, pageSize, search, status, data };
      const res = await getGuides(token, params);
      setExtractedGuides(Array.isArray(res.procedures) ? res.procedures : []);
      setTotal(res.total || 0);

      toast.success('Guia removida com sucesso');
      logActivity('Remoção de Guia', `Guia ${numeroGuia} removida`, {
        target: { numero_guia: numeroGuia },
      });
      setActivities(getRecentActivities());
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

  // Cards de indicadores usando TODOS os dados globais (não apenas página atual)
  const totalGuias = totalBeneficiarios; // Total de beneficiários únicos globais
  const totalProcedimentos = allGuides.reduce((sum, proc) => sum + (proc.qtd || 0), 0);
  const papelCounts = allGuides.reduce(
    (acc, proc) => {
      acc[papelKey(proc.papel)] = (acc[papelKey(proc.papel)] || 0) + (proc.qtd || 0);
      return acc;
    },
    {} as Record<string, number>
  );

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

  // Pacientes únicos globais
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
  const pacientesUnicos = new Set(
    allMacroRowsForPatients
      .map((row) => row.beneficiario.trim().toLowerCase())
      .filter(Boolean)
  );

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
        <div className="space-y-10">
          {/* Page Header Premium */}
          <PageHeader
            title={
              <span className="flex items-center gap-3 text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Central de Guias Médicas
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/help"
                        className="ml-2 text-blue-600 hover:text-blue-700 transition-colors flex items-center"
                        aria-label="Central de Ajuda"
                      >
                        <HelpCircle className="w-6 h-6" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      Central de Ajuda: tutoriais, vídeos e perguntas frequentes
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            }
            icon={<FileText size={32} />}
            description="Gestão inteligente de guias TISS com análise automatizada e insights de performance"
          />

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

              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                  icon={<User className="h-6 w-6" />}
                  title={
                    <span className="text-sm font-semibold">Beneficiários Únicos</span>
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
                  title={<span className="text-sm font-semibold">Média por Guia</span>}
                  value={
                    <span className="text-3xl xl:text-4xl font-bold">
                      {totalGuias > 0 ? Math.round(totalProcedimentos / totalGuias) : 0}
                    </span>
                  }
                  description={
                    <span className="text-sm">Procedimentos por guia médica</span>
                  }
                  variant="neutral"
                />
              </div>
            </section>

            {/* Participação Médica */}
            {Object.keys(papelCounts).some((papel) => papelCounts[papel] > 0) && (
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
                      title={<span className="text-sm font-semibold">1º Auxiliar</span>}
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
                      title={<span className="text-sm font-semibold">2º Auxiliar</span>}
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
                      title={<span className="text-sm font-semibold">Anestesista</span>}
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
                    setPage(1);
                  }}
                  date={formatDateToISO(data)}
                  onDateChange={(val) => {
                    setData(formatDateToBR(val));
                    setPage(1);
                  }}
                  status={status || 'ALL'}
                  onStatusChange={(val) => {
                    setStatus(val);
                    setPage(1);
                  }}
                  pendingCount={(() => {
                    // Calcula pendentes usando todos os dados globais
                    const allGrouped = allGuides.reduce<
                      Record<string, GuideProcedure[]>
                    >((grp, p) => {
                      grp[p.numero_guia] = grp[p.numero_guia] || [];
                      grp[p.numero_guia].push(p);
                      return grp;
                    }, {});
                    return Object.entries(allGrouped).filter(([_, procs]) => {
                      const statusCount = procs.reduce(
                        (statusAcc, p) => {
                          statusAcc[p.status] = (statusAcc[p.status] || 0) + 1;
                          return statusAcc;
                        },
                        {} as Record<string, number>
                      );
                      const statusComum =
                        Object.entries(statusCount).sort(
                          (a, b) => b[1] - a[1]
                        )[0]?.[0] || '-';
                      return statusComum === 'Pendente';
                    }).length;
                  })()}
                  onClear={() => {
                    setSearch('');
                    setData('');
                    setStatus('ALL');
                    setPage(1);
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
                        <GuidesTable
                          rows={filteredMacroRows}
                          columns={macroColumns}
                          selectedRows={selectedRows}
                          onSelectRow={handleSelectRow}
                          onSelectAll={handleSelectAll}
                          onExpand={(id) =>
                            setExpandedRow(expandedRow === id ? null : id)
                          }
                          expandedRow={expandedRow}
                          onNewGuide={() => setActiveTab('upload')}
                          renderExpandedRow={(row) => (
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
                                    {row.detalhes.map((proc: any) => (
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
                                        <td
                                          className="py-2 px-3 whitespace-nowrap max-w-[180px] truncate"
                                          title={proc.descricao}
                                        >
                                          {proc.descricao}
                                        </td>
                                        <td className="py-2 px-3 whitespace-nowrap">
                                          <Badge variant="participacao">
                                            {proc.papel}
                                          </Badge>
                                        </td>
                                        <td className="py-2 px-3 whitespace-nowrap text-center">
                                          {proc.qtd}
                                        </td>
                                        <td
                                          className="py-2 px-3 whitespace-nowrap max-w-[180px] truncate"
                                          title={proc.prestador}
                                        >
                                          {proc.prestador}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        />
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
