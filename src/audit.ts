import path from "node:path";
import { collectSourceFiles } from "./fs.js";
import { formatJson, formatMarkdown } from "./format.js";
import { detectSlices, migrationChecklist, runRules } from "./rules.js";
import { scoreFindings } from "./scoring.js";
import type { AuditOptions, AuditReport } from "./types.js";

export async function auditProject(options: AuditOptions): Promise<AuditReport> {
  const root = path.resolve(options.root);
  const files = await collectSourceFiles(root);
  if (files.length === 0) {
    throw new Error(`No JavaScript or TypeScript source files detected in ${root}`);
  }
  const slices = detectSlices(files);
  const findings = runRules(files, slices);
  const score = scoreFindings(findings);
  return {
    projectRoot: root,
    generatedAt: new Date().toISOString(),
    score,
    summary: {
      filesScanned: files.length,
      slices: slices.length,
      findings: findings.length,
      errors: findings.filter((item) => item.severity === "error").length,
      warnings: findings.filter((item) => item.severity === "warn").length
    },
    slices,
    findings,
    checklist: migrationChecklist(slices, findings)
  };
}

export function formatReport(report: AuditReport, format: "json" | "markdown" = "markdown"): string {
  return format === "json" ? formatJson(report) : formatMarkdown(report);
}
