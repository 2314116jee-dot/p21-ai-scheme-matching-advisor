import re
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, case
from typing import List, Optional

from backend.database import get_db
from backend.models.scheme import Scheme, SchemeSource, SchemeDocument, SchemeEligibilityRule
from backend.schemas.scheme import SchemeListResponse, SchemeDetailResponse

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])

STOP_WORDS = {
    "for", "in", "and", "the", "a", "an", "to", "of", "with", "my", "me", "under",
    "scheme", "schemes", "available", "government", "central", "what", "which", "how", "can"
}

SYNONYMS = {
    "standup": ["stand-up", "standup"],
    "loan": ["loan", "credit", "financing", "borrowing"],
    "subsidy": ["subsidy", "subsidies", "margin money", "grant"],
    "women": ["women", "woman", "female", "mahila"],
    "startup": ["startup", "start-up", "seed fund", "innovation", "dpiit"],
    "mudra": ["mudra", "pmmy"],
    "pmegp": ["pmegp", "kvic", "prime minister employment"],
    "cgtmse": ["cgtmse", "credit guarantee"],
    "agriculture": ["agriculture", "farmer", "farming", "krishi", "kisan", "agro"],
    "manufacturing": ["manufacturing", "factory", "production", "industry"],
    "food": ["food", "food processing", "pmfme"],
    "solar": ["solar", "renewable", "energy"],
    "dairy": ["dairy", "cattle", "animal husbandry", "milk"],
    "student": ["student", "education", "fellowship", "scholarship"],
}

FLAGSHIP_CODES = ["pmegp", "stand-up-india", "pmmy-mudra", "sisfs-seed-fund", "cgtmse"]


@router.get("", response_model=List[SchemeListResponse])
def list_schemes(
    q: Optional[str] = Query(None, description="Search query by name, ministry, or keywords"),
    ministry: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="Verification status: Verified, Candidate, etc."),
    limit: int = Query(150, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    base_query = db.query(Scheme).filter(Scheme.is_active == True)

    if ministry and ministry.strip():
        base_query = base_query.filter(Scheme.ministry.ilike(f"%{ministry.strip()}%"))

    if status and status.strip():
        base_query = base_query.filter(Scheme.verification_status == status.strip())

    if q and q.strip():
        raw_tokens = [w for w in re.findall(r"[a-zA-Z0-9_-]+", q.lower()) if len(w) > 1 and w not in STOP_WORDS]
        if not raw_tokens:
            raw_tokens = [q.strip().lower()]

        token_clauses = []
        for token in raw_tokens:
            terms = list(SYNONYMS.get(token, [token]))
            if token.endswith("ies"):
                terms.append(token[:-3] + "y")
            elif token.endswith("s") and len(token) > 3:
                terms.append(token[:-1])

            field_conditions = []
            for term in set(terms):
                pattern = f"%{term}%"
                field_conditions.extend([
                    Scheme.name.ilike(pattern),
                    Scheme.code.ilike(pattern),
                    Scheme.brief_description.ilike(pattern),
                    Scheme.detailed_description.ilike(pattern),
                    Scheme.benefits_summary.ilike(pattern),
                    Scheme.target_beneficiaries.ilike(pattern),
                    Scheme.ministry.ilike(pattern),
                ])
            token_clauses.append(or_(*field_conditions))

        # First attempt: Match all tokens (AND)
        and_query = base_query.filter(and_(*token_clauses))
        schemes = and_query.order_by(
            case((Scheme.code.in_(FLAGSHIP_CODES), 0), else_=1),
            case((Scheme.verification_status == "Verified", 0), else_=1),
            Scheme.name.asc()
        ).offset(offset).limit(limit).all()

        # If strict AND produces nothing, gracefully fall back to OR matching
        if not schemes:
            or_query = base_query.filter(or_(*token_clauses))
            schemes = or_query.order_by(
                case((Scheme.code.in_(FLAGSHIP_CODES), 0), else_=1),
                case((Scheme.verification_status == "Verified", 0), else_=1),
                Scheme.name.asc()
            ).offset(offset).limit(limit).all()

        return schemes

    schemes = base_query.order_by(
        case((Scheme.code.in_(FLAGSHIP_CODES), 0), else_=1),
        case((Scheme.verification_status == "Verified", 0), else_=1),
        Scheme.name.asc()
    ).offset(offset).limit(limit).all()
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
