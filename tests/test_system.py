import pytest


def test_health_check_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"]["connected"] is True
    assert "engine" in data["database"]
    assert "ai_service" in data


def test_hosted_frontend_spa_serving(client):
    # Root route should return 200 and HTML
    res_root = client.get("/")
    assert res_root.status_code == 200
    assert "text/html" in res_root.headers.get("content-type", "")
    assert "<!doctype html>" in res_root.text.lower()

    # Client-side SPA routes should fallback to index.html with 200 OK
    res_spa = client.get("/dashboard")
    assert res_spa.status_code == 200
    assert "text/html" in res_spa.headers.get("content-type", "")

    # Non-existent API route must return 404 JSON, NOT fallback to HTML
    res_api_404 = client.get("/api/nonexistent-endpoint")
    assert res_api_404.status_code == 404
    assert res_api_404.headers.get("content-type", "").startswith("application/json")
