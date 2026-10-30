from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
import datetime


class AIQueryRequest(BaseModel):
    query: str
    sector: Optional[str] = None
    business_stage: Optional[str] = None
    applicant_type: Optional[str] = None
    verified_only: bool = False
    history: Optional[List[Dict[str, str]]] = []


class SchemeMatchCitation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    scheme_id: int
    scheme_name: str
    source_title: str
    source_url: str
    source_type: str
    provenance_fact: str
    verification_status: str


class MatchedSchemeBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    ministry: str
    verification_status: str
    benefits_summary: str
    relevance_score: float
    match_rationale: str
    official_portal_url: str


class SuggestedAction(BaseModel):
    label: str
    action_type: str  # assess, view, compare, checklist, external
    target_id: Optional[int] = None
    target_url: Optional[str] = None


class AIQueryResponse(BaseModel):
    answer: str
    matched_schemes: List[MatchedSchemeBrief]
    citations: List[SchemeMatchCitation]
    suggested_actions: List[SuggestedAction]
    provider_used: str
    confidence_score: float
    is_fallback: bool
    timestamp: datetime.datetime = datetime.datetime.now(datetime.timezone.utc)


class AIProviderStatusResponse(BaseModel):
    provider: str
    is_available: bool
    model_name: str
    details: str
