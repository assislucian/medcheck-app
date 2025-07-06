import path from "path";

export function getReportPath(jobId: string): string {
  return path.join(process.cwd(), "data", "reports", `${jobId}.json`);
}
