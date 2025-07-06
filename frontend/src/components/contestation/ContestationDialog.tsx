import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, Download, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateContestation } from '@/services/contestationService';
import { jsPDF } from 'jspdf';
import { Card } from '@/components/ui/card';

interface ContestationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedureDetails: {
    codigo: string;
    procedimento: string;
    valorCBHPM: number;
    valorPago: number;
    diferenca: number;
    papel?: string;
    justificativa?: string;
  };
}

export function ContestationDialog({
  open,
  onOpenChange,
  procedureDetails,
}: ContestationDialogProps) {
  const [contestationText, setContestationText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const handleGenerateContestation = async () => {
    setLoading(true);
    try {
      const text = await generateContestation({
        procedureCode: procedureDetails.codigo,
        procedureDescription: procedureDetails.procedimento,
        cbhpmValue: procedureDetails.valorCBHPM,
        paidValue: procedureDetails.valorPago,
        difference: procedureDetails.diferenca,
        role: procedureDetails.papel,
        reasonGiven: procedureDetails.justificativa,
      });

      setContestationText(text);
      setGenerated(true);
      toast.success('Contestação gerada com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar contestação:', error);
      toast.error('Erro ao gerar contestação', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
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

      // Configure PDF
      doc.setFont('helvetica');
      doc.setFontSize(12);

      // Add text with proper line breaks
      const splitText = doc.splitTextToSize(contestationText, 180);
      doc.text(splitText, 15, 15);

      // Save PDF
      doc.save(
        `contestacao-${procedureDetails.codigo}-${new Date().toISOString().split('T')[0]}.pdf`
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
      element.download = `contestacao-${procedureDetails.codigo}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Arquivo de texto baixado com sucesso');
    } catch (error) {
      toast.error('Erro ao baixar arquivo de texto');
      console.error('Erro ao baixar arquivo de texto:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Contestação de Glosa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {!generated ? (
            <Card className="p-6 border-2 border-blue-100 bg-blue-50/30">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-semibold text-primary">
                    {procedureDetails.procedimento}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Código: {procedureDetails.codigo}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-2">
                  <div className="bg-secondary/20 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">Valor CBHPM</p>
                    <p className="font-semibold">
                      {formatCurrency(procedureDetails.valorCBHPM)}
                    </p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">Valor Pago</p>
                    <p className="font-semibold">
                      {formatCurrency(procedureDetails.valorPago)}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-md ${procedureDetails.diferenca < 0 ? 'bg-red-100 border border-red-200' : 'bg-green-100 border border-green-200'}`}
                >
                  <h4 className="font-medium">
                    {procedureDetails.diferenca < 0
                      ? `Detectamos uma diferença de ${formatCurrency(Math.abs(procedureDetails.diferenca))}`
                      : `Detectamos um pagamento excedente de ${formatCurrency(procedureDetails.diferenca)}`}
                  </h4>
                  <p className="text-sm mt-1">
                    {procedureDetails.diferenca < 0
                      ? 'Pronto para contestar com apenas 1 clique?'
                      : 'O valor pago foi maior que o valor da CBHPM.'}
                  </p>
                </div>

                <Button
                  onClick={handleGenerateContestation}
                  disabled={loading}
                  className="w-full mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando contestação...
                    </>
                  ) : (
                    'Gerar Contestação Automática'
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
                <p className="text-sm">
                  Use este texto no portal da operadora para contestar a glosa. Esta
                  contestação foi gerada com base na tabela CBHPM e na legislação
                  vigente.
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
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
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
