# Sentry Integration

This project uses Sentry for error tracking. There are two separate concerns:

## Runtime error reporting (DSN)

- File: `apps/web/instrument.server.mjs`, `apps/dashboard/instrument.server.mjs`
- Purpose: Initialize the Sentry SDK at runtime.
- Required env: `VITE_SENTRY_DSN`
- Notes: If the DSN is missing, Sentry is not initialized and a warning is logged.

## Build-time sourcemap upload

- File: `apps/web/vite.config.ts`, `apps/dashboard/vite.config.ts`
- Purpose: Upload sourcemaps so Sentry can map minified stack traces to
  original source files.
- Required env:
  - `SENTRY_AUTH_TOKEN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`
- Notes: If these are missing, the Vite Sentry plugin is disabled.

## Why sourcemaps

Production bundles are minified and bundled. Without sourcemaps, stack traces
point to compiled files (e.g. `dist/assets/index-XYZ.js:1:12345`). With
sourcemaps uploaded, Sentry shows the original TypeScript/TSX file and line.
