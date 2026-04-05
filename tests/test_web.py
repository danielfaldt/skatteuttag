from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_index_renders():
    response = client.get("/")
    assert response.status_code == 200
    assert "Skatteuttag" in response.text
    assert 'id="language-switch"' in response.text
    assert 'id="export-pdf"' in response.text
    assert 'data-i18n="button.export_pdf"' in response.text
    assert 'id="compensation-mix-analysis"' in response.text
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
    assert 'name="user_other_service_income"' in response.text
    assert 'name="planned_user_pension"' in response.text
    assert 'name="periodization_fund_change"' in response.text
    assert 'name="user_car_benefit"' in response.text
    assert 'id="tax-municipality"' in response.text
    assert 'id="include-church-fee"' in response.text
    assert 'id="tax-parish"' in response.text
    assert 'id="municipal-tax-rate"' in response.text
    assert 'class="info-popover"' in response.text
    assert 'data-i18n="info.opening_retained_earnings"' in response.text


def test_api_calculate_returns_json():
    response = client.post("/api/calculate", json={"year": 2026})
    assert response.status_code == 200
    payload = response.json()
    assert payload["recommended"]["salary"] >= 0
    assert "compensation_mix" in payload
    assert "summary" in payload["compensation_mix"]
    assert payload["ownership_suggestion"] is None


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


def test_security_and_sitemap_exist():
    assert client.get("/security.txt").status_code == 200
    assert client.get("/sitemap.xml").status_code == 200


def test_client_script_persists_form_state_on_input():
    response = client.get("/static/app.js")
    assert response.status_code == 200
    body = response.text
    assert 'form.addEventListener("input", saveStateIfFormField);' in body
    assert 'localStorage.setItem(STORAGE_KEY, JSON.stringify(formToObject()));' in body
    assert "formatInputValue" in body
    assert 'name="user_share_percentage"' in client.get("/").text
    assert "syncOwnershipDisplay" in body
    assert "ownerSpecificText" in body
    assert "/api/ownership-analysis" in body
    assert "signed-amount" in body
    assert "field.user_birth_year" in body
    assert "field.spouse_birth_year" in body
    assert "info.opening_retained_earnings" in body
    assert "info.periodization_fund_change" in body
    assert "ownership.loading_title" in body
    assert "ownership-loading" in body
    assert "ownership.input_label" in body
    assert "ownership.proposal_label" in body
    assert "renderCompensationMixAnalysis" in body
    assert "mix.title" in body
    assert "mix.summary_mixed" in body
    assert "mix.comparison_more_salary" in body
    assert "recommended.final_title" in body
    assert "renderFinalPlan" in body
    assert "ownership-comparison-row" in body
    assert "/api/municipal-tax/" in body
    assert "tax-municipality" in body
    assert "include-church-fee" in body
    assert "municipalTaxManualOverride" in body
    assert 'ownerSpecificText("birth_year", "user")' in body
    assert 'document.addEventListener("click"' in body
    assert "/api/export-pdf" in body
    assert "button.export_pdf" in body
    assert "evaluateArithmeticExpression" in body
    assert "positionInfoPopover" in body
    assert 'event.key !== "Enter"' in body


def test_styles_include_popover_positioning_rules():
    response = client.get("/static/styles.css")
    assert response.status_code == 200
    body = response.text
    assert ".info-popover.align-left .info-panel" in body
    assert ".info-popover.open-upward .info-panel" in body
