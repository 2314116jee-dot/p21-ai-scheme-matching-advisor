from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional

from backend.database import get_db
from backend.models.scheme import Scheme, SchemeSource, SchemeDocument, SchemeEligibilityRule
from backend.schemas.scheme import SchemeListResponse, SchemeDetailResponse

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])


@router.get("", response_model=List[SchemeListResponse])
def list_schemes(
    q: Optional[str] = Query(None, description="Search query by name, ministry, or keywords"),
    ministry: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="Verification status: Verified, Candidate, etc."),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Scheme).filter(Scheme.is_active == True)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Scheme.name.ilike(term),
                Scheme.ministry.ilike(term),
                Scheme.brief_description.ilike(term),
                Scheme.target_beneficiaries.ilike(term),
                Scheme.code.ilike(term)
            )
        )

    if ministry and ministry.strip():
        query = query.filter(Scheme.ministry.ilike(f"%{ministry.strip()}%"))

    if status and status.strip():
        query = query.filter(Scheme.verification_status == status.strip())

    schemes = query.order_by(Scheme.name.asc()).offset(offset).limit(limit).all()
    return schemes


@router.get("/ministries", response_model=List[str])
def list_ministries(db: Session = Depends(get_db)):
    ministries = db.query(Scheme.ministry).distinct().filter(Scheme.is_active == True).all()
    return sorted([m[0] for m in ministries if m[0]])


@router.get("/{scheme_id}", response_model=SchemeDetailResponse)
def get_scheme_details(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id, Scheme.is_active == True).first()
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found or is currently inactive."
        )
    return scheme


@router.get("/by-code/{code}", response_model=SchemeDetailResponse)
def get_scheme_by_code(code: str, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.code == code, Scheme.is_active == True).first()
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found."
        )
    return scheme
