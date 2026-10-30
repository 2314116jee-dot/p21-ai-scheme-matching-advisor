from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx

from backend.database import get_db
from backend.config import settings

router = APIRouter(tags=["Health & Status"])


@router.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    # 1. Check PostgreSQL
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_ok = False

    # 2. Check Ollama
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags")
            if resp.status_code == 200:
                ollama_ok = True
    except Exception:
        ollama_ok = False

    return {
        "status": "healthy" if db_ok else "unhealthy",
        "app": "P21: AI Scheme-Matching Advisor",
        "environment": settings.ENVIRONMENT,
        "database": {
            "connected": db_ok,
            "engine": "PostgreSQL 17"
        },
        "ai_service": {
            "provider": settings.AI_PROVIDER,
            "model": settings.OLLAMA_MODEL,
            "connected": ollama_ok,
            "notice": "Online" if ollama_ok else "Deterministic fallback active (Ollama not running)"
        }
    }
