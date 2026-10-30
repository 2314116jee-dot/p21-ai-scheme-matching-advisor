"""
P21 Enhanced Recommendation & Eligibility Gap Engine
Computes multi-factor explainable recommendation scores, assigns clear match categories,
and generates personalized, actionable next steps grounded in verified scheme rules.
"""

from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session

from backend.models.scheme import Scheme, SchemeEligibilityRule, SchemeDocument, SchemeSource
from backend.models.profile import UserProfile
from backend.schemas.scheme import SchemeListResponse
from backend.schemas.assessment import ConditionResult
from backend.schemas.recommendation import (
    EnhancedRecommendationItem,
    ScoreFactorBreakdown,
    ActionableNextStep,
    EligibilityGapAnalysis,
)
from backend.services.eligibility_engine import evaluate_condition, assess_scheme_eligibility


def compute_multi_factor_recommendation(
    scheme: Scheme,
    profile: Optional[UserProfile]
) -> EnhancedRecommendationItem:
    """
    Compute transparent hybrid recommendation combining:
    1. Structured deterministic eligibility (50%)
    2. Profile sector/stage alignment (25%)
    3. Scheme verification & freshness (15%)
    4. Evidence completeness (10%)
    """
    rules: List[SchemeEligibilityRule] = scheme.rules or []

    # 1. Structured Eligibility Evaluation
    overall_status, _, passed, failed, missing = assess_scheme_eligibility(scheme, profile)

    total_conditions = len(rules)
    has_hard_fail = any(f.is_hard_requirement for f in failed)
    has_hard_unknown = any(m.is_hard_requirement for m in missing)

    if total_conditions == 0:
        eligibility_score = 40.0
    elif has_hard_fail:
        eligibility_score = 0.0
    else:
        # Proportion of passed conditions penalized slightly for unknowns
        eligibility_score = (len(passed) / total_conditions) * 100.0
        if has_hard_unknown:
            eligibility_score = min(eligibility_score, 65.0)

    # 2. Profile Relevance Score
    profile_relevance = 50.0  # Default baseline
    relevant_attributes = []

    if profile:
        relevance_points = 0
        max_relevance_points = 0

        # Sector alignment
        if profile.sector:
            max_relevance_points += 30
            if profile.sector.lower() in (scheme.brief_description + " " + scheme.detailed_description).lower():
                relevance_points += 30
                relevant_attributes.append(f"Sector: {profile.sector.replace('_', ' ').title()}")

        # Business stage alignment
        if profile.business_stage:
            max_relevance_points += 25
            if profile.business_stage.lower() in scheme.detailed_description.lower():
                relevance_points += 25
                relevant_attributes.append(f"Stage: {profile.business_stage.replace('_', ' ').title()}")

        # Applicant type alignment
        if profile.applicant_type:
            max_relevance_points += 25
            if profile.applicant_type.lower() in scheme.detailed_description.lower():
                relevance_points += 25
                relevant_attributes.append(f"Applicant: {profile.applicant_type.replace('_', ' ').title()}")

        # Beneficiary category
        if profile.ownership_category and profile.ownership_category != "general":
            max_relevance_points += 20
            if profile.ownership_category.lower() in (scheme.target_beneficiaries or "").lower():
                relevance_points += 20
                relevant_attributes.append(f"Beneficiary: {profile.ownership_category.upper()}")

        if max_relevance_points > 0:
            profile_relevance = (relevance_points / max_relevance_points) * 100.0
        else:
            profile_relevance = 50.0

    # 3. Scheme Verification & Freshness Score
    status_weights = {
        "Verified": 100.0,
        "Needs Review": 70.0,
        "Candidate": 60.0,
        "Stale": 30.0,
        "Superseded": 10.0,
        "Rejected": 0.0,
    }
    verification_score = status_weights.get(scheme.verification_status, 50.0)

    # 4. Evidence Completeness Score
    sources_count = len(scheme.sources or [])
    docs_count = len(scheme.documents or [])
    evidence_score = min(100.0, (sources_count * 25.0) + (docs_count * 10.0) + (total_conditions * 10.0))

    # Composite Scoring Formula: 50% eligibility + 25% profile + 15% verification + 10% evidence
    w_e = 0.50
    w_p = 0.25
    w_v = 0.15
    w_ev = 0.10

    if has_hard_fail:
        composite_score = 0.0
    else:
        composite_score = (
            (w_e * eligibility_score) +
            (w_p * profile_relevance) +
            (w_v * verification_score) +
            (w_ev * evidence_score)
        )
    composite_score = round(composite_score, 1)

    # Assign Understandable Recommendation Category
    if total_conditions == 0 or len(scheme.sources or []) == 0:
        match_category = "Unable to assess because reliable evidence is insufficient"
        selection_rationale = "Scheme record lacks sufficient structured rules to definitively determine match."
    elif has_hard_fail or overall_status == "FAIL":
        match_category = "Low match based on known conditions"
        selection_rationale = f"Profile fails {len(failed)} mandatory eligibility condition(s)."
    elif len(missing) > 0 or has_hard_unknown:
        match_category = "Potential match requiring more information"
        selection_rationale = f"Shows strong potential, but {len(missing)} profile attribute(s) must be specified to verify."
    elif composite_score >= 70.0 and overall_status == "PASS":
        match_category = "Strong potential match"
        selection_rationale = f"All known criteria satisfied. Highly aligned with your enterprise profile ({composite_score}% match)."
    else:
        match_category = "Potential match requiring more information"
        selection_rationale = "Satisfies standard conditions with moderate profile alignment."

    # Generate Personalized Actionable Next Steps
    next_steps: List[ActionableNextStep] = []

    # Priority 1: Missing profile fields
    for m in missing:
        next_steps.append(
            ActionableNextStep(
                step_type="profile_update",
                title=f"Record '{m.rule_name}' in Profile",
                description=f"Your profile lacks information for '{m.rule_name}'. Provide this attribute to resolve eligibility.",
                action_url="/profile",
                target_field=m.target_field,
                is_critical=m.is_hard_requirement
            )
        )

    # Priority 2: Critical failed criteria
    for f in failed:
        if f.is_hard_requirement:
            next_steps.append(
                ActionableNextStep(
                    step_type="verify_guideline",
                    title=f"Review Disqualification: {f.rule_name}",
                    description=f"Reason: {f.reason}. Review official guidelines to see if exemptions or alternative categories apply.",
                    action_url=scheme.official_portal_url,
                    is_critical=True
                )
            )

    # Priority 3: Document preparation
    docs = scheme.documents or []
    for d in docs[:3]:
        if d.is_mandatory:
            next_steps.append(
                ActionableNextStep(
                    step_type="document_prep",
                    title=f"Prepare: {d.document_name}",
                    description=f"Mandatory requirement issued by {d.issuing_authority or 'Government authority'}. {d.instructions or ''}".strip(),
                    action_url="/checklist",
                    is_critical=False
                )
            )

    # Priority 4: Application portal link
    next_steps.append(
        ActionableNextStep(
            step_type="official_portal",
            title="Inspect Official Application Portal",
            description=f"Visit {scheme.official_portal_url} to confirm latest round deadlines and submit your application.",
            action_url=scheme.official_portal_url,
            is_critical=False
        )
    )

    score_explanation = (
        f"Score Factors: Eligibility Rules ({eligibility_score:.0f}%, wt 50%), "
        f"Profile Fit ({profile_relevance:.0f}%, wt 25%), "
        f"Verification ({verification_score:.0f}%, wt 15%), "
        f"Evidence Completeness ({evidence_score:.0f}%, wt 10%). "
        "Notice: Score represents criteria alignment, NOT a guarantee of government grant approval."
    )

    score_breakdown = ScoreFactorBreakdown(
        eligibility_score=round(eligibility_score, 1),
        profile_relevance_score=round(profile_relevance, 1),
        verification_freshness_score=round(verification_score, 1),
        evidence_completeness_score=round(evidence_score, 1),
        final_composite_score=composite_score,
        explanation=score_explanation
    )

    scheme_response = SchemeListResponse.model_validate(scheme)

    return EnhancedRecommendationItem(
        scheme=scheme_response,
        match_category=match_category,
        overall_eligibility=overall_status,
        composite_score=composite_score,
        score_breakdown=score_breakdown,
        passed_count=len(passed),
        failed_count=len(failed),
        missing_count=len(missing),
        passed_rules=passed,
        failed_rules=failed,
        missing_rules=missing,
        relevant_profile_attributes=relevant_attributes,
        selection_rationale=selection_rationale,
        personalized_next_steps=next_steps[:5],
        is_verified=scheme.verification_status == "Verified",
        last_verified_date=scheme.last_checked_date.isoformat() if scheme.last_checked_date else None,
    )


def compute_eligibility_gap_analysis(
    scheme: Scheme,
    profile: Optional[UserProfile]
) -> EligibilityGapAnalysis:
    """Generate in-depth gap analysis for a specific scheme against user profile."""
    rec = compute_multi_factor_recommendation(scheme, profile)

    missing_fields = list({m.target_field for m in rec.missing_rules})
    critical_disquals = [f.reason for f in rec.failed_rules if f.is_hard_requirement]

    return EligibilityGapAnalysis(
        scheme_id=scheme.id,
        scheme_name=scheme.name,
        ministry=scheme.ministry,
        verification_status=scheme.verification_status,
        match_category=rec.match_category,
        overall_result=rec.overall_eligibility,
        score_breakdown=rec.score_breakdown,
        passed_conditions=rec.passed_rules,
        failed_conditions=rec.failed_rules,
        missing_conditions=rec.missing_rules,
        missing_profile_fields=missing_fields,
        critical_disqualifications=critical_disquals,
        recommended_actions=rec.personalized_next_steps
    )
