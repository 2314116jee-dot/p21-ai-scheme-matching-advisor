from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.database import get_db
from backend.config import settings
from backend.services.ai_service import check_ai_provider_status

router = APIRouter(tags=["Health & Status"])


@router.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    # 1. Check PostgreSQL
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    # 2. Check AI Provider Status
    ai_status = await check_ai_provider_status()

    return {
        "status": "healthy" if db_ok else "unhealthy",
        "app": "P21: AI Scheme-Matching Advisor",
        "environment": settings.ENVIRONMENT,
        "database": {
            "connected": db_ok,
            "engine": "PostgreSQL 17"
        },
        "ai_service": {
            "provider": ai_status.active_provider,
            "model": ai_status.model_name,
            "connected": ai_status.is_available,
            "notice": ai_status.details
        }
    }
