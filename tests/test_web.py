from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_index_renders():
    response = client.get("/")
    assert response.status_code == 200
    assert "Skatteplaneraren" in response.text
    assert 'id="language-switch"' in response.text
    assert 'id="action-menu"' in response.text
    assert 'id="import-annual-report"' in response.text
    assert 'id="import-annual-report-file"' in response.text
    assert 'id="export-data"' in response.text
    assert 'id="import-data"' in response.text
    assert 'id="import-data-file"' in response.text
    assert 'id="export-pdf"' in response.text
    assert 'id="annual-report-status"' in response.text
    assert 'data-i18n="button.export_pdf"' in response.text
    assert 'id="compensation-mix-analysis"' in response.text
    assert 'id="problem-signals"' in response.text
    assert 'id="final-plan-summary"' in response.text
    assert 'id="user-share-slider"' in response.text
    assert 'name="user_display_name"' in response.text
    assert 'name="spouse_display_name"' in response.text
    assert 'name="user_birth_year"' in response.text
    assert 'name="spouse_birth_year"' in response.text
    assert 'id="user-birth-year-label"' in response.text
    assert 'id="spouse-birth-year-label"' in response.text
    assert 'name="user_birth_year" type="number"' in response.text
    assert 'name="spouse_birth_year" type="number"' in response.text
    assert 'name="household_min_net_income"' in response.text
    assert 'name="optimization_profile"' in response.text
    assert 'value="guardrails"' in response.text
    assert 'name="user_other_salary_income"' in response.text
    assert 'name="planned_user_pension"' in response.text
    assert 'name="car_benefit_is_pensionable"' in response.text
    assert 'name="periodization_fund_change"' in response.text
    assert 'name="opening_periodization_fund_balance"' in response.text
    assert 'name="opening_periodization_fund_year_minus_6"' in response.text
    assert 'id="opening-periodization-summary"' in response.text
    assert 'id="periodization-strategy"' in response.text
    assert 'name="user_car_benefit"' in response.text
    assert 'id="tax-municipality"' in response.text
    assert 'id="include-church-fee"' in response.text
    assert 'id="tax-parish"' in response.text
    assert 'id="municipal-tax-rate"' in response.text
    assert 'id="local-tax-summary"' in response.text
    assert 'id="burial-fee-rate"' in response.text
    assert 'id="church-fee-rate"' in response.text
    assert 'href="/static/styles.css?v=' in response.text
    assert 'src="/static/app.js?v=' in response.text
    assert 'class="info-popover"' in response.text
    assert 'data-i18n="info.opening_retained_earnings"' in response.text
    assert 'class="field-grid base-grid"' in response.text


def test_api_calculate_returns_json():
    response = client.post("/api/calculate", json={"year": 2026})
    assert response.status_code == 200
    payload = response.json()
    assert payload["recommended"]["salary"] >= 0
    assert "compensation_mix" in payload
    assert "problems" in payload
    assert "summary" in payload["compensation_mix"]
    assert payload["ownership_analysis_pending"] is True
    assert payload["ownership_suggestion"] is None


def test_api_calculate_returns_structured_periodization_error():
    response = client.post(
        "/api/calculate",
        json={
            "year": 2026,
            "company_result_before_corporate_tax": 846_312,
            "opening_retained_earnings": 1_051_367,
            "spouse_external_salary": 1_500_000,
            "user_car_benefit": 74_688,
            "planned_user_pension": 180_000,
            "opening_periodization_fund_balance": 650_000,
            "prior_year_company_cash_salaries": 650_599,
            "prior_year_user_company_salary": 650_599,
            "periodization_fund_change": 160_000,
        },
    )
    assert response.status_code == 422
    payload = response.json()
    assert payload["detail"]["key"] == "error.periodization_allocation_too_high"
    assert payload["detail"]["params"]["maxAmount"] == 153_938.01


def test_api_ownership_analysis_returns_json():
    response = client.post("/api/ownership-analysis", json={"year": 2026})
    assert response.status_code == 200
    payload = response.json()
    assert "ownership_suggestion" in payload


def test_api_municipal_tax_returns_catalog():
    response = client.get("/api/municipal-tax/2026")
    assert response.status_code == 200
    payload = response.json()
    assert payload["year"] == 2026
    assert payload["municipalities"]
    first = payload["municipalities"][0]
    assert "municipality" in first
    assert "total_excluding_church" in first
    assert "parishes" in first
    assert first["parishes"]


def test_api_export_pdf_returns_pdf():
    response = client.post("/api/export-pdf", json={"year": 2026, "language": "sv"})
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")


def test_api_import_annual_report_rejects_non_pdf():
    response = client.post(
        "/api/import-annual-report",
        files={"file": ("not-a-pdf.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 422


def test_security_and_sitemap_exist():
    assert client.get("/security.txt").status_code == 200
    assert client.get("/sitemap.xml").status_code == 200


def test_client_script_persists_form_state_on_input():
    response = client.get("/static/app.js")
    assert response.status_code == 200
    body = response.text
    sv_translations = client.get("/static/i18n/sv.json")
    assert sv_translations.status_code == 200
    sv_body = sv_translations.text

    assert 'form.addEventListener("input", saveStateIfFormField);' in body
    assert "localStorage.setItem(" in body
    assert "_municipal_tax_manual_override" in body
    assert "ensureTranslationsLoaded" in body
    assert "/static/i18n/" in body
    assert "formatInputValue" in body
    assert "syncOwnershipDisplay" in body
    assert "ownerSpecificText" in body
    assert "/api/ownership-analysis" in body
    assert "signed-amount" in body
    assert "openingPeriodizationSummary" in body
    assert "ownership-loading" in body
    assert "ownership_analysis_pending" in body
    assert "let activeSubmitRequestId = 0;" in body
    assert "clearLoadingState();" in body
    assert "fetchOwnershipAnalysis(payload)" in body
    assert "estimated_extraction_change" in body
    assert "same_plan_household_net_change" in body
    assert "same_plan_total_tax_change" in body
    assert "balansräkningen eller i förändringen av eget kapital" in sv_body
    assert "resultat efter finansiella poster" in sv_body
    assert "resultat före skatt kan annars bli för låg här" in sv_body
    assert "25 % av årets skattemässiga överskott efter återföring av äldre periodiseringsfonder" in sv_body
    assert "Ange årslön före skatt" in sv_body
    assert "bruttolönen från annan arbetsgivare" in sv_body
    assert "arbetsgivardeklarationer eller bokföringens lönekonton" in sv_body
    assert "kontanta bruttolöner under lönebasåret" in sv_body
    assert "kontant bruttolön före skatt" in sv_body
    assert "total bruttoutdelning före utdelningsskatt" in sv_body
    assert "Skatteeffekt" in sv_body
    assert "Ökning i hushållsnetto" in sv_body
    assert "periodization.summary_unused_room_after_goal" in sv_body
    assert "renderProblemSignals" in body
    assert "renderCompensationMixAnalysis" in body
    assert "renderFinalPlan" in body
    assert "ownership-comparison-row" in body
    assert "/api/municipal-tax/" in body
    assert "tax-municipality" in body
    assert "include-church-fee" in body
    assert "municipalTaxManualOverride" in body
    assert "syncLocalTaxComponentInputs" in body
    assert "renderLocalTaxSummary" in body
    assert 'municipalTaxRateInput.value = formatInputValue(localIncomeTax, "percent");' in body
    assert 'applyingMunicipalTaxRate = false;\n  syncLocalTaxComponentInputs();' in body
    assert "burial-fee-rate" in client.get("/").text
    assert "church-fee-rate" in client.get("/").text
    assert 'ownerSpecificText("birth_year", "user")' in body
    assert 'document.addEventListener("click"' in body
    assert "/api/export-pdf" in body
    assert "evaluateArithmeticExpression" in body
    assert "positionInfoPopover" in body
    assert 'event.key !== "Enter"' in body
    assert "EXPORT_SCHEMA" in body
    assert "buildExportPayload" in body
    assert "applyAnnualReportImport" in body
    assert "importAnnualReportFile" in body
    assert "/api/import-annual-report" in body
    assert "annualReportImportPending" in body
    assert "field-autofilled" in body
    assert "importDataFile" in body
    assert "downloadJsonFile" in body
    assert "formatApiErrorDetail" in body
    assert "formatMoneyValue" in body
    assert "normalizeErrorMessage" in body
    assert "error.periodization_allocation_too_high" in sv_body
    assert "error.no_feasible_scenario_from_company_profit" in sv_body
    assert 'id="export-data"' in client.get("/").text
    assert "actionMenu" in body


def test_client_script_supports_portable_data_export_and_import():
    response = client.get("/static/app.js")
    assert response.status_code == 200
    body = response.text
    sv_body = client.get("/static/i18n/sv.json").text
    en_body = client.get("/static/i18n/en.json").text

    assert 'const EXPORT_SCHEMA = "taxsplit-planning-export";' in body
    assert 'const LEGACY_EXPORT_SCHEMA = "skatteuttag-planning-export";' in body
    assert "const EXPORT_VERSION = 1;" in body
    assert '"button.export_data"' in sv_body
    assert '"button.import_data"' in sv_body
    assert '"button.exporting_data"' in sv_body
    assert '"button.importing_data"' in sv_body
    assert '"error.import_invalid_format"' in sv_body
    assert "Gross dividend before dividend tax" in en_body
    assert "function buildPortableState()" in body
    assert "function isCurrentFormSyncedWithAnalysis()" in body
    assert "function buildExportPayload()" in body
    assert "analysis: isCurrentFormSyncedWithAnalysis() ? lastResult : null" in body
    assert 'exportPdf().catch((error) => setError(error));' in body
    assert "function applyImportedState(source)" in body
    assert "function importDataFile(file)" in body
    assert "const isPortableExport = importedSchema === EXPORT_SCHEMA || importedSchema === LEGACY_EXPORT_SCHEMA;" in body
    assert "const importedForm = isPortableExport ? parsed.form : parsed;" in body
    assert 'importDataButton.addEventListener("click"' in body
    assert 'importDataFileInput.addEventListener("change"' in body
    assert 'exportDataButton.addEventListener("click"' in body
    assert "actionMenu.open = false" in body


def test_styles_include_popover_positioning_rules():
    response = client.get("/static/styles.css")
    assert response.status_code == 200
    body = response.text
    assert ".info-popover.align-left .info-panel" in body
    assert ".info-popover.open-upward .info-panel" in body


def test_styles_include_hidden_input_and_compact_checkbox_layout():
    response = client.get("/static/styles.css")
    assert response.status_code == 200
    body = response.text
    assert ".visually-hidden" in body
    assert ".checkbox-row-compact" in body
    assert ".action-menu" in body
    assert ".action-menu-panel" in body
    assert ".annual-report-status" in body
    assert ".annual-report-loading" in body
    assert ".field.field-autofilled::after" in body
    assert "max-width: calc(100vw - 32px);" in body
    assert "width: min(220px, calc(100vw - 48px));" in body
    assert ".hero-note {" in body
    assert "justify-content: flex-start;" in body
    assert "left: 0;" in body
    assert ".tax-summary" in body
    assert ".hero {" in body
    assert "z-index: 4;" in body
