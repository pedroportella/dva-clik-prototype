# CI/CD Pipeline

## Overview

The prototype now uses GitHub Actions for CI/CD, matching the approach used in the DEWR prototype work: a small set of repeatable jobs that install dependencies, run quality checks, build the app and execute a Playwright smoke test.

The workflow lives at:

```txt
.github/workflows/ci.yml
```

## Pipeline Jobs

| Job | Purpose |
| --- | --- |
| `install-and-verify` | Installs frontend dependencies, runs lint, unit tests, typecheck and production build. |
| `e2e` | Installs Playwright Chromium and runs the dashboard smoke test. |
| `backend-validate` | Validates the Drupal backend Composer metadata. |

## Validation Coverage

- Code quality through ESLint.
- Frontend logic through Vitest.
- TypeScript correctness through `vue-tsc`.
- Production bundle generation through Vite.
- Browser smoke coverage through Playwright.
- Drupal scaffold sanity check through Composer validation.

## Local Command Parity

Run these commands before pushing:

```bash
pnpm --dir frontend install
pnpm --dir frontend lint
pnpm --dir frontend test:unit
pnpm --dir frontend typecheck
pnpm --dir frontend build
pnpm --dir frontend exec playwright install chromium
pnpm --dir frontend test:e2e
```

## Artifacts

The workflow uploads:

- `dva-clik-frontend-dist`: the built frontend output from `frontend/dist`.
- `playwright-report`: the Playwright HTML report for test review.

## Deployment Path

This workflow is intentionally CI-first. For public demo hosting, add a separate GitHub Pages or Netlify deployment job after the `install-and-verify` and `e2e` jobs are passing.

The frontend is a static Vite build, so deployment can publish `frontend/dist` directly.
