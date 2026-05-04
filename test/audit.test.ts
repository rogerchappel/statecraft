import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { auditProject } from "../src/index.js";

const fixtureRoot = path.join(process.cwd(), "examples/fixtures");

test("clean fixture passes the default score gate", async () => {
  const report = await auditProject({ root: path.join(fixtureRoot, "redux-clean") });
  assert.equal(report.summary.slices, 2);
  assert.equal(report.summary.errors, 0);
  assert.ok(report.score >= 90);
});

test("messy fixture catches impure reducer and coverage gaps", async () => {
  const report = await auditProject({ root: path.join(fixtureRoot, "redux-messy") });
  assert.ok(report.findings.some((finding) => finding.id === "impure-reducer-input"));
  assert.ok(report.findings.some((finding) => finding.id === "missing-slice-test"));
  assert.ok(report.score < 80);
});
