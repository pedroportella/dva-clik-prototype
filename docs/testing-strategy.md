# Testing Strategy

## Overview

The prototype keeps the base automated testing stack, but narrows browser coverage to the DVA CLIK operations console.

## Current Coverage

- Vitest unit tests for retained frontend store behaviour.
- Playwright smoke test for the DVA CLIK dashboard.
- Production build validation through `vue-tsc` and Vite.

## Commands

```bash
pnpm --dir frontend test
pnpm --dir frontend build
pnpm --dir frontend test:e2e
```

## Notes

The old form-wizard end-to-end scenarios are still present as historical helpers, but Playwright is configured to run the new `home.spec.ts` dashboard smoke test only.

For a production CLIK implementation, the next tests should cover:

- Filtering upload batches by library and workflow state.
- Audit issue counts and empty states.
- Keyboard navigation through the dashboard controls.
- Drupal-backed migration batch APIs.
- Accessibility checks for table semantics, headings and focus states.
