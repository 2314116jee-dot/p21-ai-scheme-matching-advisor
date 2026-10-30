import pytest


def test_list_and_search_schemes(client):
    res = client.get("/api/schemes")
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 6

    # Test search query
    search_res = client.get("/api/schemes?q=PMEGP")
    assert search_res.status_code == 200
    found = search_res.json()
    assert len(found) >= 1
    assert any("PMEGP" in s["name"] or s["code"] == "pmegp" for s in found)


def test_filter_by_ministry_and_status(client):
    # Filter by Verified status
    res_verified = client.get("/api/schemes?status=Verified")
    assert res_verified.status_code == 200
    for s in res_verified.json():
        assert s["verification_status"] == "Verified"

    # Filter by Ministry
    res_min = client.get("/api/schemes?ministry=MSME")
    assert res_min.status_code == 200
    for s in res_min.json():
        assert "MSME" in s["ministry"] or "Micro" in s["ministry"]


def test_scheme_details_with_sources_and_rules(client):
    # Fetch PMEGP scheme detail
    res = client.get("/api/schemes/by-code/pmegp")
    assert res.status_code == 200
    scheme = res.json()
    assert scheme["code"] == "pmegp"
    assert len(scheme["rules"]) >= 1
    assert len(scheme["documents"]) >= 1
    assert len(scheme["sources"]) >= 1

    # Check sources have provenance facts
    source = scheme["sources"][0]
    assert "provenance_fact" in source
    assert "source_url" in source
