import pytest
import uuid
from backend.services.recommendation_service import (
    compute_multi_factor_recommendation,
    compute_eligibility_gap_analysis
)
from backend.models.scheme import Scheme
from backend.models.profile import UserProfile


def test_recommendations_endpoint_authenticated(client):
    user_email = f"rec_{uuid.uuid4().hex[:8]}@test.in"
    password = "RecPassword123!"

    client.post("/api/auth/register", json={
        "email": user_email,
        "full_name": "Recommendation Tester",
        "password": password,
        "confirm_password": password,
        "terms_accepted": True,
    })

    # Update profile
    client.put("/api/profile", json={
        "applicant_type": "aspiring_entrepreneur",
        "sector": "manufacturing",
        "business_stage": "ideation",
        "ownership_category": "women",
        "total_investment_inr": 2000000.0
    })

    resp = client.get("/api/assessments/recommendations")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0

    first = data[0]
    assert "scheme" in first
    assert "match_category" in first
    assert first["match_category"] in [
        "Strong potential match",
        "Potential match requiring more information",
        "Low match based on known conditions",
        "Unable to assess because reliable evidence is insufficient"
    ]
    assert "composite_score" in first
    assert "score_breakdown" in first
    assert "eligibility_score" in first["score_breakdown"]
    assert "profile_relevance_score" in first["score_breakdown"]
    assert "personalized_next_steps" in first
    assert isinstance(first["personalized_next_steps"], list)


def test_gap_analysis_endpoint(client, db):
    scheme = db.query(Scheme).filter(Scheme.code == "stand-up-india").first()
    assert scheme is not None

    user_email = f"gap_{uuid.uuid4().hex[:8]}@test.in"
    password = "GapPassword123!"

    client.post("/api/auth/register", json={
        "email": user_email,
        "full_name": "Gap Tester",
        "password": password,
        "confirm_password": password,
        "terms_accepted": True,
    })

    resp = client.get(f"/api/assessments/gap-analysis/{scheme.id}")
    assert resp.status_code == 200
    gap = resp.json()

    assert gap["scheme_id"] == scheme.id
    assert gap["scheme_name"] == scheme.name
    assert "passed_conditions" in gap
    assert "failed_conditions" in gap
    assert "missing_conditions" in gap
    assert "missing_profile_fields" in gap
    assert "recommended_actions" in gap
    assert len(gap["recommended_actions"]) > 0


def test_multi_factor_scoring_calculation(db):
    scheme = db.query(Scheme).filter(Scheme.code == "pmegp").first()
    assert scheme is not None

    # Profile matching PMEGP perfectly: manufacturing, aspiring entrepreneur, under 50L investment
    perfect_profile = UserProfile(
        user_id=1,
        applicant_type="aspiring_entrepreneur",
        sector="manufacturing",
        business_stage="ideation",
        total_investment_inr=2500000.0,
        ownership_category="women"
    )

    rec = compute_multi_factor_recommendation(scheme, perfect_profile)
    assert rec.overall_eligibility == "PASS"
    assert rec.match_category == "Strong potential match"
    assert rec.composite_score >= 70.0
    assert rec.passed_count >= 2
    assert rec.failed_count == 0


def test_hard_requirement_fail_results_in_low_match(db):
    scheme = db.query(Scheme).filter(Scheme.code == "stand-up-india").first()
    assert scheme is not None

    # Stand-Up India is strictly for Women or SC/ST. General male applicant must result in Low match
    ineligible_profile = UserProfile(
        user_id=2,
        applicant_type="existing_business",
        sector="manufacturing",
        business_stage="scaling",
        ownership_category="general",  # Disqualifies
        total_investment_inr=20000000.0  # Over 1 Cr ceiling
    )

    rec = compute_multi_factor_recommendation(scheme, ineligible_profile)
    assert rec.overall_eligibility == "FAIL"
    assert rec.match_category == "Low match based on known conditions"
    assert rec.composite_score == 0.0  # Hard fail zeroes out score
    assert rec.failed_count > 0
