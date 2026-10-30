from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Dict, Any

from backend.database import get_db
from backend.models.user import User
from backend.models.scheme import Scheme
from backend.models.profile import UserProfile
from backend.models.assessment import EligibilityAssessment
from backend.schemas.assessment import AssessmentResponse, RunAssessmentRequest, ConditionResult
from backend.schemas.scheme import SchemeListResponse
from backend.schemas.recommendation import EnhancedRecommendationItem, EligibilityGapAnalysis
from backend.services.eligibility_engine import assess_scheme_eligibility
from backend.services.recommendation_service import (
    compute_multi_factor_recommendation,
    compute_eligibility_gap_analysis,
)
from backend.services.ai_service import generate_ai_explanation
from backend.api.deps import get_current_active_user

router = APIRouter(prefix="/api/assessments", tags=["Eligibility Assessments"])


def _format_assessment(a: EligibilityAssessment) -> AssessmentResponse:
    passed = [ConditionResult(**c) for c in (a.passed_conditions or [])]
    failed = [ConditionResult(**c) for c in (a.failed_conditions or [])]
    missing = [ConditionResult(**c) for c in (a.missing_conditions or [])]

    scheme_data = SchemeListResponse.model_validate(a.scheme)

    return AssessmentResponse(
        id=a.id,
        user_id=a.user_id,
        scheme_id=a.scheme_id,
        scheme=scheme_data,
        overall_result=a.overall_result,
        match_score=a.match_score,
        passed_conditions=passed,
        failed_conditions=failed,
        missing_conditions=missing,
        ai_explanation=a.ai_explanation,
        ai_provider_used=a.ai_provider_used,
        sources_cited=a.sources_cited or [],
        created_at=a.created_at,
    )


@router.post("/run", response_model=AssessmentResponse)
async def run_assessment(
    payload: RunAssessmentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == payload.scheme_id, Scheme.is_active == True).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # 1. Deterministic assessment
    status_result, score, passed, failed, missing = assess_scheme_eligibility(scheme, profile)

    # 2. AI grounded explanation
    explanation, provider, citations = await generate_ai_explanation(
        scheme=scheme,
        profile=profile,
        overall_result=status_result,
        passed=passed,
        failed=failed,
        missing=missing,
        sources=scheme.sources or []
    )

    profile_snap = {
        "applicant_type": profile.applicant_type,
        "state": profile.state,
        "district": profile.district,
        "business_stage": profile.business_stage,
        "sector": profile.sector,
        "registration_status": profile.registration_status,
        "ownership_category": profile.ownership_category,
        "total_investment_inr": profile.total_investment_inr,
        "annual_turnover_inr": profile.annual_turnover_inr,
    }

    db_assessment = EligibilityAssessment(
        user_id=current_user.id,
        scheme_id=scheme.id,
        overall_result=status_result,
        match_score=score,
        passed_conditions=[c.model_dump() for c in passed],
        failed_conditions=[c.model_dump() for c in failed],
        missing_conditions=[c.model_dump() for c in missing],
        ai_explanation=explanation,
        ai_provider_used=provider,
        sources_cited=citations,
        profile_snapshot=profile_snap,
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)

    return _format_assessment(db_assessment)


@router.get("/recommendations", response_model=List[EnhancedRecommendationItem])
def get_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Compute multi-factor, explainable recommendations across all active schemes
    based on the user's recorded entrepreneur profile, structured rules, and verification freshness.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    schemes = db.query(Scheme).filter(Scheme.is_active == True).all()

    recommendations: List[EnhancedRecommendationItem] = []
    for s in schemes:
        item = compute_multi_factor_recommendation(s, profile)
        recommendations.append(item)

    # Sort priorities:
    # 1. Strong potential match
    # 2. Potential match requiring more information
    # 3. Unable to assess
    # 4. Low match
    category_order = {
        "Strong potential match": 0,
        "Potential match requiring more information": 1,
        "Unable to assess because reliable evidence is insufficient": 2,
        "Low match based on known conditions": 3,
    }

    recommendations.sort(
        key=lambda r: (
            category_order.get(r.match_category, 99),
            -r.composite_score,
            -r.passed_count,
            r.missing_count
        )
    )
    return recommendations


@router.get("/gap-analysis/{scheme_id}", response_model=EligibilityGapAnalysis)
def get_scheme_gap_analysis(
    scheme_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Dedicated gap analysis view evaluating passed, failed, and missing conditions,
    highlighting missing profile fields and recommended actions.
    """
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id, Scheme.is_active == True).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    return compute_eligibility_gap_analysis(scheme, profile)


@router.get("/history", response_model=List[AssessmentResponse])
def get_assessment_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(EligibilityAssessment).filter(
        EligibilityAssessment.user_id == current_user.id
    ).order_by(desc(EligibilityAssessment.created_at)).limit(20).all()

    return [_format_assessment(a) for a in assessments]


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment_by_id(
    assessment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(EligibilityAssessment).filter(
        EligibilityAssessment.id == assessment_id,
        EligibilityAssessment.user_id == current_user.id
    ).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found or unauthorized.")
    return _format_assessment(assessment)
