from io import BytesIO

from fastapi.testclient import TestClient
from reportlab.pdfgen import canvas

from app.annual_report import parse_annual_report_pages
from app.main import app


client = TestClient(app)


def build_pdf(lines: list[str]) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)
    y = 800
    for line in lines:
        pdf.drawString(72, y, line)
        y -= 20
    pdf.save()
    return buffer.getvalue()


def test_parse_annual_report_pages_extracts_known_fields():
    pages = [
        "\n".join(
            [
                "Resultat efter finansiella poster 846 312 318 472",
                "Balanserat resultat 405 055 303 055",
                "Årets resultat 646 312 102 000",
                "Obeskattade reserver 650 000 850 000",
            ]
        )
    ]

    fields = parse_annual_report_pages(pages)

    assert fields["company_result_before_corporate_tax"].value == 846312
    assert fields["opening_retained_earnings"].value == 405055
    assert fields["opening_periodization_fund_balance"].value == 650000


def test_import_annual_report_endpoint_returns_field_matches():
    pdf_bytes = build_pdf(
        [
            "Resultat efter finansiella poster 846 312 318 472",
            "Balanserat resultat 405 055 303 055",
            "Årets resultat 646 312 102 000",
            "Obeskattade reserver 650 000 850 000",
        ]
    )

    response = client.post(
        "/api/import-annual-report",
        files={"file": ("Arsredovisning - Testbolag AB - rakenskapsaret 2025.pdf", pdf_bytes, "application/pdf")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["report_year"] == 2025
    assert payload["fields"]["company_result_before_corporate_tax"]["value"] == 846312
    assert payload["fields"]["opening_retained_earnings"]["value"] == 405055
    assert payload["fields"]["opening_periodization_fund_balance"]["value"] == 650000
