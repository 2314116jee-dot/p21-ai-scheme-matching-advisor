from pydantic import BaseModel, ConfigDict, Field, computed_field
from typing import List, Optional, Dict, Any
import datetime


class AIChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class AIQueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    sector: Optional[str] = None
    business_stage: Optional[str] = None
    applicant_type: Optional[str] = None
    verified_only: bool = False
    scheme_id: Optional[int] = None
    history: Optional[List[Dict[str, Any]]] = []


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

    @computed_field
    @property
    def evidence_excerpt(self) -> str:
        return self.provenance_fact


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

    @computed_field
    @property
    def portal_url(self) -> str:
        return self.official_portal_url

    @computed_field
    @property
    def relevance_summary(self) -> str:
        return self.benefits_summary or self.match_rationale


class SuggestedAction(BaseModel):
    label: str
    action_type: str  # VIEW_SCHEME, APPLY_FILTER, UPDATE_PROFILE, VISIT_PORTAL, assess, view
    target_id: Optional[int] = None
    target_url: Optional[str] = None

    @computed_field
    @property
    def url(self) -> Optional[str]:
        return self.target_url


class AIQueryResponse(BaseModel):
    query: Optional[str] = None
    answer: str
    thought_process: Optional[str] = None
    matched_schemes: List[MatchedSchemeBrief] = []
    citations: List[SchemeMatchCitation] = []
    suggested_actions: List[SuggestedAction] = []
    provider_used: str
    confidence_score: float = 0.9
    evidence_sufficiency: str = "SUFFICIENT"
    is_fallback: bool = False
    retrieval_count: int = 0
    latency_ms: float = 0.0
    timestamp: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))

    @computed_field
    @property
    def answer_markdown(self) -> str:
        return self.answer


class AIProviderStatusResponse(BaseModel):
    provider: str
    is_available: bool
    model_name: str
    details: str
    default_provider: str = "ollama"
    active_provider: str = "ollama"
    ollama_available: bool = False
    gemini_available: bool = False
    deterministic_fallback_ready: bool = True


class AIChatRequest(BaseModel):
    message: str
    history: List[AIChatMessage] = []
    scheme_id: Optional[int] = None
    verified_only: bool = False
    top_k: int = 5


class AIChatResponse(BaseModel):
    reply: str
    thought_process: Optional[str] = None
    matched_schemes: List[MatchedSchemeBrief] = []
    citations: List[SchemeMatchCitation] = []
    suggested_actions: List[SuggestedAction] = []
    provider_used: str
    evidence_sufficiency: str = "SUFFICIENT"
    is_fallback: bool = False
    retrieval_count: int = 0
    latency_ms: float = 0.0
    timestamp: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))

    @computed_field
    @property
    def answer_markdown(self) -> str:
        return self.reply


class PromptItem(BaseModel):
    title: str
    query: str


class PromptCategory(BaseModel):
    category: str
    icon: str
    prompts: List[PromptItem]


class SuggestedPromptsResponse(BaseModel):
    categories: List[PromptCategory]
