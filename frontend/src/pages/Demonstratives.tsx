import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
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
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '../utils/format';
import { DataGrid } from '../components/ui/data-grid';
import { useFileUpload } from '../hooks/useFileUpload';
import { FileType } from '../types/upload';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  SkeletonInfoCard,
} from '../components/ui/skeleton';
import { useAuth } from '../contexts/auth/AuthContext';
import { findProcedureByCodigo, calculateTotalCBHPM } from '../data/cbhpmData';

const mockDetailedProcedures = [
  {
    id: 'p1',
    guia: '10467538',
    data: '19/08/2024',
    carteira: '00620040000604690',
    paciente: 'THAYSE BORGES',
    codigo: '30602246',
    descricao: 'Reconstrução Mamária Com Retalhos Cutâneos Regionais',
    quantidade: 1,
    apresentado: 457.64,
    liberado: 457.64,
    glosa: 0.0,
  },
  {
    id: 'p2',
    guia: '10467538',
    data: '19/08/2024',
    carteira: '00620040000604690',
    paciente: 'THAYSE BORGES',
    codigo: '30602203',
    descricao: 'Quadrantectomia Ressecção Segmentar',
    quantidade: 1,
    apresentado: 156.57,
    liberado: 156.57,
    glosa: 0.0,
  },
  {
    id: 'p3',
    guia: '10714706',
    data: '05/09/2024',
    carteira: '00620030013924381',
    paciente: 'NUBIA KATIA PEREIRA',
    codigo: '30602289',
    descricao: 'Ressecção Do Linfonodo Sentinela Torácica Lateral',
    quantidade: 1,
    apresentado: 167.68,
    liberado: 0.0,
    glosa: 167.68,
  },
];

function normalizePapel(papel) {
  return String(papel || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

const papelDisplay = (papel) => {
  const norm = normalizePapel(papel);
  if (norm === 'primeiro auxiliar') return '1º Auxiliar';
  if (norm === 'segundo auxiliar') return '2º Auxiliar';
  if (norm === 'cirurgiao') return 'Cirurgião';
  if (norm === 'anestesista') return 'Anestesista';
  return papel || '--';
};

// Mapeia papel para o valor esperado pela CBHPM
function mapPapelToCBHPM(papel: string): string {
  const norm = String(papel || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  if (/(1|primeiro|1º)[^a-zA-Z0-9]*aux/.test(norm)) return 'primeiro auxiliar';
  if (/(2|segundo|2º)[^a-zA-Z0-9]*aux/.test(norm)) return 'segundo auxiliar';
  if (/anest/.test(norm)) return 'anestesista';
  if (/cirurg/.test(norm)) return 'cirurgiao';
  return norm;
}

// Converte string BRL para número
function parseBRL(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  let cleaned = String(str).replace('R$', '').replace(/\s/g, '');
  cleaned = cleaned.replace(/\./g, '');
  const parts = cleaned.split(',');
  if (parts.length > 2) {
    cleaned = parts.slice(0, -1).join('') + ',' + parts[parts.length - 1];
  }
  const lastComma = cleaned.lastIndexOf(',');
  if (lastComma !== -1) {
    cleaned = cleaned.substring(0, lastComma) + '.' + cleaned.substring(lastComma + 1);
  }
  return Number(cleaned) || 0;
}

// Limpa string BRL para conter apenas números, vírgula e ponto
function cleanBRL(str) {
  if (typeof str === 'number') return str.toString();
  if (!str) return '0';
  return str.replace(/[^0-9.,-]/g, '');
}

// Função utilitária para parse seguro de BRL para número
function parseBRLToNumber(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let cleaned = String(val)
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return Number(cleaned) || 0;
}

const getProceduresColumns = (navigate) => [
  { field: 'guia', headerName: 'Guia', width: 90 },
  { field: 'data', headerName: 'Data', width: 90 },
  { field: 'paciente', headerName: 'Paciente', width: 140 },
  { field: 'codigo', headerName: 'Código', width: 90 },
  { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 200 },
  { field: 'quantidade', headerName: 'Qtd', width: 50 },
  {
    field: 'apresentado',
    headerName: 'Apresentado',
    width: 120,
    valueFormatter: (params: any) => formatCurrency(params.value),
    renderCell: ({ value }) => (
      <span className="font-medium text-slate-700 whitespace-nowrap">
        {formatCurrency(value)}
      </span>
    ),
  },
  {
    field: 'liberado',
    headerName: 'Liberado',
    width: 120,
    valueFormatter: (params: any) => formatCurrency(params.value),
    renderCell: ({ value }) => (
      <span className="font-medium text-emerald-700 whitespace-nowrap">
        {formatCurrency(value)}
      </span>
    ),
  },
  {
    field: 'glosa',
    headerName: 'Glosa',
    width: 120,
    renderCell: ({ value }) => {
      const hasGlosa = value > 0;
      return (
        <div className="flex items-center gap-1">
          {hasGlosa && (
            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          )}
          <Badge
            variant={hasGlosa ? 'destructive' : 'default'}
            className={`text-xs font-medium px-2 py-0.5 whitespace-nowrap ${
              hasGlosa
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {formatCurrency(value)}
          </Badge>
        </div>
      );
    },
  },
  {
    field: 'cbhpm',
    headerName: 'CBHPM',
    width: 120,
    valueGetter: (params) => params.row.cbhpm,
    valueFormatter: (params) =>
      params.value && params.value > 0 ? formatCurrency(params.value) : '--',
    renderCell: ({ value }) =>
      value && value > 0 ? (
        <span className="font-medium text-slate-700 whitespace-nowrap">
          {formatCurrency(value)}
        </span>
      ) : (
        <span className="text-slate-400 text-xs">--</span>
      ),
  },
  {
    field: 'diferenca',
    headerName: 'Diferença',
    width: 140,
    valueGetter: (params) =>
      params.row.cbhpm && params.row.cbhpm > 0
        ? params.row.liberado - params.row.cbhpm
        : null,
    renderCell: ({ value, row }) => {
      if (!row.cbhpm || row.cbhpm <= 0)
        return <span className="text-slate-400 text-xs">--</span>;
      let bgClass = 'bg-slate-50 text-slate-700 border-slate-200';
      let Icon = null;
      if (value < 0) {
        bgClass = 'bg-red-50 text-red-700 border-red-200';
        Icon = <ArrowDownRight className="w-3 h-3" />;
      } else if (value > 0) {
        bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
        Icon = <ArrowUpRight className="w-3 h-3" />;
      }
      return (
        <div className="flex items-center gap-1">
          {Icon}
          <Badge
            className={`text-xs font-medium px-2 py-0.5 whitespace-nowrap ${bgClass}`}
          >
            {formatCurrency(value)}
          </Badge>
        </div>
      );
    },
  },
  {
    field: 'delta_percent',
    headerName: 'Delta %',
    width: 90,
    valueGetter: (params) =>
      params.row.cbhpm && params.row.cbhpm > 0
        ? ((params.row.liberado - params.row.cbhpm) / params.row.cbhpm) * 100
        : null,
    renderCell: ({ value, row }) => {
      if (!row.cbhpm || row.cbhpm <= 0)
        return <span className="text-slate-400 text-xs">--</span>;
      let bgClass = 'bg-slate-50 text-slate-700 border-slate-200';
      if (value < 0) {
        bgClass = 'bg-red-50 text-red-700 border-red-200';
      } else if (value > 0) {
        bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
      }
      return (
        <Badge
          className={`text-xs font-medium px-2 py-0.5 whitespace-nowrap ${bgClass}`}
        >
          {value !== null && value !== undefined ? `${value.toFixed(1)}%` : '--'}
        </Badge>
      );
    },
  },
  {
    field: 'participacao',
    headerName: 'Participação',
    width: 130,
    renderCell: ({ value, row }) => {
      const participacao = String(value || '')
        .trim()
        .toLowerCase();
      const isPendente =
        participacao === 'upload guia' || !participacao || participacao === '--';

      if (isPendente) {
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
            <Badge 
              className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5 whitespace-nowrap cursor-pointer hover:bg-blue-100 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                // Navegar para a página de guias na aba de upload
                navigate('/guides?tab=upload');
              }}
              title="Clique para inserir guia"
            >
              Inserir Guia
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <Badge className="text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 whitespace-nowrap">
            {papelDisplay(value)}
          </Badge>
        </div>
      );
    },
  },
];

const DemonstrativeDetailDialog = ({ demonstrative }) => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGlosas, setShowGlosas] = useState(false);
  const [showOnlyPendentes, setShowOnlyPendentes] = useState(false);
  const [showOnlyGlosas, setShowOnlyGlosas] = useState(false);
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20); // Padrão 20 para contracheque médico
  const navigate = useNavigate();

  // Totais calculados a partir dos procedimentos
  const totals = procedures.reduce(
    (acc, p) => {
      const apresentado = Number(p.financial?.presented_value ?? p.apresentado) || 0;
      const liberado = Number(p.financial?.approved_value ?? p.liberado) || 0;
      const glosa = Number(p.financial?.glosa ?? p.glosa) || 0;
      acc.totalLiberado += liberado;
      acc.totalGlosa += glosa;
      acc.totalApresentado += apresentado;
      acc.totalProcedimentos += 1;
      return acc;
    },
    { totalLiberado: 0, totalGlosa: 0, totalApresentado: 0, totalProcedimentos: 0 }
  );

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL || 'http://localhost:8000'
          }/api/v1/demonstrativos/${demonstrative.id}/detalhes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Mapear campos para nomes esperados, incluindo papel
        console.log(
          `[DEBUG] Frontend recebeu ${(res.data || []).length} procedimentos da API`
        );
        console.log(
          `[DEBUG] Amostra dos procedimentos recebidos:`,
          (res.data || []).slice(0, 3)
        );
        const mapped = (res.data || []).map((p, idx) => {
          let participacao = '';

          // Priorizar papel_exercido que vem do backend
          if (p.papel_exercido && typeof p.papel_exercido === 'string') {
            participacao = p.papel_exercido;
          } else if (typeof p.papel === 'string') {
            participacao = p.papel;
          } else if (p.participacao && typeof p.participacao === 'string') {
            participacao = p.participacao;
          } else if (p.participacoes) {
            // Se participacoes é um array de objetos, extrair papéis
            if (Array.isArray(p.participacoes)) {
              const papeis = p.participacoes
                .filter((part) => part && typeof part === 'object' && part.papel)
                .map((part) => part.papel);
              participacao = papeis.length > 0 ? papeis[0] : ''; // Usar o primeiro papel encontrado
            } else if (typeof p.participacoes === 'string') {
              participacao = p.participacoes;
            }
          }

          // Se não houver participação, marcar como 'upload guia'
          if (!participacao || participacao === '--') {
            participacao = 'upload guia';
          }

          // Cálculo dos campos CBHPM
          const cbhpm =
            p.valor_cbhpm ||
            (typeof p.cbhpm === 'string' ? parseBRL(cleanBRL(p.cbhpm)) : p.cbhpm) ||
            0;
          const liberado = Number(p.financial?.approved_value ?? p.liberado) || 0;
          const diferenca = p.diferenca !== undefined ? p.diferenca : liberado - cbhpm;
          const delta_percent =
            p.delta_percent !== undefined
              ? p.delta_percent
              : cbhpm
                ? ((liberado - cbhpm) / cbhpm) * 100
                : 0;

          return {
            id: idx,
            guia: p.guia ?? p.guide ?? '',
            data: p.data ?? p.date ?? '',
            paciente: p.paciente ?? p.patient ?? '',
            codigo: p.codigo ?? p.code ?? '',
            descricao: p.descricao ?? p.description ?? '',
            participacao,
            quantidade: p.quantidade ?? p.quantity ?? 1,
            apresentado: p.financial?.presented_value ?? p.apresentado ?? 0,
            liberado,
            glosa: p.financial?.glosa ?? p.glosa ?? 0,
            cbhpm,
            diferenca,
            delta_percent,
            financial: p.financial ?? undefined,
          };
        });
        console.log(
          `[DEBUG] Após mapeamento: ${mapped.length} procedimentos processados`
        );
        console.log(`[DEBUG] Amostra dos procedimentos mapeados:`, mapped.slice(0, 3));
        setProcedures(mapped);
      } catch (error) {
        console.error('Erro ao carregar procedimentos:', error);
        toast.error('Erro ao carregar procedimentos', { id: 'load-procedures-error' });
      } finally {
        setLoading(false);
      }
    };
    if (demonstrative.id) {
      setLoading(true);
      fetchProcedures();
    }
  }, [demonstrative.id]);

  console.log('DEBUG: Renderizando DemonstrativeDetailDialog', demonstrative);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Demonstrativo - ${demonstrative.periodo || ''}`, 10, 10);
    
    // Usar autoTable corretamente
    (doc as any).autoTable({
      head: [
        [
          'Guia',
          'Data',
          'Paciente',
          'Código',
          'Descrição',
          'Qtd',
          'Apresentado',
          'Liberado',
          'Glosa',
        ],
      ],
      body: procedures.map((p) => [
        p.guia,
        p.date || p.data,
        p.patient || p.paciente,
        p.code || p.codigo,
        p.description || p.descricao,
        p.quantity || p.qtd,
        p.financial?.presented_value ?? p.apresentado,
        p.financial?.approved_value ?? p.liberado,
        p.financial?.glosa ?? p.glosa,
      ]),
    });
    doc.save(`demonstrativo_${demonstrative.periodo || ''}.pdf`);
  };

  const glosas = procedures.filter(
    (p) => (Number(p.financial?.glosa ?? p.glosa) || 0) > 0
  );

  // Insights CBHPM
  const cbhpmComparisons = procedures.map((p) => {
    const proc = findProcedureByCodigo(p.codigo);
    const papelCBHPM = mapPapelToCBHPM(p.participacao);
    const cbhpm = proc ? calculateTotalCBHPM(proc, papelCBHPM) : null;
    const liberado = Number(p.financial?.approved_value ?? p.liberado) || 0;
    return {
      codigo: p.codigo,
      descricao: p.descricao,
      cbhpm,
      liberado,
      diferenca: cbhpm !== null ? liberado - cbhpm : null,
      participacao: p.participacao, // garantir campo
    };
  });
  // DEBUG: logar cada item de cbhpmComparisons com motivo
  cbhpmComparisons.forEach((c, i) => {
    const cbhpmNum = parseBRLToNumber(c.cbhpm);
    const isPend =
      !c.participacao || String(c.participacao).trim().toLowerCase() === 'upload guia';
    const entrou =
      typeof cbhpmNum === 'number' &&
      cbhpmNum > 0 &&
      typeof c.diferenca === 'number' &&
      c.diferenca < 0 &&
      !isPend;
    console.log(`[DEBUG] Item ${i}:`, {
      codigo: c.codigo,
      cbhpm: c.cbhpm,
      cbhpmNum,
      liberado: c.liberado,
      diferenca: c.diferenca,
      participacao: c.participacao,
      entrou,
      motivo: entrou
        ? 'OK'
        : isPend
          ? 'PENDENTE'
          : cbhpmNum <= 0
            ? 'CBHPM <= 0'
            : c.diferenca === null
              ? 'DIFERENCA NULL'
              : c.diferenca >= 0
                ? 'DIFERENCA >= 0'
                : 'OUTRO',
    });
  });
  // Filtro para procedimentos válidos (CBHPM > 0 e participação válida)
  const procedimentosValidos = cbhpmComparisons.filter((c) => {
    const cbhpmNum = parseBRLToNumber(c.cbhpm);
    const isPend =
      !c.participacao || String(c.participacao).trim().toLowerCase() === 'upload guia';
    return typeof cbhpmNum === 'number' && cbhpmNum > 0 && !isPend;
  });
  // Filtro para procedimentos abaixo da CBHPM
  const abaixoCBHPM = procedimentosValidos.filter(
    (c) => typeof c.diferenca === 'number' && c.diferenca < 0
  );
  const hasCBHPM = abaixoCBHPM.length > 0;
  const totalAbaixoCBHPM = hasCBHPM
    ? abaixoCBHPM.reduce((sum, c) => sum + c.diferenca, 0)
    : null;
  // % abaixo da tabela (corrigido)
  const percentAbaixoCBHPM =
    procedimentosValidos.length > 0
      ? Math.round((abaixoCBHPM.length / procedimentosValidos.length) * 100)
      : 0;
  // Maior diferença individual (corrigido)
  const maiorPrejuizo = abaixoCBHPM.reduce(
    (min, c) => (c.diferenca !== null && c.diferenca < min ? c.diferenca : min),
    0
  );
  const maiorPrejuizoProc = abaixoCBHPM.find((c) => c.diferenca === maiorPrejuizo);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>Detalhes</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-7xl w-full p-0 max-h-[95vh] h-[95vh] overflow-hidden shadow-xl"
        style={{ boxSizing: 'border-box', maxWidth: '95vw' }}
      >
        <div className="flex flex-col h-full min-h-0 gap-5 p-6">
          <DialogHeader className="flex-shrink-0 border-b border-gray-100/60 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {demonstrative.periodo}
            </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  {totals.totalProcedimentos} procedimentos detalhados
            </DialogDescription>
                  </div>
              
              {/* Resumo discreto e elegante */}
              <div className="flex items-center gap-6 text-sm bg-gray-50/50 px-4 py-2.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Liberado</span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(totals.totalLiberado)}</span>
                  </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Glosas</span>
                  <span className="font-semibold text-red-700">{formatCurrency(totals.totalGlosa)}</span>
                  </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500/80"></div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Taxa</span>
                  <span className="font-semibold text-blue-700">
                    {totals.totalApresentado > 0
                      ? `${((totals.totalLiberado / totals.totalApresentado) * 100).toFixed(0)}%`
                      : '0%'}
                    </span>
                  </div>
                  </div>
                </div>
          </DialogHeader>
          {/* Barra de filtros elegante e minimalista */}
          <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-gray-200/40 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {(() => {
                const filteredCount = procedures.filter((row) => {
                  if (showOnlyPendentes) {
                    return String(row.participacao || '').trim().toLowerCase() === 'upload guia';
                  }
                  if (showOnlyGlosas) {
                    const glosaValue = Number(row.financial?.glosa ?? row.glosa) || 0;
                    return glosaValue > 0;
                  }
                  return true;
                }).length;
                
                return (
                  <>
                    <span className="font-medium">{filteredCount}</span>
                    <span>
                      {filteredCount === 1 ? 'procedimento' : 'procedimentos'}
                      {showOnlyPendentes && ' • pendentes'}
                      {showOnlyGlosas && ' • com glosas'}
                      {(showOnlyPendentes || showOnlyGlosas) && ` de ${procedures.length}`}
                    </span>
                  </>
                );
              })()}
                  </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={showOnlyPendentes ? 'default' : 'outline'}
                onClick={() => {
                  setShowOnlyPendentes((v) => {
                    const novo = !v;
                    // Reset do filtro de glosas quando ativar pendentes
                    if (novo) setShowOnlyGlosas(false);
                    // Reset da paginação
                    setCurrentPage(0);
                    toast.success(
                      novo
                        ? 'Mostrando apenas procedimentos pendentes.'
                        : 'Mostrando todos os procedimentos.'
                    );
                    return novo;
                  });
                }}
                className={`text-sm font-medium transition-all duration-200 ${
                  showOnlyPendentes
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-sm'
                    : 'border-amber-200 text-amber-600 hover:bg-amber-50/70 hover:border-amber-300 bg-white/70'
                }`}
              >
                {showOnlyPendentes ? 'Todos' : 'Pendentes'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await handleExportPDF();
                  toast.success('PDF exportado com sucesso.');
                }}
                className="border-gray-200 text-gray-600 hover:bg-gray-50/70 text-sm font-medium transition-all duration-200 bg-white/70"
              >
                <Download className="w-3 h-3 mr-1" />
                PDF
              </Button>
              {glosas.length > 0 && (
                <Button
                  size="sm"
                  variant={showOnlyGlosas ? 'default' : 'outline'}
                  onClick={() => {
                    setShowOnlyGlosas((v) => {
                      const novo = !v;
                      // Reset do filtro de pendentes quando ativar glosas
                      if (novo) setShowOnlyPendentes(false);
                      // Reset da paginação
                      setCurrentPage(0);
                      toast.success(
                        novo
                          ? 'Mostrando apenas procedimentos com glosa.'
                          : 'Mostrando todos os procedimentos.'
                      );
                      return novo;
                    });
                  }}
                  className={`text-sm font-medium transition-all duration-200 ${
                    showOnlyGlosas
                      ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-sm'
                      : 'border-red-200 text-red-600 hover:bg-red-50/70 hover:border-red-300 bg-white/70'
                  }`}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {showOnlyGlosas ? 'Todas' : `Glosas (${glosas.length})`}
                </Button>
              )}
            </div>
          </div>
          {/* Tabela de procedimentos - Design elegante e focado */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Card className="h-full flex flex-col border-gray-200 shadow-lg rounded-xl bg-white">
              <CardHeader className="flex-shrink-0 py-4 px-6 bg-gradient-to-r from-white to-gray-50/30 border-b border-gray-100 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/70"></div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Confirmado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500/70"></div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Pendente</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500/70"></div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Glosa</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0 bg-white">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-blue-500 w-6 h-6" />
                    <span className="ml-3 text-slate-600">
                      Carregando procedimentos...
                    </span>
                  </div>
                ) : (
                  <div className="h-full overflow-auto">
                    <DataGrid
                      rows={procedures
                        .map((p, idx) => ({ id: idx, ...p }))
                        .filter((row) => {
                          // Filtro de pendentes
                          if (showOnlyPendentes) {
                            return (
                              String(row.participacao || '')
                                .trim()
                                .toLowerCase() === 'upload guia'
                            );
                          }

                          // Filtro de glosas
                          if (showOnlyGlosas) {
                            const glosaValue =
                              Number(row.financial?.glosa ?? row.glosa) || 0;
                            return glosaValue > 0;
                          }

                          // Mostrar todos
                          return true;
                        })}
                      columns={getProceduresColumns(navigate)}
                      pageSize={pageSize}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setCurrentPage(0); // Reset para primeira página
                      }}
                      className="border-0"
                      wrapperScrollable={false}
                      paginationLabel="Procedimentos por página:"
                      rowsPerPageOptions={[10, 20, 50, 100]}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {showGlosas && (
            <Card className="flex-shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Procedimentos com Glosa</CardTitle>
              </CardHeader>
              <CardContent>
                {glosas.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">
                    Nenhuma glosa encontrada neste demonstrativo.
                  </div>
                ) : (
                  <div className="h-64 overflow-hidden">
                    <DataGrid
                      rows={glosas.map((p, idx) => ({ id: idx, ...p }))}
                      columns={getProceduresColumns(navigate)}
                      pageSize={10}
                      className="border-0"
                    />
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGlosas(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DemonstrativesPage = () => {
  console.log('DEBUG: Renderizando DemonstrativesPage');

  // SEO e Título Premium
  usePageTitle({
    title: 'Gestão de Demonstrativos',
    description:
      'Central de análise e gerenciamento de demonstrativos de pagamento médico com análise financeira avançada e insights de performance',
    keywords:
      'demonstrativos médicos, gestão financeira médica, análise de pagamentos, auditoria demonstrativos',
  });

  const [demonstratives, setDemonstratives] = useState<any[]>([]);
  const [filteredDemonstratives, setFilteredDemonstratives] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [pendingAudits, setPendingAudits] = useState(0);
  const [pendingAuditsLoading, setPendingAuditsLoading] = useState(false);
  const [pendingAuditsError, setPendingAuditsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Usar apenas as funcionalidades necessárias do hook
  const {
    handleFileChangeByType, // Manter para compatibilidade se necessário
  } = useFileUpload();

  // Estados para upload simplificado
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { userProfile } = useAuth();

  useEffect(() => {
    fetchDemonstratives();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = demonstratives;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (demo) =>
          demo.periodo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          demo.filename?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de data personalizada
    if (startDate || endDate) {
      filtered = filtered.filter((demo) => {
        const uploadDate = new Date(demo.upload_time);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-12-31');
        
        // Ajustar fim do dia para incluir todo o dia selecionado
        if (endDate) {
          end.setHours(23, 59, 59, 999);
        }
        
        return uploadDate >= start && uploadDate <= end;
      });
    }
    // Filtro de período pré-definido (apenas se não há datas personalizadas)
    else if (selectedPeriod !== 'all') {
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

    // Filtro de status
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

  useEffect(() => {
    async function fetchPendingAudits() {
      if (!demonstratives.length) {
        setPendingAudits(0);
        setPendingAuditsLoading(false);
        setPendingAuditsError(null);
        return;
      }
      setPendingAuditsLoading(true);
      setPendingAuditsError(null);
      const token = localStorage.getItem('token');
      let totalPendentes = 0;
      try {
        await Promise.all(
          demonstratives.map(async (d) => {
            const res = await axios.get(
              `${
                import.meta.env.VITE_API_URL || 'http://localhost:8000'
              }/api/v1/demonstrativos/${d.id}/detalhes`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const detalhes = Array.isArray(res.data) ? res.data : [];
            console.log('DEBUG detalhes demonstrativo', d.id, detalhes);
            const pendentes = detalhes.filter((p: any) => {
              // Usar a mesma lógica do modal: priorizar papel_exercido
              let participacao = '';

              if (p.papel_exercido && typeof p.papel_exercido === 'string') {
                participacao = p.papel_exercido;
              } else if (typeof p.papel === 'string') {
                participacao = p.papel;
              } else if (p.participacao && typeof p.participacao === 'string') {
                participacao = p.participacao;
              } else if (p.participacoes) {
                if (Array.isArray(p.participacoes)) {
                  const papeis = p.participacoes
                    .filter((part) => part && typeof part === 'object' && part.papel)
                    .map((part) => part.papel);
                  participacao = papeis.length > 0 ? papeis[0] : '';
                } else if (typeof p.participacoes === 'string') {
                  participacao = p.participacoes;
                }
              }

              if (!participacao || participacao === '--') participacao = 'upload guia';
              return String(participacao).trim().toLowerCase() === 'upload guia';
            });
            console.log('DEBUG pendentes encontrados', pendentes.length, pendentes);
            totalPendentes += pendentes.length;
          })
        );
        setPendingAudits(totalPendentes);
      } catch (err: any) {
        setPendingAuditsError('Erro ao carregar auditorias pendentes');
      } finally {
        setPendingAuditsLoading(false);
      }
    }
    fetchPendingAudits();
  }, [demonstratives]);

  const fetchDemonstratives = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Buscando demonstrativos...');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/demonstrativos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('✅ Dados recebidos do backend:', response.data);
      
      // Log específico para debug dos valores
      response.data.forEach((demo, index) => {
        console.log(`📊 Demo ${index + 1}:`, {
          periodo: demo.periodo,
          total_presented: demo.total_presented,
          total_approved: demo.total_approved,
          total_glosa: demo.total_glosa,
          apresentado_string: demo.apresentado,
          liberado_string: demo.liberado,
          glosa_string: demo.glosa
        });
      });
      
      setDemonstratives(response.data);
    } catch (error) {
      console.error('❌ Erro ao carregar demonstrativos:', error);
      toast.error('Erro ao carregar demonstrativos');
    } finally {
      setLoading(false);
    }
  };

  // Função para recarregar dados (compatibilidade)
  const loadDemonstratives = () => {
    fetchDemonstratives();
  };

  // Função para detectar duplicados baseada no conteúdo
  // const checkForDuplicates = async (file: File): Promise<boolean> => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const formData = new FormData();
  //     formData.append('file', file);
      
  //     const response = await axios.post(
  //       `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/demonstrativos/check-duplicate`,
  //       formData,
  //       {
  //         headers: { 
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'multipart/form-data'
  //         },
  //       }
  //     );
      
  //     return response.data.is_duplicate || false;
  //   } catch (error) {
  //     console.warn('Erro ao verificar duplicatas:', error);
  //     return false; // Em caso de erro, permitir upload
  //   }
  // };

  const handleDeleteDemonstrativo = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este demonstrativo?')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:8000'
        }/api/v1/demonstrativos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Demonstrativo excluído com sucesso', {
        id: `delete-success-${id}`,
      });
      fetchDemonstratives();
    } catch (error) {
      console.error('Erro ao excluir demonstrativo:', error);
      toast.error('Erro ao excluir demonstrativo');
    } finally {
      setDeleting(false);
    }
  };

  // Função simplificada para mudança de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList);
      setUploadFiles(filesArray);
    }
  };

  // Upload simplificado e funcional
  const handleSimpleUpload = async () => {
    if (!uploadFiles.length) {
      toast.error('Selecione pelo menos um arquivo para upload');
      return;
    }

    setUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token de autenticação não encontrado. Faça login novamente.');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      
      // Adicionar todos os arquivos como array
      uploadFiles.forEach((file) => {
        formData.append('files', file);
      });
      
      console.log('Enviando arquivos:', uploadFiles.map(f => f.name));
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/demonstrativos/upload`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      
      console.log('Resposta do upload:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const results = response.data;
        const successCount = results.filter(r => r.success).length;
        const duplicateCount = results.filter(r => r.duplicate).length;
        const errorCount = results.filter(r => !r.success && !r.duplicate).length;
        
        // Feedback detalhado por arquivo
        results.forEach(result => {
          if (result.success) {
            toast.success(`"${result.filename}" processado com sucesso`);
          } else if (result.duplicate) {
            toast.warning(`"${result.filename}" já foi processado anteriormente`);
          } else {
            toast.error(`Erro em "${result.filename}": ${result.error}`);
          }
        });
        
        // Resumo final
        if (successCount > 0) {
          toast.success(`Upload concluído: ${successCount} arquivo(s) processado(s)`);
          await fetchDemonstratives(); // Recarregar dados
          setUploadFiles([]); // Limpar arquivos
          
          // Limpar input
          const fileInput = document.getElementById('demo-file-upload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        } else {
          toast.info('Nenhum arquivo novo foi processado');
        }
      } else {
        toast.success('Upload realizado com sucesso');
        await fetchDemonstratives();
        setUploadFiles([]);
        
        const fileInput = document.getElementById('demo-file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }

    } catch (error: any) {
      console.error('Erro no upload:', error);
      
      if (error.response?.status === 422) {
        console.error('Detalhes do erro 422:', error.response.data);
        toast.error(`Erro de validação: ${error.response.data.detail || 'Arquivo inválido'}`);
      } else if (error.response?.status === 401) {
        toast.error('Token de autenticação inválido. Faça login novamente.');
      } else {
        toast.error(`Erro durante o upload: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  // Funções de export e manipulação não utilizadas atualmente
  // const handleFileDrop = async (type: FileType, fileList: FileList) => {
  //   try {
  //     await handleFileChangeByType(type, fileList);
  //   } catch (error) {
  //     console.error('Erro ao processar arquivo:', error);
  //     toast.error('Erro ao processar arquivo');
  //   }
  // };

  // const handleExportCSV = () => {
  //   // Implementação comentada para evitar warning
  // };

  // const handleExportProcedures = async () => {
  //   // Implementação comentada para evitar warning  
  // };

  // const clearFilters = () => {
  //   setSearchTerm('');
  //   setSelectedPeriod('all');
  //   setSelectedStatus('all');
  // };

  // Estatísticas globais (sempre usar todos os demonstrativos, não filtrados)
  const summaryStats = {
    totalProcessado: demonstratives.reduce(
      (sum, d) => {
        const value = d.total_approved || 0;
        console.log(`💰 Demo "${d.periodo}": total_approved = ${value}`);
        return sum + value;
      },
      0
    ),
    totalGlosa: demonstratives.reduce((sum, d) => {
      const value = d.total_glosa || 0;
      console.log(`🚫 Demo "${d.periodo}": total_glosa = ${value}`);
      return sum + value;
    }, 0),
    totalProcedimentos: demonstratives.reduce(
      (sum, d) => {
        const value = d.total_procedures || 0;
        console.log(`📋 Demo "${d.periodo}": total_procedures = ${value}`);
        return sum + value;
      },
      0
    ),
    // Novos cálculos inteligentes
    demonstrativosComGlosa: demonstratives.filter((d) => d.total_glosa > 0).length,
    demonstrativosSemGlosa: demonstratives.filter((d) => d.total_glosa === 0).length,
    totalApresentado: demonstratives.reduce(
      (sum, d) => {
        const value = d.total_presented || 0;
        console.log(`📄 Demo "${d.periodo}": total_presented = ${value}`);
        return sum + value;
      },
      0
    ),
  };

  // Debug dos cálculos
  console.log('📊 Demonstratives array:', demonstratives);
  console.log('📊 SummaryStats calculado:', summaryStats);

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
      headerName: 'Total Procedimentos',
      width: 170,
      renderCell: ({ value }) => <span className="font-medium">{value}</span>,
    },
    {
      field: 'total_presented',
      headerName: 'Apresentado',
      width: 150,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'total_approved',
      headerName: 'Liberado',
      width: 150,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'total_glosa',
      headerName: 'Glosa',
      width: 150,
      renderCell: ({ value }) => {
        const hasGlosa = value > 0;
        return (
          <span className={hasGlosa ? 'text-red-600 font-semibold' : 'text-gray-400'}>
            {formatCurrency(value)}
          </span>
        );
      },
    },
    {
      field: 'delta_value',
      headerName: 'Delta R$',
      width: 130,
      description: 'Diferença entre o valor liberado e o apresentado',
      valueGetter: (params) => {
        const liberado = Number(params.row.total_approved) || 0;
        const apresentado = Number(params.row.total_presented) || 0;
        return liberado - apresentado;
      },
      renderCell: ({ value }) => (
        <span
          className={
            value < 0
              ? 'text-danger font-medium'
              : value > 0
                ? 'text-success font-medium'
                : 'text-muted-foreground'
          }
        >
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 180,
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <DemonstrativeDetailDialog demonstrative={row} />
          <Button
            variant="destructive"
            size="sm"
            className="ml-2 h-9 px-4 font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow transition-all duration-200"
            onClick={async () => {
              await handleDeleteDemonstrativo(row.id);
              // Toast é disparado por handleDeleteDemonstrativo; não repetir aqui
            }}
            title="Excluir demonstrativo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Demonstrativos & Honorários - MedCheck</title>
        <meta name="description" content="Central de análise e gerenciamento de demonstrativos de pagamento médico com análise financeira avançada e insights de performance" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'MedCheck - Demonstrativos',
            description: 'Plataforma para análise e gerenciamento de demonstrativos de pagamento médico',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

      {/* Background com Gradiente Médico Consistente */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-gray-50/20 to-emerald-50/30">
      <AuthenticatedLayout
          title="Demonstrativos & Honorários"
          description="Central de análise e gerenciamento de demonstrativos de pagamento médico com análise financeira avançada e insights de performance"
        >
          <div className="space-y-8 px-4 sm:px-6 lg:px-8">
            {/* Header Discreto Seguindo Padrão Dashboard */}
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
                Central de análise e gerenciamento de demonstrativos de pagamento médico com insights de performance
              </p>

              {/* Actions Compactas */}
              <div className="flex justify-center items-center gap-2 flex-wrap pt-2">
                <Badge variant="outline" className="gap-1 bg-white/80 text-xs">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  Análise Avançada
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDemonstratives}
                  disabled={loading}
                  className="gap-1 text-xs px-3 py-1"
                >
                  <FileBarChart className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </Button>
                  </div>
              </div>

        <div className="w-full space-y-8">
          {/* 1. CONVERSÃO: Upload Principal (Destaque Máximo) */}
          <section aria-label="Upload de Demonstrativos" className="space-y-6">
            <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 border-emerald-200 shadow-lg w-full relative overflow-hidden">
              {/* Linha de destaque superior */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
              
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-emerald-900">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100">
                    <Upload className="h-6 w-6 text-emerald-700" />
                  </div>
                  Upload de Demonstrativos
                </CardTitle>
                <CardDescription className="text-emerald-700">
                  <strong>Analise seus pagamentos:</strong> Faça upload dos seus demonstrativos de pagamento para análise financeira automatizada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="demo-file-upload" className="sr-only">
                      Selecionar arquivos
                    </Label>
                    <Input
                      id="demo-file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.csv,.xlsx"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="cursor-pointer bg-white/80 border-emerald-200/60"
                    />
                  </div>
                  <Button
                    onClick={handleSimpleUpload}
                    disabled={uploadFiles.length === 0 || uploading}
                    className="min-w-[120px] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
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
                  <div className="text-sm text-emerald-700 bg-emerald-100/60 p-4 rounded-xl border border-emerald-200/60">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <strong>{uploadFiles.length} arquivo(s) selecionado(s):</strong> {uploadFiles.map(f => f.name).join(', ')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* 2. INFORMAÇÃO: Cards de Resumo Financeiro (Hierarquia Menor) */}
          <section aria-label="Visão Geral Financeira" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-full"></div>
              <h3 className="text-base font-medium text-gray-700">Resumo Financeiro</h3>
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
                {/* Card Valores Liberados - Verde */}
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
                        <p className="text-xl font-bold text-emerald-800 leading-none">
                          {formatCurrency(summaryStats.totalProcessado)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Glosas - Vermelho */}
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
                        <p className="text-xl font-bold text-red-800 leading-none">
                          {formatCurrency(summaryStats.totalGlosa)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Procedimentos - Azul */}
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
                        <p className="text-xl font-bold text-blue-800 leading-none">
                          {summaryStats.totalProcedimentos}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Demonstrativos - Âmbar */}
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
                        <p className="text-xl font-bold text-amber-800 leading-none">
                          {demonstratives.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>

          {/* 3. FERRAMENTAS: Filtros e Busca */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full"></div>
              <h3 className="text-base font-medium text-gray-700">Filtros & Análise</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>

            <Card className="bg-white/40 backdrop-blur-sm border border-gray-200/30 shadow-sm w-full">
              <CardContent className="p-4 space-y-4">
                {/* Linha 1: Busca */}
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
                  
                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="status-filter" className="text-sm font-medium whitespace-nowrap">
                      Status:
                    </Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[140px] h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="liberado">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            Liberado
                          </div>
                        </SelectItem>
                        <SelectItem value="glosado">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            Glosado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Linha 2: Filtros de Data */}
                <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center bg-gray-50/30 p-3 rounded-lg border border-gray-200/40">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                      Período de Upload:
                    </Label>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 items-center flex-1">
                    {/* Data Início */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor="start-date" className="text-sm font-medium whitespace-nowrap">
                        De:
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          // Limpar período pré-definido quando usar data personalizada
                          if (e.target.value) setSelectedPeriod('all');
                        }}
                        className="w-[140px] h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm"
                      />
                    </div>

                    {/* Data Fim */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor="end-date" className="text-sm font-medium whitespace-nowrap">
                        Até:
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          // Limpar período pré-definido quando usar data personalizada
                          if (e.target.value) setSelectedPeriod('all');
                        }}
                        className="w-[140px] h-9 rounded-lg bg-white/80 border-gray-200/60 text-sm"
                      />
                    </div>

                    {/* Divisor */}
                    <div className="w-px h-6 bg-gray-300"></div>

                    {/* Períodos Rápidos */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor="period-filter" className="text-sm font-medium whitespace-nowrap">
                        Ou selecione:
                      </Label>
                      <Select 
                        value={selectedPeriod} 
                        onValueChange={(value) => {
                          setSelectedPeriod(value);
                          // Limpar datas personalizadas quando usar período pré-definido
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

                    {/* Botão Limpar Filtros */}
                    {(startDate || endDate || selectedPeriod !== 'all' || selectedStatus !== 'all' || searchTerm) && (
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

                {/* Informações dos Filtros */}
                {filteredDemonstratives.length !== demonstratives.length && (
                  <div className="text-xs text-gray-600 bg-blue-50/60 p-2 rounded-lg border border-blue-200/40">
                    Mostrando {filteredDemonstratives.length} de {demonstratives.length} demonstrativos
                    {(startDate || endDate) && (
                      <span className="ml-1">
                        • Período: {startDate || 'início'} até {endDate || 'hoje'}
                      </span>
                    )}
                    {selectedPeriod !== 'all' && (
                      <span className="ml-1">
                        • Últimos {selectedPeriod === '30d' ? '30 dias' : selectedPeriod === '90d' ? '90 dias' : selectedPeriod === '6m' ? '6 meses' : '1 ano'}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* 4. ANÁLISE: DataGrid */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></div>
              <h3 className="text-base font-medium text-gray-700">Análise Detalhada</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>

            <div className="w-full">
              <DataGrid
                rows={filteredDemonstratives}
                columns={columns}
                loading={loading}
                className="bg-white/80 backdrop-blur-sm border-gray-200/60 shadow-lg"
              />
            </div>
          </section>
        </div>
        </div>
      </AuthenticatedLayout>
    </div>
    </>
  );
};

export default DemonstrativesPage;
