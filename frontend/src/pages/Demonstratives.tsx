import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { DataGrid } from "../components/ui/data-grid";
import { Button } from "../components/ui/button";
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
  ClipboardList
} from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import FileDropZone from "../components/upload/FileDropZone";
import { useFileUpload } from "../hooks/useFileUpload";
import { FileType } from "../types/upload";
import FileList from "../components/upload/FileList";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import axios from "axios";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { findProcedureByCodigo, calculateTotalCBHPM } from "../data/cbhpmData";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../contexts/auth/AuthContext";
import { UserMenu } from "../components/navbar/UserMenu";
import InfoCard from "../components/ui/InfoCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { useNavigate } from 'react-router-dom';

const mockDetailedProcedures = [
  {
    id: "p1",
    guia: "10467538",
    data: "19/08/2024",
    carteira: "00620040000604690",
    paciente: "THAYSE BORGES",
    codigo: "30602246",
    descricao: "Reconstrução Mamária Com Retalhos Cutâneos Regionais",
    quantidade: 1,
    apresentado: 457.64,
    liberado: 457.64,
    glosa: 0.00
  },
  {
    id: "p2",
    guia: "10467538",
    data: "19/08/2024",
    carteira: "00620040000604690",
    paciente: "THAYSE BORGES",
    codigo: "30602203",
    descricao: "Quadrantectomia Ressecção Segmentar",
    quantidade: 1,
    apresentado: 156.57,
    liberado: 156.57,
    glosa: 0.00
  },
  {
    id: "p3",
    guia: "10714706",
    data: "05/09/2024",
    carteira: "00620030013924381",
    paciente: "NUBIA KATIA PEREIRA",
    codigo: "30602289",
    descricao: "Ressecção Do Linfonodo Sentinela Torácica Lateral",
    quantidade: 1,
    apresentado: 167.68,
    liberado: 0.00,
    glosa: 167.68
  }
];

const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

function normalizePapel(papel) {
  return String(papel || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
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
  const norm = String(papel || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
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
  let cleaned = String(val).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
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
    valueFormatter: (params: any) => formatCurrency(params.value) 
  },
  { 
    field: 'liberado', 
    headerName: 'Liberado', 
    width: 120,
    valueFormatter: (params: any) => formatCurrency(params.value) 
  },
  { 
    field: 'glosa', 
    headerName: 'Glosa', 
    width: 120,
    renderCell: ({ value }) => (
      <Badge variant={value > 0 ? 'danger' : 'neutral'} className="whitespace-nowrap px-3 py-1">
        {formatCurrency(value)}
      </Badge>
    )
  },
  {
    field: 'cbhpm',
    headerName: 'CBHPM',
    minWidth: 110, flex: 0,
    valueGetter: (params) => params.row.cbhpm,
    valueFormatter: (params) => params.value && params.value > 0 ? formatCurrency(params.value) : '--',
    renderCell: ({ value }) => (value && value > 0 ? <span>{formatCurrency(value)}</span> : <span>--</span>)
  },
  {
    field: 'diferenca',
    headerName: 'Diferença',
    minWidth: 110, flex: 0,
    valueGetter: (params) => (params.row.cbhpm && params.row.cbhpm > 0) ? params.row.liberado - params.row.cbhpm : null,
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
        <Badge variant={variant} className="whitespace-nowrap px-3 py-1 font-semibold flex items-center gap-1">
          {formatCurrency(value)}
          {Icon}
        </Badge>
      );
    }
  },
  {
    field: 'delta_percent',
    headerName: 'Delta %',
    minWidth: 90, flex: 0,
    description: 'Percentual da diferença entre liberado e CBHPM',
    valueGetter: (params) => (params.row.cbhpm && params.row.cbhpm > 0) ? ((params.row.liberado - params.row.cbhpm) / params.row.cbhpm) * 100 : null,
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
    }
  },
  {
    field: 'acao',
    headerName: 'Ação',
    minWidth: 80,
    flex: 0,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const participacao = String(params.row.participacao || '').trim().toLowerCase();
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
        >
          <Upload className="h-4 w-4 mr-1" />
          Enviar Guia
        </Button>
      );
    }
  }
];

const DemonstrativeDetailDialog = ({ demonstrative }) => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGlosas, setShowGlosas] = useState(false);
  const [showOnlyPendentes, setShowOnlyPendentes] = useState(false);
  const navigate = useNavigate();

  // Totais calculados a partir dos procedimentos
  const totals = procedures.reduce((acc, p) => {
    const apresentado = Number(p.financial?.presented_value ?? p.apresentado) || 0;
    const liberado = Number(p.financial?.approved_value ?? p.liberado) || 0;
    const glosa = Number(p.financial?.glosa ?? p.glosa) || 0;
    acc.totalLiberado += liberado;
    acc.totalGlosa += glosa;
    acc.totalApresentado += apresentado;
    acc.totalProcedimentos += 1;
    return acc;
  }, { totalLiberado: 0, totalGlosa: 0, totalApresentado: 0, totalProcedimentos: 0 });

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/demonstrativos/${demonstrative.id}/detalhes`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        // Mapear campos para nomes esperados, incluindo papel
        const mapped = (res.data || []).map((p, idx) => {
          let participacao = '';
          if (typeof p.papel === 'string') {
            participacao = p.papel;
          } else if (p.participacao) {
            participacao = p.participacao;
          } else if (p.participacoes) {
            participacao = Array.isArray(p.participacoes) ? p.participacoes.join('; ') : p.participacoes;
          }
          // Se não houver participação, marcar como 'Upload guia'
          if (!participacao || participacao === '--') {
            participacao = 'Upload guia';
          }
          // Cálculo dos campos
          const cbhpm = typeof p.cbhpm === 'string' ? parseBRL(cleanBRL(p.cbhpm)) : (p.cbhpm ?? 0);
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
            financial: p.financial ?? undefined
          };
        });
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
      head: [[
        'Guia', 'Data', 'Paciente', 'Código', 'Descrição', 'Qtd', 'Apresentado', 'Liberado', 'Glosa'
      ]],
      body: procedures.map(p => [
        p.guia, p.date || p.data, p.patient || p.paciente, p.code || p.codigo, p.description || p.descricao, p.quantity || p.qtd, p.financial?.presented_value ?? p.apresentado, p.financial?.approved_value ?? p.liberado, p.financial?.glosa ?? p.glosa
      ])
    });
    doc.save(`demonstrativo_${demonstrative.periodo || ''}.pdf`);
  };

  const glosas = procedures.filter(p => (Number(p.financial?.glosa ?? p.glosa) || 0) > 0);

  // Insights CBHPM
  const cbhpmComparisons = procedures.map(p => {
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
      participacao: p.participacao // garantir campo
    };
  });
  // DEBUG: logar cada item de cbhpmComparisons com motivo
  cbhpmComparisons.forEach((c, i) => {
    const cbhpmNum = parseBRLToNumber(c.cbhpm);
    const isPend = !c.participacao || String(c.participacao).trim().toLowerCase() === 'upload guia';
    const entrou = (
      typeof cbhpmNum === 'number' &&
      cbhpmNum > 0 &&
      typeof c.diferenca === 'number' &&
      c.diferenca < 0 &&
      !isPend
    );
    console.log(`[DEBUG] Item ${i}:`, {
      codigo: c.codigo,
      cbhpm: c.cbhpm,
      cbhpmNum,
      liberado: c.liberado,
      diferenca: c.diferenca,
      participacao: c.participacao,
      entrou,
      motivo: entrou ? 'OK' : isPend ? 'PENDENTE' : cbhpmNum <= 0 ? 'CBHPM <= 0' : c.diferenca === null ? 'DIFERENCA NULL' : c.diferenca >= 0 ? 'DIFERENCA >= 0' : 'OUTRO'
    });
  });
  // Filtro para procedimentos válidos (CBHPM > 0 e participação válida)
  const procedimentosValidos = cbhpmComparisons.filter(c => {
    const cbhpmNum = parseBRLToNumber(c.cbhpm);
    const isPend = !c.participacao || String(c.participacao).trim().toLowerCase() === 'upload guia';
    return (
      typeof cbhpmNum === 'number' &&
      cbhpmNum > 0 &&
      !isPend
    );
  });
  // Filtro para procedimentos abaixo da CBHPM
  const abaixoCBHPM = procedimentosValidos.filter(c => typeof c.diferenca === 'number' && c.diferenca < 0);
  const hasCBHPM = abaixoCBHPM.length > 0;
  const totalAbaixoCBHPM = hasCBHPM
    ? abaixoCBHPM.reduce((sum, c) => sum + c.diferenca, 0)
    : null;
  // % abaixo da tabela (corrigido)
  const percentAbaixoCBHPM = procedimentosValidos.length > 0 ? Math.round((abaixoCBHPM.length / procedimentosValidos.length) * 100) : 0;
  // Maior diferença individual (corrigido)
  const maiorPrejuizo = abaixoCBHPM.reduce((min, c) => (c.diferenca !== null && c.diferenca < min ? c.diferenca : min), 0);
  const maiorPrejuizoProc = abaixoCBHPM.find(c => c.diferenca === maiorPrejuizo);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>Detalhes</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl w-full sm:min-w-[320px] md:min-w-[600px] lg:min-w-[800px] xl:min-w-[1000px] p-0 max-h-[90vh] h-[90vh] overflow-visible shadow-2xl bg-body dark:bg-body demonstrativo-dialog-content"
        style={{ boxSizing: 'border-box', maxWidth: '95vw' }}
      >
        <div className="flex flex-col h-full min-h-0 gap-2 text-[0.95rem] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-extrabold mb-1 tracking-tight">Demonstrativo - {demonstrative.periodo}</DialogTitle>
            <DialogDescription className="mb-2 text-base md:text-lg text-gray-500">
              Detalhes do demonstrativo de pagamento, incluindo totais, procedimentos e insights comparativos com a CBHPM.
            </DialogDescription>
          </DialogHeader>
          {/* Insights CBHPM - cards pequenos (PADRÃO GUIAS) */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-2">
            <InfoCard
              icon={<AlertCircle className="h-6 w-6" />}
              title={<span className="text-xs font-semibold">Total Abaixo CBHPM</span>}
              value={hasCBHPM
                ? <span className="text-2xl md:text-3xl font-bold">{formatCurrency(Math.abs(totalAbaixoCBHPM))}</span>
                : <span className="text-2xl md:text-3xl font-bold text-gray-400">—</span>
              }
              description={hasCBHPM
                ? <span className="text-xs">Soma do valor pago abaixo da CBHPM</span>
                : <span className="text-xs text-gray-400">Sem procedimentos com CBHPM neste demonstrativo</span>
              }
              variant={hasCBHPM ? "danger" : "neutral"}
            />
            <InfoCard
              icon={<ClipboardList className="h-6 w-6" />}
              title={<span className="text-xs font-semibold">% abaixo da tabela</span>}
              value={<span className="text-2xl md:text-3xl font-bold">{`${percentAbaixoCBHPM}%`}</span>}
              description={<span className="text-xs">% de procedimentos abaixo da CBHPM</span>}
              variant="warning"
            />
            <InfoCard
              icon={<FileText className="h-6 w-6" />}
              title={<span className="text-xs font-semibold">Maior diferença individual</span>}
              value={<span className="text-2xl md:text-3xl font-bold">{maiorPrejuizoProc && maiorPrejuizoProc.diferenca !== null ? formatCurrency(Math.abs(maiorPrejuizoProc.diferenca)) : '--'}</span>}
              description={<span className="text-xs">{maiorPrejuizoProc ? `${maiorPrejuizoProc.codigo} - ${maiorPrejuizoProc.descricao}` : ''}</span>}
              variant="info"
            />
          </div>
          {/* Totais - cards pequenos (PADRÃO GUIAS) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <InfoCard
              icon={<ArrowUpRight className="h-6 w-6 mb-1" />}
              title={<span className="text-xs font-semibold">Total Liberado</span>}
              value={<span className="text-2xl md:text-3xl font-bold">{formatCurrency(totals.totalLiberado)}</span>}
              variant="success"
              className="bg-surface-2 border-l-4 border-success"
            />
            <InfoCard
              icon={<FileText className="h-6 w-6 mb-1" />}
              title={<span className="text-xs font-semibold">Procedimentos</span>}
              value={<span className="text-2xl md:text-3xl font-bold">{totals.totalProcedimentos}</span>}
              variant="info"
            />
            <InfoCard
              icon={<AlertCircle className="h-6 w-6 mb-1" />}
              title={<span className="text-xs font-semibold">Total Glosa</span>}
              value={<span className="text-2xl md:text-3xl font-bold">{formatCurrency(totals.totalGlosa)}</span>}
              variant="danger"
            />
            <InfoCard
              icon={<DollarSign className="h-6 w-6 mb-1" />}
              title={<span className="text-xs font-semibold">Total Apresentado</span>}
              value={<span className="text-2xl md:text-3xl font-bold">{formatCurrency(totals.totalApresentado)}</span>}
              variant="neutral"
            />
          </div>
          {/* Filtro rápido acima da tabela de procedimentos detalhados */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 mb-3">
            <h3 className="text-lg md:text-xl font-bold mb-1">Detalhamento de Procedimentos</h3>
            <div className="flex flex-row flex-wrap gap-2 sm:gap-2 justify-end items-center">
              <Button
                size="sm"
                variant={showOnlyPendentes ? 'secondary' : 'outline'}
                className="h-9 px-4 font-medium bg-surface-2 border border-border text-foreground hover:bg-surface-3 transition-colors"
                onClick={() => {
                  setShowOnlyPendentes(v => {
                    const novo = !v;
                    toast.success(novo ? 'Mostrando apenas pendentes.' : 'Mostrando todos os procedimentos.');
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
                className="h-9 px-4 font-medium bg-surface-2 border border-border text-foreground hover:bg-surface-3 transition-colors ml-2"
                onClick={async () => {
                  await handleExportPDF();
                  toast.success('PDF exportado com sucesso.');
                }}
                title="Exportar demonstrativo detalhado em PDF"
              >
                <Download className="w-4 h-4 mr-2" /> Exportar PDF
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="h-9 px-5 font-semibold flex items-center bg-surface-2 border border-border text-foreground hover:bg-surface-3 transition-colors"
                onClick={() => setShowGlosas(true)}
                disabled={glosas.length === 0}
                aria-label="Analisar Glosas"
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Analisar Glosas
              </Button>
            </div>
          </div>
          {/* Tabela de procedimentos - estilo lovable.dev */}
          <div className="flex-grow min-h-0 flex flex-col gap-1">
            <div className="bg-body rounded-2xl shadow-inner border border-border p-1 flex-grow min-h-0 overflow-x-auto overflow-y-auto" style={{ maxHeight: '100%' }}>
              <div className="min-w-[700px]">
                {loading ? (
                  <div className="flex items-center justify-center min-h-[180px]">
                    <Loader2 className="animate-spin text-blue-500 w-8 h-8" aria-label="Carregando procedimentos..." />
                    <span className="ml-3 text-blue-600 font-medium">Carregando procedimentos...</span>
                  </div>
                ) : (
                  <DataGrid
                    rows={procedures
                      .map((p, idx) => ({ id: idx, ...p }))
                      .filter(row => !showOnlyPendentes || String(row.participacao || '').trim().toLowerCase() === 'upload guia')
                    }
                    columns={proceduresColumns}
                    pageSize={procedures.length}
                    hideFooterPagination
                    className="min-h-[200px] text-[0.92rem]"
                    autoHeight={false}
                    renderExpandedRow={undefined}
                  />
                )}
              </div>
            </div>
          </div>
          {showGlosas && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Procedimentos com Glosa</h4>
              <div className="bg-body rounded-lg shadow-inner border border-border p-2" style={{ maxHeight: 300, overflowY: 'auto' }}>
                {glosas.length === 0 ? (
                  <div className="text-muted-foreground">Nenhuma glosa encontrada neste demonstrativo.</div>
                ) : (
                  <DataGrid
                    rows={glosas.map((p, idx) => ({ id: idx, ...p }))}
                    columns={proceduresColumns}
                    pageSize={glosas.length}
                    hideFooterPagination
                    className="min-h-[200px]"
                    autoHeight={false}
                  />
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="secondary" size="sm" onClick={() => setShowGlosas(false)} className="h-9 px-4 font-medium bg-surface-2 border border-border text-foreground hover:bg-surface-3 transition-colors">Fechar</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DemonstrativesPage = () => {
  console.log('DEBUG: Renderizando DemonstrativesPage');
  const [demonstratives, setDemonstratives] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("list");
  const [deleting, setDeleting] = useState(false);
  const [pendingAudits, setPendingAudits] = useState(0);
  const [pendingAuditsLoading, setPendingAuditsLoading] = useState(false);
  const [pendingAuditsError, setPendingAuditsError] = useState<string | null>(null);
  
  const fileUpload = useFileUpload();
  const {
    files,
    isUploading,
    removeFile,
    resetFiles,
    handleFileChangeByType,
    processUploadedFiles
  } = fileUpload;

  const { userProfile, signOut } = useAuth();

  useEffect(() => {
    fetchDemonstratives();
  }, []);

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
              `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/demonstrativos/${d.id}/detalhes`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const detalhes = res.data;
            console.log('DEBUG detalhes demonstrativo', d.id, detalhes);
            const pendentes = detalhes.filter((p: any) => {
              // Replicar lógica do modal: se não houver papel/participacao/participacoes, é pendente
              let participacao = '';
              if (typeof p.papel === 'string') participacao = p.papel;
              else if (p.participacao) participacao = p.participacao;
              else if (p.participacoes) participacao = Array.isArray(p.participacoes) ? p.participacoes.join('; ') : p.participacoes;
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
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/demonstrativos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mapped = (res.data || []).map((d: any) => {
        console.log('DEBUG demonstrativo:', d);
        return {
          id: d.id,
          periodo: d.periodo || d.period || '',
          total_procedures: Number(d.total_procedures || d.totalProcedimentos || d.total_procedimentos || 0),
          total_presented: parseBRL(d.total_presented || d.apresentado),
          total_approved: parseBRL(d.total_approved || d.liberado),
          total_glosa: parseBRL(d.total_glosa || d.glosa),
          filename: d.filename,
          upload_time: d.upload_time
        };
      });
      setDemonstratives(mapped);
    } catch (err) {
      console.error('Erro ao carregar demonstrativos:', err);
      toast.error('Erro ao carregar demonstrativos');
      setDemonstratives([]);
    }
  };

  const handleDeleteDemonstrativo = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este demonstrativo?")) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/demonstrativos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const summaryStats = {
    totalProcessado: demonstratives.reduce((sum, d) => sum + (d.total_approved || 0), 0),
    totalGlosa: demonstratives.reduce((sum, d) => sum + (d.total_glosa || 0), 0),
    totalProcedimentos: demonstratives.reduce((sum, d) => sum + (d.total_procedures || 0), 0)
  };

  const demonstrativesColumns = [
    { field: 'periodo', headerName: 'Período', width: 150 },
    { field: 'total_procedures', headerName: 'Total Procedimentos', width: 170, renderCell: ({ value }) => (<span className="font-medium">{value}</span>) },
    { field: 'total_presented', headerName: 'Apresentado', width: 150, valueFormatter: (params) => formatCurrency(params.value) },
    { field: 'total_approved', headerName: 'Liberado', width: 150, valueFormatter: (params) => formatCurrency(params.value) },
    { field: 'total_glosa', headerName: 'Glosa', width: 150, valueFormatter: (params) => formatCurrency(params.value) },
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
        <span className={value < 0 ? "text-danger font-medium" : value > 0 ? "text-success font-medium" : "text-muted-foreground"}>
          {formatCurrency(value)}
        </span>
      )
    },
    { 
      field: 'actions', 
      headerName: 'Ações', 
      width: 180,
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <DemonstrativeDetailDialog demonstrative={row} />
          <Button variant="destructive" size="sm" className="ml-2 h-9 px-4 font-medium bg-surface-2 border border-border text-foreground hover:bg-surface-3 transition-colors" onClick={async () => {
            await handleDeleteDemonstrativo(row.id);
            toast.success('Demonstrativo excluído com sucesso');
          }} title="Excluir demonstrativo">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <AuthenticatedLayout
      title="Demonstrativos"
      description="Gerencie seus demonstrativos de pagamento"
    >
      <PageHeader
        title="Demonstrativos"
        icon={<FileBarChart size={28} />}
        actions={userProfile ? (
          <UserMenu
            name={userProfile.name || 'Usuário'}
            email={userProfile.email || 'sem-email@exemplo.com'}
            specialty={userProfile.crm || ''}
            avatarUrl={userProfile.avatarUrl || undefined}
            onLogout={signOut}
          />
        ) : null}
      />
      <div className="space-y-6">
        {/* Painel de Insights Clínico-Financeiros - Global */}
        <section aria-label="Painel de Insights Clínico-Financeiros" className="mb-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-2">
            <InfoCard
              icon={<ArrowUpRight className="h-6 w-6" />}
              title={<span className="text-xs font-semibold">Total Recebido</span>}
              value={<span className="text-2xl md:text-3xl font-bold">{formatCurrency(summaryStats.totalProcessado)}</span>}
              description={<span className="text-xs">Recebido nos últimos 30 dias</span>}
              variant="success"
            />
            <InfoCard
              icon={<AlertCircle className="h-6 w-6" />}
              title={<span className="text-xs font-semibold">Total Glosado</span>}
              value={<span className="text-2xl md:text-3xl font-bold">{formatCurrency(summaryStats.totalGlosa)}</span>}
              description={<span className="text-xs">Glosado nos últimos 30 dias</span>}
              variant="danger"
            />
            <InfoCard
              icon={<FileText className="h-6 w-6" />}
              title={<span className="text-xs font-semibold">Procedimentos</span>}
              value={<span className="text-2xl md:text-3xl font-bold">{summaryStats.totalProcedimentos}</span>}
              description={<span className="text-xs">Analisados nos últimos 30 dias</span>}
              variant="info"
            />
            <InfoCard
              icon={<ClipboardList className="h-6 w-6" />}
              title={<span className="text-xs font-semibold">Auditorias Pendentes</span>}
              value={<span className="text-2xl md:text-3xl font-bold">{pendingAudits}</span>}
              description={<span className="text-xs">Uploads aguardando revisão</span>}
              variant="warning"
            />
          </div>
        </section>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Demonstrativos</CardTitle>
                <CardDescription>
                  Lista de demonstrativos processados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataGrid
                  rows={demonstratives}
                  columns={demonstrativesColumns.map(col => {
                    // Adiciona tooltip nos headers técnicos
                    if (["Liberado", "Glosa", "Delta R$"].includes(col.headerName)) {
                      return {
                        ...col,
                        headerName: col.headerName,
                        headerTooltip: col.headerName === "Liberado" ? "Valor efetivamente liberado pelo convênio." : col.headerName === "Glosa" ? "Valor glosado pelo convênio." : "Diferença entre liberado e apresentado."
                      };
                    }
                    return col;
                  })}
                  pageSize={10}
                  className="min-h-[400px]"
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
  );
};

export default DemonstrativesPage;
