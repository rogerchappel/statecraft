import test from "node:test";
import assert from "node:assert/strict";
import { scoreFindings } from "../src/scoring.js";
import type { Finding } from "../src/types.js";

function makeFinding(severity: "info" | "warn" | "error"): Finding {
  return {
    id: `finding-${severity}`,
    category: "predictability",
    severity,
    title: `Sample ${severity}`,
    detail: "detail",
    recommendation: "recommendation"
  };
}

test("scoreFindings returns 100 for empty findings", () => {
  assert.equal(scoreFindings([]), 100);
});

test("scoreFindings penalizes info findings by 3 points each", () => {
  assert.equal(scoreFindings([makeFinding("info")]), 97);
  assert.equal(scoreFindings([makeFinding("info"), makeFinding("info")]), 94);
  assert.equal(scoreFindings([makeFinding("info"), makeFinding("info"), makeFinding("info")]), 91);
});

test("scoreFindings penalizes warn findings by 8 points each", () => {
  assert.equal(scoreFindings([makeFinding("warn")]), 92);
  assert.equal(scoreFindings([makeFinding("warn"), makeFinding("warn")]), 84);
  assert.equal(scoreFindings([makeFinding("warn"), makeFinding("warn"), makeFinding("warn")]), 76);
});

test("scoreFindings penalizes error findings by 18 points each", () => {
  assert.equal(scoreFindings([makeFinding("error")]), 82);
  assert.equal(scoreFindings([makeFinding("error"), makeFinding("error")]), 64);
  assert.equal(scoreFindings([makeFinding("error"), makeFinding("error"), makeFinding("error")]), 46);
});

test("scoreFindings computes all severity combinations of 0-3 findings correctly", () => {
  for (let errors = 0; errors <= 3; errors += 1) {
    for (let warns = 0; warns <= 3; warns += 1) {
      for (let infos = 0; infos <= 3; infos += 1) {
        const list: Finding[] = [
          ...Array.from({ length: errors }, () => makeFinding("error")),
          ...Array.from({ length: warns }, () => makeFinding("warn")),
          ...Array.from({ length: infos }, () => makeFinding("info"))
        ];
        const expectedPenalty = errors * 18 + warns * 8 + infos * 3;
        const expectedScore = Math.max(0, 100 - expectedPenalty);
        assert.equal(scoreFindings(list), expectedScore, `Failed for errors=${errors}, warns=${warns}, infos=${infos}`);
      }
    }
  }
});

test("scoreFindings clamps minimum score to 0 when penalty exceeds 100", () => {
  const severeFindings: Finding[] = Array.from({ length: 6 }, () => makeFinding("error")); // 6 * 18 = 108 penalty
  assert.equal(scoreFindings(severeFindings), 0);
});

test("scoreFindings handles unknown or malformed severity without NaN score corruption", () => {
  const unknownSeverityFinding = {
    id: "unknown",
    category: "predictability" as const,
    severity: "unknown" as unknown as "info",
    title: "Unknown",
    detail: "detail",
    recommendation: "recommendation"
  };
  assert.equal(scoreFindings([unknownSeverityFinding]), 100);
});

test("scoreFindings handles mixed severity finding fixture correctly", () => {
  assert.equal(scoreFindings([
    { id: "a", category: "async", severity: "info", title: "i", detail: "i", recommendation: "r" },
    { id: "b", category: "coverage", severity: "warn", title: "w", detail: "w", recommendation: "r" },
    { id: "c", category: "predictability", severity: "error", title: "e", detail: "e", recommendation: "r" }
  ]), 71);
});

