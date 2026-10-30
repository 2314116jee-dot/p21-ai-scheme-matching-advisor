import pytest
import uuid


def test_saved_schemes_flow(client):
    user_email = f"save_{uuid.uuid4().hex[:8]}@test.in"
    password = "SavePassword123!"

    client.post("/api/auth/register", json={
        "email": user_email,
        "full_name": "Saver User",
        "password": password,
        "confirm_password": password,
        "terms_accepted": True,
    })

    # Get scheme ID
    s_res = client.get("/api/schemes/by-code/pmegp")
    scheme_id = s_res.json()["id"]

    # Save scheme
    save_res = client.post("/api/saved-schemes", json={"scheme_id": scheme_id, "notes": "Must prepare DPR"})
    assert save_res.status_code == 200
    assert save_res.json()["scheme_id"] == scheme_id

    # List saved schemes
    list_res = client.get("/api/saved-schemes")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
    assert list_res.json()[0]["scheme_id"] == scheme_id

    # Remove saved scheme
    del_res = client.delete(f"/api/saved-schemes/{scheme_id}")
    assert del_res.status_code == 200

    # Verify removal
    list_after = client.get("/api/saved-schemes")
    assert len(list_after.json()) == 0


def test_document_checklist_flow(client):
    user_email = f"doc_{uuid.uuid4().hex[:8]}@test.in"
    password = "DocPassword123!"

    client.post("/api/auth/register", json={
        "email": user_email,
        "full_name": "Checklist User",
        "password": password,
        "confirm_password": password,
        "terms_accepted": True,
    })

    # Get PMEGP scheme details
    s_res = client.get("/api/schemes/by-code/pmegp")
    scheme_id = s_res.json()["id"]
    documents = s_res.json()["documents"]
    assert len(documents) >= 1
    doc_id = documents[0]["id"]

    # Get checklist
    chk_res = client.get(f"/api/checklist/scheme/{scheme_id}")
    assert chk_res.status_code == 200
    items = chk_res.json()
    assert len(items) >= 1

    # Update document status to 'available'
    update_res = client.put(f"/api/checklist/scheme/{scheme_id}/document/{doc_id}", json={
        "status": "available",
        "notes": "Aadhaar verified via DigiLocker"
    })
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "available"

    # Query checklist again to ensure persistence
    chk_persisted = client.get(f"/api/checklist/scheme/{scheme_id}")
    matching_doc = next(i for i in chk_persisted.json() if i["document_id"] == doc_id)
    assert matching_doc["status"] == "available"


def test_scheme_comparison_endpoint(client):
    res_list = client.get("/api/schemes?limit=2")
    schemes = res_list.json()
    assert len(schemes) >= 2
    ids = f"{schemes[0]['id']},{schemes[1]['id']}"

    comp_res = client.get(f"/api/comparisons/compare?ids={ids}")
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert len(comp_data) == 2
    assert comp_data[0]["benefits_summary"] is not None
