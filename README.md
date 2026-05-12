# DVA CLIK Drupal Prototype

Vue 3 + Drupal 10/GovCMS-oriented prototype for the DVA Senior Web Developer role supporting CLIK, the Consolidated Library of Information and Knowledge.

## What it demonstrates

- Operational dashboard for coordinating an urgent 2,000-page CLIK policy upload.
- Publishing workflow visibility across library, policy owner, workflow state, progress, risk and next action.
- Content-audit signals for metadata gaps, broken references, heading structure and duplicate content.
- Drupal platform-health framing for GovCMS posture, custom theme surface, accessibility and performance.
- CLIKChat-readiness thinking, where content accuracy and currency directly affect AI-assisted staff support.
- GitHub Actions CI evidence for repeatable lint, unit test, typecheck, build, browser smoke test and backend metadata validation.

## Architecture

The repository keeps the prototype concerns separated:

- `frontend`: Vue 3, Vite, TypeScript and Sass dashboard prototype.
- `backend`: Drupal 10 scaffold with Composer, Drush and a reusable custom-module pattern.
- `docker`: Nginx and PHP-FPM local runtime configuration.
- `docs`: Architecture, research, testing and CI/CD notes.
- `pitch`: One-page candidate response draft aligned to the supplied response form.

In a production CLIK implementation, the dashboard concepts would map to Drupal content types/entities, taxonomy vocabularies, Content Moderation workflows, Migrate/Batch API jobs, Queue workers, Views dashboards and admin routes.

## Prerequisites

- Node.js 20.19+ for CI parity. The repo includes `.nvmrc` set to Node 22.12.0.
- pnpm 10.18.3, managed via Corepack and `frontend/package.json`.
- Docker and Docker Compose for the Drupal/MariaDB/Nginx scaffold.
- Playwright Chromium dependencies, required only for local browser tests.
- Composer is optional locally if using Docker; the PHP container can run Composer for the backend scaffold.

## Local setup

```bash
pnpm --dir frontend install
pnpm --dir frontend dev
```

The frontend runs at `http://localhost:5173`.

Useful local checks:

```bash
pnpm --dir frontend lint
pnpm --dir frontend test:unit
pnpm --dir frontend typecheck
pnpm --dir frontend build
pnpm --dir frontend exec playwright install chromium
pnpm --dir frontend test:e2e
```

## Local access

| Area | URL | Notes |
| --- | --- | --- |
| Frontend | `http://localhost:5173` | Vue CLIK operations console |
| Drupal scaffold | `http://localhost:8080` | Nginx/PHP-FPM Drupal runtime |
| Drupal API scaffold | `http://localhost:8080/api/service-records` | Retained API route from the reusable module scaffold |
| Drupal admin | `http://localhost:8080/user/login` | Login with `admin` / `admin` after local install |
| MariaDB | `localhost:3307` | Local database exposed from Docker |

## Full local verification

Run these commands from the repository root for a clean verification. The first block exercises the Docker/Drupal scaffold; the second block validates the frontend prototype.

```bash
# Optional cleanup of generated dependencies, build output and local artefacts.
rm -rf \
  node_modules \
  frontend/node_modules \
  frontend/dist \
  frontend/build \
  frontend/.vite \
  frontend/coverage \
  frontend/playwright-report \
  frontend/test-results \
  backend/vendor \
  backend/web/core \
  backend/web/sites/default/files \
  .DS_Store \
  __MACOSX

# Reset containers, networks and the local database volume.
docker compose down -v

# Build local Docker images.
docker compose build

# Install Drupal/PHP dependencies inside the PHP container.
docker compose run --rm php composer install

# Start the runtime services.
docker compose up -d mariadb php nginx frontend

# Confirm container status.
docker compose ps

# Confirm MariaDB connectivity from the PHP container.
docker compose exec php php -r '
new PDO("mysql:host=mariadb;dbname=citizen_service", "citizen_service", "citizen_service");
echo "DB OK\n";
'
sleep 5 # in case we need to copy all commands in one go

# Install Drupal using the local settings.php database configuration.
docker compose exec php vendor/bin/drush site:install minimal \
  --site-name="DVA CLIK Prototype" \
  --account-name=admin \
  --account-pass=admin \
  -y
  sleep 5 # in case we need to copy all commands in one go

# Enable the retained custom API module and rebuild Drupal cache.
docker compose exec php vendor/bin/drush pm:enable citizen_service_record -y
docker compose exec php vendor/bin/drush updatedb -y
docker compose exec php vendor/bin/drush cache:rebuild

# Check the scaffold API list endpoint.
curl -i http://localhost:8080/api/service-records

# Create a sample scaffold record through the Drupal API.
curl -i -X POST http://localhost:8080/api/service-records \
  -H "Content-Type: application/json" \
  -d '{
    "applicant": {
      "firstName": "Alex",
      "lastName": "Policy",
      "dateOfBirth": "1990-01-01"
    },
    "contact": {
      "email": "alex.policy@example.gov.au",
      "phone": "0499000000",
      "residentialAddress": "Brisbane QLD"
    },
    "relatedParties": [],
    "supportingDocuments": []
  }'

# Confirm records are available from the API.
curl -i http://localhost:8080/api/service-records

# Confirm the frontend responds.
curl -i http://localhost:5173

# Install frontend dependencies for local quality checks.
pnpm --dir frontend install

# Install the Chromium browser used by Playwright.
pnpm --dir frontend exec playwright install chromium

# Run frontend validation.
pnpm --dir frontend lint
pnpm --dir frontend test:unit
pnpm --dir frontend typecheck
pnpm --dir frontend build
pnpm --dir frontend test:e2e

# Optional browser debugging commands.
pnpm --dir frontend test:e2e:headed
pnpm --dir frontend test:e2e:ui
```

## Daily development commands

```bash
# Start the local stack in the background.
docker compose up -d mariadb php nginx frontend

# Confirm container status.
docker compose ps

# View all service logs.
docker compose logs -f

# View Drupal/PHP and Nginx logs.
docker compose logs -f php nginx

# Rebuild Drupal cache.
docker compose exec php vendor/bin/drush updatedb -y
docker compose exec php vendor/bin/drush cache:rebuild

# Check the scaffold API.
curl -i http://localhost:8080/api/service-records

# Run frontend checks.
pnpm --dir frontend lint
pnpm --dir frontend test:unit
pnpm --dir frontend typecheck
pnpm --dir frontend build
pnpm --dir frontend test:e2e
```

## Docker

```bash
# Start the full local stack with logs attached.
docker compose up --build

# Start the stack in the background.
docker compose up -d mariadb php nginx frontend

# Stop containers while keeping the database volume.
docker compose down

# Stop containers and delete the database volume.
docker compose down -v
```

Frontend container URL: `http://localhost:5173`.

Drupal scaffold URL: `http://localhost:8080`.

## Configuration

The frontend reads one public environment variable:

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | API base URL used by retained scaffold routes. Docker sets this to `http://localhost:8080/api`. |

Docker database settings are configured in `docker-compose.yml`:

| Variable | Value |
| --- | --- |
| `DRUPAL_DB_HOST` | `mariadb` |
| `DRUPAL_DB_NAME` | `citizen_service` |
| `DRUPAL_DB_USER` | `citizen_service` |
| `DRUPAL_DB_PASSWORD` | `citizen_service` |

## CI / GitHub Actions

`.github/workflows/ci.yml` runs on pushes to `main`, pull requests to `main`, and manual dispatch.

The install-and-verify job uses Node.js 20.19.0 and Corepack-managed `pnpm@10.18.3`, then runs:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm test:unit`
- `pnpm typecheck`
- `pnpm build`

The Playwright job runs on `ubuntu-22.04`, installs Chromium dependencies, runs `pnpm test:e2e`, and uploads `frontend/playwright-report` as an artifact.

The backend validation job installs PHP 8.3 and Composer, then runs:

- `composer validate --no-check-publish`

## npm scripts

| Script | Description |
| --- | --- |
| `dev` | Start the Vite dev server |
| `build` | Type-check and build the frontend |
| `preview` | Preview the production build locally |
| `lint` | Run ESLint |
| `lint:fix` | Run ESLint with autofix |
| `test` | Run Vitest unit tests |
| `test:unit` | Run Vitest unit tests |
| `typecheck` | Type-check without emitting files |
| `test:e2e` | Run Playwright smoke tests |
| `test:e2e:headed` | Run Playwright with a visible browser |
| `test:e2e:ui` | Open the Playwright UI runner |
| `test:e2e:debug` | Run Playwright in debug mode |

## Backend commands

```bash
# Install backend dependencies.
docker compose run --rm php composer install

# Open a shell in the PHP container.
docker compose exec php bash

# Check Drupal status.
docker compose exec php vendor/bin/drush status

# Rebuild Drupal cache.
docker compose exec php vendor/bin/drush cache:rebuild

# Enable the retained custom module.
docker compose exec php vendor/bin/drush pm:enable citizen_service_record -y

# Validate Composer metadata, if Composer is available locally.
cd backend
composer validate --no-check-publish
```

## Database commands

```bash
# Open MariaDB as root.
docker compose exec mariadb mariadb -uroot -proot

# Open MariaDB as the application user.
docker compose exec mariadb mariadb -ucitizen_service -pcitizen_service citizen_service
```

## Playwright

The active browser smoke test is scoped to the DVA CLIK operations dashboard.

```bash
# Run all configured E2E tests headless.
pnpm --dir frontend test:e2e

# Run the dashboard smoke test with the browser visible.
pnpm --dir frontend test:e2e:headed -- home.spec.ts

# Open the Playwright UI runner.
pnpm --dir frontend test:e2e:ui

# Debug the dashboard smoke test interactively.
pnpm --dir frontend test:e2e:debug -- home.spec.ts
```

## Troubleshooting

- Use Node.js 20.19+ for local Playwright parity; older Node 18 releases can fail to load Playwright ESM config.
- If Playwright browser dependencies are missing locally, run `pnpm --dir frontend exec playwright install chromium`.
- If port `5173` is already in use, stop the existing Vite process or change the local dev-server port.
- Reset Docker volumes with `docker compose down -v` when you need a clean Drupal/MariaDB state.
- Rebuild the Docker stack after backend or container configuration changes.
