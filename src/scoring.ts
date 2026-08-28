import type { Finding } from "./types.js";

export function scoreFindings(findings: Finding[]): number {
  const penalty = findings.reduce((total, finding) => {
    if (finding.severity === "error") return total + 18;
    if (finding.severity === "warn") return total + 8;
    if (finding.severity === "info") return total + 3;
    return total;
  }, 0);
  if (!Number.isFinite(penalty) || Number.isNaN(penalty)) return 0;
  return Math.max(0, Math.min(100, 100 - penalty));
}
