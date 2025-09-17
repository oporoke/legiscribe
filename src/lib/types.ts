export interface Clause {
  clauseId: string;
  clauseNumber: number;
  text: string;
}

export interface ProcessedBill {
  id: string;
  fileName: string;
  originalText: string;
  clauses: Clause[];
}
