from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
import datetime
from backend.schemas.scheme import SchemeListResponse


class ConditionResult(BaseModel):
    rule_code: str
    rule_name: str
    target_field: str
    status: str  # PASS, FAIL, UNKNOWN, NOT_APPLICABLE
    user_value: Any
    expected_value: Any
    reason: str
    is_hard_requirement: bool
    source_reference: Optional[str] = None


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    scheme_id: int
    scheme: SchemeListResponse
    overall_result: str  # PASS, FAIL, UNKNOWN, NOT_APPLICABLE
    match_score: float
    passed_conditions: List[ConditionResult]
    failed_conditions: List[ConditionResult]
    missing_conditions: List[ConditionResult]
    ai_explanation: Optional[str] = None
    ai_provider_used: Optional[str] = None
    sources_cited: Optional[List[Dict[str, Any]]] = None
    created_at: datetime.datetime


class RunAssessmentRequest(BaseModel):
    scheme_id: int
    use_ai_explanation: bool = True


class SavedSchemeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    scheme_id: int
    scheme: SchemeListResponse
    notes: Optional[str] = None
    created_at: datetime.datetime


class DocumentChecklistResponse(BaseModel):
    id: int
    user_id: int
    scheme_id: int
    document_id: int
    document_name: str
    document_category: str
    is_mandatory: bool
    issuing_authority: Optional[str] = None
    instructions: Optional[str] = None
    status: str  # missing, in_progress, available, not_applicable
    notes: Optional[str] = None
    updated_at: datetime.datetime


class UpdateChecklistRequest(BaseModel):
    status: str  # missing, in_progress, available, not_applicable
    notes: Optional[str] = None


class SchemeComparisonResponse(BaseModel):
    id: int
    user_id: int
    title: str
    schemes: List[SchemeListResponse]
    notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
