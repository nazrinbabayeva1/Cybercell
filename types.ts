
export enum View {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
}

export interface LogEntry {
  path: string;
  body: string;
}

export type Classification = 'benign' | 'malicious';

export interface ClassificationResult {
  log: LogEntry;
  classification: Classification;
  reason: string;
}

export interface AnalysisSummary {
  total: number;
  malicious: number;
  benign: number;
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  timestamp: number;
  results: ClassificationResult[];
  summary: AnalysisSummary;
}
