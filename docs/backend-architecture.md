# Backend Architecture

## Overview

The backend directory is retained as a Drupal 10 scaffold from the base prototype. For the DVA CLIK role, it represents the implementation path for turning the dashboard concepts into Drupal-native publishing, migration and audit tooling.

## Drupal/GovCMS Fit

Public DVA and CLIK pages expose Drupal 10 + GovCMS metadata. CLIK also exposes Twig theme debug output for a custom `iconagency` theme and Bootstrap Barrio templates.

That makes a Drupal-first backend appropriate for:

- Content modelling for policy pages and libraries.
- Workflow configuration for owner review and publication.
- Taxonomy design for policy area, owner, audience and review cadence.
- Views dashboards for upload status and remediation queues.
- Migrate API and Batch API jobs for large-scale upload work.
- Queue workers for link, accessibility and CLIKChat-readiness checks.

## Prototype-to-Drupal Mapping

| Prototype concept | Drupal implementation path |
| --- | --- |
| Upload batch | Custom content entity or configuration entity |
| Policy page | Structured content type with workflow and revisioning |
| Owner approval | Content Moderation workflow state and role-based permissions |
| Audit issue | Entity reference field, custom entity or report view |
| Health check | Admin report route backed by services and Drush commands |
| CLIKChat readiness | Metadata flags and automated quality signals |
| Status dashboard | Views page, custom controller or admin theme route |

## Existing Scaffold

The copied scaffold still contains a custom Drupal module from the earlier form-workflow prototype. It is useful as a code pattern for:

- Routing.
- Controllers.
- Service classes.
- Install hooks.
- Admin pages.
- JSON API-style request handling.

A production CLIK implementation would rename and reshape that module around migration batches, policy content, audit findings and platform health reports.

## Operational Commands

```bash
docker compose run --rm php composer install
docker compose exec php vendor/bin/drush site:install minimal --site-name="DVA CLIK Prototype" --account-name=admin --account-pass=admin -y
docker compose exec php vendor/bin/drush cache:rebuild
```

## Delivery Notes

The first production increment should avoid over-building. Start with the time-critical publishing workflow, add reporting for policy-owner confirmation and exceptions, then layer in the broader health roadmap and platform-alignment options.
