# Skatteuttag

Skatteuttag is a developer-focused web application for Swedish compensation planning in a private limited company context. It models salary and dividend extraction for a company owned by spouses, where only the user receives salary from the company and the spouse has salary income from another employer.

The app takes one planning year as the controlling input and derives the relevant rule years from that choice. Salary tax is computed for the selected year, while the wage-linked part of the dividend room uses the salary-base year that legally feeds into that planning year.

The primary company input is the company result before corporate tax. The app then models cash salary, taxable car benefit, employer contributions, occupational pension, special payroll tax on pension, periodization fund changes, and corporate tax from that starting point.

## Features

- One-year planning input with explicit salary-base-year mapping
- Built-in bilingual UI with Swedish and English
- Locale-friendly number formatting with thousands separators in the browser
- Municipal-tax auto-fill from official Skatteverket municipality and parish tables for `2025` and `2026`, plus a derived total-local-tax display that shows burial fee and optional church fee separately from the editable income-tax field
- Salary and dividend recommendation aimed at the user's target annual net income
- Adjustable optimization profile for the main recommendation, including target-fit, lower-tax guardrails, household-maximum, and tax-minimizing modes
- Optional household net floor that can be used as a hard steering condition in the recommendation search
- Explicit salary-versus-dividend analysis with reasoning and nearby comparison mixes
- Server-generated PDF export for formal review by advisors, auditors, or the user
- JSON export/import for moving scenarios between browsers or archiving a scenario together with the latest analysis, available from the compact header actions menu
- JSON export/import only embeds the latest analysis when it still matches the current form values, so exported files do not silently mix fresh inputs with stale results
- Birth-year-aware personal tax and employer contribution handling
- Adjustable ownership split between spouses, plus an indicative ownership suggestion when a different split lowers total tax
- Additional planning inputs for salary outside the company, car benefit, occupational pension, opening periodization-fund balance, and periodization fund adjustments
- Side-by-side alternative scenarios
- Transparent breakdown of company tax, salary tax, dividend tax, and qualified dividend room
- Browser local storage for form persistence
- Built-in `security.txt`, `sitemap.xml`, and health endpoint
- Docker Compose based development workflow

## Supported rule years

- `2025`: old 3:12 structure with simplification rule or main rule, salary threshold, saved-space uplift, and old cost-basis interest
- `2026`: new 3:12 structure with one combined rule, ground amount, wage-based room, interest on cost basis above SEK 100,000, and no saved-space uplift

## Architecture overview

- `app/main.py`: FastAPI application, page routes, API route, and lightweight SEO/security routes
- `app/calculator/rules.py`: year-specific tax and dividend rule tables
- `app/calculator/tax.py`: personal-tax engine for earned income, service-taxed dividend overflow, burial fee, church fee, and senior-age handling
- `app/calculator/planner.py`: dividend-room logic, company budget modeling, scenario search, compensation-mix analysis, and recommendation scoring
- The recommendation search can now be steered by both an optimization profile and a household net floor.
- `app/tax_rates.py`: municipality and parish tax-rate catalog parsing from official Skatteverket datasets
- `app/templates/index.html`: server-rendered shell
- `app/static/app.js`: form handling, local storage, and result rendering
- `app/static/styles.css`: application styling
- `tests/`: unit and application tests

## Development setup

Everything runs in Docker with Docker Compose.

### Build and start the dev app

```bash
./deploy-dev.sh
```

The script rebuilds the image, restarts the `web` service, and leaves the app running on port `31847`.

### Manual access

Open:

```text
http://10.20.30.100:31847
```

If the app is also exposed through Nginx Proxy Manager on the LAN hostname, keep `APP_BASE_URL` pointed at that HTTPS origin so generated routes such as `security.txt` and `sitemap.xml` use the public URL. Static assets are intentionally served from same-origin `/static/...` paths so the browser uses whichever scheme and host the page itself was loaded from.

Use the `Actions` menu in the header to save the current form state plus the latest analysis as a JSON file, import a previously exported scenario, or export the formal PDF report.

### Run tests

```bash
docker compose --env-file .env.dev build test
docker compose --env-file .env.dev run --rm test
```

## Key modelling assumptions

- The company is a Swedish private limited company.
- The user can set the ownership split between spouses.
- Only the user receives salary from the company.
- Birth year affects both personal tax treatment and employer contribution rate.
- Salary outside the company for the user is modeled as additional earned income and affects base deduction, earned-income credit, pension fee, and marginal tax.
- Taxable car benefit affects salary tax and employer contributions but does not count as cash net income toward the target.
- Occupational pension is checked against the deduction envelope using the higher of the current pension base and the user's prior-year company salary.
- Positive periodization fund amounts are treated as allocations; negative values are treated as reversals and cannot exceed the stated opening balance.
- If a planned periodization-fund allocation exceeds what the current year result allows, the app now returns a specific validation error with the maximum allowed amount instead of a generic infeasible-scenario error.
- The spouse's external salary only affects the spouse's tax result where dividends spill into service taxation.
- Dividends are limited to current-year post-corporate-tax profit plus any opening retained earnings entered by the user.
- The visible municipal-tax field models municipal and regional income tax. Burial fee and optional church fee are fetched separately from municipality and parish data.
- The main recommendation can prioritize user target-fit, staying under state income tax and inside qualified dividend room where feasible, highest household net, or lowest total tax depending on the selected optimization profile.
- The app still uses one shared local tax setup for the household rather than separate municipality selections per owner.
- The current implementation supports planning years `2025` and `2026` only.

## Dev deployment

- Port: `31847`
- Runtime: Docker Compose
- Web server: `uvicorn`
- Container entrypoint: `uvicorn app.main:app --host 0.0.0.0 --port 31847`
- `APP_BASE_URL` in `.env.dev` is currently set to `https://skatteuttag.lan.intend.se` for proxied LAN access

## Known limitations

- The app does not yet support years beyond `2026`.
- Municipal tax is still shared across both spouses rather than tracked per owner with separate municipality selections.
- The pension model still assumes one simplified deduction envelope rather than a full historical pension-right analysis.
- The app is an estimation and planning tool, not a filing engine.

## Source basis

The calculation model was implemented against official Skatteverket rule material for:

- salary tax constants for income years `2025` and `2026`
- dividend-room constants for K10 rules in `2025` and `2026`
- the 2026 rule change for qualified shares in closely held companies
