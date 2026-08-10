# Statecraft 🧭

Statecraft is a local-first CLI for auditing Redux-style state recipes before they calcify into folklore. It scans project fixtures for predictable slices, async flow hygiene, coverage gaps, and migration checklist risks without mutating app code by default.

Think of it as a pantry labeler for state management: it will not cook dinner for you, but it will tell you which jars are mystery powder.

## Install

Statecraft is currently distributed through GitHub Releases, not the npm registry. Install the release tarball directly:

```sh
npm install --global https://github.com/rogerchappel/statecraft/releases/download/v0.1.0/statecraft-0.1.0.tgz
```

The package artifact is named `@rogerchappel/statecraft`; the installed CLI command is `statecraft`. A future npm-registry publication will be announced separately.

To install from a source checkout instead, clone the repository, run `npm ci && npm run build`, then run `npm install --global .` from the repository root.

## Use

```sh
statecraft scan examples/fixtures/redux-clean
statecraft scan examples/fixtures/redux-messy --format json --min-score 75
statecraft --help
```

`--min-score` accepts a number from 0 through 100. A completed audit below that threshold exits with status 2, while invalid CLI arguments exit with status 1.

## What it checks

- explicit `initialState` and discoverable reducer recipes
- reducer predictability issues such as clocks, random values, storage, or mutation outside Immer-style wrappers
- async thunk lifecycle coverage for `pending`, `fulfilled`, and `rejected`
- cancellation/idempotency hints for async flows
- nearby or mirrored test coverage signals
- migration checklist items to attach to state-library upgrade PRs

State-specific findings are evaluated only in detected Redux recipe files: files whose path names a slice, reducer, or store, or whose source uses `createSlice`, `createReducer`, or `combineReducers`. Test and spec files are excluded from that inventory. This keeps ordinary clocks, random values, loose fixture types, and test setup mutations from affecting the audit score. Because detection is intentionally heuristic, unusually named vanilla reducer files may need a conventional `.reducer` filename to enter the inventory.

Rule matching ignores comments and literal string text, including the text portions of template literals. Executable `${...}` template interpolations are still evaluated, including nested templates, so nondeterministic calls and loose types cannot be hidden inside formatted values.

## Safety model

Statecraft is read-only. The MVP scans source text and emits a report; it does not rewrite reducers, install packages in target apps, or phone home. Use reports as review evidence, not as an automatic merge gate until your team calibrates the score thresholds.

## Inspiration and attribution

Statecraft is inspired by hard-won Redux migration checklists, Redux Toolkit guidance, and the broader local-first developer tooling movement. It does not copy implementation from those projects; it preserves the idea of explicit recipes and reviewable state transitions in a small independent tool.

## Development

```sh
npm install
npm run build
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

Use `npm run package:smoke` or `npm pack --dry-run` to confirm the release tarball includes the support docs and runnable package contents. `npm run docs:smoke` verifies that the documented release URL stays aligned with the package name and version.
