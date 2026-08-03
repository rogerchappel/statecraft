import path from "node:path";
import type { Finding, SliceRecord } from "./types.js";
import type { SourceFile } from "./fs.js";

const impurePatterns = [
  { pattern: /Date\.now\s*\(/, label: "Date.now()" },
  { pattern: /Math\.random\s*\(/, label: "Math.random()" },
  { pattern: /localStorage\./, label: "localStorage" },
  { pattern: /sessionStorage\./, label: "sessionStorage" }
];

export function detectSlices(files: SourceFile[]): SliceRecord[] {
  return files
    .filter((file) => !isTestSource(file.relativePath))
    .filter((file) => /slice|reducer|store/i.test(file.relativePath) || /createSlice|combineReducers|createReducer/.test(file.text))
    .map((file) => ({
      name: inferSliceName(file),
      file: file.relativePath,
      hasInitialState: /initialState\b/.test(file.text),
      hasReducers: /reducers\s*:|createReducer|function\s+\w*Reducer|=>\s*\{/.test(file.text),
      hasAsyncThunk: /createAsyncThunk|pending|fulfilled|rejected/.test(file.text),
      hasTests: hasMatchingTest(file, files)
    }));
}

function isTestSource(relativePath: string): boolean {
  return /(^|[/\\])(__tests__|tests?|specs?)([/\\]|$)/i.test(relativePath)
    || /\.(test|spec)\.[^/\\]+$/i.test(relativePath);
}

export function runRules(files: SourceFile[], slices: SliceRecord[]): Finding[] {
  const findings: Finding[] = [];
  const stateRecipePaths = new Set(slices.map((slice) => slice.file));
  for (const slice of slices) {
    if (!slice.hasInitialState) findings.push(finding("missing-initial-state", "predictability", "warn", "Slice lacks explicit initialState", slice.file, "Declare an initialState object so defaults are reviewable and serializable."));
    if (!slice.hasReducers) findings.push(finding("missing-reducers", "inventory", "info", "State file has no obvious reducer recipe", slice.file, "Confirm this file belongs in state inventory or move non-state helpers elsewhere."));
    if (!slice.hasTests) findings.push(finding("missing-slice-test", "coverage", "warn", "Slice has no matching test file", slice.file, "Add a focused test beside the slice or in a mirrored test directory."));
  }

  for (const file of files.filter((candidate) => stateRecipePaths.has(candidate.relativePath))) {
    for (const impure of impurePatterns) {
      const line = findLine(file.text, impure.pattern);
      if (line) findings.push(finding("impure-reducer-input", "predictability", "error", `Impure input detected: ${impure.label}`, file.relativePath, "Move nondeterministic inputs into thunk payloads, selectors, or injected services.", line));
    }
    if (/createAsyncThunk/.test(file.text)) {
      if (!/pending/.test(file.text) || !/fulfilled/.test(file.text) || !/rejected/.test(file.text)) findings.push(finding("incomplete-thunk-lifecycle", "async", "warn", "Async thunk lifecycle is incomplete", file.relativePath, "Handle pending, fulfilled, and rejected states so UI loading and errors stay predictable."));
      if (!/signal|abort|condition/.test(file.text)) findings.push(finding("missing-cancellation-story", "async", "info", "Async flow lacks cancellation story", file.relativePath, "Thread AbortSignal, thunk condition, or documented idempotency through async recipes."));
    }
    if (/as\s+any|:\s*any\b/.test(file.text)) findings.push(finding("loose-state-types", "migration", "warn", "Loose any type found in state recipe", file.relativePath, "Replace any with typed slice state before migration or framework upgrades."));
    if (/state\.\w+\s*=/.test(file.text) && !/createSlice|createReducer/.test(file.text)) findings.push(finding("mutation-without-immer", "predictability", "error", "Reducer appears to mutate state without Immer wrapper", file.relativePath, "Return copied state from vanilla reducers or move recipe into createSlice/createReducer."));
  }
  return findings;
}

export function migrationChecklist(slices: SliceRecord[], findings: Finding[]): string[] {
  const checklist = [
    "Inventory every slice owner and exported action before changing runtime state libraries.",
    "Freeze public action payload shapes or document deliberate breaking changes.",
    "Add regression tests for reducers with warning/error findings.",
    "Verify async pending/fulfilled/rejected UI states before migrating thunks.",
    "Run Statecraft in read-only mode in CI and attach the report to migration PRs."
  ];
  if (slices.some((slice) => !slice.hasTests)) checklist.push("Close slice coverage gaps before replacing reducer plumbing.");
  if (findings.some((item) => item.id === "impure-reducer-input")) checklist.push("Extract clocks, random IDs, storage, and network effects out of reducers first.");
  return checklist;
}

function inferSliceName(file: SourceFile): string {
  const explicit = file.text.match(/name\s*:\s*["']([^"']+)["']/)?.[1];
  if (explicit) return explicit;
  return path.basename(file.relativePath).replace(/\.(slice|reducer|store)?\.(t|j)sx?$/i, "").replace(/\.(t|j)sx?$/i, "");
}

function hasMatchingTest(file: SourceFile, files: SourceFile[]): boolean {
  const base = path.basename(file.relativePath).replace(/\.(t|j)sx?$/i, "").replace(/\.(slice|reducer|store)$/i, "");
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const testNamePattern = new RegExp(`${escaped}.*(test|spec)|(test|spec).*${escaped}`, "i");
  const describePattern = new RegExp(`[\"']${escaped}(\\s+(slice|reducer|store|smoke|lifecycle|async))*[\"']`, "i");
  return files.some((candidate) => /test|spec/i.test(candidate.relativePath) && (testNamePattern.test(candidate.relativePath) || describePattern.test(candidate.text)));
}

function findLine(text: string, pattern: RegExp): number | undefined {
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex((line) => pattern.test(line));
  return index === -1 ? undefined : index + 1;
}

function finding(id: Finding["id"], category: Finding["category"], severity: Finding["severity"], title: string, file: string, recommendation: string, line?: number): Finding {
  return { id, category, severity, title, file, line, detail: `${title}${file ? ` in ${file}` : ""}.`, recommendation };
}
