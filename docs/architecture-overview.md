# Architecture Overview

## Overview

The DVA CLIK prototype uses a Drupal/Vue scaffold for a government knowledge-library program.

The application demonstrates an operational surface a delivery team could use to coordinate publishing, audit and health-assessment work. The backend scaffold remains Drupal-oriented so the concept can be mapped to content entities, workflows, Views dashboards, queues and migration jobs.

## Delivered Capabilities

- Vue operations console for the CLIK policy upload program.
- Filterable 2,000-page migration queue.
- Content audit summary for metadata, links, headings and duplicates.
- Platform health checks for Drupal/GovCMS, theme surface, accessibility and performance.
- Architecture options for CLIK alignment with the main DVA website.

## Frontend Layer

- Vue 3 application built with Vite.
- TypeScript and Sass.
- Vue Router for the prototype shell.
- Native HTML tables and controls for accessibility.
- Pinia retained from the base scaffold for future stateful workflows.

## Drupal Layer

The production implementation path would be Drupal-native:

- Content types for policy pages, migration batches and audit findings.
- Taxonomy vocabularies for library, policy area, owner, audience and review status.
- Workflows for draft, policy owner review, approved and published.
- Views dashboards for migration status and exceptions.
- Queue workers for link checks, accessibility checks and CLIKChat-readiness signals.
- Migrate API and Batch API for repeatable ingestion.

## Runtime Layer

The repository keeps the original Docker-oriented scaffold:

- Nginx for local HTTP routing.
- PHP-FPM for Drupal.
- MariaDB for local persistence.
- Vite for frontend development.

## Testing Layer

- Vitest validates retained frontend store logic.
- Playwright is scoped to the DVA CLIK dashboard smoke test.
- Production build verifies TypeScript and Vite output.

## Design Principles

- Prioritise the urgent upload stream first.
- Make policy-owner decisions and blockers visible.
- Treat accessibility and metadata as content quality, not late-stage polish.
- Keep the platform health roadmap concrete enough for ICT triage.
- Keep the public-facing console focused on operational decisions rather than implementation detail.
