// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { Parser, ParserContext } from "./interfaces";
import { DemonstrativoRecord, Role } from "../domain/models";
import { ParsingError } from "../errors";
import { retry } from "../utils/retry";

/**
 * PDFParser for "demonstrativo" files. Extracts structured rows of procedures,
 * filters by logged-in doctor's CRM, and normalizes values.
 */
export class PDFParser implements Parser {
  constructor(
    private readonly filePath: string,
    private readonly context: ParserContext,
  ) {}

  /**
   * Main entry: extracts text, parses to records, then filters by CRM.
   */
  async parse(): Promise<DemonstrativoRecord[]> {
    try {
      // 1. Extract raw text with retry
      // const text = await retry(
      //   () => this.extractTextFromPDF(),
      //   { retries: 3, factor: 2, minTimeout: 500, maxTimeout: 3000 }
      // );
      throw new Error("PDF text extraction not implemented in this stub.");

      // 2. Extract header info (CRM, doctor name, date)
      // const headerInfo = this.extractHeaderInfo(text);

      // 3. Parse all data lines into records
      // const records = this.parseText(text, headerInfo);

      // 4. Filter by the logged-in CRM
      // return records.filter(r => r.crm === headerInfo.crm);
    } catch (error) {
      throw new ParsingError(
        `Failed to parse PDF '${this.filePath}': ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * Pulls CRM, doctor name and date from header text.
   */
  private extractHeaderInfo(text: string): {
    crm: string;
    doctor: string;
    date: Date;
  } {
    const crmMatch = text.match(/CRM[:\s]*(\d+)/i);
    const nameMatch = text.match(/Nome\s*do\s*M[ií]dico[:\s]*([^\n]+)/i);
    const dateMatch = text.match(/Data[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
    if (!crmMatch) throw new ParsingError("CRM not found in header");
    const crm = crmMatch[1].trim();
    const doctor = nameMatch ? nameMatch[1].trim() : "";
    const date = dateMatch
      ? new Date(dateMatch[1].split("/").reverse().join("-"))
      : new Date();
    return { crm, doctor, date };
  }

  /**
   * Parses text into DemonstrativoRecord[] using fuzzy header mapping.
   */
  private parseText(
    text: string,
    headerInfo: { crm: string; doctor: string; date: Date },
  ): DemonstrativoRecord[] {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);
    // 1. Find header line based on requiredHeaders from context.config
    const headerLine = lines.find((line) =>
      this.context.config.requiredHeaders.every((hdr) =>
        line.toLowerCase().includes(hdr.toLowerCase()),
      ),
    );
    if (!headerLine) throw new ParsingError("Table header not found");

    // 2. Build column index map by matching columnMappings
    const columns = headerLine.split(/\s{2,}|\t/).map((c) => c.trim());
    const columnMap: Record<string, number> = {};
    Object.entries(this.context.config.columnMappings).forEach(
      ([field, hdr]) => {
        const idx = columns.findIndex((c) =>
          c.toLowerCase().includes((hdr as string).toLowerCase()),
        );
        if (idx === -1) throw new ParsingError(`Header '${hdr}' not found`);
        columnMap[field] = idx;
      },
    );

    // 3. Process data rows
    const records: DemonstrativoRecord[] = [];
    const start = lines.indexOf(headerLine) + 1;
    for (let i = start; i < lines.length; i++) {
      const rowCols = lines[i].split(/\s{2,}|\t/).map((c) => c.trim());
      if (rowCols.length < Object.keys(columnMap).length) continue;
      try {
        const code = parseInt(rowCols[columnMap["codigo"]], 10);
        const liberado = this.cleanCurrency(rowCols[columnMap["liberado"]]);
        const roleLabel = rowCols[columnMap["papel"]];
        const role = this.determineRole(roleLabel);
        // Busca linha de glosa associada (até 2 linhas à frente)
        let codigoGlosa: string | null = null;
        let motivoGlosa: string | null = null;
        for (let j = 1; j <= 2 && i + j < lines.length; j++) {
          const glosaMatch = lines[i + j].match(/^Glosa\s+(\d{4})\s+(.+)$/i);
          if (glosaMatch) {
            codigoGlosa = glosaMatch[1];
            motivoGlosa = glosaMatch[2];
            break;
          }
        }
        records.push({
          guia: rowCols[columnMap["guia"]],
          date: headerInfo.date,
          code: code.toString(),
          description: rowCols[columnMap["descricao"]],
          role,
          crm: headerInfo.crm,
          quantity: parseInt(rowCols[columnMap["quantidade"]] || "1", 10),
          presentedValue: this.cleanCurrency(rowCols[columnMap["apresentado"]]),
          approvedValue: liberado,
          codigo_glosa: codigoGlosa,
          motivo_glosa: motivoGlosa,
        });
      } catch (err) {
        // skip malformed rows
        console.warn("Skipping row parsing error:", err);
      }
    }
    return records;
  }

  /**
   * Normalize currency string to number
   */
  private cleanCurrency(val: string): number {
    const s = val.replace(/[^\d,\.]/g, "").replace(",", ".");
    return parseFloat(s) || 0;
  }

  /**
   * Map text label to Role enum
   */
  private determineRole(label: string): Role {
    const lower = label.toLowerCase();
    if (lower.includes("cirurg")) return Role.SURGEON;
    if (lower.includes("anest")) return Role.ANESTHETIST;
    return Role.FIRST_ASSISTANT;
  }
}
