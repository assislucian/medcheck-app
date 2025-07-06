/**
 * Types for the export services
 */

import { HistoryItem } from '@/components/history/data';

/**
 * Report data structure for Excel reports
 */
export interface ReportData {
  /** Period covered by the report (e.g., "January 2025") */
  period?: string;

  /** Summary data with totals */
  summary?: {
    /** Total value received */
    totalRecebido: number;
    /** Total value with discrepancies */
    totalGlosado: number;
    /** Total procedures count */
    totalProcedimentos: number;
    /** Procedures pending audit */
    auditoriaPendente: number;
  };

  /** Data grouped by hospital */
  hospitalData?: HospitalData[];

  /** Data grouped by month */
  monthlyData?: MonthlyData[];

  /** Data grouped by procedure */
  procedureData?: ProcedureData[];
}

/**
 * Hospital data structure for reports
 */
export interface HospitalData {
  /** Hospital name */
  name: string;
  /** Total procedures count */
  procedimentos: number;
  /** Procedures with discrepancies */
  glosados: number;
  /** Recovered procedures after contestation */
  recuperados: number;
}

/**
 * Monthly data structure for reports
 */
export interface MonthlyData {
  /** Month name or identifier */
  month: string;
  /** Total procedures count for the month */
  procedimentos: number;
  /** Procedures with discrepancies for the month */
  glosados: number;
}

/**
 * Procedure data structure for reports
 */
export interface ProcedureData {
  /** Procedure code */
  codigo: string;
  /** Procedure description */
  descricao: string;
  /** Total quantity */
  quantidade: number;
  /** Quantity with discrepancies */
  glosados: number;
}

/**
 * Type predicate to check if data is history data
 */
export function isHistoryData(data: any[]): data is HistoryItem[] {
  return data.length > 0 && 'status' in data[0] && 'glosados' in data[0];
}

/**
 * TISS procedure data
 */
export interface TISSProcedure {
  /** Procedure code */
  codigo: string;
  /** Procedure description */
  descricao: string;
}

/**
 * FHIR resource types
 */
export type FHIRResourceType =
  | 'Patient'
  | 'Practitioner'
  | 'Organization'
  | 'Procedure'
  | 'Encounter'
  | 'Claim';
