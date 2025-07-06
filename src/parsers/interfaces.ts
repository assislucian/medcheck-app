import { DemonstrativoRecord } from "../domain/models";

export interface Parser {
  parse(): Promise<DemonstrativoRecord[]>;
}

export interface FileMetadata {
  fileName: string;
  mimeType: string;
  size: number;
  encoding: string;
}

export interface ParserContext {
  config: {
    documentType: "GUIA" | "DEMONSTRATIVO";
    requiredHeaders: string[];
    columnMappings: {
      [key: string]: string;
    };
    guiaFields?: {
      crm: string;
      role: string;
      procedureCode: string;
      procedureDescription: string;
    };
    demonstrativoFields?: {
      crm: string;
      value: string;
      procedureCode: string;
      procedureDescription: string;
    };
  };
}

export interface ParserFactory {
  createParser(filePath: string, context: ParserContext): Promise<Parser>;
}
