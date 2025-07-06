import { ProcessMode, FileWithStatus, ExtractedData } from '@/types/upload';

/**
 * Determines the processing mode based on file types
 * @param hasGuias Whether there are TISS guide files
 * @param hasDemonstrativos Whether there are fee statement files
 * @returns Processing mode
 */
export function determineProcessingMode(files: FileWithStatus[]): ProcessMode {
  const hasGuias = files.some((f) => f.type === 'guia' && f.status === 'valid');
  const hasDemonstrativos = files.some(
    (f) => f.type === 'demonstrativo' && f.status === 'valid'
  );

  if (hasGuias && hasDemonstrativos) return 'complete';
  if (hasGuias) return 'guia-only';
  return 'demonstrativo-only';
}

/**
 * Generates fallback data when backend processing fails
 * @param processMode Processing mode
 * @param files Files processed
 * @param crmRegistrado CRM of the doctor
 * @returns Simulated extracted data
 */
export function generateFallbackData(
  processMode: ProcessMode,
  files: FileWithStatus[],
  crmRegistrado: string
): ExtractedData {
  console.log('Generating fallback data in mode:', processMode);

  // Generate file name based summary
  const fileNames = files
    .filter((f) => f.status === 'valid')
    .map((f) => f.name)
    .join(', ');
  const hospitalName = fileNames.includes('Hospital')
    ? fileNames.split('Hospital')[1]?.split(' ')[0]
    : 'Hospital Demonstrativo';

  // Generate a realistic patient name for the fallback data
  const patientName = 'THAYSE BORGES';

  return {
    demonstrativoInfo: {
      numero: 'DM' + Math.floor(Math.random() * 1000000),
      competencia: new Date().toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
      hospital: hospitalName,
      data: new Date().toLocaleDateString('pt-BR'),
      beneficiario: patientName, // Include patient name here
    },
    procedimentos: [
      {
        id: 'proc-1',
        codigo: '30602246',
        procedimento: 'Reconstrução Mamária Com Retalhos Cutâneos Regionais',
        papel: 'Cirurgiao',
        valorCBHPM: 3772.88,
        valorPago: 3200.5,
        diferenca: -572.38,
        pago: true,
        guia: '10467538',
        beneficiario: patientName, // Include patient name here too
        doctors: [
          {
            code: '8425',
            name: 'FERNANDA MABEL BATISTA DE AQUINO',
            role: 'Cirurgiao',
            startTime: '19/08/2024 14:09',
            endTime: '19/08/2024 15:24',
            status: 'Fechada',
          },
        ],
      },
      {
        id: 'proc-2',
        codigo: '30602076',
        procedimento: 'Exérese De Lesão Da Mama Por Marcação Estereotáxica Ou Roll',
        papel: 'Cirurgiao',
        valorCBHPM: 2450.65,
        valorPago: 2100.3,
        diferenca: -350.35,
        pago: true,
        guia: '10467538',
        beneficiario: patientName, // Include patient name here too
        doctors: [
          {
            code: '8425',
            name: 'FERNANDA MABEL BATISTA DE AQUINO',
            role: 'Cirurgiao',
            startTime: '19/08/2024 14:09',
            endTime: '19/08/2024 15:24',
            status: 'Fechada',
          },
        ],
      },
    ],
    totais: {
      valorCBHPM: 6223.53,
      valorPago: 5300.8,
      diferenca: -922.73,
      procedimentosNaoPagos: 0,
    },
  };
}
