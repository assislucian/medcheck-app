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
  Trash2
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

const proceduresColumns = [
  { field: 'guia', headerName: 'Guia', minWidth: 90, flex: 0 },
  { field: 'data', headerName: 'Data', minWidth: 90, flex: 0 },
  { field: 'paciente', headerName: 'Paciente', minWidth: 140, flex: 1 },
  { field: 'codigo', headerName: 'Código', minWidth: 90, flex: 0 },
  { field: 'descricao', headerName: 'Descrição', minWidth: 160, flex: 2 },
  { field: 'participacao', headerName: 'Participação', minWidth: 120, flex: 0 },
  { field: 'quantidade', headerName: 'Qtd', minWidth: 60, flex: 0 },
  {
    field: 'cbhpm',
    headerName: 'CBHPM',
    minWidth: 110, flex: 0,
    valueGetter: (params) => {
      const proc = findProcedureByCodigo(params.row.codigo);
      return proc ? calculateTotalCBHPM(proc, params.row.participacao) : null;
    },
    valueFormatter: (params) => params.value !== null ? formatCurrency(params.value) : '--'
  },
  {
    field: 'liberado',
    headerName: 'Liberado',
    minWidth: 110, flex: 0,
    valueGetter: (params) => params.row.financial?.approved_value ?? params.row.liberado,
    valueFormatter: (params) => formatCurrency(params.value)
  },
  {
    field: 'diferenca',
    headerName: 'Diferença',
    minWidth: 110, flex: 0,
    valueGetter: (params) => {
      const proc = findProcedureByCodigo(params.row.codigo);
      const cbhpm = proc ? calculateTotalCBHPM(proc, params.row.participacao) : null;
      const liberado = Number(params.row.financial?.approved_value ?? params.row.liberado) || 0;
      return cbhpm !== null ? liberado - cbhpm : null;
    },
    renderCell: ({ value }) => (
      value !== null ? (
        <span className={value < 0 ? "text-red-600 font-medium" : ""}>{formatCurrency(value)}</span>
      ) : '--'
    )
  },
  {
    field: 'apresentado',
    headerName: 'Apresentado',
    minWidth: 110, flex: 0,
    valueGetter: (params) => params.row.financial?.presented_value ?? params.row.apresentado,
    valueFormatter: (params) => formatCurrency(params.value)
  },
  {
    field: 'glosa',
    headerName: 'Glosa',
    minWidth: 110, flex: 0,
    valueGetter: (params) => params.row.financial?.glosa ?? params.row.glosa,
    renderCell: ({ value }) => (
      <span className={value > 0 ? "text-red-600 font-medium" : ""}>
        {formatCurrency(value)}
      </span>
    )
  }
];

const DemonstrativeDetailDialog = ({ demonstrative }) => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGlosas, setShowGlosas] = useState(false);

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
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/demonstrativos/${demonstrative.id}/procedimentos`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        // Mapear campos para nomes esperados
        const mapped = (res.data || []).map((p, idx) => ({
          id: idx,
          guia: p.guia ?? p.guide ?? '',
          data: p.data ?? p.date ?? '',
          paciente: p.paciente ?? p.patient ?? '',
          codigo: p.codigo ?? p.code ?? '',
          descricao: p.descricao ?? p.description ?? '',
          participacao: p.papel ?? p.role ?? p.funcao ?? '',
          quantidade: p.quantidade ?? p.quantity ?? 1,
          apresentado: p.financial?.presented_value ?? p.apresentado ?? 0,
          liberado: p.financial?.approved_value ?? p.liberado ?? 0,
          glosa: p.financial?.glosa ?? p.glosa ?? 0,
          financial: p.financial ?? undefined
        }));
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
    const cbhpm = proc ? calculateTotalCBHPM(proc, p.participacao) : null;
    const liberado = Number(p.financial?.approved_value ?? p.liberado) || 0;
    return {
      codigo: p.codigo,
      descricao: p.descricao,
      cbhpm,
      liberado,
      diferenca: cbhpm !== null ? liberado - cbhpm : null
    };
  });
  const totalAbaixoCBHPM = cbhpmComparisons.reduce((sum, c) => sum + (c.diferenca !== null && c.diferenca < 0 ? c.diferenca : 0), 0);
  const qtdAbaixoCBHPM = cbhpmComparisons.filter(c => c.diferenca !== null && c.diferenca < 0).length;
  const percentAbaixoCBHPM = procedures.length > 0 ? Math.round((qtdAbaixoCBHPM / procedures.length) * 100) : 0;
  const maiorPrejuizo = cbhpmComparisons.reduce((min, c) => (c.diferenca !== null && c.diferenca < min ? c.diferenca : min), 0);
  const maiorPrejuizoProc = cbhpmComparisons.find(c => c.diferenca === maiorPrejuizo);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>Detalhes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl md:min-w-[1100px] p-4">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold mb-2 tracking-tight">Demonstrativo - {demonstrative.periodo}</DialogTitle>
          <DialogDescription className="mb-6 text-lg text-gray-500">
            Detalhes do demonstrativo de pagamento, incluindo totais, procedimentos e insights comparativos com a CBHPM.
          </DialogDescription>
        </DialogHeader>
        {/* Insights CBHPM - cards pequenos */}
        <div className="w-full flex flex-col gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="shadow border-0 bg-white rounded-xl flex flex-row items-center px-4 py-3 min-h-[70px]">
              <div className="rounded-lg bg-red-50 p-2 mr-3 flex items-center justify-center"><DollarSign className="h-6 w-6 text-red-400" /></div>
              <div>
                <div className="text-xs text-gray-400 font-medium mb-0.5">Total abaixo da CBHPM</div>
                <div className="text-lg font-bold text-red-500">{formatCurrency(Math.abs(totalAbaixoCBHPM))}</div>
              </div>
            </Card>
            <Card className="shadow border-0 bg-white rounded-xl flex flex-row items-center px-4 py-3 min-h-[70px]">
              <div className="rounded-lg bg-yellow-50 p-2 mr-3 flex items-center justify-center"><FileBarChart className="h-6 w-6 text-yellow-400" /></div>
              <div>
                <div className="text-xs text-gray-400 font-medium mb-0.5">% abaixo da tabela</div>
                <div className="text-lg font-bold text-yellow-500">{percentAbaixoCBHPM}%</div>
              </div>
            </Card>
            <Card className="shadow border-0 bg-white rounded-xl flex flex-row items-center px-4 py-3 min-h-[70px]">
              <div className="rounded-lg bg-blue-50 p-2 mr-3 flex items-center justify-center"><Download className="h-6 w-6 text-blue-400" /></div>
              <div>
                <div className="text-xs text-gray-400 font-medium mb-0.5">Maior diferença individual</div>
                <div className="text-lg font-bold text-blue-500">{maiorPrejuizoProc && maiorPrejuizoProc.diferenca !== null ? formatCurrency(Math.abs(maiorPrejuizoProc.diferenca)) : '--'}</div>
                {maiorPrejuizoProc && (
                  <div className="text-xs text-blue-800 mt-0.5 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">{maiorPrejuizoProc.codigo} - {maiorPrejuizoProc.descricao}</div>
                )}
              </div>
            </Card>
          </div>
        </div>
        {/* Totais - cards pequenos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow border-0 bg-gray-50 rounded-xl">
            <CardContent className="py-3 flex flex-col items-center">
              <Calendar className="h-6 w-6 text-blue-400 mb-1" />
              <div className="text-xs text-gray-400 font-medium">Período</div>
              <div className="font-bold text-base text-blue-900">{demonstrative.periodo}</div>
            </CardContent>
          </Card>
          <Card className="shadow border-0 bg-gray-50 rounded-xl">
            <CardContent className="py-3 flex flex-col items-center">
              <DollarSign className="h-6 w-6 text-green-400 mb-1" />
              <div className="text-xs text-gray-400 font-medium">Total Liberado</div>
              <div className="font-bold text-base text-green-900">{formatCurrency(totals.totalLiberado)}</div>
            </CardContent>
          </Card>
          <Card className="shadow border-0 bg-gray-50 rounded-xl">
            <CardContent className="py-3 flex flex-col items-center">
              <FileBarChart className="h-6 w-6 text-blue-400 mb-1" />
              <div className="text-xs text-gray-400 font-medium">Procedimentos</div>
              <div className="font-bold text-base text-blue-900">{totals.totalProcedimentos}</div>
            </CardContent>
          </Card>
          <Card className="shadow border-0 bg-gray-50 rounded-xl">
            <CardContent className="py-3 flex flex-col items-center">
              <DollarSign className="h-6 w-6 text-red-400 mb-1" />
              <div className="text-xs text-gray-400 font-medium">Total Glosa</div>
              <div className="font-bold text-base text-red-900">{formatCurrency(totals.totalGlosa)}</div>
            </CardContent>
          </Card>
        </div>
        {/* Tabela de procedimentos - estilo lovable.dev */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-4">Detalhamento de Procedimentos</h3>
          <div className="bg-white rounded-2xl shadow-inner border border-gray-100 p-2 overflow-x-auto" style={{ maxHeight: 420, overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Carregando procedimentos...</div>
            ) : procedures.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Nenhum procedimento encontrado para este demonstrativo.</div>
            ) : (
              <DataGrid
                rows={procedures.map((p, idx) => ({ id: idx, ...p }))}
                columns={proceduresColumns}
                pageSize={procedures.length}
                hideFooterPagination
                className="min-h-[320px] text-lg"
                autoHeight={false}
                sx={{
                  '& .MuiDataGrid-columnHeaders': { position: 'sticky', top: 0, background: '#fff', zIndex: 1, fontWeight: 700, fontSize: '1.1rem', color: '#222' },
                  '& .MuiDataGrid-cell': { fontSize: '1.05rem', padding: '16px 10px', color: '#222' },
                  '& .MuiDataGrid-row': { minHeight: '54px' },
                  '& .MuiDataGrid-footerContainer': { display: 'none' },
                  '& .MuiDataGrid-columnSeparator': { display: 'none' },
                  '& .MuiDataGrid-virtualScroller': { background: 'transparent' },
                }}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
          <Button variant="outline" className="mr-2" onClick={handleExportPDF} disabled={procedures.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={() => setShowGlosas(true)} disabled={glosas.length === 0}>
            <ChevronRight className="h-4 w-4 mr-2" />
            Analisar Glosas
          </Button>
        </div>
        {showGlosas && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Procedimentos com Glosa</h4>
            <div className="bg-white rounded-lg shadow-inner border border-gray-100 p-2" style={{ maxHeight: 300, overflowY: 'auto' }}>
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
              <Button variant="secondary" onClick={() => setShowGlosas(false)}>Fechar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const DemonstrativesPage = () => {
  const [demonstratives, setDemonstratives] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("list");
  const [deleting, setDeleting] = useState(false);
  
  const fileUpload = useFileUpload();
  const {
    files,
    isUploading,
    removeFile,
    resetFiles,
    handleFileChangeByType,
    processUploadedFiles
  } = fileUpload;

  useEffect(() => {
    fetchDemonstratives();
  }, []);

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

  function parseBRL(str) {
    if (!str) return 0;
    let cleaned = String(str).replace('R$', '').replace(/\s/g, '');
    // Remove todos os pontos (milhar)
    cleaned = cleaned.replace(/\./g, '');
    // Se houver mais de uma vírgula, remove todas menos a última (milhar)
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      cleaned = parts.slice(0, -1).join('') + ',' + parts[parts.length - 1];
    }
    // Troca a última vírgula por ponto (decimal)
    const lastComma = cleaned.lastIndexOf(',');
    if (lastComma !== -1) {
      cleaned = cleaned.substring(0, lastComma) + '.' + cleaned.substring(lastComma + 1);
    }
    return Number(cleaned) || 0;
  }

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
      field: 'actions', 
      headerName: 'Ações', 
      width: 180,
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <DemonstrativeDetailDialog demonstrative={row} />
          <Button variant="destructive" size="sm" onClick={() => handleDeleteDemonstrativo(row.id)} title="Excluir demonstrativo">
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
      <PageHeader title="Demonstrativos" icon={<FileBarChart size={24} />} />
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <span className="text-3xl text-green-600">$</span>
              <div className="text-muted-foreground">Total Liberado</div>
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalProcessado)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <span className="text-3xl text-red-600">$</span>
              <div className="text-muted-foreground">Total Glosas</div>
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalGlosa)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <span className="text-3xl text-blue-600">📄</span>
              <div className="text-muted-foreground">Procedimentos</div>
              <div className="text-2xl font-bold">{summaryStats.totalProcedimentos}</div>
            </CardContent>
          </Card>
        </div>

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
                  columns={demonstrativesColumns}
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
