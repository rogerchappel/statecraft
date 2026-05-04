import test from "node:test";
import assert from "node:assert/strict";
import { scoreFindings } from "../src/scoring.js";

test("scoreFindings penalizes by severity", () => {
  assert.equal(scoreFindings([
    { id: "a", category: "async", severity: "info", title: "i", detail: "i", recommendation: "r" },
    { id: "b", category: "coverage", severity: "warn", title: "w", detail: "w", recommendation: "r" },
    { id: "c", category: "predictability", severity: "error", title: "e", detail: "e", recommendation: "r" }
  ]), 71);
});
