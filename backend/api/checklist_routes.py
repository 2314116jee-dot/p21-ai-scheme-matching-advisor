from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from backend.database import get_db
from backend.models.user import User
from backend.models.scheme import Scheme, SchemeDocument
from backend.models.user_action import DocumentChecklistStatus
from backend.schemas.assessment import DocumentChecklistResponse, UpdateChecklistRequest
from backend.api.deps import get_current_active_user

router = APIRouter(prefix="/api/checklist", tags=["Document Checklist"])


@router.get("/scheme/{scheme_id}", response_model=List[DocumentChecklistResponse])
def get_scheme_document_checklist(
    scheme_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    docs = db.query(SchemeDocument).filter(SchemeDocument.scheme_id == scheme_id).all()
    user_statuses = {
        s.document_id: s
        for s in db.query(DocumentChecklistStatus).filter(
            DocumentChecklistStatus.user_id == current_user.id,
            DocumentChecklistStatus.scheme_id == scheme_id
        ).all()
    }

    result = []
    for d in docs:
        st = user_statuses.get(d.id)
        result.append(
            DocumentChecklistResponse(
                id=st.id if st else 0,
                user_id=current_user.id,
                scheme_id=scheme_id,
                document_id=d.id,
                document_name=d.document_name,
                document_category=d.document_category,
                is_mandatory=d.is_mandatory,
                issuing_authority=d.issuing_authority,
                instructions=d.instructions,
                status=st.status if st else "missing",
                notes=st.notes if st else None,
                updated_at=st.updated_at if st else d.created_at,
            )
        )
    return result


@router.put("/scheme/{scheme_id}/document/{document_id}", response_model=DocumentChecklistResponse)
def update_document_checklist_status(
    scheme_id: int,
    document_id: int,
    payload: UpdateChecklistRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    doc = db.query(SchemeDocument).filter(
        SchemeDocument.id == document_id,
        SchemeDocument.scheme_id == scheme_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Scheme document not found")

    st = db.query(DocumentChecklistStatus).filter(
        DocumentChecklistStatus.user_id == current_user.id,
        DocumentChecklistStatus.scheme_id == scheme_id,
        DocumentChecklistStatus.document_id == document_id
    ).first()

    if not st:
        st = DocumentChecklistStatus(
            user_id=current_user.id,
            scheme_id=scheme_id,
            document_id=document_id,
            status=payload.status,
            notes=payload.notes
        )
        db.add(st)
    else:
        st.status = payload.status
        st.notes = payload.notes

    db.commit()
    db.refresh(st)

    return DocumentChecklistResponse(
        id=st.id,
        user_id=current_user.id,
        scheme_id=scheme_id,
        document_id=doc.id,
        document_name=doc.document_name,
        document_category=doc.document_category,
        is_mandatory=doc.is_mandatory,
        issuing_authority=doc.issuing_authority,
        instructions=doc.instructions,
        status=st.status,
        notes=st.notes,
        updated_at=st.updated_at,
    )
