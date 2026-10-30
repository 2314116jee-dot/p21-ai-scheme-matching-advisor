from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from typing import List, Dict, Any, Optional
import datetime

from backend.database import get_db
from backend.models.user import User, Role, UserRole, AuditLog
from backend.models.scheme import Scheme, SchemeSource, SchemeDocument, SchemeEligibilityRule, SchemeVersion
from backend.models.assessment import EligibilityAssessment
from backend.schemas.admin import (
    AdminStatsResponse,
    AdminUserListItem,
    AdminAuditLogItem,
    AdminUserStatusUpdate,
    SchemeVerificationUpdate,
)
from backend.schemas.scheme import SchemeDetailResponse, SchemeCreateUpdate
from backend.services.audit_service import record_audit_log
from backend.services.ingestion_service import seed_verified_schemes, seed_candidate_schemes, get_catalogue_coverage_stats
from backend.api.deps import require_admin

router = APIRouter(prefix="/api/admin", tags=["Administrator Operations"])


@router.get("/coverage")
def get_catalogue_coverage(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Retrieve comprehensive scheme data pipeline and catalogue coverage metrics."""
    stats = get_catalogue_coverage_stats(db)
    return {
        "dataset_name": "shrijayan/gov_myscheme",
        "dataset_license": "Apache-2.0",
        "total_source_files_discovered": 2154,
        "unique_source_files": 1431,
        "duplicate_copies_detected": 723,
        **stats
    }


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_dashboard_stats(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    deactivated_users = total_users - active_users

    total_schemes = db.query(func.count(Scheme.id)).scalar() or 0

    # Verification status breakdown from real records
    status_counts = (
        db.query(Scheme.verification_status, func.count(Scheme.id))
        .group_by(Scheme.verification_status)
        .all()
    )
    breakdown = {s: count for s, count in status_counts}

    total_assessments = db.query(func.count(EligibilityAssessment.id)).scalar() or 0
    total_sources = db.query(func.count(SchemeSource.id)).scalar() or 0
    total_audit_events = db.query(func.count(AuditLog.id)).scalar() or 0

    # Recent activities in last 7 days
    seven_days_ago = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)
    recent_activity = db.query(func.count(AuditLog.id)).filter(AuditLog.created_at >= seven_days_ago).scalar() or 0

    return AdminStatsResponse(
        total_users=total_users,
        active_users=active_users,
        deactivated_users=deactivated_users,
        total_schemes=total_schemes,
        verification_breakdown=breakdown,
        total_assessments=total_assessments,
        total_sources=total_sources,
        total_audit_events=total_audit_events,
        recent_activity_count=recent_activity,
    )


@router.get("/users", response_model=List[AdminUserListItem])
def list_users_for_admin(
    q: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(or_(User.email.ilike(term), User.full_name.ilike(term)))

    users = query.order_by(desc(User.created_at)).offset(offset).limit(limit).all()

    result = []
    for u in users:
        roles = [ur.role.name for ur in u.roles if ur.role]
        result.append(
            AdminUserListItem(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                mobile_number=u.mobile_number,
                is_active=u.is_active,
                roles=roles,
                has_profile=u.profile is not None,
                created_at=u.created_at,
                last_login_at=u.last_login_at,
            )
        )
    return result


@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    payload: AdminUserStatusUpdate,
    request: Request,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot alter your own administrative status.")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    target_user.is_active = payload.is_active
    db.commit()

    client_ip = request.client.host if request.client else "127.0.0.1"
    record_audit_log(
        db,
        action="ADMIN_UPDATE_USER_STATUS",
        resource_type="user",
        resource_id=str(target_user.id),
        user_id=admin_user.id,
        ip_address=client_ip,
        details={"new_active_status": payload.is_active, "reason": payload.reason}
    )

    return {"message": f"User account {'activated' if payload.is_active else 'deactivated'} successfully."}


@router.get("/audit-logs", response_model=List[AdminAuditLogItem])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).offset(offset).limit(limit).all()

    # Pre-fetch user emails if user_id exists
    user_ids = {l.user_id for l in logs if l.user_id}
    users_map = {u.id: u.email for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}

    result = []
    for l in logs:
        result.append(
            AdminAuditLogItem(
                id=l.id,
                user_id=l.user_id,
                user_email=users_map.get(l.user_id),
                action=l.action,
                resource_type=l.resource_type,
                resource_id=l.resource_id,
                ip_address=l.ip_address,
                details=l.details,
                created_at=l.created_at,
            )
        )
    return result


@router.put("/schemes/{scheme_id}/verification", response_model=SchemeDetailResponse)
def update_scheme_verification(
    scheme_id: int,
    payload: SchemeVerificationUpdate,
    request: Request,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    now = datetime.datetime.now(datetime.timezone.utc)
    old_status = scheme.verification_status
    scheme.verification_status = payload.verification_status
    scheme.verification_notes = payload.verification_notes
    scheme.last_checked_date = now

    # Add source if provided
    if payload.source_url and payload.source_title:
        db.add(
            SchemeSource(
                scheme_id=scheme.id,
                source_title=payload.source_title,
                source_url=payload.source_url,
                source_type="official_portal",
                extracted_passage="Verified by administrative review.",
                provenance_fact=f"Status transitioned from {old_status} to {payload.verification_status}.",
                last_verified_date=now,
            )
        )

    # Save version record
    current_version_num = len(scheme.versions) + 1
    version = SchemeVersion(
        scheme_id=scheme.id,
        version_number=current_version_num,
        changed_by_user_id=admin_user.id,
        change_summary=f"Verification status transitioned to {payload.verification_status}. Notes: {payload.verification_notes}",
        content_snapshot={
            "verification_status": payload.verification_status,
            "verification_notes": payload.verification_notes,
            "updated_by": admin_user.email,
        }
    )
    db.add(version)
    db.commit()
    db.refresh(scheme)

    client_ip = request.client.host if request.client else "127.0.0.1"
    record_audit_log(
        db,
        action="SCHEME_VERIFICATION_STATUS_CHANGED",
        resource_type="scheme",
        resource_id=str(scheme.id),
        user_id=admin_user.id,
        ip_address=client_ip,
        details={
            "old_status": old_status,
            "new_status": payload.verification_status,
            "notes": payload.verification_notes,
        }
    )
    return scheme


@router.post("/schemes", response_model=SchemeDetailResponse)
def create_scheme_admin(
    payload: SchemeCreateUpdate,
    request: Request,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Scheme).filter(Scheme.code == payload.code.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scheme code already exists.")

    scheme = Scheme(
        code=payload.code.strip(),
        name=payload.name.strip(),
        ministry=payload.ministry.strip(),
        department=payload.department.strip() if payload.department else None,
        brief_description=payload.brief_description.strip(),
        detailed_description=payload.detailed_description.strip(),
        target_beneficiaries=payload.target_beneficiaries,
        benefits_summary=payload.benefits_summary.strip(),
        application_procedure=payload.application_procedure.strip(),
        official_portal_url=payload.official_portal_url.strip(),
        verification_status=payload.verification_status,
        verification_notes=payload.verification_notes,
        last_checked_date=datetime.datetime.now(datetime.timezone.utc),
        is_active=True
    )
    db.add(scheme)
    db.commit()
    db.refresh(scheme)

    client_ip = request.client.host if request.client else "127.0.0.1"
    record_audit_log(
        db,
        action="ADMIN_CREATE_SCHEME",
        resource_type="scheme",
        resource_id=str(scheme.id),
        user_id=admin_user.id,
        ip_address=client_ip,
        details={"code": scheme.code, "name": scheme.name}
    )
    return scheme


@router.post("/ingestion/trigger")
def trigger_ingestion_job(
    request: Request,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Trigger ingestion pipeline for verified and candidate schemes."""
    v_count = seed_verified_schemes(db, admin_user_id=admin_user.id)
    c_count = seed_candidate_schemes(db, admin_user_id=admin_user.id)

    client_ip = request.client.host if request.client else "127.0.0.1"
    record_audit_log(
        db,
        action="TRIGGER_INGESTION_JOB",
        resource_type="system",
        user_id=admin_user.id,
        ip_address=client_ip,
        details={"verified_imported": v_count, "candidates_imported": c_count}
    )

    return {
        "message": f"Ingestion executed. Imported {v_count} verified schemes and {c_count} candidate schemes.",
        "verified_imported": v_count,
        "candidates_imported": c_count,
    }
