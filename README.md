# Skatteuttag

Skatteuttag is a developer-focused web application for Swedish compensation planning in a private limited company context. It models salary and dividend extraction for a company owned by spouses, where only the user receives salary from the company and the spouse has salary income from another employer.

The app takes one planning year as the controlling input and derives the relevant rule years from that choice. Salary tax is computed for the selected year, while the wage-linked part of the dividend room uses the salary-base year that legally feeds into that planning year.

The primary company input is the company result before corporate tax. The app then models cash salary, taxable car benefit, employer contributions, occupational pension, special payroll tax on pension, periodization fund changes, and corporate tax from that starting point.

## Features

- One-year planning input with explicit salary-base-year mapping
- Built-in bilingual UI with Swedish and English
- Locale-friendly number formatting with thousands separators in the browser
- Salary and dividend recommendation aimed at the user's target annual net income
- Birth-year-aware personal tax and employer contribution handling
- Adjustable ownership split between spouses, plus an indicative ownership suggestion when a different split lowers total tax
- Additional planning inputs for user service income, car benefit, occupational pension, and periodization fund adjustments
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
- `app/calculator/tax.py`: salary and service-income tax engine, including senior-age handling
- `app/calculator/planner.py`: dividend-room logic, company budget modeling, scenario search, and recommendation scoring
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

### Run tests

```bash
docker compose --env-file .env.dev run --rm test
```

## Key modelling assumptions

- The company is a Swedish private limited company.
- The user can set the ownership split between spouses.
- Only the user receives salary from the company.
- Birth year affects both personal tax treatment and employer contribution rate.
- Other service income for the user is modeled separately from company compensation.
- Taxable car benefit affects salary tax and employer contributions but does not count as cash net income toward the target.
- Occupational pension is checked against the model's main-rule deduction envelope.
- Positive periodization fund amounts are treated as allocations; negative values are treated as reversals.
- The spouse's external salary only affects the spouse's tax result where dividends spill into service taxation.
- Dividends are limited to current-year post-corporate-tax profit plus any opening retained earnings entered by the user.
- The app uses a single editable municipal tax rate for both spouses.
- The current implementation supports planning years `2025` and `2026` only.

## Dev deployment

- Port: `31847`
- Runtime: Docker Compose
- Web server: `uvicorn`
- Container entrypoint: `uvicorn app.main:app --host 0.0.0.0 --port 31847`

## Known limitations

- The app does not yet support years beyond `2026`.
- Municipal tax is modeled as one user-provided rate rather than separate municipality, burial fee, and faith-community components.
- The app does not yet track opening periodization fund balances, so reversals are user-controlled assumptions.
- The app is an estimation and planning tool, not a filing engine.

## Source basis

The calculation model was implemented against official Skatteverket rule material for:

- salary tax constants for income years `2025` and `2026`
- dividend-room constants for K10 rules in `2025` and `2026`
- the 2026 rule change for qualified shares in closely held companies
