import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import logging

from backend.config import settings
from backend.database import engine, Base
from backend.api import (
    auth_routes,
    profile_routes,
    scheme_routes,
    assessment_routes,
    saved_routes,
    checklist_routes,
    comparison_routes,
    admin_routes,
    health_routes,
    ai_routes,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("p21")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-flight startup logging
    logger.info("Initializing P21 Scheme-Matching Advisor Backend...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database: {settings.DATABASE_URL.split('@')[-1]}")
    logger.info(f"CORS Origins: {settings.cors_origin_list}")
    yield
    logger.info("P21 Backend shutdown complete.")


app = FastAPI(
    title="P21: AI Scheme-Matching Advisor for Indian Entrepreneurs",
    description="High-assurance, locally hosted AI scheme-matching advisor with authoritative PostgreSQL persistence.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Register API Routers
app.include_router(health_routes.router)
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(scheme_routes.router)
app.include_router(assessment_routes.router)
app.include_router(saved_routes.router)
app.include_router(checklist_routes.router)
app.include_router(comparison_routes.router)
app.include_router(admin_routes.router)
app.include_router(ai_routes.router)

# Safe global exception handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact the administrator."}
    )

# Static file serving & SPA fallback for Hosted Mode (http://localhost:8000)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
assets_dir = os.path.join(frontend_dist, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_spa(full_path: str):
    # Do not intercept API or documentation routes
    if (
        full_path.startswith("api")
        or full_path.startswith("docs")
        or full_path.startswith("openapi.json")
        or full_path.startswith("redoc")
    ):
        return JSONResponse(status_code=404, content={"detail": "Not found"})

    if os.path.exists(frontend_dist):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)

    return JSONResponse(
        status_code=404,
        content={"detail": "Frontend bundle not found. Please build frontend with 'npm run build'."}
    )
