import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch unpaid procedures and glosas from the database
 * This combines procedures from guias that don't appear in demonstrativos (not paid)
 * and procedures that appear as glosas in demonstrativos
 */
export async function fetchUnpaidProcedures() {
  try {
    // In a real implementation, this would make a database query to get:
    // 1. Procedures that appear in guides but not in demonstrativos (not paid)
    // 2. Procedures that appear in demonstrativos as glosas

    // For now, we'll return mock data
    return getMockUnpaidProcedures();
  } catch (error) {
    console.error('Error fetching unpaid procedures:', error);
    throw error;
  }
}

/**
 * Mock data function - this would be replaced with actual database queries in production
 */
function getMockUnpaidProcedures() {
  return [
    {
      id: 'u1',
      guia: '10714706',
      dataExecucao: '05/09/2024',
      codigoProcedimento: '30602289',
      descricaoProcedimento: 'Ressecção Do Linfonodo Sentinela / Torácica Lateral',
      beneficiario: 'NUBIA KATIA PEREIRA MARQUES',
      prestador: 'LIGA NORTERIOG CANCER POLICLINIC',
      papel: 'Cirurgiao',
      valorCBHPM: 167.68,
      valorPago: 0,
      diferenca: 167.68,
      motivoGlosa: 'Credenciado não habilitado a realizar o procedimento',
      tipo: 'glosa' as const,
      status: 'pendente' as const,
      doctors: [
        {
          role: 'Anestesista',
          crm: '7897',
          name: 'DIEGO HERBERT DUARTE DA SILVA',
          startTime: '05/09/2024 18:38',
          endTime: '05/09/2024 22:15',
          status: 'Fechada',
        },
        {
          role: 'Cirurgiao',
          crm: '7546',
          name: 'ANA BEATRIZ OLIVEIRA GERMANO',
          startTime: '05/09/2024 18:10',
          endTime: '05/09/2024 22:15',
          status: 'Fechada',
        },
        {
          role: 'Primeiro Auxiliar',
          crm: '6091',
          name: 'MOISES DE OLIVEIRA SCHOTS',
          startTime: '05/09/2024 18:11',
          endTime: '05/09/2024 22:25',
          status: 'Fechada',
        },
      ],
    },
    {
      id: 'u2',
      guia: '10507705',
      dataExecucao: '21/08/2024',
      codigoProcedimento: '30602246',
      descricaoProcedimento: 'Reconstrução Mamária Com Retalhos Cutâneos Regionais',
      beneficiario: 'RODRIGO BERNARDO CIR',
      prestador: 'LIGA NORTERIOG CANCER POLICLINIC',
      papel: 'Primeiro Auxiliar',
      valorCBHPM: 228.82,
      valorPago: 0,
      diferenca: 228.82,
      tipo: 'nao_pago' as const,
      status: 'contestado' as const,
      doctors: [
        {
          role: 'Anestesista',
          crm: '7897',
          name: 'DIEGO HERBERT DUARTE DA SILVA',
          startTime: '21/08/2024 10:15',
          endTime: '21/08/2024 12:45',
          status: 'Fechada',
        },
        {
          role: 'Cirurgiao',
          crm: '6091',
          name: 'MOISES DE OLIVEIRA SCHOTS',
          startTime: '21/08/2024 10:00',
          endTime: '21/08/2024 13:00',
          status: 'Fechada',
        },
      ],
    },
    {
      id: 'u3',
      guia: '10696456',
      dataExecucao: '04/09/2024',
      codigoProcedimento: '30602076',
      descricaoProcedimento: 'Exérese De Lesão Da Mama Por Marcação Estereotáxica',
      beneficiario: 'NOIVANA CAVALCANTI D',
      prestador: 'LIGA NORTERIOG CANCER POLICLINIC',
      papel: 'Cirurgiao',
      valorCBHPM: 1117.84,
      valorPago: 950.5,
      diferenca: 167.34,
      motivoGlosa: 'Valor excede tabela de referência do convênio',
      tipo: 'glosa' as const,
      status: 'recuperado' as const,
    },
    {
      id: 'u4',
      guia: '10696456',
      dataExecucao: '04/09/2024',
      codigoProcedimento: '30602203',
      descricaoProcedimento: 'Quadrantectomia Ressecção Segmentar',
      beneficiario: 'NOIVANA CAVALCANTI D',
      prestador: 'LIGA NORTERIOG CANCER POLICLINIC',
      papel: 'Cirurgiao',
      valorCBHPM: 521.91,
      valorPago: 0,
      diferenca: 521.91,
      tipo: 'nao_pago' as const,
      status: 'pendente' as const,
    },
    {
      id: 'u5',
      guia: '10467538',
      dataExecucao: '19/08/2024',
      codigoProcedimento: '30602076',
      descricaoProcedimento: 'Exérese De Lesão Da Mama Por Marcação Estereotáxica',
      beneficiario: 'THAYSE BORGES',
      prestador: 'LIGA NORTERIOG CANCER POLICLINIC',
      papel: 'Primeiro Auxiliar',
      valorCBHPM: 167.68,
      valorPago: 100.0,
      diferenca: 67.68,
      motivoGlosa: 'Ajuste de valor conforme contrato',
      tipo: 'glosa' as const,
      status: 'pendente' as const,
    },
  ];
}
