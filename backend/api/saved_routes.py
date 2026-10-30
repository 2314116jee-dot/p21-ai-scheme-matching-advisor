from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel

from backend.database import get_db
from backend.models.user import User
from backend.models.scheme import Scheme
from backend.models.user_action import SavedScheme
from backend.schemas.assessment import SavedSchemeResponse
from backend.schemas.scheme import SchemeListResponse
from backend.api.deps import get_current_active_user

router = APIRouter(prefix="/api/saved-schemes", tags=["Saved Schemes"])


class SaveSchemePayload(BaseModel):
    scheme_id: int
    notes: Optional[str] = None


@router.get("", response_model=List[SavedSchemeResponse])
def get_my_saved_schemes(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedScheme).filter(
        SavedScheme.user_id == current_user.id
    ).order_by(desc(SavedScheme.created_at)).all()

    result = []
    for s in saved:
        result.append(
            SavedSchemeResponse(
                id=s.id,
                user_id=s.user_id,
                scheme_id=s.scheme_id,
                scheme=SchemeListResponse.model_validate(s.scheme),
                notes=s.notes,
                created_at=s.created_at,
            )
        )
    return result


@router.post("", response_model=SavedSchemeResponse)
def save_scheme(
    payload: SaveSchemePayload,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == payload.scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    existing = db.query(SavedScheme).filter(
        SavedScheme.user_id == current_user.id,
        SavedScheme.scheme_id == payload.scheme_id
    ).first()

    if existing:
        existing.notes = payload.notes
        db.commit()
        db.refresh(existing)
        return SavedSchemeResponse(
            id=existing.id,
            user_id=existing.user_id,
            scheme_id=existing.scheme_id,
            scheme=SchemeListResponse.model_validate(scheme),
            notes=existing.notes,
            created_at=existing.created_at,
        )

    saved = SavedScheme(
        user_id=current_user.id,
        scheme_id=payload.scheme_id,
        notes=payload.notes
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)

    return SavedSchemeResponse(
        id=saved.id,
        user_id=saved.user_id,
        scheme_id=saved.scheme_id,
        scheme=SchemeListResponse.model_validate(scheme),
        notes=saved.notes,
        created_at=saved.created_at,
    )


@router.delete("/{scheme_id}")
def remove_saved_scheme(
    scheme_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedScheme).filter(
        SavedScheme.user_id == current_user.id,
        SavedScheme.scheme_id == scheme_id
    ).first()

    if not saved:
        raise HTTPException(status_code=404, detail="Saved scheme not found.")

    db.delete(saved)
    db.commit()
    return {"message": "Scheme removed from saved list."}
