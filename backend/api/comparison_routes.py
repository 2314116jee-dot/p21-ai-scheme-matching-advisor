from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from backend.database import get_db
from backend.models.user import User
from backend.models.scheme import Scheme
from backend.schemas.scheme import SchemeDetailResponse
from backend.api.deps import get_current_active_user

router = APIRouter(prefix="/api/comparisons", tags=["Scheme Comparisons"])


@router.get("/compare", response_model=List[SchemeDetailResponse])
def compare_schemes_by_ids(
    ids: str = Query(..., description="Comma-separated scheme IDs, e.g. 1,2,3"),
    db: Session = Depends(get_db)
):
    try:
        scheme_ids = [int(i.strip()) for i in ids.split(",") if i.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid IDs format. Must be comma-separated integers.")

    if len(scheme_ids) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 schemes can be compared simultaneously.")

    schemes = db.query(Scheme).filter(Scheme.id.in_(scheme_ids), Scheme.is_active == True).all()
    return schemes
