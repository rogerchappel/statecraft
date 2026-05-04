#!/usr/bin/env bash
set -euo pipefail
npm test
npm run check
npm run smoke
node dist/src/cli.js scan examples/fixtures/redux-messy --format markdown >/tmp/statecraft-messy.md
