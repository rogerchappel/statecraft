# Statecraft PRD

## Problem

Redux-style applications often carry years of state-management decisions that are hard to review: reducers may hide nondeterminism, async thunks may skip error states, and migration PRs often lack a clear checklist.

## Target user

- maintainers preparing Redux Toolkit, RTK Query, Zustand, or custom store migrations
- tech leads reviewing state-heavy PRs
- teams that need local-only audits for private codebases

## MVP scope

Statecraft scans a project directory and produces a read-only report with:

1. slice inventory
2. predictability findings
3. async hygiene findings
4. coverage gap hints
5. migration checklist output
6. JSON and Markdown formats
7. CLI score gate for CI smoke usage

## Non-goals

- automatic mutation of application code
- semantic type-aware execution of reducers
- cloud upload or hosted dashboards
- replacing human review

## Success criteria

- fixture-backed tests prove clean and messy projects produce different reports
- CLI smoke can scan examples locally
- docs explain safety, contribution flow, and migration intent
- package metadata is ready for public OSS use

## Risks

Text heuristics can produce false positives. The MVP addresses this by using transparent rule IDs, recommendations, and a score that teams can calibrate.
