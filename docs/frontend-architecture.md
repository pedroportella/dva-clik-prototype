# Frontend Architecture

## Overview

The frontend is a Vue 3 application that presents a DVA CLIK operational dashboard. It is intentionally framed as an internal working surface rather than a marketing page.

The screen focuses on the delivery problem: coordinating a time-critical 2,000-page policy upload while keeping content quality, accessibility, platform health and release readiness visible.

## Delivered Capabilities

- Migration program metrics for the 2,000-page upload.
- Filterable publishing queue by CLIK library and workflow state.
- Policy-owner confirmation workflow.
- Content audit issue summary covering metadata, links, headings and duplicates.
- Service health checks across release posture, template consistency, accessibility and performance.
- Platform-planning options for service alignment.
- Ticket-management and user-support action prompts.

## Technology Stack

- Vue 3.
- TypeScript.
- Vite.
- Vue Router.
- Pinia retained from the base scaffold.
- Sass.
- Vitest and Playwright retained for verification pathways.

## Design Approach

The interface is dense and operational:

- No hero-style marketing layout.
- High-signal dashboard metrics.
- Accessible table markup for upload governance.
- Native form controls for filters.
- Short operational labels suitable for repeated use by project leads, content editors, Drupal developers and ICT stakeholders.

## Drupal Integration Path

In a production Drupal implementation, the same concepts could map to:

- Content entities for policy pages and migration batches.
- Workflow states for draft, owner review, approved and published.
- Taxonomy vocabularies for library, policy area, audience, owner and review cadence.
- Batch/Migrate API jobs for source ingestion.
- Views dashboards for upload status, audit exceptions and release reporting.
- Queue workers for link checking, accessibility checks and release-readiness signals.
