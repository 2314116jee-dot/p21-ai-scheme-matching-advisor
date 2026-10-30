from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from backend.database import get_db
from backend.models.user import User
from backend.schemas.ai import AIQueryRequest, AIQueryResponse, AIProviderStatusResponse
from backend.services.ai_service import query_rag_advisor, check_ai_provider_status
from backend.api.deps import get_current_user_optional

router = APIRouter(prefix="/api/ai", tags=["AI Advisory & Natural Language Discovery"])


@router.post("/ask", response_model=AIQueryResponse)
async def ask_scheme_advisor(
    payload: AIQueryRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Natural-language scheme discovery endpoint.
    Retrieves relevant verified schemes, applies metadata filters, and returns
    a grounded response with citations and actionable next steps.
    """
    if not payload.query or len(payload.query.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query must contain at least 3 characters."
        )

    response = await query_rag_advisor(db, payload, user=current_user)
    return response


@router.get("/status", response_model=AIProviderStatusResponse)
async def get_ai_status():
    """Diagnostic check reporting AI provider availability, model, and active mode."""
    return await check_ai_provider_status()
