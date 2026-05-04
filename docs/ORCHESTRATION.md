# Orchestration

Statecraft is delivered in reviewable slices:

1. Product contract: PRD, tasks, safety boundaries
2. Scan core: local file collection and rule evaluation
3. Report core: score, checklist, formatters
4. CLI: read-only scan command and score gate
5. Fixtures/tests: clean, messy, migration projects
6. OSS readiness: README, contributing, security, CI

Every future task should link to a PR before review. Risky rule changes need fixture updates in the same PR so score movement is visible.
