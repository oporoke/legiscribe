import type { CompareBillsOutput } from "@/ai/flows/compare-bills";
import type { AnalyzeStakeholdersOutput } from "@/ai/flows/analyze-stakeholders";

export interface Clause {
  clauseId: string;
  clauseNumber: number;
  text: string;
  summary: string;
}

export interface ProcessedBill {
  id: string;
  fileName: string;
  originalText: string;
  clauses: Clause[];
  summary: string;
  comparison?: CompareBillsOutput;
  stakeholderAnalysis?: AnalyzeStakeholdersOutput;
}
