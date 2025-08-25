import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import { ResponsiveDataGrid } from "../components/ui/ResponsiveDataGrid";
import { Button } from "../components/ui/button";
import { AlertCircle, Download, FileX, Filter, Loader2, Shield, AlertTriangle, Copy, FileText, Printer, Scale } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth/AuthContext";
import { InfoCard } from "../components/ui/InfoCard";
import axios from "axios";
import { differenceInCalendarDays } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import jsPDF from 'jspdf';

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



function getPrazoStatus(dias: number) {
  if (dias > 5) return "success";
  if (dias > 0) return "warning";
  return "destructive";
}

function PrazoBadge({ dias }: { dias: number }) {
  const status = getPrazoStatus(dias);
  const label = dias > 1 ? `${dias} dias` : dias === 1 ? "1 dia" : "Expirado";
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
  
  const [contestationDialog, setContestationDialog] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [contestationText, setContestationText] = useState('');
  const [generated, setGenerated] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [glosaAnalysis, setGlosaAnalysis] = useState<any>(null);
  
  const { userProfile } = useAuth();

  // Event listeners para QuickActions (botão flutuante)
  useEffect(() => {
    const handleExportGlosas = () => {
      // Exportar dados das glosas em CSV
      if (unpaidProcedures && unpaidProcedures.length > 0) {
        const csvData = unpaidProcedures.map(proc => ({
          Data: proc.data,
          Guia: proc.guia,
          Beneficiario: proc.beneficiario,
          Procedimento: proc.procedimento,
          Valor: proc.valorApresentado,
          Motivo: proc.motivoNaoPagamento,
          'Dias Restantes': calcularDiasParaContestar(proc.data)
        }));

        // Converter para CSV
        const headers = Object.keys(csvData[0]);
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => 
            headers.map(header => `"${row[header] || ''}"`).join(',')
          )
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `glosas_pendentes_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Dados exportados com sucesso!');
      } else {
        toast.info('Nenhuma glosa disponível para exportar');
      }
    };

    const handleOpenBulkContest = () => {
      // Funcionalidade de contestação em lote
      if (unpaidProcedures && unpaidProcedures.length > 0) {
        const procedimentosContestaveis = unpaidProcedures.filter(proc => {
          const dias = calcularDiasParaContestar(proc.data);
          return dias > 0; // Apenas procedimentos dentro do prazo
        });

        if (procedimentosContestaveis.length > 0) {
          toast.info(`${procedimentosContestaveis.length} procedimentos podem ser contestados. Funcionalidade em desenvolvimento.`);
        } else {
          toast.warning('Nenhum procedimento está dentro do prazo para contestação (30 dias).');
        }
      } else {
        toast.info('Nenhum procedimento disponível para contestação');
      }
    };

    // Adicionar listeners
    window.addEventListener('exportGlosas', handleExportGlosas);
    window.addEventListener('openBulkContest', handleOpenBulkContest);

    // Cleanup
    return () => {
      window.removeEventListener('exportGlosas', handleExportGlosas);
      window.removeEventListener('openBulkContest', handleOpenBulkContest);
    };
  }, [unpaidProcedures]);

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
        const mapped = glosados.map((p: any, idx: number) => {
          const beneficiario = p.beneficiario || 
                              p.paciente || 
                              p.patient_name || 
                              p.nome_paciente || 
                              p.nome_beneficiario || 
                              p.beneficiary_name ||
                              p.patient ||
                              'Beneficiário não informado';
          
          // Debug log para verificar dados
          if (!beneficiario || beneficiario === 'Beneficiário não informado') {
            console.log('Dados do procedimento sem beneficiário:', p);
          }
          
          return {
            id: idx,
            guia: p.guia ?? p.guide ?? '',
            procedimento: p.descricao ?? p.description ?? '',
            data: p.data ?? p.date ?? '',
            valorApresentado: Number(p.financial?.presented_value ?? p.apresentado) || 0,
            motivoNaoPagamento: p.motivo_glosa ?? p.motivoNaoPagamento ?? p.motivo ?? 'Glosa',
            codigo_glosa: p.codigo_glosa ?? '',
            motivo_glosa: p.motivo_glosa ?? '',
            beneficiario,
            hospital: p.hospital ?? p.prestador ?? '',
            status: 'Pendente',
          };
        });
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

  const unpaidColumns = [
    {
      field: 'data',
      headerName: 'Data',
      width: 100,
      renderCell: ({ row }: any) => <span className="text-sm">{row.data}</span>
    },
    {
      field: 'guia',
      headerName: 'Guia',
      width: 120,
      renderCell: ({ row }: any) => <span className="text-sm font-mono">{row.guia}</span>
    },
    {
      field: 'beneficiario',
      headerName: 'Beneficiário',
      width: 180,
      renderCell: ({ row }: any) => <TruncatedCell text={row.beneficiario} />
    },
    {
      field: 'procedimento',
      headerName: 'Procedimento',
      width: 250,
      renderCell: ({ row }: any) => <TruncatedCell text={row.procedimento} />
    },
    {
      field: 'valorApresentado',
      headerName: 'Valor',
      width: 120,
      renderCell: ({ row }: any) => <span className="text-sm font-medium">{formatValor(row.valorApresentado)}</span>
    },
    {
      field: 'motivoNaoPagamento',
      headerName: 'Motivo',
      width: 140,
      renderCell: ({ row }: any) => (
        <Badge variant="destructive" className="text-xs">
          {row.motivoNaoPagamento}
        </Badge>
      )
    },
    {
      field: 'dias_contestar',
      headerName: 'Prazo',
      width: 100,
      renderCell: ({ row }: any) => {
        const dias = calcularDiasParaContestar(row.data);
        return <PrazoBadge dias={dias} />;
      }
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      renderCell: ({ row }: any) => {
        const dias = calcularDiasParaContestar(row.data);
        const isExpired = dias <= 0;
        
        return (
          <Button
            size="sm"
            variant={isExpired ? "destructive" : "default"}
            onClick={() => handleContestation(row)}
            className={`h-8 px-2 text-xs font-medium gap-1 ${
              isExpired ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Shield className="w-3 h-3" />
            {isExpired ? 'Expirado' : 'Contestar'}
          </Button>
        );
      }
    }
  ];

  const handleContestation = (procedure: any) => {
    const dias = calcularDiasParaContestar(procedure.data);
    const procedureWithDays = { ...procedure, diasRestantes: dias };
    
    // Análise automática da glosa
    const analysis = analisarGlosa(
      procedure.codigo_glosa || '', 
      procedure.motivo_glosa || procedure.motivoNaoPagamento || ''
    );
    
    setSelectedProcedure(procedureWithDays);
    setGlosaAnalysis(analysis);
    setContestationDialog(true);
    setGenerated(false);
    setContestationText('');
    setCopiedText(false);
  };

  const generateLegalContestation = (procedure: any) => {
    // Preparar dados para o sistema jurídico
    const contestationData: ContestationData = {
      procedimento: {
        guia: procedure.guia || '',
        codigo_cbhpm: procedure.codigoCBHPM || procedure.codigo || '',
        descricao: procedure.procedimento || '',
        data_execucao: procedure.data || '',
        beneficiario: procedure.beneficiario || '',
        crm: userProfile?.crm || '',
        nome_medico: userProfile?.name || '',
        valor_apresentado: parseFloat(procedure.valorApresentado?.toString().replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        valor_pago: parseFloat(procedure.valorPago?.toString().replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        hospital: procedure.hospital || '',
      },
      glosa: {
        codigo: procedure.codigo_glosa || '',
        motivo: procedure.motivo_glosa || procedure.motivoNaoPagamento || '',
        valor: parseFloat(procedure.valorApresentado?.toString().replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        categoria: 'administrativa', // Será determinado automaticamente
      },
      medico: {
        nome: userProfile?.name || '',
        crm: userProfile?.crm || '',
        uf: userProfile?.uf || '',
        especialidade: userProfile?.especialidade || undefined,
      },
      dias_desde_execucao: procedure.diasRestantes ? (30 - procedure.diasRestantes) : 0,
      prazo_legal: procedure.diasRestantes > 0 ? 'dentro' : 'expirado',
    };

    return gerarContestacaoLegal(contestationData);
  };

  const handleGenerateContestation = () => {
    if (!selectedProcedure) return;
    
    const text = generateLegalContestation(selectedProcedure);
    setContestationText(text);
    setGenerated(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contestationText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      toast.success('Texto copiado para a área de transferência');
    } catch (error) {
      toast.error('Erro ao copiar texto');
      console.error('Erro ao copiar para o clipboard:', error);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica');
      doc.setFontSize(12);
      
      // Configurar margens e quebra de linha
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      const splitText = doc.splitTextToSize(contestationText, maxWidth);
      doc.text(splitText, margin, margin);
      
      doc.save(
        `contestacao-glosa-${selectedProcedure.guia}-${new Date().toISOString().split('T')[0]}.pdf`
      );
      toast.success('PDF baixado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const handleDownloadText = () => {
    try {
      const element = document.createElement('a');
      const file = new Blob([contestationText], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `contestacao-glosa-${selectedProcedure.guia}-${
        new Date().toISOString().split('T')[0]
      }.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Arquivo de texto baixado com sucesso');
    } catch (error) {
      toast.error('Erro ao baixar arquivo de texto');
      console.error('Erro ao baixar arquivo de texto:', error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Contestação de Glosa - ${selectedProcedure.guia}</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.6; margin: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${contestationText}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
  return (
      <AuthenticatedLayout
        title="Procedimentos Não Pagos"
        description="Procedimentos que aguardam confirmação de pagamento"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout
        title="Procedimentos Não Pagos"
        description="Procedimentos que aguardam confirmação de pagamento"
      >
        <div className="flex flex-col items-center justify-center h-64">
          <FileX className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{error}</p>
                  </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <>
      {/* Background com Gradiente Médico Consistente */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <AuthenticatedLayout
          title="Procedimentos Não Pagos"
          description="Procedimentos que aguardam confirmação de pagamento"
        >
          <div className="space-y-12 px-4 sm:px-6 lg:px-8 max-w-full overflow-hidden">
            {/* Header Discreto Seguindo Padrão Dashboard */}
            <section className="text-center space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200/50">
                <AlertTriangle className="h-4 w-4 text-blue-700" />
                <span className="text-xs font-medium text-blue-800">
                  Auditoria de pagamentos
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-800 bg-clip-text text-transparent">
                Procedimentos Não Pagos
              </h1>

              <p className="text-sm text-gray-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Central de monitoramento e contestação de procedimentos pendentes de pagamento
                com análise jurídica automatizada
              </p>
            </section>

            {/* Seção de Resumo e Ações */}
            <section className="space-y-6">
              <InfoCard
                icon={<AlertCircle className="h-6 w-6 text-amber-500" />}
                title="Procedimentos Contestáveis"
                value={unpaidProcedures.length}
                description="Conteste em até 30 dias para garantir a análise pelo convênio"
                variant="warning"
                className="w-full"
              />
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </section>

            {/* Seção da Tabela */}
            <section className="w-full">
              <div className="w-full max-w-full overflow-x-auto">
                <ResponsiveDataGrid
                  rows={unpaidProcedures}
                  columns={unpaidColumns}
                  className="w-full"
                  loading={loading}
                  emptyMessage="Nenhum procedimento não pago encontrado"
                  mobileConfig={{
                    titleField: 'procedimento',
                    subtitleField: 'beneficiario',
                    statusField: 'motivoNaoPagamento',
                    primaryFields: ['valorApresentado', 'dias_contestar'],
                    secondaryFields: ['data', 'guia'],
                    actions: [
                      {
                        label: 'Contestar',
                        action: 'contest',
                        icon: <Shield className="h-4 w-4" />,
                        variant: 'default',
                      },
                    ],
                  }}
                  onAction={(action, row) => {
                    if (action === 'contest') {
                      handleContestation(row);
                    }
                  }}
                  onRowClick={(row) => handleContestation(row)}
                />
              </div>
            </section>
          </div>

          {/* Dialog de Contestação Profissional */}
          <Dialog open={contestationDialog} onOpenChange={setContestationDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  Sistema Jurídico de Contestação - ANS/Lei 13.003/2014
                </DialogTitle>
                <DialogDescription>
                  Geração automatizada de contestação com fundamentação legal específica por tipo de glosa
                </DialogDescription>
              </DialogHeader>
            
              
              {selectedProcedure && (
                <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {/* Análise Automática da Glosa */}
                  {glosaAnalysis && (
                    <div className={`border-2 rounded-lg p-4 ${
                      glosaAnalysis.urgencia === 'alta' 
                        ? 'border-green-300 bg-green-50' 
                        : glosaAnalysis.urgencia === 'media' 
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-red-300 bg-red-50'
                    }`}>
                      <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                        <AlertCircle className={`h-5 w-5 ${
                          glosaAnalysis.urgencia === 'alta' ? 'text-green-600' : 
                          glosaAnalysis.urgencia === 'media' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                        🎯 Análise Jurídica da Glosa
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <InfoCard
                          title="Código"
                          value={glosaAnalysis.analise.codigo}
                          icon={<FileText className="h-4 w-4 text-blue-600" />}
                          variant="info"
                          size="sm"
                        />
                        <InfoCard
                          title="Categoria"
                          value={glosaAnalysis.analise.categoria.charAt(0).toUpperCase() + glosaAnalysis.analise.categoria.slice(1)}
                          icon={<Scale className="h-4 w-4 text-purple-600" />}
                          variant="neutral"
                          size="sm"
                        />
                        <InfoCard
                          title="Chance de Sucesso"
                          value={glosaAnalysis.analise.chance_sucesso.toUpperCase()}
                          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
                          variant={
                            glosaAnalysis.analise.chance_sucesso === 'alta' ? 'success' :
                            glosaAnalysis.analise.chance_sucesso === 'media' ? 'warning' : 'danger'
                          }
                          size="sm"
                        />
                      </div>
                      
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                        <div className="font-medium text-blue-900 mb-2">💡 Recomendação:</div>
                        <div className="text-sm text-blue-800">{glosaAnalysis.recomendacao}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Informações do Procedimento */}
                  <div className="grid gap-4 border-b pb-4">
                  <h3 className="text-lg font-semibold">Informações do Procedimento</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Guia</p>
                      <p className="font-medium">{selectedProcedure.guia}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CRM Médico</p>
                      <p className="font-medium">{userProfile?.crm || 'N/A'} - [UF]</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Beneficiário</p>
                      <p className="font-medium">{selectedProcedure.beneficiario}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Procedimento</p>
                    <p className="font-medium">{selectedProcedure.procedimento}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Apresentado</p>
                      <p className="font-medium text-lg text-primary">
                        {formatValor(selectedProcedure.valorApresentado)}
                      </p>
            </div>
                <div>
                      <p className="text-sm text-muted-foreground">Motivo da Glosa</p>
                      <Badge variant="destructive" className="mt-1">
                        {selectedProcedure.motivoNaoPagamento}
                    </Badge>
                </div>
                  </div>
              </div>

                {/* Alerta de Prazo */}
                {selectedProcedure.diasRestantes <= 0 ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-800">
                        <div className="font-medium mb-1">⚠️ Prazo Expirado</div>
                      <div>
                          Este procedimento foi realizado há mais de 30 dias. A contestação 
                          permanece válida legalmente, mas recomenda-se celeridade na tramitação 
                          devido ao tempo decorrido.
                        </div>
                      </div>
                  </div>
                </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div className="text-sm text-green-800">
                        <strong>✅ Dentro do Prazo:</strong> {selectedProcedure.diasRestantes} dias restantes para contestação otimizada
                      </div>
                  </div>
                </div>
              )}

                {/* Geração e Edição do Documento */}
                {!generated ? (
                  <div className="text-center py-6">
                    <Button
                      onClick={handleGenerateContestation}
                      size="lg"
                      className="w-full max-w-md"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Gerar Contestação Jurídica Automática
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Documento fundamentado nas normas ANS e legislação vigente
                    </p>
                </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">📋 Documento Gerado</h4>
                      <p className="text-sm text-blue-800">
                        Contestação fundamentada juridicamente. Revise o texto abaixo e 
                        personalize conforme necessário antes de enviar à operadora.
                      </p>
        </div>
                    
                    <Textarea
                      className="h-[400px] font-mono text-sm bg-white border-2"
                      value={contestationText}
                      onChange={(e) => setContestationText(e.target.value)}
                      placeholder="Texto da contestação será gerado aqui..."
                    />
                    
                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="flex-1"
                      >
                        {copiedText ? (
                          <>
                            <Copy className="mr-2 h-4 w-4 text-green-500" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar Texto
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={handleDownloadText}
                        variant="outline"
                        className="flex-1"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Baixar .TXT
                      </Button>
                      
                      <Button
                        onClick={handleDownloadPDF}
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </Button>
                      
                      <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="flex-1"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                      </Button>
                    </div>
                  </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </AuthenticatedLayout>
      </div>
    </>
  );
};

export default UnpaidProceduresPage;

export { calcularDiasParaContestar };