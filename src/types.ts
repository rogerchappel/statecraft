export type Severity = "info" | "warn" | "error";
export type Category = "predictability" | "async" | "coverage" | "migration" | "inventory";

export interface Finding {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  detail: string;
  file?: string;
  line?: number;
  recommendation: string;
}

export interface SliceRecord {
  name: string;
  file: string;
  hasInitialState: boolean;
  hasReducers: boolean;
  hasAsyncThunk: boolean;
  hasTests: boolean;
}

export interface AuditOptions {
  root: string;
  format?: "json" | "markdown";
  minScore?: number;
}

export interface AuditReport {
  projectRoot: string;
  generatedAt: string;
  score: number;
  summary: {
    filesScanned: number;
    slices: number;
    findings: number;
    errors: number;
    warnings: number;
  };
  slices: SliceRecord[];
  findings: Finding[];
  checklist: string[];
}
