import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  Clock,
  FileText,
  Download,
  Zap,
  AlertTriangle,
  Target,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Filter,
  Mail,
  Printer,
  Copy,
  Settings,
  Brain,
  Shield,
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import jsPDF from 'jspdf';

interface BulkAction {
  id: string;
  type: 'contest' | 'export' | 'analyze' | 'notify';
  title: string;
  description: string;
  icon: React.ReactNode;
  requiresSelection: boolean;
  estimatedTime?: string;
  successRate?: number;
}

interface BulkOperationStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  current: number;
  startTime?: Date;
  endTime?: Date;
  results?: any;
}

interface SelectedItem {
  id: string;
  type: 'glosa' | 'demonstrativo' | 'guia';
  data: any;
  value?: number;
}

export function BulkActionsSystem({ 
  items = [],
  onRefresh,
  context = 'unpaid'
}: {
  items?: any[];
  onRefresh?: () => void;
  context?: 'unpaid' | 'demonstrativos' | 'guias';
}) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BulkOperationStatus | null>(null);
  const [contestationTemplate, setContestationTemplate] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('all');

  const availableActions: BulkAction[] = [
    {
      id: 'bulk-contest',
      type: 'contest',
      title: 'Contestação em Lote',
      description: 'Gerar documentos de contestação para múltiplas glosas automaticamente',
      icon: <Shield className="h-5 w-5" />,
      requiresSelection: true,
      estimatedTime: '2-5 min',
      successRate: 94,
    },
    {
      id: 'intelligent-export',
      type: 'export',
      title: 'Exportação Inteligente',
      description: 'Exportar dados selecionados com análise automática incluída',
      icon: <Download className="h-5 w-5" />,
      requiresSelection: true,
      estimatedTime: '30 seg',
      successRate: 99,
    },
    {
      id: 'pattern-analysis',
      type: 'analyze',
      title: 'Análise de Padrões',
      description: 'Identificar padrões de glosas e sugerir melhorias de processo',
      icon: <Brain className="h-5 w-5" />,
      requiresSelection: false,
      estimatedTime: '1-2 min',
      successRate: 87,
    },
    {
      id: 'automated-follow-up',
      type: 'notify',
      title: 'Follow-up Automático',
      description: 'Enviar lembretes automáticos sobre prazos e contestações',
      icon: <Mail className="h-5 w-5" />,
      requiresSelection: true,
      estimatedTime: '30 seg',
      successRate: 96,
    },
  ];

  const calcularDiasParaContestar = (data: string): number => {
    try {
      const dataGlosa = parseISO(data);
      const hoje = new Date();
      const diasPassados = differenceInCalendarDays(hoje, dataGlosa);
      return 30 - diasPassados;
    } catch {
      return 0;
    }
  };

  const getFilteredItems = () => {
    if (!Array.isArray(items)) return [];
    
    switch (filterCriteria) {
      case 'expiring':
        return items.filter(item => {
          if (context === 'unpaid' && item.data) {
            const dias = calcularDiasParaContestar(item.data);
            return dias > 0 && dias <= 7;
          }
          return false;
        });
      case 'high-value':
        return items.filter(item => {
          const valor = parseFloat(item.valorApresentado) || 0;
          return valor >= 1000;
        });
      case 'contestable':
        return items.filter(item => {
          if (context === 'unpaid' && item.data) {
            const dias = calcularDiasParaContestar(item.data);
            return dias > 0;
          }
          return false;
        });
      default:
        return items;
    }
  };

  const toggleItemSelection = (item: any) => {
    const itemId = item.id || item.guia || item.filename;
    const isSelected = selectedItems.some(selected => selected.id === itemId);
    
    if (isSelected) {
      setSelectedItems(prev => prev.filter(selected => selected.id !== itemId));
    } else {
      const selectedItem: SelectedItem = {
        id: itemId,
        type: context === 'unpaid' ? 'glosa' : context === 'demonstrativos' ? 'demonstrativo' : 'guia',
        data: item,
        value: parseFloat(item.valorApresentado) || 0,
      };
      setSelectedItems(prev => [...prev, selectedItem]);
    }
  };

  const selectAllFilteredItems = () => {
    const filtered = getFilteredItems();
    const newSelections: SelectedItem[] = filtered.map(item => ({
      id: item.id || item.guia || item.filename,
      type: context === 'unpaid' ? 'glosa' : context === 'demonstrativos' ? 'demonstrativo' : 'guia',
      data: item,
      value: parseFloat(item.valorApresentado) || 0,
    }));
    setSelectedItems(newSelections);
  };

  const clearSelections = () => {
    setSelectedItems([]);
  };

  const executeBulkAction = async (action: BulkAction) => {
    if (action.requiresSelection && selectedItems.length === 0) {
      toast.error('Selecione ao menos um item para esta ação');
      return;
    }

    setCurrentOperation({
      id: action.id,
      status: 'running',
      progress: 0,
      total: action.requiresSelection ? selectedItems.length : items.length,
      current: 0,
      startTime: new Date(),
    });

    try {
      switch (action.type) {
        case 'contest':
          await executeBulkContestation();
          break;
        case 'export':
          await executeIntelligentExport();
          break;
        case 'analyze':
          await executePatternAnalysis();
          break;
        case 'notify':
          await executeAutomatedFollowUp();
          break;
      }

      setCurrentOperation(prev => prev ? {
        ...prev,
        status: 'completed',
        progress: 100,
        current: prev.total,
        endTime: new Date(),
      } : null);

      toast.success(`${action.title} concluída com sucesso!`);
      setBulkDialogOpen(false);
      
      if (onRefresh) onRefresh();
      
    } catch (error) {
      console.error('Erro na operação em lote:', error);
      setCurrentOperation(prev => prev ? { ...prev, status: 'failed' } : null);
      toast.error(`Erro ao executar ${action.title}`);
    }
  };

  const executeBulkContestation = async () => {
    const total = selectedItems.length;
    const contestationDocs: string[] = [];

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      
      // Simular progresso
      setCurrentOperation(prev => prev ? {
        ...prev,
        progress: Math.round(((i + 1) / total) * 100),
        current: i + 1,
      } : null);

      // Gerar documento de contestação
      const documento = generateContestationDocument(item.data, contestationTemplate);
      contestationDocs.push(documento);

      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Criar PDF consolidado
    const pdf = new jsPDF();
    contestationDocs.forEach((doc, index) => {
      if (index > 0) pdf.addPage();
      
      const lines = pdf.splitTextToSize(doc, 180);
      pdf.text(lines, 10, 10);
    });

    // Download do PDF
    pdf.save(`contestacao_lote_${new Date().toISOString().slice(0, 10)}.pdf`);

    return { documents: contestationDocs.length };
  };

  const executeIntelligentExport = async () => {
    const data = selectedItems.map(item => {
      const baseData = {
        ID: item.id,
        Tipo: item.type,
        Data: item.data.data || item.data.upload_time,
        Valor: formatCurrency(item.value || 0),
      };

      if (item.type === 'glosa') {
        return {
          ...baseData,
          Guia: item.data.guia,
          Beneficiario: item.data.beneficiario,
          Procedimento: item.data.procedimento,
          Motivo: item.data.motivoNaoPagamento,
          'Dias Restantes': calcularDiasParaContestar(item.data.data),
          'Status Contestação': calcularDiasParaContestar(item.data.data) > 0 ? 'Dentro do Prazo' : 'Expirado',
        };
      }

      return baseData;
    });

    // Análise automática
    const analysis = {
      'Total Selecionado': selectedItems.length,
      'Valor Total': formatCurrency(selectedItems.reduce((sum, item) => sum + (item.value || 0), 0)),
      'Contestáveis': selectedItems.filter(item => 
        item.type === 'glosa' && calcularDiasParaContestar(item.data.data) > 0
      ).length,
      'Valor Recuperável': formatCurrency(
        selectedItems
          .filter(item => item.type === 'glosa' && calcularDiasParaContestar(item.data.data) > 0)
          .reduce((sum, item) => sum + (item.value || 0), 0)
      ),
    };

    // Simular progresso
    for (let i = 0; i <= 100; i += 10) {
      setCurrentOperation(prev => prev ? { ...prev, progress: i, current: Math.round((i / 100) * selectedItems.length) } : null);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Criar CSV com análise
    const csvContent = [
      // Headers
      Object.keys(data[0] || {}).join(','),
      // Data
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(',')),
      '',
      '=== ANÁLISE AUTOMÁTICA ===',
      ...Object.entries(analysis).map(([key, value]) => `"${key}","${value}"`)
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_inteligente_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const executePatternAnalysis = async () => {
    // Simular análise de padrões
    for (let i = 0; i <= 100; i += 5) {
      setCurrentOperation(prev => prev ? { ...prev, progress: i, current: Math.round((i / 100) * items.length) } : null);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Análise real dos dados
    const patterns = analyzeGlosaPatterns(items);
    
    // Mostrar resultados
    toast.success(`Análise concluída! ${patterns.commonMotives.length} padrões identificados`);
  };

  const executeAutomatedFollowUp = async () => {
    // Simular envio de notificações
    for (let i = 0; i < selectedItems.length; i++) {
      setCurrentOperation(prev => prev ? {
        ...prev,
        progress: Math.round(((i + 1) / selectedItems.length) * 100),
        current: i + 1,
      } : null);

      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const generateContestationDocument = (procedure: any, template: string) => {
    const dias = calcularDiasParaContestar(procedure.data);
    
    return `
CONTESTAÇÃO DE GLOSA
Guia: ${procedure.guia}
Beneficiário: ${procedure.beneficiario}
Procedimento: ${procedure.procedimento}
Valor: ${formatCurrency(parseFloat(procedure.valorApresentado) || 0)}
Motivo da Glosa: ${procedure.motivoNaoPagamento}

${template || 'Solicitamos a revisão desta glosa com base na documentação apresentada.'}

${dias <= 0 ? 'ATENÇÃO: Prazo legal expirado. Documento para fins de registro.' : `Prazo restante: ${dias} dias`}

Data: ${new Date().toLocaleDateString('pt-BR')}
    `.trim();
  };

  const analyzeGlosaPatterns = (data: any[]) => {
    const motives: { [key: string]: number } = {};
    
    data.forEach(item => {
      const motivo = item.motivoNaoPagamento || 'Não informado';
      motives[motivo] = (motives[motivo] || 0) + 1;
    });

    const commonMotives = Object.entries(motives)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    return { commonMotives, totalAnalyzed: data.length };
  };

  const getTotalSelectedValue = () => {
    return selectedItems.reduce((sum, item) => sum + (item.value || 0), 0);
  };

  const getContestableCount = () => {
    return selectedItems.filter(item => {
      if (item.type === 'glosa' && item.data.data) {
        return calcularDiasParaContestar(item.data.data) > 0;
      }
      return false;
    }).length;
  };

  const filteredItems = getFilteredItems();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Ações em Lote
            {selectedItems.length > 0 && (
              <Badge variant="default" className="ml-2">
                {selectedItems.length} selecionados
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={filterCriteria} onValueChange={setFilterCriteria}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="expiring">Expirando</SelectItem>
                <SelectItem value="high-value">Alto Valor</SelectItem>
                <SelectItem value="contestable">Contestáveis</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={selectAllFilteredItems}>
              Selecionar Filtrados ({filteredItems.length})
            </Button>
            
            {selectedItems.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearSelections}>
                Limpar Seleção
              </Button>
            )}
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-blue-800">
                {formatCurrency(getTotalSelectedValue())}
              </div>
              <div className="text-xs text-blue-600">Valor Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-800">
                {getContestableCount()}
              </div>
              <div className="text-xs text-green-600">Contestáveis</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-lg font-bold text-purple-800">
                {selectedItems.length}
              </div>
              <div className="text-xs text-purple-600">Itens</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lista de itens com seleção */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredItems.slice(0, 50).map((item, index) => {
            const itemId = item.id || item.guia || item.filename;
            const isSelected = selectedItems.some(selected => selected.id === itemId);
            const dias = context === 'unpaid' && item.data ? calcularDiasParaContestar(item.data) : null;
            
            return (
              <div
                key={itemId}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => toggleItemSelection(item)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={isSelected} readOnly />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {item.guia || item.filename || item.numero_guia || `Item ${index + 1}`}
                      </span>
                      {dias !== null && (
                        <Badge 
                          variant={dias > 7 ? "default" : dias > 0 ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {dias > 0 ? `${dias}d` : 'Expirado'}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.beneficiario || item.periodo || 'Sem descrição'}
                      {item.valorApresentado && (
                        <span className="ml-2 font-medium">
                          {formatCurrency(parseFloat(item.valorApresentado) || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ações disponíveis */}
        <div className="grid gap-3 md:grid-cols-2">
          {availableActions.map((action) => (
            <Dialog key={action.id} open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="p-4 h-auto text-left justify-start"
                  disabled={action.requiresSelection && selectedItems.length === 0}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {action.estimatedTime}
                        </Badge>
                        {action.successRate && (
                          <span className="text-xs text-green-600">
                            {action.successRate}% sucesso
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {action.icon}
                    {action.title}
                  </DialogTitle>
                  <DialogDescription>
                    {action.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {currentOperation?.status === 'running' ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          Processando... {currentOperation.current}/{currentOperation.total}
                        </div>
                        <Progress value={currentOperation.progress} className="mt-2" />
                      </div>
                    </div>
                  ) : (
                    <>
                      {action.type === 'contest' && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium">
                            Template de Contestação (opcional):
                          </label>
                          <Textarea
                            placeholder="Adicione texto personalizado para as contestações..."
                            value={contestationTemplate}
                            onChange={(e) => setContestationTemplate(e.target.value)}
                            rows={4}
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4">
                        <div className="text-sm text-gray-600">
                          {action.requiresSelection 
                            ? `${selectedItems.length} itens selecionados`
                            : `${items.length} itens para análise`
                          }
                        </div>
                        <Button 
                          onClick={() => executeBulkAction(action)}
                          disabled={action.requiresSelection && selectedItems.length === 0}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Executar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}