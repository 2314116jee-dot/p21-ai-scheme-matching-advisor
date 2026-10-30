import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from backend.database import Base


class EligibilityAssessment(Base):
    __tablename__ = "eligibility_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)

    # PASS, FAIL, UNKNOWN, NOT_APPLICABLE
    overall_result = Column(String(50), nullable=False, index=True)
    match_score = Column(Float, default=0.0, nullable=False)

    passed_conditions = Column(JSON, nullable=False)  # List of condition objects
    failed_conditions = Column(JSON, nullable=False)  # List of condition objects
    missing_conditions = Column(JSON, nullable=False)  # List of condition objects

    ai_explanation = Column(Text, nullable=True)
    ai_provider_used = Column(String(50), nullable=True)
    sources_cited = Column(JSON, nullable=True)
    profile_snapshot = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="assessments")
    scheme = relationship("Scheme", back_populates="assessments")
