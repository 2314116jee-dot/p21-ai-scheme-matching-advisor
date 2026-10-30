from typing import List, Dict, Any, Tuple
from backend.models.profile import UserProfile
from backend.models.scheme import Scheme, SchemeEligibilityRule
from backend.schemas.assessment import ConditionResult


def evaluate_condition(
    rule: SchemeEligibilityRule,
    profile: UserProfile
) -> ConditionResult:
    target = rule.target_field
    op = rule.operator.upper()
    expected = rule.expected_value
    user_val = getattr(profile, target, None) if profile else None

    # If user has not provided this information, it is UNKNOWN
    if user_val is None or (isinstance(user_val, str) and not user_val.strip()):
        return ConditionResult(
            rule_code=rule.rule_code,
            rule_name=rule.rule_name,
            target_field=target,
            status="UNKNOWN",
            user_value=None,
            expected_value=expected,
            reason=f"Missing profile detail for '{rule.rule_name}'. Please update your entrepreneur profile to verify eligibility.",
            is_hard_requirement=rule.is_hard_requirement,
            source_reference=rule.source_reference
        )

    passed = False

    if op == "EQUALS":
        passed = str(user_val).strip().lower() == str(expected).strip().lower()
    elif op == "IN":
        if isinstance(expected, list):
            expected_normalized = [str(x).strip().lower() for x in expected]
            passed = str(user_val).strip().lower() in expected_normalized
        else:
            passed = str(user_val).strip().lower() == str(expected).strip().lower()
    elif op == "NOT_IN":
        if isinstance(expected, list):
            expected_normalized = [str(x).strip().lower() for x in expected]
            passed = str(user_val).strip().lower() not in expected_normalized
        else:
            passed = str(user_val).strip().lower() != str(expected).strip().lower()
    elif op == "CONTAINS":
        passed = str(expected).strip().lower() in str(user_val).strip().lower()
    elif op == "GTE":
        try:
            passed = float(user_val) >= float(expected)
        except (ValueError, TypeError):
            passed = False
    elif op == "LTE":
        try:
            passed = float(user_val) <= float(expected)
        except (ValueError, TypeError):
            passed = False
    elif op == "BETWEEN":
        try:
            if isinstance(expected, list) and len(expected) == 2:
                passed = float(expected[0]) <= float(user_val) <= float(expected[1])
            else:
                passed = False
        except (ValueError, TypeError):
            passed = False
    else:
        # Default fallback
        passed = str(user_val) == str(expected)

    if passed:
        return ConditionResult(
            rule_code=rule.rule_code,
            rule_name=rule.rule_name,
            target_field=target,
            status="PASS",
            user_value=user_val,
            expected_value=expected,
            reason=f"Satisfied requirement: {rule.rule_name} matches your profile ({user_val}).",
            is_hard_requirement=rule.is_hard_requirement,
            source_reference=rule.source_reference
        )
    else:
        return ConditionResult(
            rule_code=rule.rule_code,
            rule_name=rule.rule_name,
            target_field=target,
            status="FAIL",
            user_value=user_val,
            expected_value=expected,
            reason=rule.failure_reason or f"Requirement not met: expected {expected}, profile indicates {user_val}.",
            is_hard_requirement=rule.is_hard_requirement,
            source_reference=rule.source_reference
        )


def assess_scheme_eligibility(
    scheme: Scheme,
    profile: UserProfile
) -> Tuple[str, float, List[ConditionResult], List[ConditionResult], List[ConditionResult]]:
    """
    Evaluate deterministic eligibility for a scheme against user profile.
    Returns: (overall_status, match_score, passed_conditions, failed_conditions, missing_conditions)
    Statuses: PASS, FAIL, UNKNOWN, NOT_APPLICABLE
    """
    rules: List[SchemeEligibilityRule] = scheme.rules or []

    if not rules:
        # If no explicit structured rules are configured, mark as UNKNOWN or NOT_APPLICABLE
        return "UNKNOWN", 50.0, [], [], [
            ConditionResult(
                rule_code="GENERAL_ELIGIBILITY",
                rule_name="Scheme Specific Rules",
                target_field="general",
                status="UNKNOWN",
                user_value=None,
                expected_value="Verified criteria",
                reason="This scheme does not yet have automated eligibility rules attached. Please consult the official guidelines.",
                is_hard_requirement=False,
                source_reference=scheme.official_portal_url
            )
        ]

    passed: List[ConditionResult] = []
    failed: List[ConditionResult] = []
    missing: List[ConditionResult] = []

    for rule in rules:
        res = evaluate_condition(rule, profile)
        if res.status == "PASS":
            passed.append(res)
        elif res.status == "FAIL":
            failed.append(res)
        elif res.status == "UNKNOWN":
            missing.append(res)

    # Any hard requirement failure immediately yields overall FAIL
    has_hard_fail = any(f.is_hard_requirement for f in failed)
    has_hard_unknown = any(m.is_hard_requirement for m in missing)

    total_conditions = len(rules)
    score = (len(passed) / total_conditions) * 100.0 if total_conditions > 0 else 0.0

    if has_hard_fail:
        overall_status = "FAIL"
    elif has_hard_unknown:
        overall_status = "UNKNOWN"
    elif len(failed) > 0:
        overall_status = "FAIL"
    elif len(passed) == total_conditions:
        overall_status = "PASS"
    else:
        overall_status = "UNKNOWN"

    return overall_status, round(score, 1), passed, failed, missing
