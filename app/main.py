from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .annual_report import import_annual_report
from .calculator.planner import CalculationInputError, PlanningInput, build_ownership_analysis, plan_compensation
from .calculator.rules import SUPPORTED_YEARS
from .config import settings
from .pdf_report import generate_pdf_report
from .tax_rates import municipality_payload


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

app = FastAPI(title=settings.app_name)
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


@app.get("/", response_class=HTMLResponse)
def index(request: Request) -> HTMLResponse:
    defaults = PlanningInput().model_dump()
    asset_version = max(
        int((STATIC_DIR / "app.js").stat().st_mtime),
        int((STATIC_DIR / "styles.css").stat().st_mtime),
    )
    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "app_name": settings.app_name,
            "defaults": defaults,
            "supported_years": SUPPORTED_YEARS,
            "app_base_url": settings.app_base_url,
            "asset_version": asset_version,
        },
    )


@app.post("/api/calculate")
async def calculate(request: Request) -> JSONResponse:
    payload = await request.json()
    try:
        result = plan_compensation(payload, include_ownership_analysis=False)
    except CalculationInputError as exc:
        raise HTTPException(status_code=422, detail=exc.to_detail()) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return JSONResponse(result)


@app.post("/api/ownership-analysis")
async def ownership_analysis(request: Request) -> JSONResponse:
    payload = await request.json()
    try:
        result = build_ownership_analysis(payload)
    except CalculationInputError as exc:
        raise HTTPException(status_code=422, detail=exc.to_detail()) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return JSONResponse(result)


@app.get("/api/municipal-tax/{year}")
def municipal_tax(year: int) -> JSONResponse:
    try:
        PlanningInput.validate_year(year)
        result = municipality_payload(year)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return JSONResponse(result)


@app.post("/api/export-pdf")
async def export_pdf(request: Request) -> Response:
    payload = await request.json()
    language = payload.pop("language", "sv")
    try:
        pdf_bytes = generate_pdf_report(payload, language=language)
    except CalculationInputError as exc:
        raise HTTPException(status_code=422, detail=exc.to_detail()) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="skatteuttag-report.pdf"'},
    )


@app.post("/api/import-annual-report")
async def import_annual_report_route(file: UploadFile = File(...)) -> JSONResponse:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Välj en PDF med årsredovisningen.")

    try:
        payload = import_annual_report(await file.read(), filename=file.filename)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return JSONResponse(payload)


@app.get("/health")
def health() -> JSONResponse:
    return JSONResponse({"status": "ok", "app": settings.app_name, "env": settings.app_env})


@app.get("/security.txt")
def security_txt() -> PlainTextResponse:
    body = "\n".join(
        [
            f"Contact: {settings.security_contact}",
            f"Canonical: {settings.app_base_url}/security.txt",
            "Policy: This is a development deployment. Report issues through the listed contact.",
        ]
    )
    return PlainTextResponse(body, media_type="text/plain")


@app.get("/sitemap.xml")
def sitemap() -> Response:
    base = settings.app_base_url.rstrip("/")
    body = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{base}/</loc></url>
  <url><loc>{base}/security.txt</loc></url>
  <url><loc>{base}/health</loc></url>
</urlset>
"""
    return Response(content=body, media_type="application/xml")
