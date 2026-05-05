# Release candidate readiness

Generated: 2026-05-06 07:28:03 AEST
Base branch: main
Readiness branch: release-candidate/readiness
Base commit: 498e785

## Local verification

- npm ci: PASS
- npm run release:check: PASS
- bash scripts/validate.sh: PASS
- releasebox check: PASS

## ReleaseBox notes

The branch records the local release-readiness gate results requested for this release candidate pass. Dependencies were installed inside the isolated worktree before rerunning the readiness gates. Full command output was reviewed locally; this document keeps a durable summary in the repository for PR review.

## Reviewer checklist

- [ ] Confirm package metadata and repository links are correct.
- [ ] Confirm README/usage docs match the current CLI/API surface.
- [ ] Confirm release notes/changelog are ready for the intended version.
- [ ] Re-run the release checks in CI or locally before tagging.
