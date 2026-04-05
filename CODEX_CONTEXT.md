# CODEX_CONTEXT

## Purpose

Skatteuttag is a Docker Compose based FastAPI web app for Swedish salary and dividend planning in a two-owner spouse setup with configurable ownership percentages, birth years, salary-linked dividend room, car benefit, occupational pension, and periodization-fund adjustments.

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
- `app/calculator/tax.py`: salary and service-income tax logic, including senior-age tax handling
- `app/calculator/planner.py`: dividend room, scenario evaluation, company budget, pension limits, and recommendation selection
- `app/templates/index.html`: page shell
- `app/static/app.js`: client behavior and local storage
- `app/static/app.js`: client behavior, local storage, and Swedish/English i18n
- `app/static/styles.css`: UI styling

## Conventions

- Comments and markdown must stay in English.
- Chat communication with the admin/developer must follow the language used by the admin/developer.
- Use `apply_patch` for manual file edits.
- Keep the year linkage explicit: one chosen planning year, plus derived salary-base year.
- Treat user-entered car benefit as taxable compensation that affects tax and employer contributions but not cash net salary toward the target.
- Treat positive `periodization_fund_change` as an allocation and negative values as reversal.

## Critical warnings

- Do not touch anything outside this repository directory.
- Do not do production work.
- Do not modify `/opt/docker`.
