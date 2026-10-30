from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
import datetime


class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    deactivated_users: int
    total_schemes: int
    verification_breakdown: Dict[str, int]
    total_assessments: int
    total_sources: int
    total_audit_events: int
    recent_activity_count: int


class AdminUserListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    mobile_number: Optional[str] = None
    is_active: bool
    roles: List[str]
    has_profile: bool
    created_at: datetime.datetime
    last_login_at: Optional[datetime.datetime] = None


class AdminAuditLogItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime


class AdminUserStatusUpdate(BaseModel):
    is_active: bool
    reason: str = Field(..., min_length=3)


class SchemeVerificationUpdate(BaseModel):
    verification_status: str = Field(..., description="Candidate, Needs Review, Verified, Stale, Superseded, Rejected")
    verification_notes: str = Field(..., min_length=5)
    source_url: Optional[str] = None
    source_title: Optional[str] = None
