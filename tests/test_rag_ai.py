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
