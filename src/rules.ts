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
    .map((file) => ({ file, code: maskCommentsAndStrings(file.text) }))
    .filter(({ file, code }) => hasStateRecipePath(file.relativePath) || /\b(createSlice|combineReducers|createReducer)\b/.test(code))
    .map(({ file, code }) => ({
      name: inferSliceName(file),
      file: file.relativePath,
      hasInitialState: /\binitialState\b/.test(code),
      hasReducers: /\breducers\s*:|\bcreateReducer\b|\bfunction\s+\w*Reducer\b/.test(code),
      hasAsyncThunk: /\b(createAsyncThunk|pending|fulfilled|rejected)\b/.test(code),
      hasTests: hasMatchingTest(file, files)
    }));
}

function hasStateRecipePath(relativePath: string): boolean {
  return /(^|[^a-z0-9])(slice|reducer|store)([^a-z0-9]|$)/i.test(relativePath);
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
    const code = maskCommentsAndStrings(file.text);
    for (const impure of impurePatterns) {
      const line = findLine(code, impure.pattern);
      if (line) findings.push(finding("impure-reducer-input", "predictability", "error", `Impure input detected: ${impure.label}`, file.relativePath, "Move nondeterministic inputs into thunk payloads, selectors, or injected services.", line));
    }
    if (/\bcreateAsyncThunk\b/.test(code)) {
      if (!/\bpending\b/.test(code) || !/\bfulfilled\b/.test(code) || !/\brejected\b/.test(code)) findings.push(finding("incomplete-thunk-lifecycle", "async", "warn", "Async thunk lifecycle is incomplete", file.relativePath, "Handle pending, fulfilled, and rejected states so UI loading and errors stay predictable."));
      if (!/\b(signal|abort|condition)\b/.test(code)) findings.push(finding("missing-cancellation-story", "async", "info", "Async flow lacks cancellation story", file.relativePath, "Thread AbortSignal, thunk condition, or documented idempotency through async recipes."));
    }
    if (/\bas\s+any|:\s*any\b/.test(code)) findings.push(finding("loose-state-types", "migration", "warn", "Loose any type found in state recipe", file.relativePath, "Replace any with typed slice state before migration or framework upgrades."));
    if (/\bstate\.\w+\s*=/.test(code) && !/\b(createSlice|createReducer)\b/.test(code)) findings.push(finding("mutation-without-immer", "predictability", "error", "Reducer appears to mutate state without Immer wrapper", file.relativePath, "Return copied state from vanilla reducers or move recipe into createSlice/createReducer."));
  }
  return findings;
}

function maskCommentsAndStrings(text: string): string {
  let result = "";
  let state: "code" | "line-comment" | "block-comment" | "single" | "double" | "template" = "code";
  let escaped = false;
  const templateExpressions: Array<number | undefined> = [];

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (state === "code") {
      if (character === "/" && next === "/") { state = "line-comment"; result += "  "; index += 1; continue; }
      if (character === "/" && next === "*") { state = "block-comment"; result += "  "; index += 1; continue; }
      if (character === "'") state = "single";
      else if (character === '"') state = "double";
      else if (character === "`") { state = "template"; templateExpressions.push(undefined); }
      else if (templateExpressions.length > 0 && character === "{") {
        templateExpressions[templateExpressions.length - 1] = (templateExpressions.at(-1) ?? 0) + 1;
        result += character;
        continue;
      } else if (templateExpressions.length > 0 && character === "}") {
        const depth = templateExpressions.at(-1) ?? 0;
        result += character;
        if (depth === 0) {
          templateExpressions[templateExpressions.length - 1] = undefined;
          state = "template";
        } else {
          templateExpressions[templateExpressions.length - 1] = depth - 1;
        }
        continue;
      }
      else { result += character; continue; }
      result += " ";
      continue;
    }
    if (character === "\n" || character === "\r") {
      result += character;
      if (state === "line-comment") state = "code";
      if (state !== "single" && state !== "double") escaped = false;
      continue;
    }
    result += " ";
    if (state === "block-comment" && character === "*" && next === "/") { result += " "; index += 1; state = "code"; continue; }
    if (state === "line-comment" || state === "block-comment") continue;
    if (escaped) { escaped = false; continue; }
    if (character === "\\") { escaped = true; continue; }
    if (state === "template" && character === "$" && next === "{") {
      result += "{";
      index += 1;
      templateExpressions[templateExpressions.length - 1] = 0;
      state = "code";
      continue;
    }
    if (state === "template" && character === "`") {
      templateExpressions.pop();
      state = templateExpressions.at(-1) === undefined && templateExpressions.length > 0 ? "template" : "code";
      continue;
    }
    if ((state === "single" && character === "'") || (state === "double" && character === '"')) state = "code";
  }
  return result;
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
  const semanticBase = `(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`;
  const testNamePattern = new RegExp(semanticBase, "i");
  const describePattern = new RegExp(`[\"']${escaped}(\\s+(slice|reducer|store|smoke|lifecycle|async))*[\"']`, "i");
  return files.some((candidate) => isTestSource(candidate.relativePath) && (testNamePattern.test(candidate.relativePath) || describePattern.test(candidate.text)));
}

function findLine(text: string, pattern: RegExp): number | undefined {
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex((line) => pattern.test(line));
  return index === -1 ? undefined : index + 1;
}

function finding(id: Finding["id"], category: Finding["category"], severity: Finding["severity"], title: string, file: string, recommendation: string, line?: number): Finding {
  return { id, category, severity, title, file, line, detail: `${title}${file ? ` in ${file}` : ""}.`, recommendation };
}
