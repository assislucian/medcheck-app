import { supabase } from '@/integrations/supabase/client';
import { findProcedureByCodigo, calculateTotalCBHPM } from '@/data/cbhpmData';

interface ContestationParams {
  procedureCode: string;
  procedureDescription: string;
  cbhpmValue: number;
  paidValue: number;
  difference: number;
  role?: string;
  reasonGiven?: string;
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

  // Get response template from database
  const { data: standardResponse, error } = await supabase
    .from('standard_responses')
    .select('*')
    .eq('reason_type', detectedReason)
    .single();

  if (error) {
    console.error('Error fetching standard response:', error);
    return getDefaultResponse(detectedReason);
  }

  const standardResponseText =
    standardResponse?.response_text || getDefaultResponse(detectedReason);

  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Montar texto da contestação
  const contestationText = `
CONTESTAÇÃO DE GLOSA - ${currentDate}

Código do procedimento: ${procedureCode}
Descrição: ${procedureDescription}
Papel profissional: ${role}

Prezados Senhores,

Venho por meio desta contestar a glosa/pagamento inadequado do procedimento acima identificado pelos motivos abaixo:

1. VALOR DE REFERÊNCIA CBHPM 2015:
   Valor estabelecido: R$ ${cbhpmValue.toFixed(2)}
   Valor pago: R$ ${paidValue.toFixed(2)}
   Diferença: R$ ${Math.abs(difference).toFixed(2)} (${difference < 0 ? 'valor inferior ao previsto' : 'valor superior ao previsto'})

2. JUSTIFICATIVA TÉCNICA:
${standardResponseText}

3. FUNDAMENTOS LEGAIS:
   - Resolução Normativa ANS nº 305/2012, que estabelece o padrão obrigatório para Troca de Informações na Saúde Suplementar;
   - Lei nº 13.003/2014, que dispõe sobre os contratos entre operadoras e prestadores de serviço;
   - Classificação Brasileira Hierarquizada de Procedimentos Médicos (CBHPM), edição 2015, utilizada como referência contratual.

Considerando o exposto, solicito a revisão do pagamento e o complemento do valor devido conforme tabela CBHPM 2015, bem como a reanálise do procedimento em questão.

Atenciosamente,

___________________________
Dr(a). 
CRM:
`;

  return contestationText;
};

/**
 * Retorna resposta padrão para um motivo de glosa caso não seja encontrada no banco
 */
const getDefaultResponse = (reason: GlossReason): string => {
  const responses: Record<GlossReason, string> = {
    valor_divergente: `O valor pago está em desacordo com a tabela de referência CBHPM 2015, utilizada como base para precificação dos procedimentos médicos conforme contrato vigente. O valor correto deve incluir o porte do procedimento, custo operacional e porte anestésico quando aplicável.`,

    documento_ausente: `Todos os documentos necessários para comprovação do procedimento foram devidamente enviados no faturamento original, incluindo relatório médico, folha de sala, descrição cirúrgica e ficha anestésica. Anexo novamente nesta contestação todos os documentos pertinentes.`,

    codigo_incorreto: `O código utilizado está correto e em conformidade com a tabela CBHPM 2015. O procedimento realizado corresponde exatamente à descrição do código informado, não havendo justificativa para alteração ou substituição do mesmo.`,

    procedimento_nao_coberto: `O procedimento em questão está coberto pelo contrato vigente e pela regulamentação da ANS para o plano do beneficiário. Não há exclusão contratual ou legal que justifique a não cobertura do procedimento realizado, que possui indicação técnica comprovada.`,

    pacote_servico: `O procedimento contestado não está incluído em nenhum pacote de serviços. Trata-se de procedimento distinto, com código específico na tabela CBHPM, devendo ser pago separadamente conforme valores de referência estabelecidos.`,

    nao_justificado: `A glosa/pagamento inferior ao devido foi realizada sem qualquer justificativa, contrariando o Art. 8º da Lei 13.003/2014, que determina que a operadora deve informar ao prestador o motivo da glosa de forma clara e inequívoca.`,

    outro: `O procedimento foi realizado conforme indicação médica, em conformidade com as melhores práticas e seguindo todos os protocolos técnicos. Não há justificativa técnica ou legal para a glosa/pagamento inferior ao devido.`,
  };

  return responses[reason];
};
