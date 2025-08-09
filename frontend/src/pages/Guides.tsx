/**
 * =============================================================================
 * GUIDES PAGE - PÁGINA PRINCIPAL DE GESTÃO DE GUIAS MÉDICAS
 * =============================================================================
 */

import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import axios from 'axios';
import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  DollarSign,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Upload,
  User,
  X
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { FeatureCard } from '../components/ui/FeatureCard';
import { InfoCard } from '../components/ui/InfoCard';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { SkeletonInfoCard } from '../components/ui/SkeletonInfoCard';
import { buildApiUrl } from '../config/api';
import { usePageTitle } from '../hooks/usePageTitle';
import { exportSimpleGuidesReport } from '../services/exportService';

// =============================================================================
// TIPAGENS
// =============================================================================

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
  qtd: number;
  status: string;
  codigo?: string;
  descricao?: string;
  papel?: string;
  smart_payment_status?: {
    status: string;
    reason: string;
    demonstrativo_info?: {
      presented_value: number;
      approved_value: number;
      glosa: number;
      glosa_percentage: number;
      payment_date?: string;
    };
    dt_inicio?: string;
    dt_fim?: string;
    nome_medico?: string;
  };
}

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

const processGuidesData = (
  procedures: GuideProcedure[],
  page: number,
  pageSize: number
) => {
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

  macroRows.sort((a, b) => {
    const dateA = formatDateToISO(a.data);
    const dateB = formatDateToISO(b.data);
    return dateB.localeCompare(dateA);
  });

  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMacroRows = macroRows.slice(startIndex, endIndex);
  const currentPageProcedures = paginatedMacroRows.flatMap((row) => row.detalhes);

  return {
    totalGroups: macroRows.length,
    currentPageProcedures,
    macroRows: paginatedMacroRows,
  };
};

function formatDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateStr;
  }
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}/)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

function getCurrentCrm() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user && user.crm ? user.crm : '';
  } catch {
    return '';
  }
}

// =============================================================================
// COMPONENTE DE STATUS FINANCEIRO DISCRETO (ESTILO DEMONSTRATIVOS)
// =============================================================================

const FinancialStatusChip = ({
  procedure,
  financialInfo,
}: {
  procedure?: GuideProcedure;
  financialInfo?: {
    status: string;
    total_approved: number;
    total_glosa: number;
  };
}) => {
  const status =
    financialInfo?.status ||
    procedure?.smart_payment_status?.status ||
    'sem_demonstrativo';
  const demoInfo = procedure?.smart_payment_status?.demonstrativo_info;

  let approvedValue = 0;
  let glosaValue = 0;

  if (financialInfo) {
    approvedValue = financialInfo.total_approved;
    glosaValue = financialInfo.total_glosa;
  } else if (demoInfo) {
    approvedValue = demoInfo.approved_value;
    glosaValue = demoInfo.glosa;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'pago':
        return {
          label: 'PAGO',
          value: formatCurrency(approvedValue),
          bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotColor: 'bg-emerald-500',
        };
      case 'parcialmente_pago':
        return {
          label: 'PARCIALMENTE PAGO',
          value: formatCurrency(approvedValue),
          bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
          dotColor: 'bg-amber-500',
        };
      case 'glosado':
        return {
          label: 'GLOSADA',
          value: formatCurrency(glosaValue),
          bgColor: 'bg-red-50 text-red-700 border-red-200',
          dotColor: 'bg-red-500',
        };
      case 'nao_encontrado':
      case 'sem_demonstrativo':
      default:
        return {
          label: 'SEM DEMONSTRATIVO',
          value: '',
          bgColor: 'bg-orange-50 text-orange-700 border-orange-200',
          dotColor: 'bg-orange-500',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      className={`text-xs font-medium px-2 py-0.5 whitespace-nowrap ${config.bgColor} flex items-center gap-1.5 min-w-[190px] justify-center`}
    >
      <div className={`w-2 h-2 rounded-full ${config.dotColor} flex-shrink-0`}></div>
      <span>
        {config.label}
        {config.value && (
          <span className="ml-1 font-mono opacity-90">{config.value}</span>
        )}
      </span>
    </Badge>
  );
};

// =============================================================================
// ANÁLISE INTELIGENTE DE STATUS FINANCEIRO DA GUIA
// =============================================================================

const analyzeGuideFinancialStatus = (guide: Guide) => {
  if (!guide.detalhes || guide.detalhes.length === 0) {
    return { status: 'sem_demonstrativo', total_approved: 0, total_glosa: 0 };
  }

  let totalProcedimentos = 0;
  let procedimentosPagos = 0;
  let procedimentosGlosados = 0;
  let procedimentosSemDemonstrativo = 0;
  let total_approved = 0;
  let total_glosa = 0;

  // Analisar cada procedimento da guia
  guide.detalhes.forEach((procedimento) => {
    totalProcedimentos++;
    const status = procedimento.smart_payment_status?.status;
    const demoInfo = procedimento.smart_payment_status?.demonstrativo_info;

    if (demoInfo) {
      total_approved += demoInfo.approved_value || 0;
      total_glosa += demoInfo.glosa || 0;
    }

    if (!status || status === 'sem_demonstrativo' || status === 'nao_encontrado') {
      procedimentosSemDemonstrativo++;
    } else if (status === 'pago') {
      // Verificar se foi realmente pago integralmente
      if (demoInfo && demoInfo.approved_value > 0 && demoInfo.glosa === 0) {
        procedimentosPagos++;
      } else if (demoInfo && demoInfo.glosa > 0) {
        procedimentosGlosados++;
      }
    } else if (status === 'parcialmente_pago') {
      // Parcial = aprovado parte mas não tudo
      procedimentosPagos++; // Conta como pago parcial
    } else if (status === 'glosado') {
      procedimentosGlosados++;
    }
  });

  // Lógica inteligente de status da guia baseada na realidade médica
  let finalStatus = 'sem_demonstrativo';
  if (procedimentosSemDemonstrativo === totalProcedimentos) {
    finalStatus = 'sem_demonstrativo';
  } else if (procedimentosGlosados === totalProcedimentos) {
    finalStatus = 'glosado';
  } else if (procedimentosPagos === totalProcedimentos && procedimentosGlosados === 0) {
    finalStatus = 'pago';
  } else if (procedimentosPagos > 0 && procedimentosGlosados > 0) {
    finalStatus = 'parcialmente_pago';
  } else if (procedimentosPagos > 0 && procedimentosSemDemonstrativo > 0) {
    finalStatus = 'parcialmente_pago';
  } else if (procedimentosGlosados > 0) {
    finalStatus = 'glosado';
  }

  return { status: finalStatus, total_approved, total_glosa };
};

// =============================================================================
// COMPONENTE DATAGRID REFINADO - VERSÃO CORRIGIDA
// =============================================================================

const RefinedDataGrid = ({
  data,
  loading,
  onRowClick,
  onViewDetails,
  onDeleteGuide,
  onDeleteSelected,
  selectedGuides,
  onSelectAll,
  onSelectGuide,
  currentPage,
  totalPages,
  onPageChange,
}: {
  data: Guide[];
  loading: boolean;
  onRowClick: (guide: Guide) => void;
  onViewDetails: (guide: Guide) => void;
  onDeleteGuide: (guide: Guide) => void;
  onDeleteSelected: (selectedIds: string[]) => void;
  selectedGuides: string[];
  onSelectAll: (checked: boolean | 'indeterminate') => void;
  onSelectGuide: (guideId: string, checked: boolean) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const [sortField, setSortField] = useState<string>('data');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const paginationRange = useMemo(() => {
    const totalPageCount = totalPages;
    const siblingCount = 1;
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPageCount) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPageCount - rightItemCount + i + 1
      );
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
    return [];
  }, [totalPages, currentPage]);

  // Função de ordenação
  const sortedData = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let aValue = a[sortField as keyof Guide];
      let bValue = b[sortField as keyof Guide];

      // Tratamento especial para datas
      if (sortField === 'data') {
        aValue = formatDateToISO(a.data);
        bValue = formatDateToISO(b.data);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
    return sorted;
  }, [data, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, guide: Guide) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick(guide);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-24">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Carregando guias...</span>
        </div>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-24">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma guia encontrada
          </h3>
          <p className="text-gray-500 mb-6">
            Não há guias que correspondam aos filtros aplicados.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar dados
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/40 overflow-hidden w-full">
      {/* Container com largura completa */}
      <div className="w-full">
        {/* Header da Tabela */}
        <div className="bg-gradient-to-r from-white to-gray-50/30 border-b border-gray-100 px-6 py-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1 flex items-center">
              <Checkbox
                id="select-all"
                onCheckedChange={onSelectAll}
                checked={
                  selectedGuides.length > 0 && selectedGuides.length === data.length
                    ? true
                    : selectedGuides.length > 0
                      ? 'indeterminate'
                      : false
                }
              />
            </div>
            {/* Número da Guia */}
            <div className="col-span-2 flex items-center">
              <button
                onClick={() => handleSort('numero_guia')}
                className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors"
                aria-label="Ordenar por número da guia"
              >
                NÚMERO DA GUIA
                {sortField === 'numero_guia' && (
                  <span className="text-gray-400">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </button>
            </div>

            {/* Data */}
            <div className="col-span-2 flex items-center">
              <button
                onClick={() => handleSort('data')}
                className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors"
                aria-label="Ordenar por data"
              >
                DATA
                {sortField === 'data' && (
                  <span className="text-gray-400">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </button>
            </div>

            {/* Paciente */}
            <div className="col-span-3 flex items-center">
              <button
                onClick={() => handleSort('beneficiario')}
                className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors"
                aria-label="Ordenar por paciente"
              >
                PACIENTE
                {sortField === 'beneficiario' && (
                  <span className="text-gray-400">
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </button>
            </div>

            {/* Procedimentos */}
            <div className="col-span-1 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                PROC.
              </span>
            </div>

            {/* Status Financeiro */}
            <div className="col-span-2 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                STATUS
              </span>
            </div>

            {/* Ações */}
            <div className="col-span-1 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                AÇÕES
              </span>
            </div>
          </div>
        </div>

        {/* Corpo da Tabela */}
        <div className="divide-y divide-gray-100">
          {sortedData.map((guide, index) => {
            // Analisar status financeiro real da guia
            const realFinancialStatusInfo = analyzeGuideFinancialStatus(guide);

            return (
              <div
                key={guide.numero_guia || index}
                className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-blue-50/30 transition-colors cursor-pointer group bg-white even:bg-gray-50/20"
                onClick={() => onRowClick(guide)}
                onKeyDown={(e) => handleKeyDown(e, guide)}
                tabIndex={0}
                role="row"
                aria-label={`Guia ${guide.numero_guia} do paciente ${guide.beneficiario}`}
              >
                <div
                  className="col-span-1 flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    id={`select-${guide.numero_guia}`}
                    checked={selectedGuides.includes(guide.numero_guia)}
                    onCheckedChange={(checked) =>
                      onSelectGuide(guide.numero_guia, !!checked)
                    }
                  />
                </div>
                {/* Número da Guia */}
                <div className="col-span-2 flex items-center">
                  <div className="font-mono text-sm font-medium text-slate-700 bg-slate-50/60 px-3 py-1.5 rounded-lg border border-slate-200/60">
                    {guide.numero_guia}
                  </div>
                </div>

                {/* Data */}
                <div className="col-span-2 flex items-center">
                  <div className="text-sm font-medium text-gray-900">{guide.data}</div>
                </div>

                {/* Paciente */}
                <div className="col-span-3 flex items-center">
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <div className="w-8 h-8 rounded-full bg-slate-600/80 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {guide.beneficiario
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {guide.beneficiario}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Procedimentos */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="font-medium text-slate-700">
                    {guide.qtdProcedimentos}
                  </span>
                </div>

                {/* Status Financeiro */}
                <div className="col-span-2 flex items-center justify-center">
                  <FinancialStatusChip financialInfo={realFinancialStatusInfo} />
                </div>

                {/* Ações */}
                <div className="col-span-1 flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(guide);
                    }}
                    className="h-8 w-8 p-0 rounded-lg hover:bg-blue-100/60 hover:text-blue-600 transition-all duration-200"
                    aria-label={`Ver detalhes da guia ${guide.numero_guia}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteGuide(guide);
                    }}
                    className="h-8 w-8 p-0 rounded-lg hover:bg-red-100/60 hover:text-red-600 transition-all duration-200"
                    aria-label={`Excluir guia ${guide.numero_guia}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        {/* Footer com Paginação e Ações */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-white/50">
          <div className="text-sm text-gray-600">
            {selectedGuides.length > 0 ? (
              <span>
                {selectedGuides.length} de {data.length} guias selecionadas.
              </span>
            ) : (
              <span>{data.length} guias nesta página.</span>
            )}
          </div>

          {selectedGuides.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteSelected(selectedGuides)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Selecionados ({selectedGuides.length})
            </Button>
          )}

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {paginationRange.map((pageNumber, index) => {
                if (pageNumber === '...') {
                  return (
                    <PaginationItem key={`dots-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNumber as number)}
                      isActive={pageNumber === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

const GuidesPage = () => {
  usePageTitle({
    title: 'Central de Guias Médicas',
    description:
      'Sistema avançado de gestão e análise de guias médicas TISS com processamento automatizado e insights de performance',
    keywords:
      'guias médicas, TISS, gestão médica, procedimentos médicos, auditoria guias',
  });

  const [guides, setGuides] = useState<Guide[]>([]);
  const [rawProcedures, setRawProcedures] = useState<GuideProcedure[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guideToDelete, setGuideToDelete] = useState<Guide | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [filterUpdateTrigger, setFilterUpdateTrigger] = useState(0);
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);
  const [guidesToDelete, setGuidesToDelete] = useState<string[]>([]);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);

  // Função para forçar atualização dos filtros
  const triggerFilterUpdate = useCallback(() => {
    setFilterUpdateTrigger((prev) => prev + 1);
  }, []);

  // Função para exportar relatório em PDF
  const handleExportPDF = useCallback(() => {
    try {
      // Verificar se há dados para exportar
      if (!filteredGuides || filteredGuides.length === 0) {
        toast.error('Nenhuma guia disponível para exportar');
        return;
      }

      // Preparar dados para export
      const guidesForExport = rawProcedures.map(procedure => ({
        numero_guia: procedure.guia || '-',
        data: procedure.data || '-',
        paciente: procedure.beneficiario || procedure.paciente || '-',
        codigo: procedure.codigo || '-',
        descricao: procedure.descricao || '-',
        papel: procedure.papel || procedure.funcao || '-',
        qtd: procedure.qtd || 1,
        valorEstimado: procedure.valorCBHPM || procedure.valorTabela2015 || 0,
        prestador: procedure.prestador || '-'
      }));

      toast.loading('Gerando relatório PDF...', { id: 'pdf-export' });

      // Exportar usando o serviço
      exportSimpleGuidesReport(guidesForExport, 'relatorio-guias-medicas');

      toast.success('Relatório PDF gerado com sucesso!', { id: 'pdf-export' });

    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar relatório PDF. Tente novamente.', { id: 'pdf-export' });
    }
  }, [filteredGuides, rawProcedures]);

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

      setRawProcedures(procedures);

      const processedData = processGuidesData(procedures, 0, 1000);

      setGuides(processedData.macroRows);

      // Inicializar dados filtrados imediatamente
      setFilteredGuides(processedData.macroRows);

      // Forçar atualização dos filtros após carregamento
      triggerFilterUpdate();
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 404) {
        toast.error('Serviço temporariamente indisponível');
      } else {
        toast.error('Erro ao carregar guias');
      }
    } finally {
      setLoading(false);
    }
  }, [triggerFilterUpdate]);

  // Upload de arquivos
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(files);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Selecione pelo menos um arquivo');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(buildApiUrl('/api/v1/guias/upload'), formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data as { results?: Array<{ filename: string; success: boolean; error?: string; parser_used?: string; guias_adicionadas?: number }> };
      const results = data?.results || [];

      if (results.length === 0) {
        toast.error('Nenhuma guia válida foi processada.');
      } else {
        const successes = results.filter(r => r.success);
        const failures = results.filter(r => !r.success);

        if (successes.length > 0) {
          const addedSum = successes.reduce((sum, r) => sum + (r.guias_adicionadas || 0), 0);
          const parsers = Array.from(new Set(successes.map(r => r.parser_used).filter(Boolean)));
          toast.success(`${successes.length} arquivo(s) processado(s) com sucesso. ${addedSum} procedimento(s) novo(s) salvo(s). ${parsers.length ? `Parser: ${parsers.join(', ')}` : ''}`.trim());
        }
        if (failures.length > 0) {
          const files = failures.slice(0, 3).map(f => f.filename).join(', ');
          toast.error(`Falha ao processar ${failures.length} arquivo(s): ${files}${failures.length > 3 ? '…' : ''}`);
        }
      }
      setSelectedFiles(null);
      loadGuides();
    } catch (error) {
      // Tentar detalhar o erro retornado pelo backend
      const err = error as any;
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Erro no upload dos arquivos';
      toast.error(typeof msg === 'string' ? msg : 'Erro no upload dos arquivos');
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, loadGuides]);

  // Função para deletar guia
  const handleDeleteGuide = useCallback(
    async (guide: Guide) => {
      try {
        const token = localStorage.getItem('token');

        await axios.delete(buildApiUrl(`/api/v1/guias/${guide.numero_guia}`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('Guia excluída com sucesso');
        setDeleteDialogOpen(false);
        setGuideToDelete(null);
        loadGuides();
      } catch (error) {
        toast.error('Erro ao excluir guia');
      }
    },
    [loadGuides]
  );

  const handleDeleteSelected = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        buildApiUrl(`/api/v1/guias/batch-delete`),
        { guide_ids: guidesToDelete },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`${guidesToDelete.length} guias excluídas com sucesso`);
      setDeleteSelectedOpen(false);
      setGuidesToDelete([]);
      setSelectedGuides([]);
      loadGuides();
    } catch (error) {
      toast.error('Erro ao excluir guias selecionadas');
    }
  }, [loadGuides, guidesToDelete]);

  // Função para criar dados de teste (temporária)
  const createSampleData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        buildApiUrl('/api/v1/guias/create-sample-data'),
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message);

      // Recarregar guias após criar dados
      loadGuides();
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.info(error.response.data.message);
      } else {
        toast.error('Erro ao criar dados de exemplo');
      }
    }
  }, [loadGuides]);

  // Dados paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredGuides.slice(startIndex, endIndex);
  }, [filteredGuides, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredGuides.length / pageSize);
  }, [filteredGuides, pageSize]);

  // Cálculos estatísticos
  const uniquePatients = useMemo(() => {
    const patients = new Set();
    guides.forEach((guide) => {
      if (guide.beneficiario) {
        patients.add(guide.beneficiario.trim().toLowerCase());
      }
    });
    return Array.from(patients);
  }, [guides]);

  const totalProcessedGuides = useMemo(() => {
    return guides.filter((g) => g.status === 'Processado').length;
  }, [guides]);

  // Carregamento inicial
  useEffect(() => {
    loadGuides();
  }, [loadGuides]);

  // Event listeners para QuickActions (botão flutuante)
  useEffect(() => {
    const handleOpenGuideUpload = () => {
      // Simular clique no input de upload
      const fileInput = document.querySelector('input[type="file"][accept*=".pdf"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    };

    const handleExportGuidesCSV = () => {
      // Usar função de export existente
      if (guides && guides.length > 0) {
        const guidesForExport = guides.map(guide => ({
          numero_guia: guide.numero_guia,
          data: guide.data,
          beneficiario: guide.beneficiario,
          qtdProcedimentos: guide.qtdProcedimentos,
          smart_status: guide.smart_status
        }));
        exportSimpleGuidesReport(guidesForExport, 'guias-medicas-completo');
        toast.success('Relatório exportado com sucesso!');
      } else {
        toast.info('Nenhuma guia disponível para exportar');
      }
    };

    // Adicionar listeners
    window.addEventListener('openGuideUpload', handleOpenGuideUpload);
    window.addEventListener('exportGuidesCSV', handleExportGuidesCSV);

    // Cleanup
    return () => {
      window.removeEventListener('openGuideUpload', handleOpenGuideUpload);
      window.removeEventListener('exportGuidesCSV', handleExportGuidesCSV);
    };
  }, [guides]);

  // Filtros aplicados
  useEffect(() => {
    let filtered = [...guides];

    if (searchTerm) {
      filtered = filtered.filter(
        (guide) =>
          guide.beneficiario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guide.numero_guia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guide.prestador?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((guide) => {
        // Usar análise inteligente em vez do primeiro procedimento apenas
        const realFinancialStatus = analyzeGuideFinancialStatus(guide);
        return realFinancialStatus.status === statusFilter;
      });
    }

    if (startDate) {
      filtered = filtered.filter((guide) => {
        const guideDate = formatDateToISO(guide.data);
        return guideDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((guide) => {
        const guideDate = formatDateToISO(guide.data);
        return guideDate <= endDate;
      });
    }

    setFilteredGuides(filtered);
    setCurrentPage(1);
  }, [guides, searchTerm, statusFilter, startDate, endDate, filterUpdateTrigger]);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelectedGuides(guides.map((g) => g.numero_guia));
    } else {
      setSelectedGuides([]);
    }
  };

  const handleSelectGuide = (guideId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedGuides((prev) => [...prev, guideId]);
    } else {
      setSelectedGuides((prev) => prev.filter((id) => id !== guideId));
    }
  };

  // Modal de detalhes da guia
  const GuideDetailsModal = ({
    guide,
    onClose,
  }: {
    guide: Guide | null;
    onClose: () => void;
  }) => {
    if (!guide) return null;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    };

    return (
      <Dialog open={!!guide} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              Detalhes da Guia {guide.numero_guia}
            </DialogTitle>
            <DialogDescription>
              Informações completas dos procedimentos e status de pagamento
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Informações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Data de Execução
                  </Label>
                  <p className="text-sm font-medium">{guide.data}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Beneficiário
                  </Label>
                  <p className="text-sm font-medium">{guide.beneficiario}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Prestador</Label>
                  <p className="text-sm font-medium">{guide.prestador}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Total de Procedimentos
                  </Label>
                  <p className="text-sm font-medium">{guide.qtdProcedimentos}</p>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Procedimentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Procedimentos Realizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guide.detalhes?.map((procedimento, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {procedimento.codigo}
                            </Badge>
                            <FinancialStatusChip procedure={procedimento} />
                          </div>
                          <p className="font-medium text-gray-900 mb-1">
                            {procedimento.descricao}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Papel: <strong>{procedimento.papel}</strong>
                            </span>
                            <span>
                              Qtd: <strong>{procedimento.qtd}</strong>
                            </span>
                            {procedimento.nome_medico && (
                              <span>
                                Médico: <strong>{procedimento.nome_medico}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Informações Financeiras */}
                      {procedimento.smart_payment_status?.demonstrativo_info && (
                        <div className="mt-3 pt-3 border-t bg-white rounded p-3">
                          <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Informações Financeiras
                          </h5>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <Label className="text-gray-600">Valor Apresentado</Label>
                              <p className="font-mono text-blue-600">
                                {formatCurrency(
                                  procedimento.smart_payment_status.demonstrativo_info
                                    .presented_value
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-gray-600">Valor Liberado</Label>
                              <p className="font-mono text-green-600">
                                {formatCurrency(
                                  procedimento.smart_payment_status.demonstrativo_info
                                    .approved_value
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-gray-600">Glosa</Label>
                              <p className="font-mono text-red-600">
                                {formatCurrency(
                                  procedimento.smart_payment_status.demonstrativo_info
                                    .glosa
                                )}
                                {procedimento.smart_payment_status.demonstrativo_info
                                  .glosa_percentage > 0 && (
                                    <span className="ml-1 text-xs">
                                      (
                                      {procedimento.smart_payment_status.demonstrativo_info.glosa_percentage.toFixed(
                                        1
                                      )}
                                      %)
                                    </span>
                                  )}
                              </p>
                            </div>
                          </div>

                          {procedimento.smart_payment_status.demonstrativo_info
                            .payment_date && (
                              <div className="mt-2 pt-2 border-t">
                                <Label className="text-gray-600">
                                  Período de Pagamento
                                </Label>
                                <p className="text-sm font-medium">
                                  {
                                    procedimento.smart_payment_status.demonstrativo_info
                                      .payment_date
                                  }
                                </p>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Horários de Execução */}
                      {(procedimento.dt_inicio || procedimento.dt_fim) && (
                        <div className="mt-3 pt-3 border-t bg-blue-50 rounded p-3">
                          <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Horários de Execução
                          </h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {procedimento.dt_inicio && (
                              <div>
                                <Label className="text-gray-600">Início</Label>
                                <p className="font-mono">{procedimento.dt_inicio}</p>
                              </div>
                            )}
                            {procedimento.dt_fim && (
                              <div>
                                <Label className="text-gray-600">Fim</Label>
                                <p className="font-mono">{procedimento.dt_fim}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            {guide.detalhes?.some(
              (p) => p.smart_payment_status?.demonstrativo_info
            ) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Resumo Financeiro da Guia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {(() => {
                        const totalApresentado =
                          guide.detalhes?.reduce(
                            (sum, p) =>
                              sum +
                              (p.smart_payment_status?.demonstrativo_info
                                ?.presented_value || 0),
                            0
                          ) || 0;
                        const totalLiberado =
                          guide.detalhes?.reduce(
                            (sum, p) =>
                              sum +
                              (p.smart_payment_status?.demonstrativo_info
                                ?.approved_value || 0),
                            0
                          ) || 0;
                        const totalGlosa =
                          guide.detalhes?.reduce(
                            (sum, p) =>
                              sum +
                              (p.smart_payment_status?.demonstrativo_info?.glosa || 0),
                            0
                          ) || 0;

                        return (
                          <>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <Label className="text-blue-600 font-medium">
                                Total Apresentado
                              </Label>
                              <p className="text-xl font-bold text-blue-700 font-mono">
                                {formatCurrency(totalApresentado)}
                              </p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <Label className="text-green-600 font-medium">
                                Total Liberado
                              </Label>
                              <p className="text-xl font-bold text-green-700 font-mono">
                                {formatCurrency(totalLiberado)}
                              </p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                              <Label className="text-red-600 font-medium">
                                Total Glosa
                              </Label>
                              <p className="text-xl font-bold text-red-700 font-mono">
                                {formatCurrency(totalGlosa)}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Helmet>
        <title>Central de Guias Médicas - MedCheck</title>
        <meta
          name="description"
          content="Gestão avançada de guias médicas TISS com processamento automatizado e insights inteligentes"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'MedCheck - Guias Médicas',
            description:
              'Plataforma para gestão e análise de guias médicas TISS com upload automatizado',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

      {/* Background com Gradiente Médico Consistente */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-gray-50/20 to-emerald-50/30">
        <AuthenticatedLayout
          title="Central de Guias Médicas"
          description="Gerencie suas guias TISS com total controle, automação e insights inteligentes"
        >
          <div className="space-y-8 px-4 sm:px-6 lg:px-8">
            {/* Header Discreto Seguindo Padrão Dashboard */}
            <div className="text-center space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 border border-blue-200/50">
                <FileText className="h-4 w-4 text-blue-700" />
                <span className="text-xs font-medium text-blue-800">
                  Suas guias TISS organizadas
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-700 via-emerald-600 to-gray-800 bg-clip-text text-transparent">
                Central de Guias Médicas
              </h1>

              <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
                <strong>Envie suas guias e descubra instantaneamente</strong> se estão
                corretas e quanto você deve receber. Simples como anexar um arquivo no
                WhatsApp!
              </p>

              {/* Actions Compactas */}
              <div className="flex justify-center items-center gap-2 flex-wrap pt-2">
                <Badge variant="outline" className="gap-1 bg-white/80 text-xs">
                  <Crown className="h-3 w-3 text-blue-600" />
                  Sistema TISS Oficial
                </Badge>

                {/* Botões removidos conforme solicitado */}
                {/*
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createSampleData}
                  className="gap-1 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 text-xs px-3 py-1"
                >
                  <Plus className="h-3 w-3" />
                  Testar Sistema
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadGuides}
                  disabled={loading}
                  className="gap-1 text-xs px-3 py-1"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                */}
              </div>
            </div>

            <div className="w-full space-y-8">
              {/* 1. CONVERSÃO: Upload Principal (Destaque Máximo) */}
              <section aria-label="Upload de Guias" className="space-y-6">
                <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border-blue-200 shadow-lg w-full relative overflow-hidden">
                  {/* Linha de destaque superior */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-blue-900">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                        <Upload className="h-6 w-6 text-blue-700" />
                      </div>
                      Enviar Suas Guias TISS
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                      <strong>Simples assim:</strong> Selecione suas guias TISS (PDF ou
                      XML) e clique em "Enviar". Em segundos você vai saber se estão
                      corretas!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="file-upload" className="sr-only">
                          Selecionar arquivos
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".pdf,.xml"
                          onChange={handleFileSelect}
                          disabled={uploading}
                          className="cursor-pointer bg-white/90 border-blue-200 h-12 text-blue-800 file:bg-blue-100 file:text-blue-700 file:border-0 file:rounded-lg"
                          placeholder="Clique aqui para escolher suas guias..."
                        />
                      </div>
                      <Button
                        onClick={handleUpload}
                        disabled={!selectedFiles || uploading}
                        size="lg"
                        className="min-w-[160px] h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
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
                      <div className="text-sm text-blue-700 bg-blue-100/60 p-4 rounded-xl border border-blue-200/60">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <strong>
                            {selectedFiles.length} arquivo(s) prontos
                          </strong>{' '}
                          para análise
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* 2. INFORMAÇÃO: Cards de Resumo (Hierarquia Menor) */}
              <section aria-label="Visão Geral dos Dados" className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
                  <h3 className="text-base font-medium text-gray-700">
                    Resumo dos Dados
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                </div>

                {loading ? (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonInfoCard key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <InfoCard
                      title="Total de Guias"
                      value={<AnimatedNumber value={guides.length} />}
                      description="Suas guias enviadas"
                      icon={<FileText className="h-4 w-4 text-blue-600" />}
                      className="border-blue-200/60 bg-gradient-to-br from-blue-50/60 to-cyan-50/30"
                      size="sm"
                    />

                    <InfoCard
                      title="Guias Ativas"
                      value={<AnimatedNumber value={totalProcessedGuides} />}
                      description="Sendo processadas"
                      icon={<Activity className="h-4 w-4 text-emerald-600" />}
                      className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/60 to-green-50/30"
                      size="sm"
                    />

                    <InfoCard
                      title="Seus Pacientes"
                      value={<AnimatedNumber value={uniquePatients.length} />}
                      description="Pacientes atendidos"
                      icon={<User className="h-4 w-4 text-purple-600" />}
                      className="border-purple-200/60 bg-gradient-to-br from-purple-50/60 to-violet-50/30"
                      size="sm"
                    />

                    <InfoCard
                      title="Valor Total"
                      value={`${guides.length > 0
                        ? 'R$ ' + (guides.length * 1500).toLocaleString('pt-BR')
                        : 'R$ 0'
                        }`}
                      description="Seus honorários enviados"
                      icon={<DollarSign className="h-4 w-4 text-amber-600" />}
                      className="border-amber-200/60 bg-gradient-to-br from-amber-50/60 to-yellow-50/30"
                      size="sm"
                    />
                  </div>
                )}
              </section>

              {/* 3. AÇÕES: Ações Rápidas (FeatureCards) */}
              {guides.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-full"></div>
                    <h3 className="text-base font-medium text-gray-700">
                      Ações Rápidas
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FeatureCard
                      title="Exportar Relatório"
                      description="Baixar relatório PDF das guias processadas"
                      icon={<FileText className="h-full w-full" />}
                      size="compact"
                      priority="medium"
                      onClick={handleExportPDF}
                    />
                    <FeatureCard
                      title="Sincronizar Dados"
                      description="Atualizar informações com o sistema TISS"
                      icon={<RefreshCw className="h-full w-full" />}
                      size="compact"
                      priority="medium"
                      onClick={loadGuides}
                    />
                    <FeatureCard
                      title="Ver Demonstrativos"
                      description="Comparar com seus pagamentos"
                      icon={<BarChart3 className="h-full w-full" />}
                      size="compact"
                      priority="low"
                      href="/demonstratives"
                    />
                    <FeatureCard
                      title="Contestar Glosas"
                      description="Recuperar valores negados indevidamente"
                      icon={<Shield className="h-full w-full" />}
                      size="compact"
                      priority="high"
                      badge="Importante"
                      href="/unpaid-procedures"
                    />
                  </div>
                </section>
              )}

              {/* 4. FERRAMENTAS: Filtros Compactos */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full"></div>
                  <h3 className="text-base font-medium text-gray-700">
                    Filtros & Análise
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                </div>

                <Card className="bg-white/40 backdrop-blur-sm border border-gray-200/30 shadow-sm w-full">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por paciente, número da guia ou procedimento..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm"
                        />
                      </div>

                      <div className="flex gap-2 flex-wrap items-center">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <Input
                            type="date"
                            placeholder="Data Início"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-[140px] h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">até</span>
                          <Input
                            type="date"
                            placeholder="Data Fim"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-[140px] h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm"
                          />
                        </div>

                        {(startDate || endDate) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStartDate('');
                              setEndDate('');
                            }}
                            className="h-9 px-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white/80"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[160px] h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm">
                            <SelectValue placeholder="Status Financeiro" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            <SelectItem value="pago">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                Pago
                              </div>
                            </SelectItem>
                            <SelectItem value="parcialmente_pago">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                Parcial
                              </div>
                            </SelectItem>
                            <SelectItem value="glosado">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                Glosada
                              </div>
                            </SelectItem>
                            <SelectItem value="sem_demonstrativo">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                Sem Demonstrativo
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {filteredGuides.length !== guides.length && (
                      <div className="mt-3 text-xs text-gray-600">
                        Mostrando {filteredGuides.length} de {guides.length} guias
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* 5. ANÁLISE: DataGrid */}
              <div className="w-full">
                <RefinedDataGrid
                  data={paginatedData}
                  loading={loading}
                  onRowClick={(guide) => setSelectedGuide(guide)}
                  onViewDetails={(guide) => setSelectedGuide(guide)}
                  onDeleteGuide={(guide) => {
                    setGuideToDelete(guide);
                    setDeleteDialogOpen(true);
                  }}
                  onDeleteSelected={(selectedIds) => {
                    setGuidesToDelete(selectedIds);
                    setDeleteSelectedOpen(true);
                  }}
                  selectedGuides={selectedGuides}
                  onSelectAll={handleSelectAll}
                  onSelectGuide={handleSelectGuide}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>

            {/* Modal de detalhes da guia */}
            <GuideDetailsModal
              guide={selectedGuide}
              onClose={() => setSelectedGuide(null)}
            />

            {/* Modal de confirmação de exclusão em massa */}
            <Dialog open={deleteSelectedOpen} onOpenChange={setDeleteSelectedOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão em Massa</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja excluir as {guidesToDelete.length} guias
                    selecionadas? Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteSelectedOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteSelected}>
                    Excluir Selecionadas
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Modal de confirmação de exclusão */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja excluir a guia {guideToDelete?.numero_guia}?
                    Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setGuideToDelete(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => guideToDelete && handleDeleteGuide(guideToDelete)}
                  >
                    Excluir
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </AuthenticatedLayout>
      </div>
    </>
  );
};

export default GuidesPage;
