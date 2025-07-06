export type FileType = 'guia' | 'demonstrativo';
export type ProcessingStage =
  | 'idle'
  | 'extracting'
  | 'analyzing'
  | 'comparing'
  | 'complete'
  | 'uploading'
  | 'error';
export type FileStatus = 'valid' | 'invalid' | 'processing';
export type ProcessMode = 'complete' | 'guia-only' | 'demonstrativo-only';

export interface FileWithStatus {
  id?: string;
  name: string;
  type: FileType;
  file: File;
  status?: FileStatus;
}

export interface DoctorParticipation {
  code: string;
  name: string;
  role: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface ProcedureExtracted {
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
  doctors: DoctorParticipation[];
}

export interface Honorarios {
  totalApresentado: number;
  totalAprovado: number;
  totalGlosa: number;
  totalProcedimentos: number;
}

export interface Periodo {
  inicio: string;
  fim: string;
}

export interface DemonstrativoInfo {
  numero: string;
  competencia: string;
  hospital: string;
  data: string;
  beneficiario: string;
  honorarios?: Honorarios;
  periodo?: Periodo;
}

export interface ProcessingTotals {
  valorCBHPM: number;
  valorPago: number;
  diferenca: number;
  procedimentosNaoPagos: number;
}

export interface ExtractedData {
  demonstrativoInfo: DemonstrativoInfo;
  procedimentos: ProcedureExtracted[];
  totais: ProcessingTotals;
}
