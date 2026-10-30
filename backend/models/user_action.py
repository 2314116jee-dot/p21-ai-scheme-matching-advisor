import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Text, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from backend.database import Base


class SavedScheme(Base):
    __tablename__ = "saved_schemes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "scheme_id", name="uq_user_saved_scheme"),
    )

    user = relationship("User", back_populates="saved_schemes")
    scheme = relationship("Scheme", back_populates="saved_by_users")


class SchemeComparison(Base):
    __tablename__ = "scheme_comparisons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="Scheme Comparison", nullable=False)
    scheme_ids = Column(JSON, nullable=False)  # List of integer scheme IDs
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="comparisons")


class DocumentChecklistStatus(Base):
    __tablename__ = "document_checklist_statuses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("scheme_documents.id", ondelete="CASCADE"), nullable=False, index=True)

    # Status: missing, in_progress, available, not_applicable
    status = Column(String(50), default="missing", nullable=False)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "scheme_id", "document_id", name="uq_user_scheme_document"),
    )

    user = relationship("User", back_populates="checklists")
    scheme = relationship("Scheme", back_populates="checklists")
    document = relationship("SchemeDocument", back_populates="statuses")
