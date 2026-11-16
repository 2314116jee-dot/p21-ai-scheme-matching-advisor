import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.rag_service import hybrid_retrieve_schemes
from backend.models.scheme import Scheme

client = TestClient(app)


def test_ai_status_endpoint():
    resp = client.get("/api/ai/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "provider" in data
    assert "is_available" in data
    assert "model_name" in data
    assert "details" in data


def test_ai_ask_natural_language_discovery_general():
    resp = client.post(
        "/api/ai/ask",
        json={"query": "Which schemes offer subsidies for manufacturing ventures?"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert len(data["answer"]) > 50
    assert "matched_schemes" in data
    assert isinstance(data["matched_schemes"], list)
    assert len(data["matched_schemes"]) > 0
    assert "citations" in data
    assert "suggested_actions" in data
    assert "confidence_score" in data
    assert "provider_used" in data


def test_ai_ask_specific_scheme_query():
    resp = client.post(
        "/api/ai/ask",
        json={"query": "What are the rules and investment limits for Stand-Up India?"}
    )
    assert resp.status_code == 200
    data = resp.json()
    matched_names = [s["name"].lower() for s in data["matched_schemes"]]
    assert any("stand-up" in n or "stand up" in n for n in matched_names)
    assert len(data["citations"]) > 0


def test_ai_ask_short_query_validation():
    resp = client.post("/api/ai/ask", json={"query": "hi"})
    assert resp.status_code == 400
    assert "at least 3 characters" in resp.json()["detail"]


def test_hybrid_retriever_ranking(db):
    schemes, citations = hybrid_retrieve_schemes(
        db=db,
        query="credit guarantee for micro small enterprises",
        verified_only=False,
        limit=5
    )
    assert len(schemes) > 0
    # Top match should be CGTMSE or credit related
    top = schemes[0]
    assert "cgtmse" in top["code"].lower() or "credit" in top["name"].lower() or "guarantee" in top["name"].lower()


def test_ai_chat_endpoint_basic():
    resp = client.post(
        "/api/ai/chat",
        json={
            "message": "What is PMEGP scheme?",
            "history": [],
            "top_k": 3
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "reply" in data
    assert "answer_markdown" in data
    assert len(data["reply"]) > 20
    assert "matched_schemes" in data
    assert "citations" in data
    assert "provider_used" in data
    assert "evidence_sufficiency" in data
    assert "latency_ms" in data


def test_ai_chat_endpoint_multiturn_history():
    resp = client.post(
        "/api/ai/chat",
        json={
            "message": "What is the subsidy percentage for women in rural areas?",
            "history": [
                {"role": "user", "content": "Tell me about PMEGP"},
                {"role": "assistant", "content": "PMEGP is the Prime Minister Employment Generation Programme."}
            ],
            "top_k": 3
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "reply" in data
    # Should identify PMEGP from previous context
    matched_codes = [s["code"].lower() for s in data["matched_schemes"]]
    assert any("pmegp" in c for c in matched_codes)


def test_ai_suggested_prompts_endpoint():
    resp = client.get("/api/ai/suggested-prompts")
    assert resp.status_code == 200
    data = resp.json()
    assert "categories" in data
    assert len(data["categories"]) >= 3
    first_cat = data["categories"][0]
    assert "category" in first_cat
    assert "prompts" in first_cat
    assert len(first_cat["prompts"]) > 0


def test_deepseek_reasoning_extraction():
    from backend.services.ai_service import extract_deepseek_thought_process
    raw_text = "<think>\nAnalyzing PMEGP criteria for rural women.\nSubsidy is 35%.\n</think>\n\nUnder PMEGP, special category rural beneficiaries receive up to 35% margin money subsidy."
    thought, answer = extract_deepseek_thought_process(raw_text)
    assert thought is not None
    assert "Analyzing PMEGP" in thought
    assert "Under PMEGP" in answer
    assert "<think>" not in answer
    assert "</think>" not in answer

