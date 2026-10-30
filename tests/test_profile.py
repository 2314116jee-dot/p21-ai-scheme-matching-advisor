import pytest
import uuid


def test_profile_creation_update_and_persistence(client):
    user_email = f"profile_user_{uuid.uuid4().hex[:8]}@test.in"
    password = "ProfilePassword123!"

    client.post("/api/auth/register", json={
        "email": user_email,
        "full_name": "Entrepreneur Test",
        "password": password,
        "confirm_password": password,
        "terms_accepted": True,
    })

    # Initial profile query
    res = client.get("/api/profile")
    assert res.status_code == 200
    initial_data = res.json()
    assert initial_data["applicant_type"] is None
    assert initial_data["completion_percentage"] == 0

    # Update profile
    update_payload = {
        "applicant_type": "aspiring_entrepreneur",
        "business_name": "AgroTech Innovations",
        "business_stage": "ideation",
        "state": "Maharashtra",
        "district": "Pune",
        "sector": "food_processing",
        "registration_status": "unregistered",
        "business_age_months": 3,
        "ownership_category": "women",
        "total_investment_inr": 2500000.0,
        "annual_turnover_inr": 0.0,
    }

    put_res = client.put("/api/profile", json=update_payload)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["business_name"] == "AgroTech Innovations"
    assert updated["sector"] == "food_processing"
    assert updated["ownership_category"] == "women"
    assert updated["completion_percentage"] >= 80

    # Verify persistence by querying again
    get_res = client.get("/api/profile")
    assert get_res.status_code == 200
    persisted = get_res.json()
    assert persisted["business_name"] == "AgroTech Innovations"
    assert persisted["total_investment_inr"] == 2500000.0
