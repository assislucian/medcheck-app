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
import { Input } from '../components/ui/input';
import {
  FileBarChart,
  Download,
  Filter,
  Upload,
  Eye,
  ChevronRight,
  Calendar,
  DollarSign,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  FileText,
  ClipboardList,
  Search,
  Plus,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import FileDropZone from '../components/upload/FileDropZone';
import { useFileUpload } from '../hooks/useFileUpload';
import { FileType } from '../types/upload';
import FileList from '../components/upload/FileList';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { findProcedureByCodigo, calculateTotalCBHPM } from '../data/cbhpmData';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../contexts/auth/AuthContext';
import { UserMenu } from '../components/navbar/UserMenu';
import { InfoCard } from '../components/ui/InfoCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { Helmet } from 'react-helmet-async';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

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

const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

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

const proceduresColumns = [
  { field: 'guia', headerName: 'Guia', width: 100 },
  { field: 'data', headerName: 'Data', width: 100 },
  { field: 'paciente', headerName: 'Paciente', width: 150 },
  { field: 'codigo', headerName: 'Código', width: 100 },
  { field: 'descricao', headerName: 'Descrição', flex: 1 },
  { field: 'quantidade', headerName: 'Qtd', width: 60 },
  {
    field: 'apresentado',
    headerName: 'Apresentado',
    width: 120,
    valueFormatter: (params: any) => formatCurrency(params.value),
  },
  {
    field: 'liberado',
    headerName: 'Liberado',
    width: 120,
    valueFormatter: (params: any) => formatCurrency(params.value),
  },
  {
    field: 'glosa',
    headerName: 'Glosa',
    width: 120,
    renderCell: ({ value }) => {
      const hasGlosa = value > 0;
      return (
        <div className="flex items-center gap-2">
          {hasGlosa && (
            <div
              className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
              title="Glosa identificada"
            />
          )}
          <Badge
            variant={hasGlosa ? 'warning' : 'success'}
            className="whitespace-nowrap px-3 py-1 text-xs font-medium"
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
    minWidth: 110,
    flex: 0,
    valueGetter: (params) => params.row.cbhpm,
    valueFormatter: (params) =>
      params.value && params.value > 0 ? formatCurrency(params.value) : '--',
    renderCell: ({ value }) =>
      value && value > 0 ? <span>{formatCurrency(value)}</span> : <span>--</span>,
  },
  {
    field: 'diferenca',
    headerName: 'Diferença',
    minWidth: 110,
    flex: 0,
    valueGetter: (params) =>
      params.row.cbhpm && params.row.cbhpm > 0
        ? params.row.liberado - params.row.cbhpm
        : null,
    renderCell: ({ value, row }) => {
      if (!row.cbhpm || row.cbhpm <= 0) return <span>--</span>;
      let variant = 'neutral';
      let Icon = null;
      if (value < 0) {
        variant = 'danger';
        Icon = <ArrowDownRight className="inline w-4 h-4 ml-1 text-danger" />;
      } else if (value > 0) {
        variant = 'success';
        Icon = <ArrowUpRight className="inline w-4 h-4 ml-1 text-success" />;
      }
      return (
        <Badge
          variant={variant}
          className="whitespace-nowrap px-3 py-1 font-semibold flex items-center gap-1"
        >
          {formatCurrency(value)}
          {Icon}
        </Badge>
      );
    },
  },
  {
    field: 'delta_percent',
    headerName: 'Delta %',
    minWidth: 90,
    flex: 0,
    description: 'Percentual da diferença entre liberado e CBHPM',
    valueGetter: (params) =>
      params.row.cbhpm && params.row.cbhpm > 0
        ? ((params.row.liberado - params.row.cbhpm) / params.row.cbhpm) * 100
        : null,
    renderCell: ({ value, row }) => {
      if (!row.cbhpm || row.cbhpm <= 0) return <span>--</span>;
      let variant = 'neutral';
      if (value < 0) variant = 'warning';
      if (value > 0) variant = 'success';
      return (
        <Badge variant={variant} className="whitespace-nowrap px-3 py-1 font-semibold">
          {value !== null && value !== undefined ? `${value.toFixed(2)}%` : '--'}
        </Badge>
      );
    },
  },
  {
    field: 'participacao',
    headerName: 'Status',
    minWidth: 140,
    flex: 0,
    renderCell: ({ value }) => {
      const participacao = String(value || '')
        .trim()
        .toLowerCase();
      const isPendente =
        participacao === 'upload guia' || !participacao || participacao === '--';

      if (isPendente) {
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
              title="Aguardando upload de guia"
            />
            <Badge variant="warning" className="text-xs font-medium">
              Aguardando Guia
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-emerald-500"
            title="Participação confirmada"
          />
          <Badge variant="success" className="text-xs font-medium">
            {papelDisplay(value)}
          </Badge>
        </div>
      );
    },
  },
  {
    field: 'acao',
    headerName: 'Ação',
    minWidth: 80,
    flex: 0,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const participacao = String(params.row.participacao || '')
        .trim()
        .toLowerCase();
      if (participacao !== 'upload guia') return null;
      const codigo = encodeURIComponent(params.row.codigo || '');
      const paciente = encodeURIComponent(params.row.paciente || '');
      const navigate = useNavigate();
      return (
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/guides?codigo=${codigo}&paciente=${paciente}`);
          }}
          title="Clique para enviar a guia TISS referente a este procedimento. Você será redirecionado para a tela de upload de guias."
          className="text-xs border-slate-300 hover:bg-slate-50"
        >
          <Upload className="h-4 w-4 mr-1" />
          Enviar Guia
        </Button>
      );
    },
  },
];

const DemonstrativeDetailDialog = ({ demonstrative }) => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGlosas, setShowGlosas] = useState(false);
  const [showOnlyPendentes, setShowOnlyPendentes] = useState(false);
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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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
          if (typeof p.papel === 'string') {
            participacao = p.papel;
          } else if (p.participacao) {
            participacao = p.participacao;
          } else if (p.participacoes) {
            participacao = Array.isArray(p.participacoes)
              ? p.participacoes.join('; ')
              : p.participacoes;
          }
          // Se não houver participação, marcar como 'Upload guia'
          if (!participacao || participacao === '--') {
            participacao = 'Upload guia';
          }
          // Cálculo dos campos
          const cbhpm =
            typeof p.cbhpm === 'string' ? parseBRL(cleanBRL(p.cbhpm)) : p.cbhpm ?? 0;
          const liberado = Number(p.financial?.approved_value ?? p.liberado) || 0;
          const diferenca = liberado - cbhpm;
          const delta_percent = cbhpm ? ((liberado - cbhpm) / cbhpm) * 100 : 0;
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
        toast.error('Erro ao carregar procedimentos');
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
    doc.autoTable({
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
        <div className="flex flex-col h-full min-h-0 gap-4 p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              Demonstrativo - {demonstrative.periodo}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Detalhes do demonstrativo de pagamento, incluindo totais, procedimentos e
              insights comparativos com a CBHPM.
            </DialogDescription>
          </DialogHeader>
          {/* Insights CBHPM - Cards com design médico profissional */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 flex-shrink-0">
            <Card className="border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-500/60" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Divergência CBHPM
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                      {hasCBHPM ? formatCurrency(Math.abs(totalAbaixoCBHPM)) : '—'}
                    </p>
                    <p className="text-xs text-slate-500 leading-tight">
                      {hasCBHPM
                        ? 'Valor total em divergência com a tabela CBHPM'
                        : 'Análise CBHPM indisponível'}
                    </p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Taxa Conformidade
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                      {100 - percentAbaixoCBHPM}%
                    </p>
                    <p className="text-xs text-slate-500 leading-tight">
                      Procedimentos em conformidade com CBHPM
                    </p>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500/60" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Maior Divergência
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                      {maiorPrejuizoProc && maiorPrejuizoProc.diferenca !== null
                        ? formatCurrency(Math.abs(maiorPrejuizoProc.diferenca))
                        : '--'}
                    </p>
                    <p className="text-xs text-slate-500 leading-tight">
                      {maiorPrejuizoProc
                        ? `Código: ${maiorPrejuizoProc.codigo}`
                        : 'Nenhuma divergência identificada'}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Totais - Cards com design médico profissional */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 rounded-md">
                    <ArrowUpRight className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-600">Total Liberado</p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(totals.totalLiberado)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-600 rounded-md">
                    <FileText className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-600">Procedimentos</p>
                    <p className="text-sm font-bold text-slate-900">
                      {totals.totalProcedimentos}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-600 rounded-md">
                    <AlertCircle className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-600">Total Glosa</p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(totals.totalGlosa)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-600 rounded-md">
                    <DollarSign className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-600">
                      Total Apresentado
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(totals.totalApresentado)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Cabeçalho da tabela com filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
            <h3 className="text-lg font-semibold text-foreground">
              Detalhamento de Procedimentos
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                size="sm"
                variant={showOnlyPendentes ? 'default' : 'outline'}
                onClick={() => {
                  setShowOnlyPendentes((v) => {
                    const novo = !v;
                    toast.success(
                      novo
                        ? 'Mostrando apenas pendentes.'
                        : 'Mostrando todos os procedimentos.'
                    );
                    return novo;
                  });
                }}
                title="Mostrar apenas procedimentos pendentes de upload de guia"
              >
                {showOnlyPendentes ? 'Mostrar Todos' : 'Mostrar Pendentes'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await handleExportPDF();
                  toast.success('PDF exportado com sucesso.');
                }}
                title="Exportar demonstrativo detalhado em PDF"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button
                size="sm"
                onClick={() => setShowGlosas(true)}
                disabled={glosas.length === 0}
                aria-label="Analisar Glosas"
                className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white border-0 shadow-sm text-xs"
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Analisar Glosas
              </Button>
            </div>
          </div>
          {/* Tabela de procedimentos - CORRIGIDA com scroll adequado */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Lista de Procedimentos ({procedures.length} itens)
                  </CardTitle>
                  <div className="text-xs text-slate-500">
                    {showOnlyPendentes
                      ? 'Mostrando apenas pendentes'
                      : 'Mostrando todos'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-primary w-6 h-6" />
                    <span className="ml-3 text-muted-foreground">
                      Carregando procedimentos...
                    </span>
                  </div>
                ) : (
                  <div className="h-full overflow-auto border-t">
                    <DataGrid
                      rows={procedures
                        .map((p, idx) => ({ id: idx, ...p }))
                        .filter(
                          (row) =>
                            !showOnlyPendentes ||
                            String(row.participacao || '')
                              .trim()
                              .toLowerCase() === 'upload guia'
                        )}
                      columns={proceduresColumns}
                      pageSize={100}
                      className="border-0"
                      wrapperScrollable={false}
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
                      columns={proceduresColumns}
                      pageSize={10}
                      className="border-0"
                      autoHeight={false}
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
  const [activeTab, setActiveTab] = useState('list');
  const [deleting, setDeleting] = useState(false);
  const [pendingAudits, setPendingAudits] = useState(0);
  const [pendingAuditsLoading, setPendingAuditsLoading] = useState(false);
  const [pendingAuditsError, setPendingAuditsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fileUpload = useFileUpload();
  const {
    files,
    isUploading,
    removeFile,
    resetFiles,
    handleFileChangeByType,
    processUploadedFiles,
  } = fileUpload;

  const { userProfile, signOut } = useAuth();

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

    // Filtro de período
    if (selectedPeriod !== 'all') {
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
  }, [demonstratives, searchTerm, selectedPeriod, selectedStatus]);

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
            const detalhes = res.data;
            console.log('DEBUG detalhes demonstrativo', d.id, detalhes);
            const pendentes = detalhes.filter((p: any) => {
              // Replicar lógica do modal: se não houver papel/participacao/participacoes, é pendente
              let participacao = '';
              if (typeof p.papel === 'string') participacao = p.papel;
              else if (p.participacao) participacao = p.participacao;
              else if (p.participacoes)
                participacao = Array.isArray(p.participacoes)
                  ? p.participacoes.join('; ')
                  : p.participacoes;
              if (!participacao || participacao === '--') participacao = 'Upload guia';
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
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:8000'
        }/api/v1/demonstrativos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const mapped = (res.data || []).map((d: any) => {
        console.log('DEBUG demonstrativo:', d);
        return {
          id: d.id,
          periodo: d.periodo || d.period || '',
          total_procedures: Number(
            d.total_procedures || d.totalProcedimentos || d.total_procedimentos || 0
          ),
          total_presented: parseBRL(d.total_presented || d.apresentado),
          total_approved: parseBRL(d.total_approved || d.liberado),
          total_glosa: parseBRL(d.total_glosa || d.glosa),
          filename: d.filename,
          upload_time: d.upload_time,
        };
      });
      setDemonstratives(mapped);
    } catch (err) {
      console.error('Erro ao carregar demonstrativos:', err);
      toast.error('Erro ao carregar demonstrativos');
      setDemonstratives([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDemonstrativo = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este demonstrativo?')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:8000'
        }/api/v1/demonstrativos/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Demonstrativo excluído com sucesso');
      fetchDemonstratives();
    } catch (error) {
      console.error('Erro ao excluir demonstrativo:', error);
      toast.error('Erro ao excluir demonstrativo');
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadDemonstrativos = async () => {
    if (!files.length) {
      toast.error('Selecione pelo menos um arquivo para upload');
      return;
    }

    try {
      await processUploadedFiles();
      toast.success('Demonstrativos processados com sucesso');
      await fetchDemonstratives();
      resetFiles();
    } catch (error) {
      console.error('Erro ao processar demonstrativos:', error);
      toast.error('Erro ao processar demonstrativos');
    }
  };

  const handleFileDrop = async (type: FileType, fileList: FileList) => {
    try {
      await handleFileChangeByType(type, fileList);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar arquivo');
    }
  };

  // Funções para exportar dados
  const handleExportCSV = () => {
    const headers = [
      'Período',
      'Total Procedimentos',
      'Apresentado',
      'Liberado',
      'Glosa',
      'Delta R$',
      'Arquivo',
    ];
    const rows = filteredDemonstratives.map((demo) => [
      demo.periodo,
      demo.total_procedures,
      formatCurrency(demo.total_presented),
      formatCurrency(demo.total_approved),
      formatCurrency(demo.total_glosa),
      formatCurrency((demo.total_approved || 0) - (demo.total_presented || 0)),
      demo.filename,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `demonstrativos_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exportado com sucesso');
  };

  const handleExportProcedures = async () => {
    try {
      const token = localStorage.getItem('token');
      const allProcedures = [];

      // Buscar detalhes de todos os demonstrativos filtrados
      for (const demo of filteredDemonstratives) {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL || 'http://localhost:8000'
          }/api/v1/demonstrativos/${demo.id}/detalhes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        allProcedures.push(
          ...res.data.map((proc) => ({ ...proc, demonstrativo: demo.periodo }))
        );
      }

      const headers = [
        'Demonstrativo',
        'Guia',
        'Data',
        'Paciente',
        'Código',
        'Descrição',
        'Qtd',
        'Apresentado',
        'Liberado',
        'Glosa',
      ];
      const rows = allProcedures.map((proc) => [
        proc.demonstrativo,
        proc.guia,
        proc.data,
        proc.paciente,
        proc.codigo,
        proc.descricao,
        proc.quantidade,
        formatCurrency(proc.apresentado),
        formatCurrency(proc.liberado),
        formatCurrency(proc.glosa),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `procedimentos_demonstrativos_${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Procedimentos exportados com sucesso');
    } catch (error) {
      console.error('Erro ao exportar procedimentos:', error);
      toast.error('Erro ao exportar procedimentos');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPeriod('all');
    setSelectedStatus('all');
  };

  // Estatísticas globais (sempre usar todos os demonstrativos, não filtrados)
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
    // Novos cálculos inteligentes
    demonstrativosComGlosa: demonstratives.filter((d) => d.total_glosa > 0).length,
    demonstrativosSemGlosa: demonstratives.filter((d) => d.total_glosa === 0).length,
    totalApresentado: demonstratives.reduce(
      (sum, d) => sum + (d.total_presented || 0),
      0
    ),
  };

  const demonstrativesColumns = [
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
            className="ml-2 h-9 px-4 font-medium bg-surface-2 border border-border text-foreground hover:bg-surface-3 transition-colors"
            onClick={async () => {
              await handleDeleteDemonstrativo(row.id);
              toast.success('Demonstrativo excluído com sucesso');
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
        <title>Gestão de Demonstrativos | MedCheck</title>
        <meta
          name="description"
          content="Central de análise e gerenciamento de demonstrativos de pagamento médico com análise financeira avançada e insights de performance"
        />
        <meta
          name="keywords"
          content="demonstrativos médicos, gestão financeira médica, análise de pagamentos, auditoria demonstrativos"
        />

        {/* Open Graph para compartilhamento */}
        <meta property="og:title" content="Gestão de Demonstrativos | MedCheck" />
        <meta
          property="og:description"
          content="Central de análise e gerenciamento de demonstrativos de pagamento médico"
        />
        <meta property="og:type" content="website" />

        {/* Schema.org para SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'MedCheck Demonstrativos',
            description: 'Sistema de gestão e análise de demonstrativos médicos',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

      <AuthenticatedLayout
        title="Gestão de Demonstrativos"
        description="Central de análise e gerenciamento de demonstrativos de pagamento"
      >
        <PageHeader
          title="Gestão de Demonstrativos"
          icon={<FileBarChart size={28} />}
          description="Central de análise financeira e auditoria de demonstrativos"
          actions={
            userProfile ? (
              <UserMenu
                name={userProfile.name || 'Usuário'}
                email={userProfile.email || 'sem-email@exemplo.com'}
                specialty={userProfile.crm || ''}
                avatarUrl={userProfile.avatarUrl || undefined}
                onLogout={signOut}
              />
            ) : null
          }
        />
        <div className="space-y-6">
          {/* Painel de Insights Clínico-Financeiros - Global */}
          <section aria-label="Painel de Insights Clínico-Financeiros" className="mb-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-2">
              <InfoCard
                icon={<ArrowUpRight className="h-6 w-6" />}
                title={<span className="text-xs font-semibold">Total Liberado</span>}
                value={
                  <span className="text-2xl md:text-3xl font-bold">
                    {formatCurrency(summaryStats.totalProcessado)}
                  </span>
                }
                description={
                  <span className="text-xs">
                    Valor efetivamente liberado pelos convênios
                  </span>
                }
                variant="success"
              />
              <InfoCard
                icon={<AlertCircle className="h-6 w-6" />}
                title={<span className="text-xs font-semibold">Total Glosado</span>}
                value={
                  <span className="text-2xl md:text-3xl font-bold">
                    {formatCurrency(summaryStats.totalGlosa)}
                  </span>
                }
                description={
                  <span className="text-xs">Valor total glosado pelos convênios</span>
                }
                variant="danger"
              />
              <InfoCard
                icon={<FileText className="h-6 w-6" />}
                title={<span className="text-xs font-semibold">Procedimentos</span>}
                value={
                  <span className="text-2xl md:text-3xl font-bold">
                    {summaryStats.totalProcedimentos}
                  </span>
                }
                description={
                  <span className="text-xs">Total de procedimentos processados</span>
                }
                variant="info"
              />
              <InfoCard
                icon={<ClipboardList className="h-6 w-6" />}
                title={<span className="text-xs font-semibold">Demonstrativos</span>}
                value={
                  <span className="text-2xl md:text-3xl font-bold">
                    {demonstratives.length}
                  </span>
                }
                description={
                  <span className="text-xs">
                    {summaryStats.demonstrativosComGlosa} com glosas,{' '}
                    {summaryStats.demonstrativosSemGlosa} sem glosas
                  </span>
                }
                variant="neutral"
              />
            </div>
          </section>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              {/* Filtros e Ações */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <CardTitle className="text-lg">Filtros e Ações</CardTitle>
                    {(searchTerm ||
                      selectedPeriod !== 'all' ||
                      selectedStatus !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="ml-auto h-8 px-3"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Buscar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Período ou arquivo..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Período</label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os períodos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os períodos</SelectItem>
                          <SelectItem value="30d">Últimos 30 dias</SelectItem>
                          <SelectItem value="90d">Últimos 90 dias</SelectItem>
                          <SelectItem value="6m">Últimos 6 meses</SelectItem>
                          <SelectItem value="1y">Último ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="liberado">Liberado integral</SelectItem>
                          <SelectItem value="glosado">Com glosas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Eficiência</label>
                      <div className="flex gap-1">
                        <Button
                          variant={selectedStatus === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedStatus('all')}
                          className="flex-1 text-xs"
                        >
                          Todos ({demonstratives.length})
                        </Button>
                        <Button
                          variant={
                            selectedStatus === 'liberado' ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => setSelectedStatus('liberado')}
                          className="flex-1 text-xs text-green-600"
                        >
                          100% ({summaryStats.demonstrativosSemGlosa})
                        </Button>
                        <Button
                          variant={selectedStatus === 'glosado' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedStatus('glosado')}
                          className="flex-1 text-xs text-red-600"
                        >
                          Glosas ({summaryStats.demonstrativosComGlosa})
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleExportCSV}
                      disabled={!filteredDemonstratives.length}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar CSV
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleExportProcedures}
                      disabled={!filteredDemonstratives.length}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar Procedimentos
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveTab('upload')}
                      className="flex items-center gap-2 ml-auto"
                    >
                      <Plus className="h-4 w-4" />
                      Novo Demonstrativo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Demonstrativos */}
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Demonstrativos</CardTitle>
                  <CardDescription>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando demonstrativos...
                      </span>
                    ) : (
                      `${filteredDemonstratives.length} ${
                        filteredDemonstratives.length === 1
                          ? 'demonstrativo encontrado'
                          : 'demonstrativos encontrados'
                      }`
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataGrid
                    rows={filteredDemonstratives}
                    columns={demonstrativesColumns.map((col) => {
                      // Adiciona tooltip nos headers técnicos
                      if (['Liberado', 'Glosa', 'Delta R$'].includes(col.headerName)) {
                        return {
                          ...col,
                          headerName: col.headerName,
                          headerTooltip:
                            col.headerName === 'Liberado'
                              ? 'Valor efetivamente liberado pelo convênio.'
                              : col.headerName === 'Glosa'
                                ? 'Valor glosado pelo convênio.'
                                : 'Diferença entre liberado e apresentado.',
                        };
                      }
                      return col;
                    })}
                    pageSize={10}
                    className="min-h-[400px] mb-0"
                    loading={loading}
                    paginationLabel="Demonstrativos por página:"
                    emptyMessage={
                      searchTerm || selectedPeriod !== 'all' || selectedStatus !== 'all'
                        ? 'Nenhum demonstrativo encontrado com os filtros aplicados'
                        : 'Nenhum demonstrativo encontrado'
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload de Demonstrativos</CardTitle>
                  <CardDescription>
                    Faça upload de novos demonstrativos para processamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileDropZone
                    onDropFiles={handleFileDrop}
                    type="demonstrativo"
                    disabled={isUploading}
                  />
                  <FileList
                    files={files}
                    onRemove={removeFile}
                    disabled={isUploading}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleUploadDemonstrativos}
                      disabled={isUploading || !files.length}
                      size="sm"
                      variant="primary"
                      className="h-9 px-5 font-semibold flex items-center bg-surface-2 border border-border text-foreground hover:bg-surface-3 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Processando...' : 'Processar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default DemonstrativesPage;
