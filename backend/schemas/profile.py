from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import datetime


class UserProfileCreateUpdate(BaseModel):
    applicant_type: Optional[str] = Field(None, description="aspiring_entrepreneur, individual, existing_business, startup, msme")
    state: Optional[str] = None
    district: Optional[str] = None
    business_name: Optional[str] = None
    business_stage: Optional[str] = Field(None, description="ideation, prototype, early_stage, growth, scaling")
    sector: Optional[str] = Field(None, description="manufacturing, services, agriculture_allied, it_technology, etc.")
    registration_status: Optional[str] = Field(None, description="unregistered, udyam_registered, startup_india_recognized, pvt_ltd, etc.")
    business_age_months: Optional[int] = Field(None, ge=0)
    ownership_category: Optional[str] = Field(None, description="general, women, sc_st, obc, minority, divyangjan, ex_servicemen")
    annual_turnover_inr: Optional[float] = Field(None, ge=0)
    total_investment_inr: Optional[float] = Field(None, ge=0)


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    applicant_type: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    business_name: Optional[str] = None
    business_stage: Optional[str] = None
    sector: Optional[str] = None
    registration_status: Optional[str] = None
    business_age_months: Optional[int] = None
    ownership_category: Optional[str] = None
    annual_turnover_inr: Optional[float] = None
    total_investment_inr: Optional[float] = None
    completion_percentage: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
