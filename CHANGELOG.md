# Changelog

## Unreleased

- Reject scan targets containing zero JavaScript or TypeScript source files with an informative exit-code 1 error instead of producing an unearned perfect score.
- Harden score calculation against non-finite or invalid penalties with bounded clamping.
- Add comprehensive test coverage across all finding severity combinations and CLI threshold gates.
- Distribute the `@rogerchappel/statecraft` package artifact through GitHub Releases, with source-checkout installation supported and npm-registry publication reserved for a future release.
- Ignore detector vocabulary inside JavaScript and TypeScript regular-expression literals while preserving division expressions and executable template interpolations.

## 0.1.0

- Initial local-first MVP with read-only Redux-style audit CLI.
