import cbhpmTableJson from './cbhpmTable.json';

export interface CBHPMProcedure {
  codigo: string | number;
  procedimento: string;
  valor_cirurgiao?: number;
  valor_anestesista?: number;
  valor_primeiro_auxiliar?: number;
}

export const cbhpmTable: CBHPMProcedure[] = cbhpmTableJson as CBHPMProcedure[];

export const findProcedureByCodigo = (
  codigo: string | number
): CBHPMProcedure | undefined => {
  return cbhpmTable.find((proc) => String(proc.codigo) === String(codigo));
};

export const calculateTotalCBHPM = (
  procedure: CBHPMProcedure,
  papel?: string
): number => {
  if (!procedure) return 0;
  if (papel?.toLowerCase().includes('anest')) return procedure.valor_anestesista || 0;
  if (papel?.toLowerCase().includes('aux'))
    return procedure.valor_primeiro_auxiliar || 0;
  return procedure.valor_cirurgiao || 0;
};
