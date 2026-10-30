import asyncio
import pytest
from backend.services.ai_service import build_deterministic_explanation, generate_ai_explanation
from backend.models.scheme import Scheme, SchemeSource
from backend.schemas.assessment import ConditionResult


def test_ai_explanation_deterministic_fallback():
    async def _test():
        scheme = Scheme(
            id=1,
            code="pmegp",
            name="Prime Minister's Employment Generation Programme (PMEGP)",
            ministry="Ministry of MSME",
            brief_description="Credit linked subsidy scheme.",
            detailed_description="Detailed description.",
            benefits_summary="Margin money subsidy up to 35%.",
            application_procedure="Apply via KVIC portal.",
            official_portal_url="https://kviconline.gov.in"
        )

        source = SchemeSource(
            id=1,
            scheme_id=1,
            source_title="KVIC Gazette Guidelines",
            source_url="https://kviconline.gov.in/guidelines.pdf",
            source_type="gazette",
            extracted_passage="Quantum of Margin Money Subsidy: Special Category 35% rural.",
            provenance_fact="Confirmed 35% margin subsidy for special category rural projects."
        )

        passed = [
            ConditionResult(
                rule_code="RULE1",
                rule_name="Sector Match",
                target_field="sector",
                status="PASS",
                user_value="manufacturing",
                expected_value=["manufacturing"],
                reason="Sector matches manufacturing activity.",
                is_hard_requirement=True
            )
        ]

        explanation, provider, citations = await generate_ai_explanation(
            scheme=scheme,
            profile=None,
            overall_result="PASS",
            passed=passed,
            failed=[],
            missing=[],
            sources=[source]
        )

        assert explanation is not None
        assert "PMEGP" in explanation or "Prime Minister" in explanation
        assert "Margin money subsidy" in explanation or "35%" in explanation
        assert len(citations) == 1
        assert citations[0]["title"] == "KVIC Gazette Guidelines"
        assert "does not constitute a guarantee" in explanation or "does not guarantee" in explanation

    asyncio.run(_test())
