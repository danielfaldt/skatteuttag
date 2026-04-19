# CODEX_CONTEXT

## Purpose

TaxSplit is a Docker Compose based FastAPI web app for Swedish salary and dividend planning in a two-owner spouse setup with configurable ownership percentages, birth years, salary-linked dividend room, adjustable optimization profiles, optional household-net floor, compensation-mix analysis, car benefit, occupational pension, year-split opening periodization funds, municipality/parish based tax auto-fill, a derived total-local-tax display, a compact header actions menu, server-generated PDF export, and JSON export/import of scenarios with embedded analysis snapshots. The Swedish UI name is `Skatteplaneraren`.

## Scope

- Everything must stay inside `/home/daniel/src/taxsplit`.
- Development and dev deployment only.
- Production must never be touched without a direct, specific order.
- Any future production work must back up both database and code before changes.

## Environment

- Dev port: `31847`
- Direct dev URL: `http://10.20.30.100:31847`
- Current LAN HTTPS URL via Nginx Proxy Manager: `https://skatteuttag.lan.intend.se`
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
- `app/calculator/planner.py`: dividend room, scenario evaluation, company budget, pension limits, year-specific local-tax defaults, compensation-mix analysis, ownership analysis, recommendation selection, and the `ownership_analysis_pending` flag used while the background ownership analysis is still running
- `app/tax_rates.py`: official Skatteverket municipality/parish tax catalog parsing for `2025` and `2026`
- `app/templates/index.html`: page shell
- `app/static/app.js`: client behavior, local storage, async i18n loading, actions menu, derived local-tax summary, export staleness guard for embedded analysis, and provisional/final result-state handling while ownership analysis completes
- `app/static/i18n/*.json`: language catalogs; adding a new catalog file makes the language available in the switcher as long as the JSON is valid
- `app/static/styles.css`: UI styling

## Conventions

- Comments and markdown must stay in English.
- Chat communication with the admin/developer must follow the language used by the admin/developer.
- Use `apply_patch` for manual file edits.
- Keep the year linkage explicit: one chosen planning year, plus derived salary-base year.
- Keep browser-loaded static assets same-origin via `/static/...` paths so the app works correctly over both direct HTTP and proxied HTTPS.
- Keep static asset URLs cache-busted from the page template so new frontend error handling reaches browsers immediately after deploy.
- Keep frontend translations in `app/static/i18n/*.json`; do not re-inline them into `app.js`.
- The main recommendation is steerable through `optimization_profile` plus `household_min_net_income`, including a guardrails mode that prioritizes staying below state income tax and inside qualified dividend room where feasible.
- Keep gross-versus-net wording explicit in both inputs and outputs: salary and dividend amounts shown as recommended extraction are gross unless the UI explicitly says net after tax.
- Treat user-entered car benefit as taxable compensation that affects tax and employer contributions but not cash net salary toward the target.
- Treat positive `periodization_fund_change` as a new allocation and negative values as an extra voluntary reversal on top of any oldest-first mandatory reversals.
- Keep opening periodization funds split by original tax year so mandatory reversal order, gross-up factors, and schablon income can be calculated correctly; legacy JSON imports may still arrive with only `opening_periodization_fund_balance` and must degrade gracefully.
- Surface periodization-fund and pension-limit input errors explicitly; do not collapse them into a generic "no feasible scenario" message.
- The visible municipal-tax field covers municipal and regional income tax. Burial fee and any church fee are handled separately from the same municipality/parish dataset.

## Critical warnings

- Do not touch anything outside this repository directory.
- Do not do production work.
- Do not modify `/opt/docker`.
