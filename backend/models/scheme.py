import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
)
from sqlalchemy.orm import relationship
from backend.database import Base


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    ministry = Column(String(255), index=True, nullable=False)
    department = Column(String(255), nullable=True)
    brief_description = Column(Text, nullable=False)
    detailed_description = Column(Text, nullable=False)
    target_beneficiaries = Column(Text, nullable=True)
    benefits_summary = Column(Text, nullable=False)
    application_procedure = Column(Text, nullable=False)
    official_portal_url = Column(String(500), nullable=False)

    # Verification Lifecycle: Candidate, Needs Review, Verified, Stale, Superseded, Rejected
    verification_status = Column(String(50), default="Candidate", index=True, nullable=False)
    verification_notes = Column(Text, nullable=True)
    last_checked_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    effective_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    versions = relationship("SchemeVersion", back_populates="scheme", cascade="all, delete-orphan")
    sources = relationship("SchemeSource", back_populates="scheme", cascade="all, delete-orphan")
    documents = relationship("SchemeDocument", back_populates="scheme", cascade="all, delete-orphan")
    rules = relationship("SchemeEligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    assessments = relationship("EligibilityAssessment", back_populates="scheme", cascade="all, delete-orphan")
    saved_by_users = relationship("SavedScheme", back_populates="scheme", cascade="all, delete-orphan")
    checklists = relationship("DocumentChecklistStatus", back_populates="scheme", cascade="all, delete-orphan")


class SchemeVersion(Base):
    __tablename__ = "scheme_versions"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    changed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    change_summary = Column(Text, nullable=False)
    content_snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    scheme = relationship("Scheme", back_populates="versions")


class SchemeSource(Base):
    __tablename__ = "scheme_sources"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    source_title = Column(String(255), nullable=False)
    source_url = Column(String(500), nullable=False)
    source_type = Column(String(50), default="official_portal", nullable=False)  # official_portal, myscheme_page, gazette, guideline_doc
    extracted_passage = Column(Text, nullable=False)
    provenance_fact = Column(Text, nullable=False)
    last_verified_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    scheme = relationship("Scheme", back_populates="sources")


class SchemeDocument(Base):
    __tablename__ = "scheme_documents"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    document_name = Column(String(255), nullable=False)
    document_category = Column(String(100), default="identity", nullable=False)
    is_mandatory = Column(Boolean, default=True, nullable=False)
    issuing_authority = Column(String(255), nullable=True)
    instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    scheme = relationship("Scheme", back_populates="documents")
    statuses = relationship("DocumentChecklistStatus", back_populates="document", cascade="all, delete-orphan")


class SchemeEligibilityRule(Base):
    __tablename__ = "scheme_eligibility_rules"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_code = Column(String(100), nullable=False)
    rule_name = Column(String(255), nullable=False)
    target_field = Column(String(100), nullable=False, index=True)
    operator = Column(String(50), nullable=False)  # IN, NOT_IN, EQUALS, GTE, LTE, BETWEEN, CONTAINS
    expected_value = Column(JSON, nullable=False)
    is_hard_requirement = Column(Boolean, default=True, nullable=False)
    failure_reason = Column(Text, nullable=False)
    source_reference = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    scheme = relationship("Scheme", back_populates="rules")
