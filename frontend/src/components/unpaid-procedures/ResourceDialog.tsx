import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, FilePlus, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { jsPDF } from 'jspdf';

interface ResourceDialogProps {
  procedure: {
    guia: string;
    procedimento: string;
    dataExecucao?: string;
    valorApresentado: number;
    motivoNaoPagamento: string;
    status: string;
    hospital?: string;
    beneficiario?: string;
  };
}

function generateLegalContestation({
  guia,
  procedimento,
  dataExecucao,
  valorApresentado,
  motivoNaoPagamento,
  codigo_glosa,
  motivo_glosa,
  crm,
  nomeMedico,
  local = '',
  data = new Date(),
  hospital = '',
  beneficiario = '',
}) {
  const dataFormatada = data.toLocaleDateString('pt-BR');
  return `À Operadora/Convênio

Ref.: Contestação de Glosa – Guia nº ${guia}, Procedimento ${procedimento}${
    codigo_glosa ? `, Código de Glosa: ${codigo_glosa}` : ''
  }

Prezados,

Venho, na qualidade de médico responsável, apresentar contestação à glosa aplicada ao procedimento acima identificado, conforme demonstrativo recebido.

Motivo da glosa informado pela operadora:
${codigo_glosa ? `${codigo_glosa} - ` : ''}${
    motivo_glosa || motivoNaoPagamento || '[motivo não informado]'
  }

Fundamentação técnica e legal:
Conforme previsto no contrato firmado entre as partes, bem como na legislação vigente (Lei 13.003/2014, Lei 9.656/98, Lei 8.080/90, RN 503/2022, RN 630/2025 e demais normas da ANS), o procedimento foi realizado de acordo com as diretrizes clínicas, administrativas e contratuais, estando devidamente autorizado, documentado e comprovado.

Reforço o direito ao contraditório e à ampla defesa, conforme garantido pela legislação e regulamentação da ANS, solicitando análise criteriosa do recurso.

Argumentação específica:
[Descreva aqui, de forma objetiva, por que a glosa é improcedente. Anexe documentos se necessário.]

Dados do procedimento:
- Guia: ${guia}
- Procedimento: ${procedimento}
- Data de Execução: ${dataExecucao || '[data não informada]'}
- Valor Apresentado: R$ ${valorApresentado?.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
  })}
- Beneficiário: ${beneficiario || '[não informado]'}
- Hospital/Local: ${hospital || local || '[não informado]'}

Solicito, portanto, a revisão da glosa e o pagamento do valor devido, anexando os documentos comprobatórios necessários.

Atenciosamente,

Nome: ${nomeMedico || '[Nome do Médico]'}
CRM: ${crm || '[CRM]'}
${local ? `Local: ${local}\n` : ''}Data: ${dataFormatada}
Assinatura: ____________________
`;
}

export function ResourceDialog({ procedure }: ResourceDialogProps) {
  const { user, userProfile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [glosaDescricao, setGlosaDescricao] = useState<string | null>(null);
  const [contestationText, setContestationText] = useState<string>('');
  const [generated, setGenerated] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    // Tenta extrair código da glosa do campo dedicado ou do motivo
    let codigo: string | null = null;
    // 1. Se vier campo dedicado (backend novo)
    if ((procedure as any).codigo_glosa) {
      codigo = String((procedure as any).codigo_glosa);
    } else {
      // 2. Tenta extrair do texto do motivo
      const motivo = procedure.motivoNaoPagamento || '';
      const match = motivo.match(/\b(\d{4})\b/);
      if (match) codigo = match[1];
    }
    if (!codigo) {
      setGlosaDescricao(null);
      return;
    }
    // Cache simples em memória
    const cacheKey = `glosa_${codigo}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setGlosaDescricao(cached);
      return;
    }
    // Busca na knowledge base
    fetch(
      `${
        import.meta.env.VITE_API_URL || 'https://medcheck-backend.onrender.com'
      }/api/v1/glosas?codigo=${codigo}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setGlosaDescricao(data[0].descricao);
          sessionStorage.setItem(cacheKey, data[0].descricao);
        } else {
          setGlosaDescricao(null);
        }
      })
      .catch(() => setGlosaDescricao(null));
  }, [procedure]);

  const handleGenerateContestation = () => {
    const text = generateLegalContestation({
      guia: procedure.guia,
      procedimento: procedure.procedimento,
      dataExecucao: procedure.dataExecucao,
      valorApresentado: procedure.valorApresentado,
      motivoNaoPagamento: procedure.motivoNaoPagamento,
      codigo_glosa: (procedure as any).codigo_glosa,
      motivo_glosa: (procedure as any).motivo_glosa,
      crm: userProfile?.crm,
      nomeMedico: userProfile?.name,
      local: procedure.hospital || procedure.local || '',
      data: new Date(),
      hospital: procedure.hospital || '',
      beneficiario: procedure.beneficiario || '',
    });
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
      const splitText = doc.splitTextToSize(contestationText, 180);
      doc.text(splitText, 15, 15);
      doc.save(
        `contestacao-${procedure.guia}-${new Date().toISOString().split('T')[0]}.pdf`
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
      const file = new Blob([contestationText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `contestacao-${procedure.guia}-${
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={procedure.status === 'Negado'}
        >
          <FileText className="h-4 w-4" />
          Contestar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Formulário de Recurso</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 border-b pb-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Informações do Procedimento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Guia</p>
                  <p className="font-medium">{procedure.guia}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CRM Médico</p>
                  <p className="font-medium">{userProfile?.crm || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Procedimento</p>
                <p className="font-medium">{procedure.procedimento}</p>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Motivo do Não Pagamento</p>
                <Badge variant="destructive" className="mt-1">
                  {procedure.motivoNaoPagamento}
                </Badge>
                {glosaDescricao && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs">
                    <strong>Explicação oficial:</strong> {glosaDescricao}
                  </div>
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Valor Apresentado</p>
                <p className="font-medium text-lg text-primary">
                  {formatCurrency(procedure.valorApresentado)}
                </p>
              </div>
            </div>
          </div>

          {!generated ? (
            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerateContestation}
              disabled={isGenerating}
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Gerar Contestação Automática
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
                <p className="text-sm">
                  Use este texto para contestar a glosa junto à operadora. O texto está
                  fundamentado na legislação vigente e pode ser editado antes do envio.
                </p>
              </div>
              <Textarea
                className="h-[300px] font-mono text-sm"
                value={contestationText}
                onChange={(e) => setContestationText(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  {copiedText ? (
                    <>
                      <FileText className="mr-2 h-4 w-4 text-green-500" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Copiar Texto
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownloadText}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Baixar .TXT
                </Button>
                <Button onClick={handleDownloadPDF} className="flex-1 sm:flex-none">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
