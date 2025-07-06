import { Parser, ParserFactory, ParserContext } from "./interfaces";
import { PDFParser } from "./pdf-parser";

export class DefaultParserFactory implements ParserFactory {
  async createParser(
    filePath: string,
    context: ParserContext,
  ): Promise<Parser> {
    const fileType = this.getFileType(filePath);

    switch (fileType) {
      case "pdf":
        return new PDFParser(filePath, context);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private getFileType(filePath: string): string {
    const extension = filePath.split(".").pop()?.toLowerCase();
    if (!extension) {
      throw new Error("File has no extension");
    }
    return extension;
  }
}
