import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { DataGrid } from '../components/ui/data-grid';
import { Button } from '../components/ui/button';
import {
  AlertCircle,
  Download,
  FileX,
  Filter,
  Loader2,
  Clock,
  XCircle,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useState, useEffect } from 'react';
import { ResourceDialog } from '../components/unpaid-procedures/ResourceDialog';
import { formatCurrency } from '../utils/format';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../contexts/auth/AuthContext';

import { InfoCard } from '../components/ui/InfoCard';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { calcularDiasParaContestar } from '@/utils/date';
import { usePageTitle } from '../hooks/usePageTitle';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '../components/ui/card';
import { DollarSign } from 'lucide-react';

function GlosaDetailModal({
  codigo,
  open,
  onClose,
}: {
  codigo: string;
  open: boolean;
  onClose: () => void;
}) {
  const [glosa, setGlosa] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !codigo) return;
    setLoading(true);
    setError(null);
    fetch(
      `${
        import.meta.env.VITE_API_URL || 'http://localhost:8000'
      }/api/v1/glosas?codigo=${codigo}`
    )
      .then((res) => res.json())
      .then((data) => {
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
            <div>
              <b>Grupo:</b> {glosa.grupo}
            </div>
            <div>
              <b>Código:</b> {glosa.codigo}
            </div>
            <div>
              <b>Descrição:</b> {glosa.descricao}
            </div>
          </div>
        ) : (
          <div>Nenhuma informação encontrada para a glosa {codigo}.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getPrazoStatus(dias: number) {
  if (dias > 5) return 'success';
  if (dias > 0) return 'warning';
  return 'destructive';
}

function PrazoBadge({ dias }: { dias: number }) {
  const status = getPrazoStatus(dias);
  let label: string;
  let actionLabel: string;

  if (dias > 1) {
    label = `${dias} dias`;
    actionLabel = 'Contestar';
  } else if (dias === 1) {
    label = '1 dia';
    actionLabel = 'Urgente!';
  } else {
    label = 'Expirado';
    actionLabel = 'Recurso';
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Badge
        variant={status}
        className={
          status === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200 font-medium'
            : status === 'warning'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 font-medium'
              : 'bg-red-100 text-red-800 border border-red-200 font-medium'
        }
        aria-label={label}
        tabIndex={0}
      >
        {label}
      </Badge>
      {dias === 0 && (
        <Badge
          variant="outline"
          className="text-xs bg-blue-50 text-blue-700 border-blue-200"
        >
          {actionLabel}
        </Badge>
      )}
    </div>
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
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    valor
  );
}

const UnpaidProceduresPage = () => {
  // SEO e Título Premium
  usePageTitle({
    title: 'Glosas e Contestações',
    description:
      'Central de gestão de glosas médicas e contestações com análise inteligente de prazos e estratégias de recuperação',
    keywords:
      'glosas médicas, contestações médicas, recuperação glosas, auditoria glosas, gestão glosas',
  });

  const [unpaidProcedures, setUnpaidProcedures] = useState<any[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile, signOut } = useAuth();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [glosaDetail, setGlosaDetail] = useState<any>(null);
  const [glosaLoading, setGlosaLoading] = useState(false);
  const [glosaError, setGlosaError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'contestable' | 'expired'>(
    'all'
  );

  useEffect(() => {
    const fetchUnpaidProcedures = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        // 1. Buscar todos os demonstrativos
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL || 'http://localhost:8000'
          }/api/v1/demonstrativos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const demonstrativos = res.data || [];
        // 2. Buscar detalhes de cada demonstrativo (em paralelo)
        const detalhesAll = await Promise.all(
          demonstrativos.map(async (d: any) => {
            try {
              const resDetalhes = await axios.get(
                `${
                  import.meta.env.VITE_API_URL || 'http://localhost:8000'
                }/api/v1/demonstrativos/${d.id}/detalhes`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
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
          motivoNaoPagamento:
            p.motivo_glosa ?? p.motivoNaoPagamento ?? p.motivo ?? 'Glosa',
          codigo_glosa: p.codigo_glosa ?? '',
          motivo_glosa: p.motivo_glosa ?? '',
          beneficiario: p.beneficiario ?? p.paciente ?? '',
          hospital: p.hospital ?? p.prestador ?? '',
          status: 'Pendente',
        }));
        setUnpaidProcedures(mapped);
        setFilteredProcedures(mapped);
      } catch (err) {
        setError('Erro ao carregar glosas e contestações.');
        setUnpaidProcedures([]);
        setFilteredProcedures([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUnpaidProcedures();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = unpaidProcedures;

    if (statusFilter === 'contestable') {
      filtered = filtered.filter((p) => calcularDiasParaContestar(p.data) > 0);
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter((p) => calcularDiasParaContestar(p.data) === 0);
    }

    setFilteredProcedures(filtered);
  }, [unpaidProcedures, statusFilter]);

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
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL || 'http://localhost:8000'
          }/api/v1/glosas?codigo=${row.codigo_glosa}`
        );
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
    {
      field: 'guia',
      headerName: 'Nº Guia',
      width: 100,
      renderCell: ({ row }: { row: any }) => {
        const diasRestantes = calcularDiasParaContestar(row.data);
        const isExpired = diasRestantes === 0;
        return (
          <span className={isExpired ? 'text-gray-400 line-through' : ''}>
            {row.guia}
          </span>
        );
      },
    },
    {
      field: 'procedimento',
      headerName: 'Procedimento',
      flex: 2,
      renderCell: ({ row }: { row: any }) => {
        const diasRestantes = calcularDiasParaContestar(row.data);
        const isExpired = diasRestantes === 0;
        return (
          <span className={isExpired ? 'text-gray-400' : ''}>{row.procedimento}</span>
        );
      },
    },
    {
      field: 'data',
      headerName: 'Data',
      width: 100,
      renderCell: ({ row }: { row: any }) => {
        const diasRestantes = calcularDiasParaContestar(row.data);
        const isExpired = diasRestantes === 0;
        return <span className={isExpired ? 'text-gray-400' : ''}>{row.data}</span>;
      },
    },
    {
      field: 'valorApresentado',
      headerName: 'Valor',
      width: 120,
      renderCell: ({ row }: { row: any }) => {
        const diasRestantes = calcularDiasParaContestar(row.data);
        const isExpired = diasRestantes === 0;
        return (
          <span className={isExpired ? 'text-gray-400 line-through' : 'font-semibold'}>
            {formatValor(row.valorApresentado)}
          </span>
        );
      },
    },
    {
      field: 'motivoNaoPagamento',
      headerName: 'Motivo',
      flex: 3,
      renderCell: ({ row }: { row: any }) => {
        const codigo = row.codigo_glosa;
        const motivo = row.motivo_glosa || row.motivoNaoPagamento;
        if (codigo) {
          return (
            <span
              className="cursor-pointer text-danger underline truncate max-w-[220px]"
              onClick={() => handleExpandRow(row, row.id)}
              title="Expandir detalhes da glosa"
            >
              {`${codigo} - ${motivo}`}
            </span>
          );
        }
        return (
          <Badge variant="danger" className="truncate max-w-[200px]" title={motivo}>
            {motivo || 'Glosa'}
          </Badge>
        );
      },
    },
    {
      field: 'diasParaContestar',
      headerName: 'Dias',
      width: 110,
      renderCell: ({ row }: { row: any }) => (
        <PrazoBadge dias={calcularDiasParaContestar(row.data)} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      renderCell: ({ row }: { row: any }) => {
        const diasRestantes = calcularDiasParaContestar(row.data);
        const podeContestar = diasRestantes > 0;

        return (
          <div className="flex items-center gap-1">
            {podeContestar ? (
              <>
                <ResourceDialog procedure={row} />
                {diasRestantes <= 3 && (
                  <Badge variant="warning" className="text-xs">
                    Urgente
                  </Badge>
                )}
              </>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      Recurso
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Prazo de contestação expirado - Abrir recurso administrativo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>Glosas e Contestações | MedCheck</title>
        <meta
          name="description"
          content="Central de gestão de glosas médicas e contestações com análise inteligente de prazos e estratégias de recuperação"
        />
        <meta
          name="keywords"
          content="glosas médicas, contestações médicas, recuperação glosas, auditoria glosas"
        />
      </Helmet>

      <AuthenticatedLayout title="Glosas e Contestações">
        <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
          <div className="px-4 sm:px-6 lg:px-8 py-12 space-y-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-full border border-red-200/60">
                <FileX className="h-6 w-6 text-red-700" />
                <span className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                  Gestão de Glosas Médicas
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-red-700 via-rose-600 to-red-800 bg-clip-text text-transparent leading-tight">
                  Glosas & Contestações
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Defenda seus direitos! Conteste glosas indevidas e recupere valores
                  que são seus por direito. Análise inteligente de prazos.
                </p>
              </div>
            </div>

            <section className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-rose-100">
                    <AlertCircle className="h-6 w-6 text-red-700" />
                  </div>
                  Status das Contestações
                </h2>
                <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                  Acompanhe prazos e valores: procedimentos ainda contestáveis e
                  oportunidades de recuperação financeira.
                </p>
              </div>

              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                          <Clock className="h-7 w-7 text-amber-700" />
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          Urgente
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                          Contestáveis
                        </p>
                        <p className="text-3xl font-bold text-amber-800 leading-none">
                          {
                            unpaidProcedures.filter(
                              (p) => calcularDiasParaContestar(p.data) > 0
                            ).length
                          }
                        </p>
                        <p className="text-sm text-amber-600">
                          Com prazo válido para contestação
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50 to-red-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-rose-100">
                          <XCircle className="h-7 w-7 text-red-700" />
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          Perdidos
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                          Expirados
                        </p>
                        <p className="text-3xl font-bold text-red-800 leading-none">
                          {
                            unpaidProcedures.filter(
                              (p) => calcularDiasParaContestar(p.data) === 0
                            ).length
                          }
                        </p>
                        <p className="text-sm text-red-600">
                          Prazo de contestação expirado
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100">
                          <DollarSign className="h-7 w-7 text-emerald-700" />
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          Recuperável
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                          Valor Contestável
                        </p>
                        <p className="text-3xl font-bold text-emerald-800 leading-none">
                          {formatCurrency(
                            unpaidProcedures
                              .filter((p) => calcularDiasParaContestar(p.data) > 0)
                              .reduce((sum, p) => sum + p.valorApresentado, 0)
                          )}
                        </p>
                        <p className="text-sm text-emerald-600">
                          Valor total ainda contestável
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 to-slate-600"></div>
                  <CardContent className="relative p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100">
                          <Loader2 className="h-7 w-7 text-gray-700" />
                        </div>
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                          Perdido
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                          Valor Perdido
                        </p>
                        <p className="text-3xl font-bold text-gray-800 leading-none">
                          {formatCurrency(
                            unpaidProcedures
                              .filter((p) => calcularDiasParaContestar(p.data) === 0)
                              .reduce((sum, p) => sum + p.valorApresentado, 0)
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          Valor com prazo expirado
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Todos ({unpaidProcedures.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'contestable' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('contestable')}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Contestáveis (
                    {
                      unpaidProcedures.filter(
                        (p) => calcularDiasParaContestar(p.data) > 0
                      ).length
                    }
                    )
                  </Button>
                  <Button
                    variant={statusFilter === 'expired' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('expired')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Expirados (
                    {
                      unpaidProcedures.filter(
                        (p) => calcularDiasParaContestar(p.data) === 0
                      ).length
                    }
                    )
                  </Button>
                </div>

                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Filtrados
                </Button>
              </div>

              <div className="pt-2">
                <DataGrid
                  rows={filteredProcedures}
                  columns={unpaidColumns}
                  className="w-full"
                  wrapperScrollable
                  renderExpandedRow={(row) => {
                    if (expandedRow !== row.id) return null;
                    return (
                      <tr>
                        <td
                          colSpan={unpaidColumns.length}
                          className="bg-transparent p-0 border-t-0"
                        >
                          <div className="flex justify-start">
                            <div className="rounded-lg border border-border bg-card shadow-sm p-4 mt-2 mb-4 w-full">
                              <div className="flex items-center mb-2">
                                <svg
                                  className="w-5 h-5 text-muted-foreground mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                                  />
                                </svg>
                                <span className="font-semibold text-foreground text-base">
                                  Detalhes Oficiais da Glosa
                                </span>
                              </div>
                              {glosaLoading ? (
                                <div className="text-muted-foreground">
                                  Carregando detalhes da glosa...
                                </div>
                              ) : glosaError ? (
                                <div className="text-danger">{glosaError}</div>
                              ) : glosaDetail ? (
                                <table className="w-full text-sm mt-2">
                                  <thead>
                                    <tr className="bg-muted/10">
                                      <th className="px-3 py-2 text-left font-semibold">
                                        Grupo
                                      </th>
                                      <th className="px-3 py-2 text-left font-semibold">
                                        Código
                                      </th>
                                      <th className="px-3 py-2 text-left font-semibold">
                                        Descrição
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="px-3 py-2">{glosaDetail.grupo}</td>
                                      <td className="px-3 py-2">
                                        {glosaDetail.codigo}
                                      </td>
                                      <td className="px-3 py-2">
                                        {glosaDetail.descricao}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              ) : (
                                <div className="text-muted-foreground">
                                  Nenhuma informação encontrada para a glosa{' '}
                                  {row.codigo_glosa}.
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }}
                />
              </div>
            </section>
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default UnpaidProceduresPage;

export { PrazoBadge, TruncatedCell, calcularDiasParaContestar };
