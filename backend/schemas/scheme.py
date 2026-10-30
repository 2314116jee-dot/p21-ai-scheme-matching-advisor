from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
import datetime


class SchemeSourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source_title: str
    source_url: str
    source_type: str
    extracted_passage: str
    provenance_fact: str
    last_verified_date: datetime.datetime


class SchemeDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_name: str
    document_category: str
    is_mandatory: bool
    issuing_authority: Optional[str] = None
    instructions: Optional[str] = None


class SchemeRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rule_code: str
    rule_name: str
    target_field: str
    operator: str
    expected_value: Any
    is_hard_requirement: bool
    failure_reason: str
    source_reference: Optional[str] = None


class SchemeListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    ministry: str
    department: Optional[str] = None
    brief_description: str
    benefits_summary: str
    verification_status: str
    last_checked_date: datetime.datetime
    official_portal_url: str


class SchemeDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    ministry: str
    department: Optional[str] = None
    brief_description: str
    detailed_description: str
    target_beneficiaries: Optional[str] = None
    benefits_summary: str
    application_procedure: str
    official_portal_url: str
    verification_status: str
    verification_notes: Optional[str] = None
    last_checked_date: datetime.datetime
    effective_date: Optional[datetime.datetime] = None
    sources: List[SchemeSourceResponse] = []
    documents: List[SchemeDocumentResponse] = []
    rules: List[SchemeRuleResponse] = []


class SchemeCreateUpdate(BaseModel):
    code: str = Field(..., min_length=2, max_length=100)
    name: str = Field(..., min_length=3, max_length=255)
    ministry: str = Field(..., min_length=3, max_length=255)
    department: Optional[str] = None
    brief_description: str = Field(..., min_length=10)
    detailed_description: str = Field(..., min_length=20)
    target_beneficiaries: Optional[str] = None
    benefits_summary: str = Field(..., min_length=10)
    application_procedure: str = Field(..., min_length=10)
    official_portal_url: str = Field(..., min_length=5)
    verification_status: str = Field("Candidate", description="Candidate, Needs Review, Verified, Stale, Superseded, Rejected")
    verification_notes: Optional[str] = None
