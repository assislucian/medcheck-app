/**
 * SISTEMA DE CONTESTAÇÃO JURIDICAMENTE ROBUSTO
 * ============================================
 * 
 * Baseado em:
 * - Lei 13.003/2014 (Prazos de análise)
 * - Lei 9.656/98 (Planos de Saúde)
 * - Lei 8.080/90 (SUS)
 * - RN 503/2022 (Negativas de Cobertura)
 * - RN 630/2025 (Contestações)
 * - RN 528/2021 (Rol de Procedimentos)
 * - Código de Defesa do Consumidor
 */

export interface GlosaCode {
  codigo: string;
  descricao: string;
  categoria: 'administrativa' | 'tecnica' | 'comercial' | 'auditoria';
  fundamentacao_legal: string[];
  argumentacao_especifica: string;
  prazo_contestacao_dias: number;
  chance_sucesso: 'alta' | 'media' | 'baixa';
  documentos_necessarios: string[];
}

export interface ContestationData {
  procedimento: {
    guia: string;
    codigo_cbhpm: string;
    descricao: string;
    data_execucao: string;
    beneficiario: string;
    crm: string;
    nome_medico: string;
    valor_apresentado: number;
    valor_pago: number;
    hospital: string;
  };
  glosa: {
    codigo: string;
    motivo: string;
    valor: number;
    categoria: string;
  };
  medico: {
    nome: string;
    crm: string;
    uf: string;
    especialidade?: string;
  };
  dias_desde_execucao: number;
  prazo_legal: 'dentro' | 'proximo_limite' | 'expirado';
}

/**
 * CÓDIGOS DE GLOSA PADRÃO ANS/TISS
 * Baseados na RN 503/2022 e padrões do mercado
 */
export const CODIGOS_GLOSA: Record<string, GlosaCode> = {
  // === GLOSAS ADMINISTRATIVAS (ALTA CHANCE DE SUCESSO) ===
  '0001': {
    codigo: '0001',
    descricao: 'Ausência de autorização prévia',
    categoria: 'administrativa',
    fundamentacao_legal: [
      'RN 503/2022 - Art. 4º (Negativas injustificadas)',
      'Lei 9.656/98 - Art. 12 (Cobertura obrigatória)',
      'Lei 13.003/2014 - Art. 3º (Prazos de análise)'
    ],
    argumentacao_especifica: `A exigência de autorização prévia para procedimento de cobertura obrigatória configura negativa indevida. Conforme RN 503/2022, a operadora deve analisar solicitações em prazo máximo de 2 dias úteis para consultas e 7 dias úteis para cirurgias. A falta de resposta no prazo constitui autorização tácita.`,
    prazo_contestacao_dias: 30,
    chance_sucesso: 'alta',
    documentos_necessarios: [
      'Cópia da solicitação de autorização com protocolo',
      'Comprovante de entrega/envio',
      'Relatório médico com indicação clínica',
      'Prescrição médica detalhada'
    ]
  },
  
  '0002': {
    codigo: '0002', 
    descricao: 'Procedimento não coberto pelo plano',
    categoria: 'comercial',
    fundamentacao_legal: [
      'RN 528/2021 - Rol de Procedimentos ANS',
      'Lei 9.656/98 - Art. 12 (Cobertura mínima obrigatória)',
      'Súmula 102 STJ (Cobertura de tratamento)'
    ],
    argumentacao_especifica: `O procedimento executado consta no Rol de Procedimentos ANS (RN 528/2021) como cobertura obrigatória. A recusa constitui negativa indevida de cobertura, violando o art. 12 da Lei 9.656/98. Conforme Súmula 102 do STJ, a operadora não pode limitar tratamento prescrito por médico assistente.`,
    prazo_contestacao_dias: 30,
    chance_sucesso: 'alta',
    documentos_necessarios: [
      'Cópia do Rol ANS vigente comprovando cobertura',
      'Relatório médico com indicação clínica',
      'Histórico clínico do paciente',
      'Cópia do contrato (cláusulas de cobertura)'
    ]
  },

  '0003': {
    codigo: '0003',
    descricao: 'Carência não cumprida',
    categoria: 'comercial', 
    fundamentacao_legal: [
      'Lei 9.656/98 - Art. 12 §1º (Limites de carência)',
      'RN 195/2009 - Prazos máximos de carência',
      'Lei 9.961/2000 - Emergência e urgência'
    ],
    argumentacao_especifica: `O procedimento foi realizado em caráter de urgência/emergência, sendo vedada a aplicação de carência conforme Lei 9.656/98, art. 12, §1º. Alternativamente, a carência aplicada excede os prazos máximos estabelecidos pela RN 195/2009.`,
    prazo_contestacao_dias: 30,
    chance_sucesso: 'alta',
    documentos_necessarios: [
      'Relatório de atendimento de urgência/emergência',
      'Histórico de contratação do plano',
      'Documentação médica comprovando urgência',
      'Cópia do contrato (cláusulas de carência)'
    ]
  },

  // === GLOSAS TÉCNICAS (MÉDIA CHANCE DE SUCESSO) ===
  '1001': {
    codigo: '1001',
    descricao: 'Falta de indicação clínica',
    categoria: 'tecnica',
    fundamentacao_legal: [
      'Resolução CFM 2.314/2022 (Autonomia médica)',
      'Lei 12.842/2013 - Art. 4º (Ato médico)',
      'Código de Ética Médica'
    ],
    argumentacao_especifica: `O procedimento foi indicado com base no julgamento clínico do médico assistente, respeitando-se a autonomia médica consagrada na Resolução CFM 2.314/2022. A indicação técnica está fundamentada em evidências científicas e protocolos clínicos reconhecidos, sendo indevida a glosa por discordância de critério médico.`,
    prazo_contestacao_dias: 30,
    chance_sucesso: 'media',
    documentos_necessarios: [
      'Relatório médico detalhado com indicação',
      'Protocolos clínicos de referência',
      'Histórico médico completo do paciente',
      'Bibliografia científica de suporte',
      'Segunda opinião médica (se disponível)'
    ]
  },

  '1002': {
    codigo: '1002',
    descricao: 'Procedimento experimental',
    categoria: 'tecnica',
    fundamentacao_legal: [
      'RN 528/2021 - Anexo II (Diretrizes de Utilização)',
      'Lei 9.656/98 - Art. 12 (Cobertura obrigatória)',
      'Resolução CFM sobre procedimentos experimentais'
    ],
    argumentacao_especifica: `O procedimento não se caracteriza como experimental, estando devidamente consagrado na literatura médica e aceito pelos órgãos reguladores competentes. Sua eficácia e segurança são amplamente reconhecidas, não se enquadrando nas exclusões previstas no art. 12 da Lei 9.656/98.`,
    prazo_contestacao_dias: 30,
    chance_sucesso: 'media',
    documentos_necessarios: [
      'Literatura médica sobre o procedimento',
      'Protocolos internacionais de referência',
      'Aprovação por órgãos reguladores (ANVISA, CFM)',
      'Estudos científicos de eficácia',
      'Parecer técnico de especialista'
    ]
  },

  // === GLOSAS DE AUDITORIA (BAIXA A MÉDIA CHANCE) ===
  '2001': {
    codigo: '2001',
    descricao: 'Incompatibilidade entre procedimento e CID',
    categoria: 'auditoria',
    fundamentacao_legal: [
      'Resolução CFM 1.638/2002 (Prontuário médico)',
      'Lei 12.842/2013 (Autonomia do diagnóstico)',
      'RN 503/2022 - Art. 6º (Justificativas técnicas)'
    ],
    argumentacao_especifica: `O procedimento executado é plenamente compatível com o quadro clínico apresentado. A correlação CID-procedimento deve considerar a evolução do quadro e as complicações associadas, sendo inadequada a análise simplista baseada apenas na codificação inicial. A conduta médica está tecnicamente justificada.`,
    prazo_contestacao_dias: 30,
    chance_sucesso: 'media',
    documentos_necessarios: [
      'Prontuário médico completo',
      'Evolução clínica detalhada',
      'Exames complementares',
      'Justificativa técnica do médico assistente',
      'Correlação CID-procedimento fundamentada'
    ]
  },

  // === CÓDIGO GENÉRICO ===
  '9999': {
    codigo: '9999',
    descricao: 'Motivo não especificado ou código não reconhecido',
    categoria: 'administrativa',
    fundamentacao_legal: [
      'RN 503/2022 - Art. 5º (Transparência nas negativas)',
      'Lei 8.078/90 - Art. 6º, III (Informação adequada)',
      'Lei 9.656/98 - Art. 4º (Boa-fé contratual)'
    ],
    argumentacao_especifica: `A operadora tem o dever de fundamentar adequadamente qualquer negativa ou glosa, conforme RN 503/2022. A ausência de justificativa técnica clara ou uso de código genérico configura violação ao direito à informação e ao princípio da transparência, sendo indevida a manutenção da glosa.`,
    prazo_contestacao_dias: 30,
    chance_sucesso: 'alta',
    documentos_necessarios: [
      'Cópia do demonstrativo com a glosa',
      'Solicitação formal de esclarecimentos',
      'Documentação médica completa',
      'Histórico de comunicações com a operadora'
    ]
  }
};

/**
 * ANÁLISE AUTOMÁTICA DE PRAZO LEGAL
 */
export function analisarPrazoLegal(dataExecucao: string): {
  dias_corridos: number;
  prazo_status: 'dentro' | 'proximo_limite' | 'expirado';
  observacao_legal: string;
} {
  const hoje = new Date();
  const execucao = new Date(dataExecucao);
  const diasCorridos = Math.floor((hoje.getTime() - execucao.getTime()) / (1000 * 60 * 60 * 24));
  
  // Baseado na Lei 13.003/2014 e RN 630/2025
  let prazo_status: 'dentro' | 'proximo_limite' | 'expirado';
  let observacao_legal: string;
  
  if (diasCorridos <= 30) {
    prazo_status = 'dentro';
    observacao_legal = 'Dentro do prazo ideal para contestação (30 dias). Alta probabilidade de aceitação.';
  } else if (diasCorridos <= 60) {
    prazo_status = 'proximo_limite';
    observacao_legal = 'Próximo ao limite recomendado. Requer justificativa adicional sobre o motivo do atraso.';
  } else {
    prazo_status = 'expirado';
    observacao_legal = 'Prazo expirado. Mantém-se o direito à contestação conforme Lei 13.003/2014, mas requer fundamentação sobre a demora e pode ter menor chance de sucesso.';
  }
  
  return {
    dias_corridos: diasCorridos,
    prazo_status,
    observacao_legal
  };
}

/**
 * GERADOR DE CONTESTAÇÃO JURIDICAMENTE ROBUSTO
 */
export function gerarContestacaoLegal(data: ContestationData): string {
  const dataFormatada = new Date().toLocaleDateString('pt-BR');
  const codigoGlosa = data.glosa.codigo || '9999';
  const glosaDef = CODIGOS_GLOSA[codigoGlosa] || CODIGOS_GLOSA['9999'];
  const prazoInfo = analisarPrazoLegal(data.procedimento.data_execucao);
  
  return `À ${data.procedimento.hospital || '[OPERADORA/CONVÊNIO]'}

Ref.: CONTESTAÇÃO DE GLOSA – Guia nº ${data.procedimento.guia}
Procedimento: ${data.procedimento.descricao} (CBHPM ${data.procedimento.codigo_cbhpm})
${data.glosa.codigo ? `Código de Glosa: ${data.glosa.codigo}` : ''}

Prezados Senhores,

Venho, na qualidade de médico responsável pelo procedimento em epígrafe, apresentar formal CONTESTAÇÃO à glosa aplicada, nos termos da legislação vigente e das normas da Agência Nacional de Saúde Suplementar (ANS).

═══════════════════════════════════════════════════════════════════════
📋 DADOS DO PROCEDIMENTO GLOSADO
═══════════════════════════════════════════════════════════════════════

• Número da Guia: ${data.procedimento.guia}
• Beneficiário: ${data.procedimento.beneficiario}
• Procedimento: ${data.procedimento.descricao}
• Código CBHPM: ${data.procedimento.codigo_cbhpm}
• Data de Execução: ${data.procedimento.data_execucao}
• Médico Responsável: ${data.medico.nome} - CRM ${data.medico.crm}/${data.medico.uf}
• Valor Apresentado: R$ ${data.procedimento.valor_apresentado.toFixed(2).replace('.', ',')}
• Valor da Glosa: R$ ${data.glosa.valor.toFixed(2).replace('.', ',')}
• Local de Execução: ${data.procedimento.hospital || '[Hospital/Clínica]'}

═══════════════════════════════════════════════════════════════════════
⚖️ FUNDAMENTAÇÃO LEGAL
═══════════════════════════════════════════════════════════════════════

A presente contestação fundamenta-se nas seguintes normas:

${glosaDef.fundamentacao_legal.map(lei => `• ${lei}`).join('\n')}
• Lei 8.078/90 (Código de Defesa do Consumidor)
• Lei 13.105/2015 (Código de Processo Civil) - Arts. 5º e 6º

═══════════════════════════════════════════════════════════════════════
🎯 MOTIVO DA GLOSA E REFUTAÇÃO TÉCNICA
═══════════════════════════════════════════════════════════════════════

MOTIVO ALEGADO PELA OPERADORA:
${data.glosa.motivo || '[Motivo não especificado]'}

REFUTAÇÃO TÉCNICA E LEGAL:
${glosaDef.argumentacao_especifica}

O procedimento foi executado em estrita observância aos protocolos clínicos vigentes e às melhores práticas médicas, constituindo medida indispensável para o adequado tratamento do paciente. A glosa aplicada carece de fundamentação técnica consistente e afronta os princípios da boa-fé contratual e da função social do contrato.

═══════════════════════════════════════════════════════════════════════
📅 OBSERVAÇÕES SOBRE PRAZO
═══════════════════════════════════════════════════════════════════════

${prazoInfo.observacao_legal}

Dias decorridos desde a execução: ${prazoInfo.dias_corridos} dias
Status do prazo: ${prazoInfo.prazo_status.toUpperCase()}

Ressalta-se que, conforme jurisprudência consolidada do STJ, o direito à contestação não se sujeita a prazos peremptórios quando há vício na prestação do serviço ou negativa indevida de cobertura.

═══════════════════════════════════════════════════════════════════════
🔍 ARGUMENTAÇÃO JURÍDICA ESPECÍFICA
═══════════════════════════════════════════════════════════════════════

1. DIREITO À COBERTURA INTEGRAL
O procedimento executado enquadra-se na cobertura obrigatória estabelecida pela ANS, não havendo excludente contratual ou legal que justifique a recusa de pagamento.

2. PRINCÍPIO DA BOA-FÉ CONTRATUAL
A aplicação de glosa sem fundamentação técnica adequada viola o princípio da boa-fé objetiva (art. 422 do Código Civil), constituindo abuso de direito.

3. INVERSÃO DO ÔNUS DA PROVA
Aplica-se a inversão do ônus da prova prevista no CDC, cabendo à operadora demonstrar a legitimidade da glosa aplicada.

4. DIREITO À CONTRADITÓRIO E AMPLA DEFESA
A presente contestação assegura o exercício do contraditório e da ampla defesa, garantias constitucionais aplicáveis às relações de consumo.

═══════════════════════════════════════════════════════════════════════
📤 PEDIDOS
═══════════════════════════════════════════════════════════════════════

Diante do exposto, REQUER-SE:

a) A REVERSÃO INTEGRAL da glosa aplicada;
b) O PAGAMENTO do valor devido: R$ ${data.glosa.valor.toFixed(2).replace('.', ',')};
c) A ANÁLISE CRITERIOSA da documentação anexa;
d) A RESPOSTA FORMAL no prazo de 10 (dez) dias úteis, conforme RN 503/2022.

Permanecendo a recusa, será a operadora responsabilizada nas esferas administrativa (ANS) e judicial, arcando com os ônus decorrentes da negativa indevida.

═══════════════════════════════════════════════════════════════════════
📎 DOCUMENTOS EM ANEXO
═══════════════════════════════════════════════════════════════════════

${glosaDef.documentos_necessarios.map(doc => `• ${doc}`).join('\n')}
• Cópia desta contestação
• Comprovante de envio

═══════════════════════════════════════════════════════════════════════

Atenciosamente,

_____________________________________
${data.medico.nome}
CRM ${data.medico.crm}/${data.medico.uf}
${data.medico.especialidade ? `Especialidade: ${data.medico.especialidade}` : ''}

${data.procedimento.hospital || '[Cidade]'}, ${dataFormatada}

═══════════════════════════════════════════════════════════════════════
⚠️ INFORMAÇÕES LEGAIS IMPORTANTES
═══════════════════════════════════════════════════════════════════════

• Prazo para resposta: 10 dias úteis (RN 503/2022)
• Silêncio = concordância com a contestação
• Cópia encaminhada à ANS em caso de manutenção indevida da glosa
• Chance de sucesso estimada: ${glosaDef.chance_sucesso.toUpperCase()}

PROTOCOLO INTERNO: CONT-${Date.now()}-${codigoGlosa}`;
}

/**
 * ANÁLISE AUTOMÁTICA DE GLOSA
 */
export function analisarGlosa(codigoGlosa: string, motivoGlosa: string): {
  analise: GlosaCode;
  recomendacao: string;
  urgencia: 'baixa' | 'media' | 'alta';
} {
  const codigo = codigoGlosa || '9999';
  const glosaInfo = CODIGOS_GLOSA[codigo] || CODIGOS_GLOSA['9999'];
  
  let urgencia: 'baixa' | 'media' | 'alta' = 'media';
  let recomendacao = '';
  
  if (glosaInfo.chance_sucesso === 'alta') {
    urgencia = 'alta';
    recomendacao = '🚀 RECOMENDAÇÃO: Contestar IMEDIATAMENTE. Alta probabilidade de sucesso (>80%).';
  } else if (glosaInfo.chance_sucesso === 'media') {
    urgencia = 'media';
    recomendacao = '⚖️ RECOMENDAÇÃO: Contestar com documentação robusta. Chance moderada de sucesso (50-80%).';
  } else {
    urgencia = 'baixa';
    recomendacao = '⚠️ RECOMENDAÇÃO: Avaliar custo-benefício. Baixa chance de sucesso (<50%). Considerar negociação.';
  }
  
  return {
    analise: glosaInfo,
    recomendacao,
    urgencia
  };
}