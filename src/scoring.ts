import type { Finding } from "./types.js";

export function scoreFindings(findings: Finding[]): number {
  const penalty = findings.reduce((total, finding) => {
    if (finding.severity === "error") return total + 18;
    if (finding.severity === "warn") return total + 8;
    return total + 3;
  }, 0);
  return Math.max(0, 100 - penalty);
}
