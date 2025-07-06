import { ProcedureData } from './supabase/procedureHelpers';

/**
 * Types for the comparison fallback module
 */
interface ProcedureComparison {
  id: string;
  codigo: string;
  procedimento: string;
  papel: string;
  valorCBHPM: number;
  valorPago: number;
  diferenca: number;
  pago: boolean;
  guia: string;
  beneficiario: string;
}

interface SummaryResult {
  total: number;
  conforme: number;
  abaixo: number;
  acima: number;
  valorCBHPM: number;
  valorPago: number;
  diferenca: number;
  naoPagos: number;
}

// Define a mapping between our types
interface ProcedureMappedData extends ProcedureData {
  procedimento: string;
  papel: string;
  valor_cbhpm: number;
  valor_pago: number;
  diferenca: number;
  pago: boolean;
  guia: string;
  beneficiario: string;
}

/**
 * Get fallback data for CBHPM comparison
 * @param proceduresData Optional procedures data to use
 * @returns Mapped procedures data for comparison
 */
export function getFallbackComparisonData(
  proceduresData?: any[]
): ProcedureComparison[] {
  // If we have procedures data, use it
  if (proceduresData && proceduresData.length > 0) {
    // Map the data to ensure it matches the expected format
    return proceduresData.map((proc) => {
      // Type assertion to ensure we have the expected fields
      const mappedProc = proc as ProcedureMappedData;

      return {
        id: mappedProc.id,
        codigo: mappedProc.codigo || '',
        procedimento: mappedProc.procedimento || '',
        papel: mappedProc.papel || '',
        valorCBHPM: mappedProc.valor_cbhpm || 0,
        valorPago: mappedProc.valor_pago || 0,
        diferenca: mappedProc.diferenca || 0,
        pago: mappedProc.pago || false,
        guia: mappedProc.guia || '',
        beneficiario: mappedProc.beneficiario || '',
      };
    });
  }

  // Otherwise, generate fallback data
  return [
    {
      id: '1',
      codigo: '31309054',
      procedimento: 'Laparotomia exploradora',
      papel: 'Cirurgião',
      valorCBHPM: 562.3,
      valorPago: 468.6,
      diferenca: -93.7,
      pago: true,
      guia: 'G123456',
      beneficiario: 'João da Silva',
    },
    {
      id: '2',
      codigo: '30715016',
      procedimento: 'Angioplastia transluminal',
      papel: 'Auxiliar',
      valorCBHPM: 320.4,
      valorPago: 280.0,
      diferenca: -40.4,
      pago: true,
      guia: 'G123457',
      beneficiario: 'Maria Oliveira',
    },
    {
      id: '3',
      codigo: '32301065',
      procedimento: 'Cirurgia de catarata',
      papel: 'Cirurgião',
      valorCBHPM: 480.0,
      valorPago: 0,
      diferenca: -480.0,
      pago: false,
      guia: 'G123458',
      beneficiario: 'Antonio Pereira',
    },
  ];
}

/**
 * Calculates summary statistics for CBHPM comparisons
 * @param procedimentos Array of procedure comparisons
 * @returns Summary statistics
 */
export function calculateCBHPMSummary(
  procedimentos: ProcedureComparison[]
): SummaryResult {
  const total = procedimentos.length;
  let conforme = 0;
  let abaixo = 0;
  let acima = 0;
  let valorCBHPM = 0;
  let valorPago = 0;
  let naoPagos = 0;

  procedimentos.forEach((proc) => {
    valorCBHPM += proc.valorCBHPM;
    valorPago += proc.valorPago;

    if (Math.abs(proc.diferenca) < 0.01) {
      conforme++;
    } else if (proc.diferenca < 0) {
      abaixo++;
    } else {
      acima++;
    }

    if (!proc.pago) {
      naoPagos++;
    }
  });

  const diferenca = valorCBHPM - valorPago;

  return {
    total,
    conforme,
    abaixo,
    acima,
    valorCBHPM,
    valorPago,
    diferenca,
    naoPagos,
  };
}
