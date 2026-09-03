import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

const cli = path.join(process.cwd(), "dist/src/cli.js");
const cleanFixture = path.join(process.cwd(), "examples/fixtures/redux-clean");
const messyFixture = path.join(process.cwd(), "examples/fixtures/redux-messy");
const regexFixture = path.join(process.cwd(), "examples/fixtures/regex-literals");
const moduleExtensionsFixture = path.join(process.cwd(), "examples/fixtures/module-extensions");

function runCli(args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

for (const flag of ["--help", "-h"]) {
  test(`${flag} prints top-level usage`, () => {
    const result = runCli([flag]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /Usage:\n  statecraft scan/);
    assert.equal(result.stderr, "");
  });
}

for (const score of ["0", "100"]) {
  test(`--min-score accepts the valid ${score} boundary`, () => {
    const result = runCli(["scan", cleanFixture, "--min-score", score]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /Statecraft audit/);
    assert.equal(result.stderr, "");
  });
}

for (const { label, args } of [
  { label: "negative values", args: ["scan", cleanFixture, "--min-score", "-1"] },
  { label: "values above 100", args: ["scan", cleanFixture, "--min-score", "101"] },
  { label: "non-finite values", args: ["scan", cleanFixture, "--min-score", "Infinity"] },
  { label: "a missing value", args: ["scan", cleanFixture, "--min-score"] }
]) {
  test(`--min-score rejects ${label}`, () => {
    const result = runCli(args);

    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /--min-score must be a number from 0 to 100/);
  });
}

test("a valid score gate failure keeps exit status 2", () => {
  const result = runCli(["scan", messyFixture, "--min-score", "100"]);

  assert.equal(result.status, 2);
  assert.match(result.stdout, /Statecraft audit/);
  assert.match(result.stderr, /is below minimum 100/);
});

test("scanning redux-messy fixture fails when --min-score threshold is above actual score", () => {
  // redux-messy has impure inputs and missing test which penalize its score
  const result = runCli(["scan", messyFixture, "--min-score", "80", "--format", "json"]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /is below minimum 80/);
  const parsed = JSON.parse(result.stdout);
  assert.ok(parsed.score < 80);
});

test("scanning empty directory target exits status 1 with informative error", () => {
  const emptyFixture = path.join(process.cwd(), "examples/fixtures/empty-directory");
  const result = runCli(["scan", emptyFixture]);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /No JavaScript or TypeScript source files detected in/);
});

test("JSON scans ignore detector vocabulary inside regex literals", () => {
  const result = runCli(["scan", regexFixture, "--format", "json"]);

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.slices.map(({ file }: { file: string }) => file), ["src/control.reducer.ts", "src/real-code.ts"]);
  assert.ok(!report.findings.some(({ file }: { file?: string }) => file === "src/patterns.ts"));
  assert.ok(!report.findings.some(({ id, file }: { id: string; file?: string }) => id === "impure-reducer-input" && file === "src/control.reducer.ts"));
  assert.deepEqual(
    report.findings.filter(({ id }: { id: string }) => id === "impure-reducer-input").map(({ title, line }: { title: string; line?: number }) => ({ title, line })),
    [
      { title: "Impure input detected: Date.now()", line: 8 },
      { title: "Impure input detected: localStorage", line: 7 }
    ]
  );
});

test("a directory containing only .mts and .cts sources scans successfully", () => {
  const result = runCli(["scan", moduleExtensionsFixture, "--format", "json"]);

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.summary.filesScanned, 2);
});
