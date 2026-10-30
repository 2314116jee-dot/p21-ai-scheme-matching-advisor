from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.models.profile import UserProfile
from backend.schemas.profile import UserProfileCreateUpdate, UserProfileResponse
from backend.api.deps import get_current_active_user

router = APIRouter(prefix="/api/profile", tags=["Entrepreneur Profile"])


def _format_profile_response(profile: UserProfile) -> UserProfileResponse:
    return UserProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        applicant_type=profile.applicant_type,
        state=profile.state,
        district=profile.district,
        business_name=profile.business_name,
        business_stage=profile.business_stage,
        sector=profile.sector,
        registration_status=profile.registration_status,
        business_age_months=profile.business_age_months,
        ownership_category=profile.ownership_category,
        annual_turnover_inr=profile.annual_turnover_inr,
        total_investment_inr=profile.total_investment_inr,
        completion_percentage=profile.completion_percentage(),
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.get("", response_model=UserProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        # Create empty profile skeleton if doesn't exist
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return _format_profile_response(profile)


@router.put("", response_model=UserProfileResponse)
def update_my_profile(
    payload: UserProfileCreateUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return _format_profile_response(profile)
