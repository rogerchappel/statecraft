import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { auditProject } from "../src/index.js";

const fixtureRoot = path.join(process.cwd(), "examples/fixtures");

test("clean fixture passes the default score gate", async () => {
  const report = await auditProject({ root: path.join(fixtureRoot, "redux-clean") });
  assert.equal(report.summary.slices, 2);
  assert.equal(report.summary.errors, 0);
  assert.ok(report.slices.every((slice) => slice.hasTests));
  assert.ok(report.score >= 90);
});

test("messy fixture catches impure reducer and coverage gaps", async () => {
  const report = await auditProject({ root: path.join(fixtureRoot, "redux-messy") });
  assert.ok(report.findings.some((finding) => finding.id === "impure-reducer-input"));
  assert.ok(report.findings.some((finding) => finding.id === "missing-slice-test"));
  assert.ok(report.score < 80);
});

test("non-state source and tests do not produce state recipe findings", async () => {
  const report = await auditProject({ root: path.join(fixtureRoot, "non-state-source") });

  assert.equal(report.summary.slices, 0);
  assert.equal(report.summary.findings, 0);
  assert.equal(report.score, 100);
});

test("state recipe findings retain the source file and line", async () => {
  const report = await auditProject({ root: path.join(fixtureRoot, "redux-messy") });
  const findings = report.findings.filter(
    (finding) => finding.file === "src/cart.reducer.ts" && finding.id === "impure-reducer-input"
  );

  assert.deepEqual(
    findings.map(({ title, line }) => ({ title, line })),
    [
      { title: "Impure input detected: Date.now()", line: 7 },
      { title: "Impure input detected: Math.random()", line: 6 }
    ]
  );
});

test("test path filtering does not exclude source names containing test or spec", async () => {
  const report = await auditProject({ root: path.join(fixtureRoot, "path-filtering") });

  assert.equal(report.summary.slices, 1);
  assert.deepEqual(report.slices.map(({ file, hasTests }) => ({ file, hasTests })), [
    { file: "src/contest.reducer.ts", hasTests: true }
  ]);
  assert.deepEqual(
    report.findings.map(({ id, file, line }) => ({ id, file, line })),
    [{ id: "impure-reducer-input", file: "src/contest.reducer.ts", line: 5 }]
  );
});

test("source names containing test are not mistaken for their own tests", async () => {
  const report = await auditProject({ root: path.join(fixtureRoot, "test-name-substring") });

  assert.deepEqual(report.slices.map(({ file, hasTests }) => ({ file, hasTests })), [
    { file: "src/contest.reducer.ts", hasTests: false }
  ]);
  assert.deepEqual(
    report.findings.map(({ id, file }) => ({ id, file })),
    [{ id: "missing-slice-test", file: "src/contest.reducer.ts" }]
  );
});
