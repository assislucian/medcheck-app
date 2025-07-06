export interface ValidationError {
  type:
    | "MISSING_PROCEDURE"
    | "EXTRA_PROCEDURE"
    | "DESCRIPTION_MISMATCH"
    | "CRM_MISMATCH";
  procedureCode: string;
  message: string;
  expected: any;
  actual: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  summary: {
    totalProcedures: number;
    validatedProcedures: number;
    errorCount: number;
  };
}
