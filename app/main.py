from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .calculator.planner import PlanningInput, build_ownership_analysis, plan_compensation
from .calculator.rules import SUPPORTED_YEARS
from .config import settings


BASE_DIR = Path(__file__).resolve().parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

app = FastAPI(title=settings.app_name)
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


@app.get("/", response_class=HTMLResponse)
def index(request: Request) -> HTMLResponse:
    defaults = PlanningInput().model_dump()
    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "app_name": settings.app_name,
            "defaults": defaults,
            "supported_years": SUPPORTED_YEARS,
            "app_base_url": settings.app_base_url,
        },
    )


@app.post("/api/calculate")
async def calculate(request: Request) -> JSONResponse:
    payload = await request.json()
    try:
        result = plan_compensation(payload, include_ownership_analysis=False)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return JSONResponse(result)


@app.post("/api/ownership-analysis")
async def ownership_analysis(request: Request) -> JSONResponse:
    payload = await request.json()
    try:
        result = build_ownership_analysis(payload)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return JSONResponse(result)


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
