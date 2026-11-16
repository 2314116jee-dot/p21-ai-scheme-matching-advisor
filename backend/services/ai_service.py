"""
P21 Modular AI Service Layer
Provides multi-provider LLM orchestration (Local Ollama with DeepSeek-R1, Google Gemini API,
and Deterministic RAG Fallback) with structured outputs, prompt injection safeguards,
DeepSeek-R1 reasoning chain isolation (<think> tokens), and rigorous evidence citation binding.
"""

import re
import time
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
    AIChatRequest,
    AIChatResponse,
    MatchedSchemeBrief,
    SchemeMatchCitation,
    SuggestedAction,
    AIProviderStatusResponse,
    SuggestedPromptsResponse,
    PromptCategory,
    PromptItem,
)
from backend.services.rag_service import (
    hybrid_retrieve_schemes,
    build_rag_system_prompt,
    build_rag_user_prompt,
    build_deterministic_rag_answer,
)

logger = logging.getLogger("p21.ai")


def extract_deepseek_thought_process(text: str) -> Tuple[Optional[str], str]:
    """
    Extracts DeepSeek-R1 <think>...</think> reasoning tags.
    Returns (thought_process, cleaned_content).
    """
    if not text:
        return None, ""
    match = re.search(r"<think>(.*?)</think>", text, flags=re.DOTALL)
    if match:
        thought = match.group(1).strip()
        cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
        return (thought if thought else None), cleaned
    if "<think>" in text and "</think>" not in text:
        parts = text.split("<think>", 1)
        return parts[1].strip(), parts[0].strip()
    return None, text.strip()


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


async def call_gemini_api(
    system_prompt: str,
    user_prompt: str,
    history: Optional[List[Dict[str, Any]]] = None
) -> Optional[str]:
    """Execute inference via Google Gemini REST API with optional multi-turn conversation support."""
    if not settings.GEMINI_API_KEY:
        return None

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    )

    contents: List[Dict[str, Any]] = []
    if history:
        for msg in history[-6:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant") and content and isinstance(content, str):
                gemini_role = "user" if role == "user" else "model"
                if not contents and gemini_role == "model":
                    continue
                if contents and contents[-1]["role"] == gemini_role:
                    contents[-1]["parts"][0]["text"] += f"\n{content}"
                else:
                    contents.append({"role": gemini_role, "parts": [{"text": content}]})

    if contents and contents[-1]["role"] == "user":
        contents[-1]["parts"][0]["text"] += f"\n\n{user_prompt}"
    else:
        contents.append({"role": "user", "parts": [{"text": user_prompt}]})

    payload = {
        "contents": contents,
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
            elif resp.status_code == 429 and settings.GEMINI_MODEL != "gemini-2.5-flash-lite":
                logger.warning("Primary Gemini model quota rate-limited (429). Falling back to gemini-2.5-flash-lite...")
                fallback_url = (
                    f"https://generativelanguage.googleapis.com/v1beta/models/"
                    f"gemini-2.5-flash-lite:generateContent?key={settings.GEMINI_API_KEY}"
                )
                resp2 = await client.post(fallback_url, json=payload)
                if resp2.status_code == 200:
                    data2 = resp2.json()
                    candidates = data2.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
                else:
                    logger.warning(f"Fallback Gemini model returned status {resp2.status_code}: {resp2.text}")
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
    except Exception as exc:
        logger.info(f"Gemini API request failed ({exc}).")

    return None


async def call_ollama_api(system_prompt: str, user_prompt: str) -> Optional[str]:
    """Execute inference via local Ollama daemon /api/generate."""
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


async def call_ollama_chat(
    system_prompt: str,
    user_prompt: str,
    history: Optional[List[Dict[str, Any]]] = None
) -> Tuple[Optional[str], Optional[str]]:
    """
    Execute chat inference via local Ollama daemon using /api/chat.
    Tuned for DeepSeek-R1:1.5b with automatic thought-process extraction.
    Returns (cleaned_content, thought_process).
    """
    ollama_url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"

    messages = [{"role": "system", "content": system_prompt}]
    if history:
        for msg in history[-6:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant") and content and isinstance(content, str):
                messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": user_prompt})

    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
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
                msg = data.get("message", {})
                raw_content = msg.get("content", "").strip()
                thinking = msg.get("thinking")
                if thinking:
                    _, cleaned = extract_deepseek_thought_process(raw_content)
                    return (cleaned or raw_content), thinking.strip()
                thought, cleaned = extract_deepseek_thought_process(raw_content)
                return (cleaned or raw_content), thought
            else:
                logger.warning(f"Ollama /api/chat returned status {resp.status_code}: {resp.text}")
    except Exception as exc:
        logger.info(f"Ollama /api/chat call failed ({exc}). Falling back to /api/generate...")

    # Fallback to /api/generate
    raw_gen = await call_ollama_api(system_prompt, user_prompt)
    if raw_gen:
        thought, cleaned = extract_deepseek_thought_process(raw_gen)
        return (cleaned or raw_gen), thought

    return None, None


async def query_rag_advisor(
    db: Session,
    request: AIQueryRequest,
    user: Optional[User] = None
) -> AIQueryResponse:
    """
    Execute natural-language scheme discovery using hybrid retrieval and grounded LLM synthesis.
    Falls back gracefully to deterministic synthesis if AI providers are unreachable.
    """
    start_time = time.perf_counter()
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first() if user else None

    # Step 1: Hybrid retrieval
    retrieved_schemes, citations = hybrid_retrieve_schemes(
        db=db,
        query=request.query,
        profile=profile,
        verified_only=request.verified_only,
        limit=request.top_k or 5,
        scheme_id=request.scheme_id,
        history=request.history,
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

    # Evaluate evidence sufficiency
    top_score = retrieved_schemes[0]["relevance_score"] if retrieved_schemes else 0.0
    if top_score >= 35.0 and len(citations) > 0:
        evidence_sufficiency = "SUFFICIENT"
    elif top_score >= 15.0 or len(retrieved_schemes) > 0:
        evidence_sufficiency = "PARTIAL"
    else:
        evidence_sufficiency = "INSUFFICIENT"

    if not settings.AI_ENABLED or settings.AI_PROVIDER == "deterministic":
        latency_ms = (time.perf_counter() - start_time) * 1000
        return AIQueryResponse(
            query=request.query,
            answer=deterministic_answer,
            thought_process=None,
            matched_schemes=matched_briefs,
            citations=citations,
            suggested_actions=default_actions,
            provider_used="deterministic_rules_engine",
            confidence_score=0.95 if retrieved_schemes else 0.5,
            evidence_sufficiency=evidence_sufficiency,
            is_fallback=True,
            retrieval_count=len(retrieved_schemes),
            latency_ms=round(latency_ms, 1),
            timestamp=datetime.datetime.now(datetime.timezone.utc)
        )

    # Step 2: Prepare LLM prompts
    system_prompt = build_rag_system_prompt()
    user_prompt = build_rag_user_prompt(request.query, retrieved_schemes, profile)

    llm_output = None
    thought_process = None
    provider_name = settings.AI_PROVIDER

    # Step 3: Dispatch to configured provider
    if settings.AI_PROVIDER == "gemini":
        llm_output = await call_gemini_api(system_prompt, user_prompt, request.history)
        provider_name = f"google_gemini_{settings.GEMINI_MODEL}"
    elif settings.AI_PROVIDER == "ollama":
        llm_output, thought_process = await call_ollama_chat(system_prompt, user_prompt, request.history)
        provider_name = f"ollama_{settings.OLLAMA_MODEL}"

    latency_ms = (time.perf_counter() - start_time) * 1000

    # Step 4: Fallback if LLM failed
    if not llm_output:
        logger.info(f"AI provider {settings.AI_PROVIDER} unavailable. Serving grounded deterministic synthesis.")
        return AIQueryResponse(
            query=request.query,
            answer=deterministic_answer,
            thought_process=None,
            matched_schemes=matched_briefs,
            citations=citations,
            suggested_actions=default_actions,
            provider_used="deterministic_fallback (provider unavailable)",
            confidence_score=0.90 if retrieved_schemes else 0.4,
            evidence_sufficiency=evidence_sufficiency,
            is_fallback=True,
            retrieval_count=len(retrieved_schemes),
            latency_ms=round(latency_ms, 1),
            timestamp=datetime.datetime.now(datetime.timezone.utc)
        )

    return AIQueryResponse(
        query=request.query,
        answer=llm_output,
        thought_process=thought_process,
        matched_schemes=matched_briefs,
        citations=citations,
        suggested_actions=default_actions,
        provider_used=provider_name,
        confidence_score=0.98 if retrieved_schemes else 0.6,
        evidence_sufficiency=evidence_sufficiency,
        is_fallback=False,
        retrieval_count=len(retrieved_schemes),
        latency_ms=round(latency_ms, 1),
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )


async def chat_rag_advisor(
    db: Session,
    request: AIChatRequest,
    user: Optional[User] = None
) -> AIChatResponse:
    """
    Conversational chatbot endpoint for Indian entrepreneurs.
    Accepts conversation history, executes hybrid RAG retrieval, and generates
    grounded responses using DeepSeek-R1 (Ollama) or deterministic fallback.
    """
    query_req = AIQueryRequest(
        query=request.message,
        top_k=request.top_k,
        verified_only=request.verified_only,
        scheme_id=request.scheme_id,
        history=[m.model_dump() for m in request.history],
    )
    res = await query_rag_advisor(db, query_req, user=user)

    return AIChatResponse(
        reply=res.answer,
        thought_process=res.thought_process,
        matched_schemes=res.matched_schemes,
        citations=res.citations,
        suggested_actions=res.suggested_actions,
        provider_used=res.provider_used,
        evidence_sufficiency=res.evidence_sufficiency,
        is_fallback=res.is_fallback,
        retrieval_count=res.retrieval_count,
        latency_ms=res.latency_ms,
        timestamp=res.timestamp,
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
        cleaned, _ = await call_ollama_chat(system_prompt, user_prompt)
        llm_output = cleaned
        provider_name = f"ollama_{settings.OLLAMA_MODEL}"

    if llm_output:
        return llm_output, provider_name, citations

    return deterministic_fallback, "deterministic_rules_engine", citations


async def check_ai_provider_status() -> AIProviderStatusResponse:
    """Check health and live availability of configured AI provider and local Ollama models."""
    provider = settings.AI_PROVIDER

    ollama_ok = False
    gemini_ok = False
    model_found = False

    # Check Gemini if configured (lightweight metadata check that does not consume generation quota)
    if settings.GEMINI_API_KEY:
        try:
            check_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={settings.GEMINI_API_KEY}"
            async with httpx.AsyncClient(timeout=3.0) as client:
                r = await client.get(check_url)
                gemini_ok = (r.status_code == 200)
        except Exception:
            gemini_ok = False

    # Check Ollama daemon (fast probe if Gemini is already the active provider)
    ollama_timeout = 3.0 if provider == "ollama" else 0.8
    try:
        async with httpx.AsyncClient(timeout=ollama_timeout) as client:
            r = await client.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags")
            if r.status_code == 200:
                ollama_ok = True
                models_data = r.json().get("models", [])
                model_names = [m.get("name", "") for m in models_data]
                model_found = any(settings.OLLAMA_MODEL in name for name in model_names)
    except Exception:
        ollama_ok = False

    if not settings.AI_ENABLED:
        return AIProviderStatusResponse(
            provider="disabled",
            default_provider="disabled",
            active_provider="disabled",
            is_available=False,
            ollama_available=ollama_ok,
            gemini_available=gemini_ok,
            deterministic_fallback_ready=True,
            model_name="none",
            details="AI capabilities have been explicitly disabled in server configuration."
        )

    if provider == "ollama":
        if ollama_ok:
            details_str = (
                f"Local Ollama is active with '{settings.OLLAMA_MODEL}' loaded."
                if model_found
                else f"Local Ollama daemon is active. Model '{settings.OLLAMA_MODEL}' not found in registry (available models will be queried)."
            )
            return AIProviderStatusResponse(
                provider="ollama",
                default_provider="ollama",
                active_provider="ollama",
                is_available=True,
                ollama_available=True,
                gemini_available=gemini_ok,
                deterministic_fallback_ready=True,
                model_name=settings.OLLAMA_MODEL,
                details=details_str
            )
        else:
            return AIProviderStatusResponse(
                provider="ollama",
                default_provider="ollama",
                active_provider="deterministic",
                is_available=False,
                ollama_available=False,
                gemini_available=gemini_ok,
                deterministic_fallback_ready=True,
                model_name=settings.OLLAMA_MODEL,
                details=f"Ollama service unavailable on {settings.OLLAMA_BASE_URL}. Deterministic RAG fallback active."
            )

    if provider == "gemini":
        return AIProviderStatusResponse(
            provider="gemini",
            default_provider="gemini",
            active_provider="gemini" if gemini_ok else "deterministic",
            is_available=gemini_ok,
            ollama_available=ollama_ok,
            gemini_available=gemini_ok,
            deterministic_fallback_ready=True,
            model_name=settings.GEMINI_MODEL,
            details="Google Gemini API is online and responding." if gemini_ok else "Gemini API key missing or check timed out; deterministic fallback active."
        )

    return AIProviderStatusResponse(
        provider="deterministic",
        default_provider="deterministic",
        active_provider="deterministic",
        is_available=True,
        ollama_available=ollama_ok,
        gemini_available=gemini_ok,
        deterministic_fallback_ready=True,
        model_name="deterministic_rules_engine",
        details="Deterministic rule-grounded RAG engine active (Zero external API dependencies)."
    )


def get_domain_suggested_prompts() -> SuggestedPromptsResponse:
    """Pre-curated starter questions tailored for Indian entrepreneur profiles."""
    return SuggestedPromptsResponse(
        categories=[
            PromptCategory(
                category="Women Entrepreneurs",
                icon="Heart",
                prompts=[
                    PromptItem(
                        title="Special Subsidies for Women",
                        query="What special subsidies or margin money concessions are available for women entrepreneurs under PMEGP and Stand-Up India?"
                    ),
                    PromptItem(
                        title="Collateral-Free Credit",
                        query="How can a female-founded enterprise obtain collateral-free loans up to ₹1 Crore?"
                    ),
                ]
            ),
            PromptCategory(
                category="Manufacturing & MSME",
                icon="Factory",
                prompts=[
                    PromptItem(
                        title="PMEGP ₹50 Lakh Grant",
                        query="What are the eligibility criteria and education requirements to set up a ₹50 Lakh manufacturing unit under PMEGP?"
                    ),
                    PromptItem(
                        title="CGTMSE Guarantee",
                        query="What is CGTMSE coverage and how does it protect lenders against defaults for micro enterprises?"
                    ),
                ]
            ),
            PromptCategory(
                category="Startups & Innovation",
                icon="Rocket",
                prompts=[
                    PromptItem(
                        title="Startup India Seed Fund",
                        query="Which central schemes provide grants for proof-of-concept, prototyping, and early-stage startup commercialization?"
                    ),
                    PromptItem(
                        title="DPIIT Recognition Benefits",
                        query="What exemptions and funding assistance does DPIIT startup recognition unlock?"
                    ),
                ]
            ),
            PromptCategory(
                category="Artisans & Traditional Trades",
                icon="Hammer",
                prompts=[
                    PromptItem(
                        title="PM Vishwakarma Benefits",
                        query="What toolkit incentives, collateral-free loans at 5% interest, and stipends does PM Vishwakarma provide for traditional artisans?"
                    ),
                    PromptItem(
                        title="Khadi & Village Industries",
                        query="What assistance exists for village industries and rural agro-processing units?"
                    ),
                ]
            ),
            PromptCategory(
                category="Small Loans (Mudra)",
                icon="Banknote",
                prompts=[
                    PromptItem(
                        title="Mudra Shishu, Kishore & Tarun",
                        query="What are the loan limits for Shishu, Kishore, and Tarun categories under Pradhan Mantri Mudra Yojana?"
                    ),
                    PromptItem(
                        title="Application Checklist",
                        query="What documents do I need to prepare before applying for a Mudra loan at a public sector bank?"
                    ),
                ]
            ),
        ]
    )
