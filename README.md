# Statecraft 🧭

Statecraft is a local-first CLI for auditing Redux-style state recipes before they calcify into folklore. It scans project fixtures for predictable slices, async flow hygiene, coverage gaps, and migration checklist risks without mutating app code by default.

Think of it as a pantry labeler for state management: it will not cook dinner for you, but it will tell you which jars are mystery powder.

## Install

```sh
npm install
npm run build
```

## Use

```sh
npx statecraft scan examples/fixtures/redux-clean
npx statecraft scan examples/fixtures/redux-messy --format json --min-score 75
```

## What it checks

- explicit `initialState` and discoverable reducer recipes
- reducer predictability issues such as clocks, random values, storage, network calls, or mutation outside Immer-style wrappers
- async thunk lifecycle coverage for `pending`, `fulfilled`, and `rejected`
- cancellation/idempotency hints for async flows
- nearby or mirrored test coverage signals
- migration checklist items to attach to state-library upgrade PRs

State-specific findings are evaluated only in detected Redux recipe files: files whose path names a slice, reducer, or store, or whose source uses `createSlice`, `createReducer`, or `combineReducers`. Test and spec files are excluded from that inventory. This keeps ordinary clocks, random values, loose fixture types, and test setup mutations from affecting the audit score. Because detection is intentionally heuristic, unusually named vanilla reducer files may need a conventional `.reducer` filename to enter the inventory.

## Safety model

Statecraft is read-only. The MVP scans source text and emits a report; it does not rewrite reducers, install packages in target apps, or phone home. Use reports as review evidence, not as an automatic merge gate until your team calibrates the score thresholds.

## Inspiration and attribution

Statecraft is inspired by hard-won Redux migration checklists, Redux Toolkit guidance, and the broader local-first developer tooling movement. It does not copy implementation from those projects; it preserves the idea of explicit recipes and reviewable state transitions in a small independent tool.

## Development

```sh
npm test
npm run check
npm run smoke
bash scripts/validate.sh
```

## Verification

Run the release-readiness checks before publishing or cutting a PR:

```bash
npm run check
npm run build
npm run test
npm run smoke
npm run package:smoke
npm run release:check
```

Use `npm run package:smoke` or `npm pack --dry-run` to confirm the published tarball includes the support docs and runnable package contents.
