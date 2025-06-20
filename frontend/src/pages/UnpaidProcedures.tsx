import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { DataGrid } from "../components/ui/data-grid";
import { Button } from "../components/ui/button";
import { AlertCircle, Download, FileX, Filter, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useState, useEffect } from "react";
import { ResourceDialog } from "../components/unpaid-procedures/ResourceDialog";
import { formatCurrency } from "../utils/format";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../contexts/auth/AuthContext";
import { UserMenu } from "../components/navbar/UserMenu";
import InfoCard from "../components/ui/InfoCard";
import axios from "axios";
import { differenceInCalendarDays, parse } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function calcularDiasParaContestar(data: string) {
  // data no formato DD/MM/YYYY ou YYYY-MM-DD
  let dataBase: Date;
  if (/\d{2}\/\d{2}\/\d{4}/.test(data)) {
    const [dia, mes, ano] = data.split("/");
    dataBase = new Date(Number(ano), Number(mes) - 1, Number(dia));
  } else if (/\d{4}-\d{2}-\d{2}/.test(data)) {
    const [ano, mes, dia] = data.split("-");
    dataBase = new Date(Number(ano), Number(mes) - 1, Number(dia));
  } else {
    dataBase = new Date(data);
  }
  const hoje = new Date();
  const diff = differenceInCalendarDays(hoje, dataBase);
  return Math.max(0, 30 - diff);
}

function GlosaDetailModal({ codigo, open, onClose }: { codigo: string, open: boolean, onClose: () => void }) {
  const [glosa, setGlosa] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !codigo) return;
    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/glosas?codigo=${codigo}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setGlosa(data[0]);
        else setGlosa(null);
      })
      .catch(() => setError('Erro ao buscar detalhes da glosa.'))
      .finally(() => setLoading(false));
  }, [open, codigo]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Glosa</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div>Carregando...</div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : glosa ? (
          <div className="space-y-2">
            <div><b>Grupo:</b> {glosa.grupo}</div>
            <div><b>Código:</b> {glosa.codigo}</div>
            <div><b>Descrição:</b> {glosa.descricao}</div>
          </div>
        ) : (
          <div>Nenhuma informação encontrada para a glosa {codigo}.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getPrazoStatus(dias: number) {
  if (dias > 5) return "success";
  if (dias > 0) return "warning";
  return "destructive";
}

function PrazoBadge({ dias }: { dias: number }) {
  const status = getPrazoStatus(dias);
  let label = dias > 1 ? `${dias} dias` : dias === 1 ? "1 dia" : "Expirado";
  return (
    <Badge
      variant={status}
      className={
        status === "success"
          ? "bg-green-100 text-green-800 border border-green-200 font-medium"
          : status === "warning"
          ? "bg-yellow-100 text-yellow-800 border border-yellow-200 font-medium"
          : "bg-red-100 text-red-800 border border-red-200 font-medium"
      }
      aria-label={label}
      tabIndex={0}
    >
      {label}
    </Badge>
  );
}

function TruncatedCell({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <TooltipProvider>
      <Tooltip open={show} onOpenChange={setShow}>
        <TooltipTrigger
          onFocus={() => setShow(true)}
          onBlur={() => setShow(false)}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          tabIndex={0}
          className="truncate max-w-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label={text}
        >
          {text}
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatValor(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

const UnpaidProceduresPage = () => {
  const [unpaidProcedures, setUnpaidProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile, signOut } = useAuth();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [glosaDetail, setGlosaDetail] = useState<any>(null);
  const [glosaLoading, setGlosaLoading] = useState(false);
  const [glosaError, setGlosaError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnpaidProcedures = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        // 1. Buscar todos os demonstrativos
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/demonstrativos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const demonstrativos = res.data || [];
        // 2. Buscar detalhes de cada demonstrativo (em paralelo)
        const detalhesAll = await Promise.all(
          demonstrativos.map(async (d: any) => {
            try {
              const resDetalhes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/demonstrativos/${d.id}/detalhes`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return resDetalhes.data || [];
            } catch {
              return [];
            }
          })
        );
        // 3. Filtrar procedimentos glosados
        const glosados = detalhesAll.flat().filter((p: any) => {
          const glosa = Number(p.financial?.glosa ?? p.glosa) || 0;
          return glosa > 0;
        });
        // 4. Mapear para o formato esperado pela tabela/dialog
        const mapped = glosados.map((p: any, idx: number) => ({
          id: idx,
          guia: p.guia ?? p.guide ?? '',
          procedimento: p.descricao ?? p.description ?? '',
          data: p.data ?? p.date ?? '',
          valorApresentado: Number(p.financial?.presented_value ?? p.apresentado) || 0,
          motivoNaoPagamento: p.motivo_glosa ?? p.motivoNaoPagamento ?? p.motivo ?? 'Glosa',
          codigo_glosa: p.codigo_glosa ?? '',
          motivo_glosa: p.motivo_glosa ?? '',
          beneficiario: p.beneficiario ?? p.paciente ?? '',
          hospital: p.hospital ?? p.prestador ?? '',
          status: 'Pendente',
        }));
        setUnpaidProcedures(mapped);
      } catch (err) {
        setError('Erro ao carregar procedimentos não pagos.');
        setUnpaidProcedures([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUnpaidProcedures();
  }, []);

  const handleExpandRow = async (row: any, idx: number) => {
    if (expandedRow === idx) {
      setExpandedRow(null);
      setGlosaDetail(null);
      setGlosaError(null);
      return;
    }
    setExpandedRow(idx);
    setGlosaLoading(true);
    setGlosaError(null);
    setGlosaDetail(null);
    if (row.codigo_glosa) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/glosas?codigo=${row.codigo_glosa}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setGlosaDetail(data[0]);
        else setGlosaDetail(null);
      } catch {
        setGlosaError('Erro ao buscar detalhes da glosa.');
      } finally {
        setGlosaLoading(false);
      }
    } else {
      setGlosaDetail(null);
      setGlosaLoading(false);
    }
  };

  const unpaidColumns = [
    { field: 'guia', headerName: 'Nº Guia', width: 120 },
    { field: 'procedimento', headerName: 'Procedimento', flex: 1 },
    { field: 'data', headerName: 'Data', width: 120 },
    { 
      field: 'valorApresentado', 
      headerName: 'Valor Apresentado', 
      width: 150,
      valueFormatter: (params: any) => formatValor(params.value)
    },
    { 
      field: 'motivoNaoPagamento', 
      headerName: 'Motivo', 
      width: 260,
      renderCell: ({ row, id }: { row: any, id: number }) => {
        const codigo = row.codigo_glosa;
        const motivo = row.motivo_glosa || row.motivoNaoPagamento;
        if (codigo) {
          return (
            <span className="cursor-pointer text-danger underline" onClick={() => handleExpandRow(row, row.id)} title="Expandir detalhes da glosa">
              {`${codigo} - ${motivo}`}
            </span>
          );
        }
        if (motivo) {
          return <Badge variant="danger">{motivo}</Badge>;
        }
        return <Badge variant="danger">Glosa</Badge>;
      }
    },
    { 
      field: 'diasParaContestar', 
      headerName: 'Dias para Contestação', 
      width: 200,
      renderCell: ({ row }: { row: any }) => {
        const dias = calcularDiasParaContestar(row.data);
        return (
          <PrazoBadge dias={dias} />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      renderCell: ({ row }: { row: any }) => (
        <ResourceDialog procedure={row} />
      )
    }
  ];

  return (
    <AuthenticatedLayout title="Procedimentos Não Pagos">
      <PageHeader
        title="Procedimentos Não Pagos"
        icon={<FileX size={28} />}
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
        <InfoCard
          icon={<AlertCircle className="h-6 w-6 text-amber-500" />}
          title={`Existem ${unpaidProcedures.length} procedimentos que podem ser contestados`}
          description="Conteste em até 30 dias para garantir a análise pelo convênio"
          variant="warning"
          className="w-full mb-4"
        />
        
        <div className="flex gap-2 self-end">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileX className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Lista de Procedimentos Não Pagos</h3>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" aria-label="Carregando..." />
                <span className="ml-3 text-blue-600 font-medium">Carregando procedimentos...</span>
              </div>
            ) : error ? (
              <div className="text-danger font-medium p-4">{error}</div>
            ) : (
              <table className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    {unpaidColumns.map((col) => (
                      <th
                        key={col.field}
                        className="px-4 py-3 text-left font-semibold text-gray-800 text-sm border-b border-gray-200"
                      >
                        {col.headerName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unpaidProcedures.map((row, idx) => [
                    <tr
                      key={row.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white hover:bg-blue-50 transition-colors"
                          : "bg-gray-50 hover:bg-blue-50 transition-colors"
                      }
                    >
                      {unpaidColumns.map((col, colIdx) => (
                        <td key={col.field} className="py-2 px-3 align-top">
                          {col.renderCell ? col.renderCell({ row, id: idx }) : row[col.field]}
                        </td>
                      ))}
                    </tr>,
                    expandedRow === idx && (
                      <tr key={row.id + "-expanded"}>
                        <td colSpan={unpaidColumns.length} className="bg-transparent p-0 border-t-0">
                          <div className="flex justify-start">
                            <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 mt-2 mb-4 w-full">
                              <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                                <span className="font-semibold text-gray-800 text-base">Detalhes Oficiais da Glosa</span>
                              </div>
                              {glosaLoading ? (
                                <div className="text-gray-600">Carregando detalhes da glosa...</div>
                              ) : glosaError ? (
                                <div className="text-danger">{glosaError}</div>
                              ) : glosaDetail ? (
                                <table className="w-full text-sm mt-2">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Grupo</th>
                                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Código</th>
                                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Descrição</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="px-3 py-2 text-gray-900">{glosaDetail.grupo}</td>
                                      <td className="px-3 py-2 text-gray-900">{glosaDetail.codigo}</td>
                                      <td className="px-3 py-2 text-gray-900">{glosaDetail.descricao}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              ) : (
                                <div className="text-gray-600">Nenhuma informação encontrada para a glosa {row.codigo_glosa}.</div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  ])}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

export default UnpaidProceduresPage;

export { calcularDiasParaContestar };
