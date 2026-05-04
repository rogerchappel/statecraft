import type { AuditReport } from "./types.js";

export function formatJson(report: AuditReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function formatMarkdown(report: AuditReport): string {
  const lines = [
    `# Statecraft audit`,
    ``,
    `Score: **${report.score}/100**`,
    ``,
    `## Summary`,
    ``,
    `- Files scanned: ${report.summary.filesScanned}`,
    `- Slices found: ${report.summary.slices}`,
    `- Findings: ${report.summary.findings} (${report.summary.errors} errors, ${report.summary.warnings} warnings)`,
    ``,
    `## Findings`,
    ``
  ];

  if (report.findings.length === 0) lines.push("No findings. This state recipe cupboard is tidy.", "");
  for (const finding of report.findings) {
    lines.push(`- **${finding.severity.toUpperCase()}** ${finding.title} (${finding.category})`);
    if (finding.file) lines.push(`  - Location: ${finding.file}${finding.line ? `:${finding.line}` : ""}`);
    lines.push(`  - Recommendation: ${finding.recommendation}`);
  }

  lines.push("", "## Migration checklist", "");
  for (const item of report.checklist) lines.push(`- [ ] ${item}`);
  return `${lines.join("\n")}\n`;
}
