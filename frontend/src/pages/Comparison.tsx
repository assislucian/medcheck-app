import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Calculator, 
  Scale, 
  FileText, 
  Shield, 
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  BookOpen,
  TrendingUp,
  DollarSign,
  Gavel
} from 'lucide-react';
import { cbhpmTable, findProcedureByCodigo, calculateTotalCBHPM, CBHPMProcedure } from '@/data/cbhpmData';
import ComparisonView from '@/components/ComparisonView';

interface LegalGuidance {
  title: string;
  description: string;
  laws: string[];
  actions: string[];
  severity: 'low' | 'medium' | 'high';
}

const legalGuidanceData: Record<string, LegalGuidance> = {
  glosa_sem_justificativa: {
    title: "Glosa Sem Justificativa Técnica",
    description: "Quando o plano de saúde nega o pagamento sem apresentar fundamentação técnica adequada.",
    laws: [
      "Lei nº 9.656/98 - Art. 12 (Direito à cobertura)",
      "Resolução ANS nº 387/2015 - Art. 2º (Negativa de cobertura)",
      "CDC Art. 51, IV (Cláusulas abusivas)"
    ],
    actions: [
      "Solicitar justificativa técnica por escrito",
      "Contestar administrativamente junto à operadora",
      "Procurar a ANS para mediação",
      "Consultar advogado especializado em Direito Médico"
    ],
    severity: 'high'
  },
  valor_abaixo_cbhpm: {
    title: "Pagamento Abaixo dos Valores CBHPM",
    description: "Quando os valores pagos estão significativamente abaixo da tabela de referência.",
    laws: [
      "CBHPM - Referência técnica da AMB",
      "Lei nº 13.003/2014 - Contratos escritos obrigatórios",
      "Código de Ética Médica - Art. 69"
    ],
    actions: [
      "Verificar cláusulas contratuais",
      "Negociar reajuste baseado em CBHPM",
      "Solicitar auditoria técnica independente",
      "Considerar mediação ou arbitragem"
    ],
    severity: 'medium'
  },
  atraso_pagamento: {
    title: "Atraso no Pagamento de Honorários",
    description: "Quando há demora injustificada no pagamento dos serviços prestados.",
    laws: [
      "Lei nº 13.003/2014 - Prazos de pagamento",
      "CC Art. 394 (Juros de mora)",
      "Resolução ANS nº 388/2015"
    ],
    actions: [
      "Notificar extrajudicialmente",
      "Aplicar juros e correção monetária",
      "Suspender atendimento (se previsto em contrato)",
      "Acionar juridicamente"
    ],
    severity: 'high'
  }
};

const Comparison: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('database');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProcedures, setFilteredProcedures] = useState<CBHPMProcedure[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('cirurgiao');
  const [calculatorValues, setCalculatorValues] = useState({
    codigo: '',
    quantidade: 1,
    papel: 'cirurgiao',
    uco: 1.0,
    ch: 1.0
  });
  const [legalCase, setLegalCase] = useState('');
  const [contestationData, setContestationData] = useState({
    procedimento: '',
    valorPago: '',
    valorCBHPM: '',
    justificativa: '',
    documentos: ''
  });
  const [selectedContestationProcedure, setSelectedContestationProcedure] = useState<any>(null);
  const [glosaAnalysis, setGlosaAnalysis] = useState<any>(null);

  // Check if we have an analysisId for comparison
  const analysisId = searchParams.get('analysisId');

  useEffect(() => {
    if (searchTerm.length >= 3) {
      const filtered = cbhpmTable.filter(proc => 
        proc.procedimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(proc.codigo).includes(searchTerm)
      ).slice(0, 50); // Limit to 50 results for performance
      setFilteredProcedures(filtered);
    } else {
      setFilteredProcedures([]);
    }
  }, [searchTerm]);

  const formatCurrency = (value: number | null | undefined): string => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateHonorarios = () => {
    const procedure = findProcedureByCodigo(calculatorValues.codigo);
    if (!procedure) return null;

    const baseValue = calculateTotalCBHPM(procedure, calculatorValues.papel);
    const total = baseValue * calculatorValues.quantidade * calculatorValues.uco * calculatorValues.ch;
    
    return {
      procedure,
      baseValue,
      total,
      breakdown: {
        base: baseValue,
        quantidade: calculatorValues.quantidade,
        uco: calculatorValues.uco,
        ch: calculatorValues.ch
      }
    };
  };

  const getRoleName = (role: string): string => {
    const roles = {
      'cirurgiao': 'Cirurgião',
      'anestesista': 'Anestesista',
      'primeiro_auxiliar': 'Primeiro Auxiliar',
      'segundo_auxiliar': 'Segundo Auxiliar'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getLegalGuidanceForCase = (caseType: string): LegalGuidance | null => {
    return legalGuidanceData[caseType] || null;
  };

  const generateContestationDocument = () => {
    const template = `
CONTESTAÇÃO DE GLOSA MÉDICA

Dados do Procedimento:
- Código CBHPM: ${contestationData.procedimento}
- Valor Pago: ${contestationData.valorPago}
- Valor CBHPM de Referência: ${contestationData.valorCBHPM}

Fundamentação Técnica:
${contestationData.justificativa}

Base Legal:
- Lei nº 9.656/98 - Planos e Seguros Privados de Assistência à Saúde
- Resolução ANS nº 387/2015 - Procedimentos de negativa de cobertura
- CBHPM - Classificação Brasileira Hierarquizada de Procedimentos Médicos

Documentos Anexos:
${contestationData.documentos}

Solicitação:
Solicito a revisão da glosa aplicada, com base na fundamentação técnica apresentada e na legislação vigente, para que seja efetuado o pagamento integral do procedimento conforme tabela de referência.
    `.trim();

    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contestacao_glosa_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // If we have an analysisId, show the comparison view
  if (analysisId) {
    return (
      <AuthenticatedLayout title="Comparação">
        <Helmet>
          <title>Análise Comparativa | MedCheck</title>
        </Helmet>
        <ComparisonView analysisId={analysisId} />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout title="Centro de Tabelas e Orientação Jurídica">
      <Helmet>
        <title>Centro de Tabelas e Orientação Jurídica | MedCheck</title>
        <meta name="description" content="Base completa CBHPM, calculadora de honorários e orientação jurídica para médicos" />
      </Helmet>

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Centro de Tabelas e Orientação Jurídica
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Consulte a base completa CBHPM, calcule honorários médicos e obtenha orientação jurídica 
            para defesa dos seus direitos profissionais.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Base CBHPM
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Orientação Jurídica
            </TabsTrigger>
            <TabsTrigger value="contestation" className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Contestação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Base de Dados CBHPM Completa
                </CardTitle>
                <CardDescription>
                  Consulte mais de 4.000 procedimentos médicos com valores de referência por especialidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Buscar Procedimento</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Digite o nome do procedimento ou código CBHPM..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-48">
                    <Label htmlFor="role">Papel Médico</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cirurgiao">Cirurgião</SelectItem>
                        <SelectItem value="anestesista">Anestesista</SelectItem>
                        <SelectItem value="primeiro_auxiliar">Primeiro Auxiliar</SelectItem>
                        <SelectItem value="segundo_auxiliar">Segundo Auxiliar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {searchTerm.length < 3 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Digite pelo menos 3 caracteres para buscar procedimentos
                    </AlertDescription>
                  </Alert>
                )}

                {filteredProcedures.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="font-medium">Resultados Encontrados ({filteredProcedures.length})</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {filteredProcedures.map((procedure, index) => {
                        const value = calculateTotalCBHPM(procedure, selectedRole);
                        return (
                          <div key={index} className="p-4 border-b hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">{procedure.codigo}</Badge>
                                  <Badge variant="secondary">{getRoleName(selectedRole)}</Badge>
                                </div>
                                <p className="text-sm text-gray-900 leading-relaxed">
                                  {procedure.procedimento}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-lg font-semibold text-green-600">
                                  {formatCurrency(value)}
                                </div>
                                <div className="text-xs text-gray-500">Valor de referência</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculadora de Honorários Médicos
                </CardTitle>
                <CardDescription>
                  Calcule honorários com base na CBHPM considerando UCO, CH e outros fatores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codigo">Código CBHPM</Label>
                    <Input
                      id="codigo"
                      placeholder="Ex: 40601080"
                      value={calculatorValues.codigo}
                      onChange={(e) => setCalculatorValues(prev => ({ ...prev, codigo: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={calculatorValues.quantidade}
                      onChange={(e) => setCalculatorValues(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="papel">Papel Médico</Label>
                    <Select 
                      value={calculatorValues.papel} 
                      onValueChange={(value) => setCalculatorValues(prev => ({ ...prev, papel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cirurgiao">Cirurgião</SelectItem>
                        <SelectItem value="anestesista">Anestesista</SelectItem>
                        <SelectItem value="primeiro_auxiliar">Primeiro Auxiliar</SelectItem>
                        <SelectItem value="segundo_auxiliar">Segundo Auxiliar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="uco">UCO (Unidade de Custo Operacional)</Label>
                    <Input
                      id="uco"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={calculatorValues.uco}
                      onChange={(e) => setCalculatorValues(prev => ({ ...prev, uco: parseFloat(e.target.value) || 1.0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ch">CH (Coeficiente de Honorários)</Label>
                    <Input
                      id="ch"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={calculatorValues.ch}
                      onChange={(e) => setCalculatorValues(prev => ({ ...prev, ch: parseFloat(e.target.value) || 1.0 }))}
                    />
                  </div>
                </div>

                {calculatorValues.codigo && (
                  <div className="mt-6">
                    {(() => {
                      const result = calculateHonorarios();
                      if (!result) {
                        return (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Código CBHPM não encontrado. Verifique se o código está correto.
                            </AlertDescription>
                          </Alert>
                        );
                      }

                      return (
                        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                          <CardHeader>
                            <CardTitle className="text-green-800 flex items-center gap-2">
                              <DollarSign className="h-5 w-5" />
                              Resultado do Cálculo
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Procedimento:</h4>
                              <p className="text-sm text-gray-700">{result.procedure.procedimento}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Detalhamento:</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Valor base ({getRoleName(calculatorValues.papel)}):</span>
                                    <span>{formatCurrency(result.baseValue)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Quantidade:</span>
                                    <span>{result.breakdown.quantidade}x</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>UCO:</span>
                                    <span>{result.breakdown.uco}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>CH:</span>
                                    <span>{result.breakdown.ch}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <h4 className="font-medium text-gray-900 mb-2">Total Calculado:</h4>
                                <div className="text-3xl font-bold text-green-600">
                                  {formatCurrency(result.total)}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Valor de referência CBHPM
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Orientação Jurídica para Médicos
                </CardTitle>
                <CardDescription>
                  Conheça seus direitos e saiba como proceder em diferentes situações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="legal-case">Selecione seu caso:</Label>
                  <Select value={legalCase} onValueChange={setLegalCase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha a situação que se aplica ao seu caso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glosa_sem_justificativa">Glosa sem justificativa técnica</SelectItem>
                      <SelectItem value="valor_abaixo_cbhpm">Pagamento abaixo dos valores CBHPM</SelectItem>
                      <SelectItem value="atraso_pagamento">Atraso no pagamento de honorários</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {legalCase && (() => {
                  const guidance = getLegalGuidanceForCase(legalCase);
                  if (!guidance) return null;

                  const severityColors = {
                    low: 'border-yellow-200 bg-yellow-50',
                    medium: 'border-orange-200 bg-orange-50',
                    high: 'border-red-200 bg-red-50'
                  };

                  const severityIcons = {
                    low: <Info className="h-5 w-5 text-yellow-600" />,
                    medium: <AlertTriangle className="h-5 w-5 text-orange-600" />,
                    high: <Shield className="h-5 w-5 text-red-600" />
                  };

                  return (
                    <Card className={`border-2 ${severityColors[guidance.severity]}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {severityIcons[guidance.severity]}
                          {guidance.title}
                        </CardTitle>
                        <CardDescription>{guidance.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Base Legal:
                          </h4>
                          <ul className="space-y-1">
                            {guidance.laws.map((law, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                {law}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Ações Recomendadas:
                          </h4>
                          <ul className="space-y-1">
                            {guidance.actions.map((action, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                                  {index + 1}
                                </div>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Importante:</strong> Esta é uma orientação geral. Para casos específicos, 
                            recomenda-se consultar um advogado especializado em Direito Médico ou da Saúde.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contestation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Gerador de Contestação de Glosas
                </CardTitle>
                <CardDescription>
                  Crie documentos fundamentados para contestar glosas de planos de saúde
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contestacao-procedimento">Código CBHPM</Label>
                    <Input
                      id="contestacao-procedimento"
                      placeholder="Ex: 40601080"
                      value={contestationData.procedimento}
                      onChange={(e) => setContestationData(prev => ({ ...prev, procedimento: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contestacao-valor-pago">Valor Pago</Label>
                    <Input
                      id="contestacao-valor-pago"
                      placeholder="R$ 0,00"
                      value={contestationData.valorPago}
                      onChange={(e) => setContestationData(prev => ({ ...prev, valorPago: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contestacao-valor-cbhpm">Valor CBHPM</Label>
                    <Input
                      id="contestacao-valor-cbhpm"
                      placeholder="R$ 0,00"
                      value={contestationData.valorCBHPM}
                      onChange={(e) => setContestationData(prev => ({ ...prev, valorCBHPM: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contestacao-justificativa">Justificativa Técnica</Label>
                  <Textarea
                    id="contestacao-justificativa"
                    placeholder="Descreva a fundamentação técnica para a contestação da glosa..."
                    rows={4}
                    value={contestationData.justificativa}
                    onChange={(e) => setContestationData(prev => ({ ...prev, justificativa: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="contestacao-documentos">Documentos Anexos</Label>
                  <Textarea
                    id="contestacao-documentos"
                    placeholder="Liste os documentos que serão anexados à contestação..."
                    rows={3}
                    value={contestationData.documentos}
                    onChange={(e) => setContestationData(prev => ({ ...prev, documentos: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={generateContestationDocument}
                    disabled={!contestationData.procedimento || !contestationData.justificativa}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Gerar Documento de Contestação
                  </Button>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    O documento gerado deve ser revisado por um profissional jurídico antes do envio. 
                    Sempre mantenha cópias de toda a documentação enviada.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default Comparison;
