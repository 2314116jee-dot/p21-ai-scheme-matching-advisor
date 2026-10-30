import pytest
import uuid
from backend.services.auth_service import bootstrap_admin_user


def test_unauthenticated_access_blocked(client):
    res = client.get("/api/profile")
    assert res.status_code == 401

    res_admin = client.get("/api/admin/stats")
    assert res_admin.status_code == 401


def test_standard_user_cannot_access_admin_endpoints(client):
    user_email = f"standard_{uuid.uuid4().hex[:8]}@test.in"
    password = "UserPassword123!"

    reg = client.post("/api/auth/register", json={
        "email": user_email,
        "full_name": "Standard User",
        "password": password,
        "confirm_password": password,
        "terms_accepted": True,
    })
    assert reg.status_code == 200

    # Attempting to access admin stats with standard user cookie
    admin_res = client.get("/api/admin/stats")
    assert admin_res.status_code == 403
    assert "Administrator privileges required" in admin_res.json()["detail"]

    # Attempting admin login as non-admin user
    admin_login_res = client.post("/api/auth/admin-login", json={
        "email": user_email,
        "password": password,
    })
    assert admin_login_res.status_code == 403
    assert "Access denied" in admin_login_res.json()["detail"]


def test_bootstrap_admin_access(client, db):
    admin_email = f"admin_{uuid.uuid4().hex[:8]}@p21.gov.in"
    password = "AdminSuperSecret123!"

    # Bootstrap administrator
    bootstrap_admin_user(db, email=admin_email, password=password, full_name="Test Official")

    # Login as admin
    login_res = client.post("/api/auth/admin-login", json={
        "email": admin_email,
        "password": password,
    })
    assert login_res.status_code == 200
    assert "admin" in login_res.json()["user"]["roles"]

    # Access admin endpoints
    stats_res = client.get("/api/admin/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_users" in stats
    assert "total_schemes" in stats
    assert stats["total_schemes"] >= 6
