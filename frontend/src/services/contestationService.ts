import { findProcedureByCodigo, calculateTotalCBHPM } from '@/data/cbhpmData';

interface ContestationParams {
  procedureCode: string;
  procedureDescription: string;
  cbhpmValue: number;
  paidValue: number;
  difference: number;
  role?: string;
  reasonGiven?: string;
  daysSince?: number;
  patientName?: string;
  guideNumber?: string;
}

export type GlossReason =
  | 'valor_divergente'
  | 'documento_ausente'
  | 'codigo_incorreto'
  | 'procedimento_nao_coberto'
  | 'pacote_servico'
  | 'nao_justificado'
  | 'outro';

/**
 * Gera texto de contestação para um procedimento baseado nos valores da CBHPM
 */
export const generateContestation = async (
  params: ContestationParams
): Promise<string> => {
  const {
    procedureCode,
    procedureDescription,
    cbhpmValue,
    paidValue,
    difference,
    role = 'Cirurgião',
    reasonGiven,
    daysSince = 0,
    patientName,
    guideNumber,
  } = params;

  // Encontrar procedimento na tabela CBHPM para obter dados detalhados
  const cbhpmProcedure = findProcedureByCodigo(procedureCode);

  // Tentar identificar o motivo da glosa
  let detectedReason: GlossReason = 'valor_divergente';

  if (paidValue === 0) {
    detectedReason = 'procedimento_nao_coberto';
  } else if (reasonGiven?.toLowerCase().includes('document')) {
    detectedReason = 'documento_ausente';
  } else if (
    reasonGiven?.toLowerCase().includes('pacote') ||
    reasonGiven?.toLowerCase().includes('bundle')
  ) {
    detectedReason = 'pacote_servico';
  } else if (reasonGiven?.toLowerCase().includes('cod')) {
    detectedReason = 'codigo_incorreto';
  } else if (!reasonGiven) {
    detectedReason = 'nao_justificado';
  }

  // Usar resposta padrão baseada no motivo detectado
  const standardResponseText = getDefaultResponse(detectedReason);

  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Montar texto da contestação com contexto médico brasileiro
  const urgencyText = daysSince > 90 ? 'CRÍTICA' : daysSince > 60 ? 'URGENTE' : daysSince > 30 ? 'EXPIRADA' : 'NORMAL';
  const patientInfo = patientName ? `\nPaciente: ${patientName}` : '';
  const guideInfo = guideNumber ? `\nGuia: ${guideNumber}` : '';
  
  const contestationText = `CONTESTAÇÃO DE GLOSA - ${urgencyText} - ${currentDate}

=== IDENTIFICAÇÃO DO PROCEDIMENTO ===
Código CBHPM: ${procedureCode}
Descrição: ${procedureDescription}
Papel Médico: ${role}${patientInfo}${guideInfo}
Tempo sem pagamento: ${daysSince} dias

Prezados Senhores,

Venho por meio desta CONTESTAR FORMALMENTE a glosa/pagamento inadequado do procedimento acima identificado, conforme fundamentos técnicos e legais abaixo:

=== 1. ANÁLISE FINANCEIRA ===
• Valor CBHPM 2015 (Referência Contratual): R$ ${cbhpmValue.toFixed(2)}
• Valor efetivamente pago: R$ ${paidValue.toFixed(2)}
• Prejuízo ao prestador: R$ ${Math.abs(difference).toFixed(2)}
• Percentual de glosa: ${cbhpmValue > 0 ? ((Math.abs(difference) / cbhpmValue) * 100).toFixed(1) : '100'}%

=== 2. CONTEXTO TEMPORAL ===
O procedimento foi realizado há ${daysSince} dias e permanece ${paidValue === 0 ? 'TOTALMENTE GLOSADO' : 'COM PAGAMENTO INSUFICIENTE'}, caracterizando ${daysSince > 30 ? 'DESCUMPRIMENTO DO PRAZO LEGAL DE 30 DIAS' : 'situação irregular'} para liberação de pagamentos médicos.

=== 3. JUSTIFICATIVA TÉCNICA ===
${standardResponseText}

=== 4. FUNDAMENTOS LEGAIS ===
• Lei nº 13.003/2014 - Art. 8º: Obrigação de justificar glosas de forma clara;
• RN ANS nº 305/2012: Padrão TISS para troca de informações;
• RN ANS nº 259/2011: Prazo de 30 dias para pagamento de procedimentos;
• CBHPM 2015: Tabela de referência contratual para precificação.

=== 5. SOLICITAÇÃO ===
Diante do exposto, REQUEIRO:
1. REVISÃO IMEDIATA da glosa aplicada;
2. PAGAMENTO INTEGRAL do valor devido: R$ ${Math.abs(difference).toFixed(2)};
3. REGULARIZAÇÃO do processo para evitar novos atrasos;
4. CONFIRMAÇÃO por escrito da liberação do pagamento.

${daysSince > 30 ? `**ATENÇÃO: Esta contestação encontra-se ${daysSince > 60 ? "FORA DO PRAZO REGULAMENTAR" : "NO LIMITE DO PRAZO"}, mas é apresentada com base no direito ao pagamento integral.**` : ''}

Atenciosamente,

___________________________
Dr(a). [NOME DO MÉDICO]
CRM: [NÚMERO] - [UF]
Especialidade: [ESPECIALIDADE]
Data: ${currentDate}

OBS: Mantenho cópia desta contestação para controle e eventual acionamento dos órgãos competentes.`;

  return contestationText;
};

/**
 * Retorna resposta padrão para um motivo de glosa caso não seja encontrada no banco
 */
const getDefaultResponse = (reason: GlossReason): string => {
  const responses: Record<GlossReason, string> = {
    valor_divergente: `O valor pago está em desacordo com a tabela de referência CBHPM 2015, utilizada como base para precificação dos procedimentos médicos conforme contrato vigente. O valor correto deve incluir o porte do procedimento, custo operacional e porte anestésico quando aplicável. A diferença constitui prejuízo direto ao prestador e configura descumprimento contratual.`,

    documento_ausente: `Todos os documentos necessários para comprovação do procedimento foram devidamente enviados no faturamento original, incluindo relatório médico detalhado, folha de sala cirúrgica, descrição operatória completa e ficha anestésica. A documentação comprova a necessidade técnica e a correta execução do procedimento. Anexo novamente nesta contestação todos os documentos pertinentes para reanálise.`,

    codigo_incorreto: `O código CBHPM utilizado está CORRETO e em total conformidade com a tabela CBHPM 2015 vigente. O procedimento realizado corresponde EXATAMENTE à descrição técnica do código informado, não havendo qualquer justificativa médica ou administrativa para alteração ou substituição do mesmo. A codificação foi realizada por profissional qualificado seguindo os critérios técnicos estabelecidos.`,

    procedimento_nao_coberto: `O procedimento em questão está EXPRESSAMENTE COBERTO pelo contrato vigente e pela regulamentação da ANS para o plano do beneficiário. Não há exclusão contratual, legal ou regulamentar que justifique a não cobertura do procedimento realizado. O procedimento possui indicação técnica comprovada, está incluso no rol de procedimentos da ANS e foi executado seguindo todas as normas técnicas aplicáveis.`,

    pacote_servico: `O procedimento contestado NÃO ESTÁ INCLUÍDO em nenhum pacote de serviços ou bundle. Trata-se de procedimento DISTINTO E INDEPENDENTE, com código específico na tabela CBHPM, portador de porte próprio e complexidade técnica individual. Deve ser pago SEPARADAMENTE conforme valores de referência estabelecidos na tabela contratual, não podendo ser absorvido por outros procedimentos.`,

    nao_justificado: `A glosa aplicada foi realizada SEM QUALQUER JUSTIFICATIVA TÉCNICA OU ADMINISTRATIVA, contrariando frontalmente o Art. 8º da Lei 13.003/2014, que determina de forma OBRIGATÓRIA que a operadora informe ao prestador o motivo específico da glosa de forma clara, detalhada e inequívoca. A ausência de justificativa constitui irregularidade grave e impossibilita a defesa do prestador.`,

    outro: `O procedimento foi realizado conforme rigorosa indicação médica, em total conformidade com as melhores práticas médicas estabelecidas e seguindo integralmente todos os protocolos técnicos e científicos aplicáveis. A execução seguiu padrões de excelência técnica e foi devidamente documentada. Não há justificativa técnica, científica ou legal para a glosa aplicada, caracterizando prejuízo injustificado ao prestador.`,
  };

  return responses[reason];
};