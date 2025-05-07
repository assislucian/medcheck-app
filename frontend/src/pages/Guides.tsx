import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { DataGrid } from "../components/ui/data-grid";
import { Button } from "../components/ui/button";
import { FileText, Upload, Eye, Trash2, HelpCircle, Users, UserCheck } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import FileDropZone from "../components/upload/FileDropZone";
import { useFileUpload } from "../hooks/useFileUpload";
import { FileType } from "../types/upload";
import FileList from "../components/upload/FileList";
import { toast } from "sonner";
import { getGuides, deleteGuide, uploadGuide, GuidesQueryParams } from "../services/guides";
import DetalhesGuia from "../components/guides/DetalhesGuia";
import { GuideProcedure } from "../types/medical";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";
import { Link } from "react-router-dom";
import LoaderTable from "../components/ui/LoaderTable";
import { cn } from "../lib/utils";
import { Card } from "../components/ui/card";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../contexts/auth/AuthContext";
import { UserMenu } from "../components/navbar/UserMenu";
import InfoCard from "../components/ui/InfoCard";
// import Fuse from 'fuse.js';

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
      nome: typeof user === 'object' && user && 'nome' in user ? (user as any).nome : ''
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
      'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action,
      details,
      ...extra
    })
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
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/1º|primeiro/, 'primeiro')
    .replace(/2º|segundo/, 'segundo')
    .replace(/auxiliar/, 'auxiliar')
    .replace(/cirurgiao/, 'cirurgiao')
    .replace(/anestesista/, 'anestesista')
    .replace(/[^a-z\s]/g, '') // remove caracteres especiais
    .trim();
}

const GuidesPage = () => {
  const [activeTab, setActiveTab] = useState<"list" | "upload">("list");
  const [extractedGuides, setExtractedGuides] = useState<GuideProcedure[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedGuia, setSelectedGuia] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activities, setActivities] = useState(getRecentActivities());

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

  // Carrega guias já salvas
  useEffect(() => {
    const fetchSavedGuias = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const params: GuidesQueryParams = { page, pageSize, search, status, data };
        const res = await getGuides(token, params);
        setExtractedGuides(Array.isArray(res.procedures) ? res.procedures : []);
        setTotal(res.total || 0);
      } catch (err: any) {
        toast.error("Erro ao carregar guias", { description: err?.response?.data?.detail || err?.message });
        setExtractedGuides([]);
        setTotal(0);
      }
    };
    fetchSavedGuias();
  }, [page, pageSize, search, status, data]);

  // Upload/processamento
  const handleUploadGuias = async () => {
    if (files.length === 0) {
      toast.error("Nenhum arquivo selecionado");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const guiaFile = files.find((f) => f.type === "guia");
      if (!guiaFile) throw new Error("Nenhum arquivo de guia válido");
      
      // Faz o upload da guia
      const uploadResult = await uploadGuide(guiaFile.file, token);
      toast.success("Guias processadas com sucesso");
      
      // Recarrega os dados do servidor para ter a lista completa e atualizada
      const params: GuidesQueryParams = { page, pageSize, search, status, data };
      const res = await getGuides(token, params);
      setExtractedGuides(Array.isArray(res.procedures) ? res.procedures : []);
      setTotal(res.total || 0);
      
      resetFiles();
      setActiveTab("list");
      
      // Registra atividade
      const uniqueGuias = new Set(uploadResult.map((p: any) => p.numero_guia));
      logActivity("Upload de Guias", `Processada(s) ${uniqueGuias.size} guia(s) com ${uploadResult.length} procedimento(s)`, {
        target: { numero_guia: Array.from(uniqueGuias) },
        result: `${uploadResult.length} procedimentos processados`
      });
      setActivities(getRecentActivities());
    } catch (err: any) {
      toast.error("Erro ao processar os arquivos", { description: err?.response?.data?.detail || err?.message });
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
    const datas = procs.map((p) => p.data).sort();
    const dataMaisRecente = datas[datas.length - 1] || "";
    const beneficiario = procs[0]?.beneficiario || "";
    const prestador = procs[0]?.prestador || "";

    // Soma o campo qtd
    const qtdProcedimentos = procs.reduce((sum, p) => sum + (p.qtd || 0), 0);

    // Status mais comum
    const statusCount = procs.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const statusComum =
      Object.entries(statusCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    return {
      numero_guia,
      data: dataMaisRecente,
      beneficiario,
      prestador,
      qtdProcedimentos,
      status: statusComum,
      detalhes: procs,
    };
  });

  // Substitua filteredMacroRows por lógica de busca global
  const lowerSearch = search.trim().toLowerCase();
  const filteredMacroRows = lowerSearch
    ? macroRows.filter(row => {
        const campos = [
          row.numero_guia,
          row.data,
          row.beneficiario,
          row.prestador,
          String(row.qtdProcedimentos),
          row.status,
          ...(row.detalhes?.flatMap((p: any) => [p.codigo, p.descricao, p.papel]) || [])
        ].join(' ').toLowerCase();
        return campos.includes(lowerSearch);
      })
    : macroRows;

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
    if (!window.confirm(`Deseja remover ${selectedRows.length} guias selecionadas?`)) return;
    try {
      const token = localStorage.getItem("token") || "";
      await Promise.all(selectedRows.map((numeroGuia) => deleteGuide(numeroGuia, token)));
      
      // Recarrega os dados do servidor para ter a lista atualizada
      const params: GuidesQueryParams = { page, pageSize, search, status, data };
      const res = await getGuides(token, params);
      setExtractedGuides(Array.isArray(res.procedures) ? res.procedures : []);
      setTotal(res.total || 0);
      
      setSelectedRows([]);
      toast.success("Guias removidas!");
      logActivity("Remoção de Guias", `Removidas ${selectedRows.length} guias`, { target: { numero_guia: selectedRows } });
      setActivities(getRecentActivities());
    } catch (err: any) {
      toast.error("Erro ao remover guias", {
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const macroColumns = [
    {
      field: "select",
      headerName: "",
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
      field: "expand",
      headerName: "",
      width: 40,
      renderCell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpandedRow(expandedRow === row.numero_guia ? null : row.numero_guia)}
          aria-label={expandedRow === row.numero_guia ? "Colapsar detalhes" : "Expandir detalhes"}
        >
          {expandedRow === row.numero_guia ? <Eye className="w-4 h-4 text-primary" /> : <Eye className="w-4 h-4" />}
        </Button>
      ),
    },
    { field: "numero_guia", headerName: "Nº Guia", width: 120 },
    { field: "data", headerName: "Data de Execução", width: 140 },
    { field: "beneficiario", headerName: "Beneficiário", width: 200 },
    { field: "qtdProcedimentos", headerName: "Qtd Procedimentos", width: 140 },
    { field: "status", headerName: "Status", width: 120, renderCell: ({ value }: { value: string }) => {
      const variant =
        value === "Fechada"
          ? "success"
          : value === "Pendente"
          ? "warning"
          : "default";
      return <Badge variant={variant}>{value || "-"}</Badge>;
    }, },
  ];

  const handleDeleteGuia = async (numeroGuia: string) => {
    if (!window.confirm(`Deseja realmente remover a guia ${numeroGuia}?`)) {
      return;
    }
    try {
      const token = localStorage.getItem("token") || "";
      await deleteGuide(numeroGuia, token);
      
      // Recarrega os dados do servidor para ter a lista atualizada
      const params: GuidesQueryParams = { page, pageSize, search, status, data };
      const res = await getGuides(token, params);
      setExtractedGuides(Array.isArray(res.procedures) ? res.procedures : []);
      setTotal(res.total || 0);
      
      toast.success("Guia removida com sucesso");
      logActivity("Remoção de Guia", `Guia ${numeroGuia} removida`, { target: { numero_guia: numeroGuia } });
      setActivities(getRecentActivities());
    } catch (err: any) {
      toast.error("Erro ao remover guia", {
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
      'Status'
    ];
    const csvRows = [
      header.join(','),
      ...rows.map(row => [
        row.numero_guia,
        row.data,
        '"' + (row.beneficiario || '').replace(/"/g, '""') + '"',
        '"' + (row.prestador || '').replace(/"/g, '""') + '"',
        row.qtdProcedimentos,
        row.status
      ].join(','))
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `guias_medicas_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logActivity("Exportação de Guias", `Exportadas ${rows.length} guias para CSV`, { result: `${rows.length} guias exportadas` });
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
      'Prestador'
    ];
    const csvRows = [
      header.join(','),
      ...allProcedures.map(proc => [
        proc.numero_guia,
        proc.data,
        proc.codigo,
        '"' + (proc.descricao || '').replace(/"/g, '""') + '"',
        proc.papel,
        proc.qtd,
        proc.status,
        '"' + (proc.beneficiario || '').replace(/"/g, '""') + '"',
        '"' + (proc.prestador || '').replace(/"/g, '""') + '"',
      ].join(','))
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `procedimentos_guias_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logActivity("Exportação de Procedimentos", `Exportados ${allProcedures.length} procedimentos para CSV`, { result: `${allProcedures.length} procedimentos exportados` });
    setActivities(getRecentActivities());
  }

  // Cards de indicadores ajustados
  const totalGuias = filteredMacroRows.length;
  const totalProcedimentos = filteredMacroRows.reduce((sum, row) => sum + (row.detalhes?.reduce((s: number, p: any) => s + (p.qtd || 0), 0) || 0), 0);
  const papelCounts = filteredMacroRows.reduce((acc, row) => {
    row.detalhes?.forEach((p: any) => {
      acc[p.papel] = (acc[p.papel] || 0) + (p.qtd || 0);
    });
    return acc;
  }, {} as Record<string, number>);
  const papelMaisFrequente = Object.entries(papelCounts).sort((a, b) => b[1] - a[1])[0] || ["-", 0];

  // Mapeamento de cores para cada tipo de papel
  const papelColors: Record<string, { bg: string; text: string }> = {
    'cirurgiao':   { bg: 'rgba(59,130,246,0.18)', text: '#1e3a8a' }, // azul
    'anestesista': { bg: 'rgba(139,92,246,0.18)', text: '#6d28d9' }, // roxo
    'primeiro auxiliar': { bg: 'rgba(16,185,129,0.18)', text: '#065f46' }, // verde
    'segundo auxiliar': { bg: 'rgba(251,191,36,0.18)', text: '#92400e' }, // laranja
  };
  const defaultPapelColor = { bg: 'rgba(99,102,241,0.13)', text: '#3730a3' }; // fallback suave

  return (
    <AuthenticatedLayout title="Guias" description="Gerencie e consulte suas guias médicas processadas">
      <PageHeader
        title={
          <span className="flex items-center">
            Guias Médicas
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/help" className="ml-2 text-brand hover:underline flex items-center" aria-label="Central de Ajuda">
                    <HelpCircle className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Central de Ajuda: tutoriais, vídeos e perguntas frequentes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        }
        icon={<FileText size={28} />}
        description="Gerencie e consulte suas guias médicas processadas"
        size="md"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
          <InfoCard
            icon={<FileText className="h-6 w-6 text-blue-500" />}
            title="Guias"
            value={totalGuias}
            variant="info"
          />
          <InfoCard
            icon={<Users className="h-6 w-6 text-green-500" />}
            title="Procedimentos"
            value={totalProcedimentos}
            variant="success"
          />
          <InfoCard
            icon={<UserCheck className="h-6 w-6 text-purple-500" />}
            title="Papel mais frequente"
            value={`${papelMaisFrequente[0]} (${papelMaisFrequente[1]})`}
            variant="neutral"
          />
        </div>
        <div className="bg-muted rounded-lg p-3 mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-muted-foreground">Minhas Atividades Recentes</span>
            <Button variant="ghost" size="sm" onClick={() => { clearActivities(); setActivities([]); }}>Limpar</Button>
          </div>
          <ul className="text-xs space-y-1">
            {activities.slice(0, 5).map((log: any, idx: number) => {
              if (typeof log === "string") {
                return <li key={idx} className="flex items-center gap-2">{log}</li>;
              }
              return (
                <li key={idx} className="flex items-center gap-2">
                  <span className="font-medium">{log.action}</span>
                  {log.target?.numero_guia && <span>Guia: <b>{log.target.numero_guia}</b></span>}
                  {log.target?.beneficiario && <span>- {log.target.beneficiario}</span>}
                  {log.result && <span className="text-green-700">({log.result})</span>}
                  <span className="truncate">{log.details}</span>
                  <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                </li>
              );
            })}
            {activities.length === 0 && <li className="text-muted-foreground">Nenhuma atividade registrada</li>}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <input
                    type="text"
                    placeholder="Filtrar por número, beneficiário"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="border rounded px-2 py-1 text-sm"
                    style={{ minWidth: 220 }}
                    disabled={activeTab !== "list"}
                    aria-label="Filtrar por número ou beneficiário"
                  />
                </TooltipTrigger>
                <TooltipContent>Digite parte do número da guia ou nome do beneficiário para filtrar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <input
                    type="date"
                    placeholder="Data"
                    value={data}
                    onChange={(e) => { setData(e.target.value); setPage(1); }}
                    className="border rounded px-2 py-1 text-sm"
                    style={{ minWidth: 140 }}
                    disabled={activeTab !== "list"}
                    aria-label="Filtrar por data de execução"
                  />
                </TooltipTrigger>
                <TooltipContent>Filtre por data de execução do procedimento</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="border rounded px-2 py-1 text-sm"
                    disabled={activeTab !== "list"}
                    aria-label="Filtrar por status"
                  >
                    <option value="">Todos Status</option>
                    <option value="Fechada">Fechada</option>
                    <option value="Gerado pela execução">Gerado pela execução</option>
                  </select>
                </TooltipTrigger>
                <TooltipContent>Filtre por status do procedimento</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">{`Total: ${filteredMacroRows.length}`}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(filteredMacroRows)}
                    disabled={filteredMacroRows.length === 0}
                    aria-label="Exportar CSV"
                  >
                    Exportar CSV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Exporta a lista filtrada de guias para planilha CSV</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportProceduresToCSV(grouped)}
                    disabled={Object.values(grouped).flat().length === 0}
                    aria-label="Exportar Procedimentos CSV"
                  >
                    Exportar Procedimentos CSV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Exporta todos os procedimentos detalhados das guias filtradas para planilha CSV</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant={activeTab === "upload" ? "outline" : "secondary"}
              size="sm"
              onClick={() => setActiveTab("upload")}
            >
              <Upload className="w-4 h-4 mr-2" />
              Nova Guia
            </Button>
          </div>
        </div>

        {/* AVISO DE RESPONSABILIDADE LGPD */}
        <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm">
          <strong>Aviso de Privacidade:</strong> Ao inserir dados de pacientes (ex: upload de guias), você declara que possui consentimento ou base legal para tratar dados sensíveis de terceiros, conforme a LGPD. O uso indevido pode gerar responsabilidade legal.
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "list" | "upload")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista de Guias</TabsTrigger>
            <TabsTrigger value="upload">Upload de Guias</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Guias Médicas
                </CardTitle>
                <CardDescription>
                  Liste e gerencie as suas guias processadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoaderTable />
                ) : (
                  <DataGrid
                    rows={filteredMacroRows}
                    columns={macroColumns}
                    pageSize={10}
                    className="min-h-[500px]"
                    renderExpandedRow={(row) =>
                      expandedRow === row.numero_guia ? (
                        <tr>
                          <td colSpan={macroColumns.length} className="bg-[#F7F9FC] p-0">
                            <Card className="w-full max-w-full overflow-hidden px-2">
                              <div className="overflow-x-auto w-full" style={{ maxWidth: 'calc(100vw - 220px)' }}>
                                <table className="w-full text-sm min-w-[600px]">
                                  <thead>
                                    <tr>
                                      {['Data', 'Código', 'Descrição', 'Participação', 'Qtd', 'Prestador'].map(h => (
                                        <th
                                          key={h}
                                          className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-ink-low dark:text-slate-400"
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {row.detalhes.map((proc: any) => (
                                      <tr key={proc.codigo} className="odd:bg-gray-50 dark:odd:bg-surface-dark/50">
                                        <td className="py-2 px-3 whitespace-nowrap">{proc.data}</td>
                                        <td className="py-2 px-3 whitespace-nowrap font-mono">{proc.codigo}</td>
                                        <td className="py-2 px-3 whitespace-nowrap max-w-[180px] truncate">{proc.descricao}</td>
                                        <td className="py-2 px-3 whitespace-nowrap">
                                          <Badge
                                            variant="participacao"
                                            color={(papelColors[normalizePapel(proc.papel)] || defaultPapelColor).bg}
                                            textColor={(papelColors[normalizePapel(proc.papel)] || defaultPapelColor).text}
                                          >
                                            {proc.papel}
                                          </Badge>
                                        </td>
                                        <td className="py-2 px-3 whitespace-nowrap text-center">{proc.qtd}</td>
                                        <td className="py-2 px-3 whitespace-nowrap max-w-[180px] truncate">{proc.prestador}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </Card>
                          </td>
                        </tr>
                      ) : null
                    }
                  />
                )}
                {selectedGuia && (
                  <DetalhesGuia
                    guia={selectedGuia}
                    procedimentos={grouped[selectedGuia]}
                    onClose={() => setSelectedGuia(null)}
                  />
                )}
                {activeTab === "list" && (
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-muted-foreground">
                      Página {page} de {Math.ceil(total / pageSize) || 1}
                    </div>
                    <div className="flex gap-2 items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={selectedRows.length === 0}
                              onClick={handleDeleteSelected}
                              aria-label="Remover selecionadas"
                            >
                              Remover selecionadas
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove todas as guias selecionadas da sua lista</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >Anterior</Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page * pageSize >= total}
                        onClick={() => setPage((p) => p + 1)}
                      >Próxima</Button>
                      <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                        className="border rounded px-2 py-1 text-xs"
                      >
                        {[10, 20, 50, 100].map((sz) => (
                          <option key={sz} value={sz}>{sz} por página</option>
                        ))}
                      </select>
                    </div>
                  </div>
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
                  hasFiles={files.some((f) => f.type === "guia")}
                />
                <FileList
                  files={files.filter((f) => f.type === "guia")}
                  onRemove={removeFile}
                  disabled={isUploading || loading}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetFiles}
                    disabled={!files.length || isUploading || loading}
                  >
                    Limpar
                  </Button>
                  <Button
                    onClick={handleUploadGuias}
                    disabled={!files.length || isUploading || loading}
                  >
                    {isUploading || loading
                      ? "Processando..."
                      : "Processar Guias"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 flex flex-col items-center gap-4">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-lg font-medium">Processando guias...</span>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default GuidesPage;