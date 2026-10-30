import pytest
import uuid
from backend.services.auth_service import hash_password, verify_password, hash_token
from backend.models.user import User


def test_password_hashing():
    raw = "MySecurePass123!"
    hashed = hash_password(raw)
    assert hashed != raw
    assert hashed.startswith("$2b$")
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_user_registration_and_duplicate_prevention(client, db):
    unique_email = f"user_{uuid.uuid4().hex[:8]}@test.in"

    payload = {
        "email": unique_email,
        "full_name": "Test Founder",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "mobile_number": "+91 9876543210",
        "terms_accepted": True,
    }

    # First registration should succeed
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["user"]["email"] == unique_email
    assert "user" in data["user"]["roles"]
    assert "csrf_token" in data
    assert "p21_access_token" in res.cookies

    # Duplicate registration must fail with 400
    res_dup = client.post("/api/auth/register", json=payload)
    assert res_dup.status_code == 400
    assert "already exists" in res_dup.json()["detail"]


def test_user_login_success_and_failure(client):
    unique_email = f"login_test_{uuid.uuid4().hex[:8]}@test.in"
    password = "CorrectPassword123!"

    # Register user
    client.post("/api/auth/register", json={
        "email": unique_email,
        "full_name": "Login User",
        "password": password,
        "confirm_password": password,
        "terms_accepted": True,
    })

    # Failed login with wrong password
    res_fail = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "WrongPassword123!",
    })
    assert res_fail.status_code == 401
    assert "Invalid email or password" in res_fail.json()["detail"]

    # Failed login with non-existent email
    res_nonexistent = client.post("/api/auth/login", json={
        "email": "does_not_exist@domain.in",
        "password": "AnyPassword123!",
    })
    assert res_nonexistent.status_code == 401
    assert "Invalid email or password" in res_nonexistent.json()["detail"]

    # Successful login
    res_success = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": password,
    })
    assert res_success.status_code == 200
    assert res_success.json()["user"]["email"] == unique_email
    assert "p21_access_token" in res_success.cookies


def test_password_recovery_and_reset_flow(client):
    unique_email = f"recover_{uuid.uuid4().hex[:8]}@test.in"
    password = "OldPassword123!"

    client.post("/api/auth/register", json={
        "email": unique_email,
        "full_name": "Recover User",
        "password": password,
        "confirm_password": password,
        "terms_accepted": True,
    })

    # Request recovery
    res_forgot = client.post("/api/auth/forgot-password", json={"email": unique_email})
    assert res_forgot.status_code == 200
    data = res_forgot.json()
    assert "instructions have been generated" in data["message"]
    token = data.get("dev_recovery_token")
    assert token is not None

    # Reset with new password
    new_pw = "NewSecurePassword456!"
    res_reset = client.post("/api/auth/reset-password", json={
        "token": token,
        "new_password": new_pw,
        "confirm_new_password": new_pw,
    })
    assert res_reset.status_code == 200

    # Old password must fail
    res_old = client.post("/api/auth/login", json={"email": unique_email, "password": password})
    assert res_old.status_code == 401

    # New password must succeed
    res_new = client.post("/api/auth/login", json={"email": unique_email, "password": new_pw})
    assert res_new.status_code == 200
