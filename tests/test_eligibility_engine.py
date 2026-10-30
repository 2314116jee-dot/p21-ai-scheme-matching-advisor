import pytest
import uuid
from backend.models.profile import UserProfile
from backend.models.scheme import SchemeEligibilityRule
from backend.services.eligibility_engine import evaluate_condition, assess_scheme_eligibility


def test_evaluate_condition_pass_fail_unknown():
    # Rule expecting applicant_type IN ['startup', 'aspiring_entrepreneur']
    rule = SchemeEligibilityRule(
        rule_code="TEST_RULE",
        rule_name="Target Applicant Type",
        target_field="applicant_type",
        operator="IN",
        expected_value=["startup", "aspiring_entrepreneur"],
        is_hard_requirement=True,
        failure_reason="Ineligible applicant type"
    )

    # 1. Profile with matching applicant_type -> PASS
    p_pass = UserProfile(applicant_type="startup")
    res_pass = evaluate_condition(rule, p_pass)
    assert res_pass.status == "PASS"

    # 2. Profile with non-matching applicant_type -> FAIL
    p_fail = UserProfile(applicant_type="large_corporate")
    res_fail = evaluate_condition(rule, p_fail)
    assert res_fail.status == "FAIL"
    assert "Ineligible applicant type" in res_fail.reason

    # 3. Profile with missing applicant_type -> UNKNOWN
    p_missing = UserProfile(applicant_type=None)
    res_unknown = evaluate_condition(rule, p_missing)
    assert res_unknown.status == "UNKNOWN"
    assert "Missing profile detail" in res_unknown.reason


def test_numeric_operator_evaluation():
    rule = SchemeEligibilityRule(
        rule_code="MAX_INVESTMENT",
        rule_name="Investment Limit",
        target_field="total_investment_inr",
        operator="LTE",
        expected_value=5000000,
        is_hard_requirement=True,
        failure_reason="Investment exceeds ceiling"
    )

    # Within limit -> PASS
    p1 = UserProfile(total_investment_inr=2500000)
    assert evaluate_condition(rule, p1).status == "PASS"

    # Over limit -> FAIL
    p2 = UserProfile(total_investment_inr=7500000)
    assert evaluate_condition(rule, p2).status == "FAIL"

    # Missing -> UNKNOWN
    p3 = UserProfile(total_investment_inr=None)
    assert evaluate_condition(rule, p3).status == "UNKNOWN"


def test_run_assessment_api(client, db):
    user_email = f"assess_{uuid.uuid4().hex[:8]}@test.in"
    password = "AssessPassword123!"

    # Register & setup profile
    client.post("/api/auth/register", json={
        "email": user_email,
        "full_name": "Assessment Applicant",
        "password": password,
        "confirm_password": password,
        "terms_accepted": True,
    })

    client.put("/api/profile", json={
        "applicant_type": "aspiring_entrepreneur",
        "business_stage": "ideation",
        "sector": "manufacturing",
        "total_investment_inr": 2500000,
        "ownership_category": "women",
        "state": "Maharashtra",
        "registration_status": "unregistered"
    })

    # Get PMEGP scheme ID
    scheme_res = client.get("/api/schemes/by-code/pmegp")
    assert scheme_res.status_code == 200
    pmegp_id = scheme_res.json()["id"]

    # Run assessment
    assess_res = client.post("/api/assessments/run", json={"scheme_id": pmegp_id})
    assert assess_res.status_code == 200
    data = assess_res.json()
    assert data["scheme_id"] == pmegp_id
    assert data["overall_result"] in ["PASS", "UNKNOWN", "FAIL"]
    assert len(data["passed_conditions"]) >= 1
    assert "ai_explanation" in data
    assert data["ai_explanation"] is not None

    # Check assessment history
    hist_res = client.get("/api/assessments/history")
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1
