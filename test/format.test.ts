import test from "node:test";
import assert from "node:assert/strict";
import { formatReport } from "../src/audit.js";
import type { AuditReport } from "../src/types.js";

test("markdown formatter includes checklist", () => {
  const report: AuditReport = {
    projectRoot: ".",
    generatedAt: "now",
    score: 100,
    summary: { filesScanned: 0, slices: 0, findings: 0, errors: 0, warnings: 0 },
    slices: [],
    findings: [],
    checklist: ["Ship carefully"]
  };
  assert.match(formatReport(report, "markdown"), /Ship carefully/);
});
