import pytest
import uuid
from backend.services.auth_service import bootstrap_admin_user
from backend.models.user import User, AuditLog
from backend.models.scheme import Scheme, SchemeVersion


def test_admin_metrics_and_user_deactivation(client, db):
    admin_email = f"admin_ops_{uuid.uuid4().hex[:8]}@p21.gov.in"
    pw = "AdminPass123!"
    bootstrap_admin_user(db, email=admin_email, password=pw, full_name="Ops Admin")

    client.post("/api/auth/admin-login", json={"email": admin_email, "password": pw})

    # Create target user
    user_email = f"target_{uuid.uuid4().hex[:8]}@test.in"
    target_user = User(
        email=user_email,
        password_hash="dummy_hash",
        full_name="Target User",
        is_active=True
    )
    db.add(target_user)
    db.commit()
    db.refresh(target_user)

    # Deactivate target user
    deact_res = client.put(f"/api/admin/users/{target_user.id}/status", json={
        "is_active": False,
        "reason": "Administrative suspension for testing"
    })
    assert deact_res.status_code == 200

    # Verify user is deactivated in DB
    db.refresh(target_user)
    assert target_user.is_active is False

    # Check audit log was written
    log = db.query(AuditLog).filter(
        AuditLog.action == "ADMIN_UPDATE_USER_STATUS",
        AuditLog.resource_id == str(target_user.id)
    ).first()
    assert log is not None
    assert log.details["reason"] == "Administrative suspension for testing"


def test_scheme_verification_status_update(client, db):
    admin_email = f"verifier_{uuid.uuid4().hex[:8]}@p21.gov.in"
    pw = "VerifierPass123!"
    bootstrap_admin_user(db, email=admin_email, password=pw, full_name="Verifier Admin")

    client.post("/api/auth/admin-login", json={"email": admin_email, "password": pw})

    # Create candidate scheme
    scheme = Scheme(
        code=f"test-cand-{uuid.uuid4().hex[:6]}",
        name="Candidate Test Scheme",
        ministry="Ministry of Testing",
        brief_description="Brief description.",
        detailed_description="Detailed description.",
        benefits_summary="Subsidy benefits.",
        application_procedure="Procedure.",
        official_portal_url="https://test.gov.in",
        verification_status="Candidate",
        is_active=True
    )
    db.add(scheme)
    db.commit()
    db.refresh(scheme)

    # Transition to Verified
    update_res = client.put(f"/api/admin/schemes/{scheme.id}/verification", json={
        "verification_status": "Verified",
        "verification_notes": "Official gazette notification confirmed by admin.",
        "source_url": "https://test.gov.in/notification.pdf",
        "source_title": "Official Test Gazette 2026"
    })
    assert update_res.status_code == 200
    assert update_res.json()["verification_status"] == "Verified"

    # Verify scheme version recorded
    db.refresh(scheme)
    assert scheme.verification_status == "Verified"
    assert len(scheme.versions) >= 1


def test_admin_catalogue_coverage_endpoint(client, db):
    admin_email = f"coverage_admin_{uuid.uuid4().hex[:8]}@p21.gov.in"
    pw = "CoveragePass123!"
    bootstrap_admin_user(db, email=admin_email, password=pw, full_name="Coverage Admin")

    client.post("/api/auth/admin-login", json={"email": admin_email, "password": pw})

    res = client.get("/api/admin/coverage")
    assert res.status_code == 200
    data = res.json()
    assert data["dataset_name"] == "shrijayan/gov_myscheme"
    assert data["total_source_files_discovered"] == 2154
    assert data["unique_source_files"] == 1431
    assert data["duplicate_copies_detected"] == 723
    assert data["total_schemes_in_db"] >= 1
    assert "verified_count" in data
    assert "candidate_count" in data
    assert "total_rules_defined" in data

