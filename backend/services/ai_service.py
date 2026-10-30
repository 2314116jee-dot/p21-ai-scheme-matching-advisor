"""
P21 Modular AI Service Layer
Provides multi-provider LLM orchestration (Local Ollama, Google Gemini API,
and Deterministic RAG Fallback) with structured outputs, prompt injection safeguards,
and rigorous evidence citation binding.
"""

import httpx
import logging
import datetime
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session

from backend.config import settings
from backend.models.scheme import Scheme, SchemeSource
from backend.models.profile import UserProfile
from backend.models.user import User
from backend.schemas.assessment import ConditionResult
from backend.schemas.ai import (
    AIQueryRequest,
    AIQueryResponse,
    MatchedSchemeBrief,
    SchemeMatchCitation,
    SuggestedAction,
    AIProviderStatusResponse,
)
from backend.services.rag_service import (
    hybrid_retrieve_schemes,
    build_rag_system_prompt,
    build_rag_user_prompt,
    build_deterministic_rag_answer,
)

logger = logging.getLogger("p21.ai")


def build_deterministic_explanation(
    scheme: Scheme,
    overall_result: str,
    passed: List[ConditionResult],
    failed: List[ConditionResult],
    missing: List[ConditionResult],
    sources: List[SchemeSource]
) -> str:
    """Generate a reliable, factual explanation without an external LLM."""
    lines = []
    lines.append(f"**Eligibility Determination: {overall_result}**")
    lines.append(f"Scheme: {scheme.name} ({scheme.ministry})")
    lines.append("")

    if overall_result == "PASS":
        lines.append("Based on the official criteria and your entrepreneur profile, you appear eligible for this scheme.")
        lines.append("Satisfied conditions:")
        for p in passed:
            lines.append(f"- **{p.rule_name}**: {p.reason}")
    elif overall_result == "FAIL":
        lines.append("Your profile currently does not satisfy one or more mandatory eligibility requirements for this scheme:")
        for f in failed:
            lines.append(f"- **{f.rule_name}**: {f.reason}")
        if passed:
            lines.append("\nConditions you met:")
            for p in passed:
                lines.append(f"- {p.rule_name}")
    elif overall_result == "UNKNOWN":
        lines.append("Eligibility could not be definitively determined because essential profile attributes are unrecorded:")
        for m in missing:
            lines.append(f"- **{m.rule_name}**: {m.reason}")
        if passed:
            lines.append("\nCurrently satisfied conditions:")
            for p in passed:
                lines.append(f"- {p.rule_name}")
    else:
        lines.append("This scheme is marked as not applicable under current guidelines.")

    lines.append("\n**Key Benefits:**")
    lines.append(scheme.benefits_summary)

    if sources:
        lines.append("\n**Official Citations:**")
        for s in sources[:3]:
            lines.append(f"- [{s.source_title}]({s.source_url}): {s.provenance_fact}")

    lines.append("\n*Notice: This assessment is informational and based strictly on official published criteria. It does not constitute a guarantee of approval or funding.*")
    return "\n".join(lines)


async def call_gemini_api(system_prompt: str, user_prompt: str) -> Optional[str]:
    """Execute inference via Google Gemini REST API."""
    if not settings.GEMINI_API_KEY:
        return None

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    )

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": user_prompt}
                ]
            }
        ],
        "systemInstruction": {
            "parts": [
                {"text": system_prompt}
            ]
        },
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
    except Exception as exc:
        logger.info(f"Gemini API request failed ({exc}).")

    return None


async def call_ollama_api(system_prompt: str, user_prompt: str) -> Optional[str]:
    """Execute inference via local Ollama daemon."""
    ollama_url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
    combined_prompt = f"{system_prompt}\n\n{user_prompt}"

    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": combined_prompt,
        "stream": False,
        "options": {
            "temperature": 0.2,
            "top_p": 0.9,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            resp = await client.post(ollama_url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("response", "").strip()
    except Exception as exc:
        logger.info(f"Ollama local instance unavailable ({exc}).")

    return None


async def query_rag_advisor(
    db: Session,
    request: AIQueryRequest,
    user: Optional[User] = None
) -> AIQueryResponse:
    """
    Execute natural-language scheme discovery using hybrid retrieval and grounded LLM synthesis.
    Falls back gracefully to deterministic synthesis if AI providers are unreachable.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first() if user else None

    # Step 1: Hybrid retrieval
    retrieved_schemes, citations = hybrid_retrieve_schemes(
        db=db,
        query=request.query,
        profile=profile,
        verified_only=request.verified_only,
        limit=5
    )

    matched_briefs: List[MatchedSchemeBrief] = [
        MatchedSchemeBrief(
            id=s["id"],
            code=s["code"],
            name=s["name"],
            ministry=s["ministry"],
            verification_status=s["verification_status"],
            benefits_summary=s["benefits_summary"],
            relevance_score=s["relevance_score"],
            match_rationale=s["match_rationale"],
            official_portal_url=s["official_portal_url"],
        )
        for s in retrieved_schemes
    ]

    deterministic_answer, default_actions = build_deterministic_rag_answer(
        query=request.query,
        schemes=retrieved_schemes,
        citations=citations,
        profile=profile
    )

    if not settings.AI_ENABLED or settings.AI_PROVIDER == "deterministic":
        return AIQueryResponse(
            answer=deterministic_answer,
            matched_schemes=matched_briefs,
            citations=citations,
            suggested_actions=default_actions,
            provider_used="deterministic_rules_engine",
            confidence_score=0.95 if retrieved_schemes else 0.5,
            is_fallback=True,
            timestamp=datetime.datetime.now(datetime.timezone.utc)
        )

    # Step 2: Prepare LLM prompts
    system_prompt = build_rag_system_prompt()
    user_prompt = build_rag_user_prompt(request.query, retrieved_schemes, profile)

    llm_output = None
    provider_name = settings.AI_PROVIDER

    # Step 3: Dispatch to configured provider
    if settings.AI_PROVIDER == "gemini":
        llm_output = await call_gemini_api(system_prompt, user_prompt)
        provider_name = f"google_gemini_{settings.GEMINI_MODEL}"
    elif settings.AI_PROVIDER == "ollama":
        llm_output = await call_ollama_api(system_prompt, user_prompt)
        provider_name = f"ollama_{settings.OLLAMA_MODEL}"

    # Step 4: Fallback if LLM failed
    if not llm_output:
        logger.info(f"AI provider {settings.AI_PROVIDER} unavailable. Serving grounded deterministic synthesis.")
        return AIQueryResponse(
            answer=deterministic_answer,
            matched_schemes=matched_briefs,
            citations=citations,
            suggested_actions=default_actions,
            provider_used="deterministic_fallback (provider unavailable)",
            confidence_score=0.90 if retrieved_schemes else 0.4,
            is_fallback=True,
            timestamp=datetime.datetime.now(datetime.timezone.utc)
        )

    return AIQueryResponse(
        answer=llm_output,
        matched_schemes=matched_briefs,
        citations=citations,
        suggested_actions=default_actions,
        provider_used=provider_name,
        confidence_score=0.98 if retrieved_schemes else 0.6,
        is_fallback=False,
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )


async def generate_ai_explanation(
    scheme: Scheme,
    profile: Optional[UserProfile],
    overall_result: str,
    passed: List[ConditionResult],
    failed: List[ConditionResult],
    missing: List[ConditionResult],
    sources: List[SchemeSource]
) -> Tuple[str, str, List[Dict[str, Any]]]:
    """
    Generate an assessment explanation using the configured LLM provider,
    falling back to the deterministic source-grounded explanation.
    """
    citations = [
        {
            "id": s.id,
            "title": s.source_title,
            "url": s.source_url,
            "fact": s.provenance_fact,
            "type": s.source_type
        }
        for s in sources
    ]

    deterministic_fallback = build_deterministic_explanation(
        scheme, overall_result, passed, failed, missing, sources
    )

    if not settings.AI_ENABLED or settings.AI_PROVIDER == "deterministic":
        return deterministic_fallback, "deterministic_rules_engine", citations

    system_prompt = build_rag_system_prompt()

    passed_str = ", ".join([f"{p.rule_name} ({p.reason})" for p in passed]) or "None"
    failed_str = ", ".join([f"{f.rule_name} ({f.reason})" for f in failed]) or "None"
    missing_str = ", ".join([f"{m.rule_name} ({m.reason})" for m in missing]) or "None"

    prompt_sources = "\n".join([
        f"Source: {s.source_title} ({s.source_url})\nExcerpt: {s.extracted_passage}\nFact: {s.provenance_fact}"
        for s in sources[:4]
    ])

    user_prompt = f"""Explain this scheme eligibility determination clearly to an Indian entrepreneur.

CRITICAL INSTRUCTIONS:
1. You MUST adhere strictly to the deterministic evaluation status: {overall_result}. Do NOT alter this status.
2. Ground all factual statements in the provided Official Sources. Do NOT invent eligibility rules, monetary limits, or websites.

Scheme Name: {scheme.name}
Ministry: {scheme.ministry}
Assessment Result: {overall_result}
Passed Conditions: {passed_str}
Failed Conditions: {failed_str}
Missing Conditions: {missing_str}
Scheme Benefits: {scheme.benefits_summary}
Application Procedure: {scheme.application_procedure}

Official Grounding Sources:
{prompt_sources}
"""

    llm_output = None
    provider_name = settings.AI_PROVIDER

    if settings.AI_PROVIDER == "gemini":
        llm_output = await call_gemini_api(system_prompt, user_prompt)
        provider_name = f"google_gemini_{settings.GEMINI_MODEL}"
    elif settings.AI_PROVIDER == "ollama":
        llm_output = await call_ollama_api(system_prompt, user_prompt)
        provider_name = f"ollama_{settings.OLLAMA_MODEL}"

    if llm_output:
        return llm_output, provider_name, citations

    return deterministic_fallback, "deterministic_rules_engine", citations


async def check_ai_provider_status() -> AIProviderStatusResponse:
    """Check health and live availability of configured AI provider."""
    provider = settings.AI_PROVIDER

    if not settings.AI_ENABLED:
        return AIProviderStatusResponse(
            provider="disabled",
            is_available=False,
            model_name="none",
            details="AI capabilities have been explicitly disabled in server configuration."
        )

    if provider == "gemini":
        if not settings.GEMINI_API_KEY:
            return AIProviderStatusResponse(
                provider="gemini",
                is_available=False,
                model_name=settings.GEMINI_MODEL,
                details="Gemini API Key is not configured. Falling back to deterministic RAG engine."
            )
        # Test Gemini endpoint
        res = await call_gemini_api("You are a health checker. Reply 'P21_OK'.", "Ping")
        is_ok = bool(res and "P21_OK" in res)
        return AIProviderStatusResponse(
            provider="gemini",
            is_available=is_ok,
            model_name=settings.GEMINI_MODEL,
            details="Google Gemini API is online and responding." if is_ok else "Gemini API reachable check timed out; falling back to deterministic RAG."
        )

    if provider == "ollama":
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                r = await client.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags")
                is_ok = r.status_code == 200
                return AIProviderStatusResponse(
                    provider="ollama",
                    is_available=is_ok,
                    model_name=settings.OLLAMA_MODEL,
                    details="Local Ollama daemon is active." if is_ok else "Ollama service unavailable on localhost:11434; deterministic fallback active."
                )
        except Exception:
            return AIProviderStatusResponse(
                provider="ollama",
                is_available=False,
                model_name=settings.OLLAMA_MODEL,
                details="Ollama service is not running on localhost:11434. Deterministic RAG active."
            )

    return AIProviderStatusResponse(
        provider="deterministic",
        is_available=True,
        model_name="deterministic_rules_engine",
        details="Deterministic rule-grounded RAG engine active (Zero external API dependencies)."
    )
