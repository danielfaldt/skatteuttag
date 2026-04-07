# CODEX_CONTEXT

## Purpose

Skatteuttag is a Docker Compose based FastAPI web app for Swedish salary and dividend planning in a two-owner spouse setup with configurable ownership percentages, birth years, salary-linked dividend room, adjustable optimization profiles, optional household-net floor, compensation-mix analysis, car benefit, occupational pension, opening periodization-fund balance, municipality/parish based tax auto-fill, a derived total-local-tax display, a compact header actions menu, server-generated PDF export, and JSON export/import of scenarios with embedded analysis snapshots.

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
docker compose --env-file .env.dev build test
docker compose --env-file .env.dev run --rm test
```

## Architecture

- `app/main.py`: routes and HTTP surface
- `app/calculator/rules.py`: year constants for `2025` and `2026`
- `app/calculator/tax.py`: personal-tax logic for earned income, service-taxed dividend overflow, burial fee, church fee, and senior-age tax handling
- `app/calculator/planner.py`: dividend room, scenario evaluation, company budget, pension limits, year-specific local-tax defaults, compensation-mix analysis, ownership analysis, and recommendation selection
- `app/tax_rates.py`: official Skatteverket municipality/parish tax catalog parsing for `2025` and `2026`
- `app/templates/index.html`: page shell
- `app/static/app.js`: client behavior, local storage, Swedish/English i18n, actions menu, and derived local-tax summary
- `app/static/styles.css`: UI styling

## Conventions

- Comments and markdown must stay in English.
- Chat communication with the admin/developer must follow the language used by the admin/developer.
- Use `apply_patch` for manual file edits.
- Keep the year linkage explicit: one chosen planning year, plus derived salary-base year.
- The main recommendation is steerable through `optimization_profile` plus `household_min_net_income`.
- Treat user-entered car benefit as taxable compensation that affects tax and employer contributions but not cash net salary toward the target.
- Treat positive `periodization_fund_change` as an allocation and negative values as reversal that cannot exceed the stated opening balance.
- The visible municipal-tax field covers municipal and regional income tax. Burial fee and any church fee are handled separately from the same municipality/parish dataset.

## Critical warnings

- Do not touch anything outside this repository directory.
- Do not do production work.
- Do not modify `/opt/docker`.
