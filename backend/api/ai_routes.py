from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from backend.database import get_db
from backend.models.user import User
from backend.schemas.ai import (
    AIQueryRequest,
    AIQueryResponse,
    AIChatRequest,
    AIChatResponse,
    AIProviderStatusResponse,
    SuggestedPromptsResponse,
)
from backend.services.ai_service import (
    query_rag_advisor,
    chat_rag_advisor,
    check_ai_provider_status,
    get_domain_suggested_prompts,
)
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


@router.post("/chat", response_model=AIChatResponse)
async def chat_scheme_advisor(
    payload: AIChatRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Conversational chatbot endpoint for Indian entrepreneurs.
    Accepts full message history, applies context-aware hybrid RAG retrieval,
    and returns a source-grounded response with DeepSeek-R1 reasoning extraction.
    """
    if not payload.message or len(payload.message.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message must contain at least 2 characters."
        )

    response = await chat_rag_advisor(db, payload, user=current_user)
    return response


@router.get("/suggested-prompts", response_model=SuggestedPromptsResponse)
async def get_suggested_prompts():
    """Returns curated starter prompts categorized by entrepreneur types."""
    return get_domain_suggested_prompts()


@router.get("/status", response_model=AIProviderStatusResponse)
async def get_ai_status():
    """Diagnostic check reporting AI provider availability, model, and active mode."""
    return await check_ai_provider_status()
