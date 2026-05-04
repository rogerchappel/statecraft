# Security Policy

Statecraft is intended to run locally against private application code.

## Supported versions

The current `main` branch receives security fixes until the first stable release policy is published.

## Reporting

Please open a private GitHub security advisory or contact the maintainer through GitHub if you find a vulnerability.

## Data handling

The CLI reads local source files and writes reports to stdout/stderr only. It does not upload code, execute target project files, or mutate app code in the MVP.
