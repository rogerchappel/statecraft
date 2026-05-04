#!/usr/bin/env node
import { auditProject, formatReport } from "./audit.js";

interface CliArgs {
  command: string;
  root: string;
  format: "json" | "markdown";
  minScore?: number;
}

function parseArgs(argv: string[]): CliArgs {
  const [command = "help", root = ".", ...rest] = argv;
  let format: "json" | "markdown" = "markdown";
  let minScore: number | undefined;
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--format") {
      const value = rest[++index];
      if (value !== "json" && value !== "markdown") throw new Error("--format must be json or markdown");
      format = value;
    } else if (arg === "--min-score") {
      const value = Number(rest[++index]);
      if (!Number.isFinite(value)) throw new Error("--min-score must be a number");
      minScore = value;
    } else if (arg === "--help" || arg === "-h") {
      return { command: "help", root, format, minScore };
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return { command, root, format, minScore };
}

function usage(): string {
  return `Statecraft — read-only Redux-style state recipe auditor\n\nUsage:\n  statecraft scan <project> [--format markdown|json] [--min-score 0-100]\n\nExamples:\n  statecraft scan examples/fixtures/redux-clean\n  statecraft scan . --format json --min-score 75\n`;
}

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.command === "help") {
      process.stdout.write(usage());
      return;
    }
    if (args.command !== "scan") throw new Error(`Unknown command: ${args.command}`);
    const report = await auditProject({ root: args.root, format: args.format, minScore: args.minScore });
    process.stdout.write(formatReport(report, args.format));
    if (args.minScore !== undefined && report.score < args.minScore) {
      process.stderr.write(`Statecraft score ${report.score} is below minimum ${args.minScore}.\n`);
      process.exitCode = 2;
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n\n${usage()}`);
    process.exitCode = 1;
  }
}

await main();
