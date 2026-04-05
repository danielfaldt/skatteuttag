# CODEX_CONTEXT

## Purpose

Skatteuttag is a Docker Compose based FastAPI web app for Swedish salary and dividend planning in a two-owner spouse setup with 50/50 ownership.

## Scope

- Everything must stay inside `/home/daniel/src/skatteuttag`.
- Development and dev deployment only.
- Production must never be touched without a direct, specific order.
- Any future production work must back up both database and code before changes.

## Environment

- Dev port: `31847`
- Dev URL: `http://10.20.30.100:31847`
- Runtime: Docker Compose
- App stack: FastAPI, Jinja2, vanilla JavaScript, CSS

## Run

```bash
./deploy-dev.sh
```

## Test

```bash
docker compose --env-file .env.dev run --rm test
```

## Architecture

- `app/main.py`: routes and HTTP surface
- `app/calculator/rules.py`: year constants for `2025` and `2026`
- `app/calculator/tax.py`: salary and service-income tax logic
- `app/calculator/planner.py`: dividend room, scenario evaluation, recommendation selection
- `app/templates/index.html`: page shell
- `app/static/app.js`: client behavior and local storage
- `app/static/styles.css`: UI styling

## Conventions

- Comments and markdown must stay in English.
- Use `apply_patch` for manual file edits.
- Keep the year linkage explicit: one chosen planning year, plus derived salary-base year.

## Critical warnings

- Do not touch anything outside this repository directory.
- Do not do production work.
- Do not modify `/opt/docker`.
