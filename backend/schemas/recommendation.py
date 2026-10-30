from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from backend.schemas.scheme import SchemeListResponse
from backend.schemas.assessment import ConditionResult


class ScoreFactorBreakdown(BaseModel):
    eligibility_score: float
    profile_relevance_score: float
    verification_freshness_score: float
    evidence_completeness_score: float
    final_composite_score: float
    explanation: str


class ActionableNextStep(BaseModel):
    step_type: str  # profile_update, document_prep, verify_guideline, official_portal, compare
    title: str
    description: str
    action_url: Optional[str] = None
    target_field: Optional[str] = None
    is_critical: bool = False


class EnhancedRecommendationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scheme: SchemeListResponse
    match_category: str  # Strong potential match, Potential match requiring more information, Low match based on known conditions, Unable to assess because reliable evidence is insufficient
    overall_eligibility: str  # PASS, FAIL, UNKNOWN, NOT_APPLICABLE
    composite_score: float
    score_breakdown: ScoreFactorBreakdown
    passed_count: int
    failed_count: int
    missing_count: int
    passed_rules: List[ConditionResult]
    failed_rules: List[ConditionResult]
    missing_rules: List[ConditionResult]
    relevant_profile_attributes: List[str]
    selection_rationale: str
    personalized_next_steps: List[ActionableNextStep]
    is_verified: bool
    last_verified_date: Optional[str] = None


class EligibilityGapAnalysis(BaseModel):
    scheme_id: int
    scheme_name: str
    ministry: str
    verification_status: str
    match_category: str
    overall_result: str
    score_breakdown: ScoreFactorBreakdown
    passed_conditions: List[ConditionResult]
    failed_conditions: List[ConditionResult]
    missing_conditions: List[ConditionResult]
    missing_profile_fields: List[str]
    critical_disqualifications: List[str]
    recommended_actions: List[ActionableNextStep]
