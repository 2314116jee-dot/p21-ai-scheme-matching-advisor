import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from backend.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Entrepreneur Profile Fields
    applicant_type = Column(String(50), nullable=True)  # aspiring_entrepreneur, individual, existing_business, startup, msme
    state = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True)
    business_name = Column(String(255), nullable=True)
    business_stage = Column(String(50), nullable=True)  # ideation, prototype, early_stage, growth, scaling
    sector = Column(String(100), nullable=True, index=True)  # manufacturing, services, agriculture_allied, it_technology, etc.
    registration_status = Column(String(100), nullable=True)  # unregistered, udyam_registered, startup_india_recognized, pvt_ltd, etc.
    business_age_months = Column(Integer, nullable=True)  # In months
    ownership_category = Column(String(50), nullable=True)  # general, women, sc_st, obc, minority, divyangjan, ex_servicemen
    annual_turnover_inr = Column(Float, nullable=True)
    total_investment_inr = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="profile")

    def completion_percentage(self) -> int:
        fields = [
            self.applicant_type,
            self.state,
            self.district,
            self.business_stage,
            self.sector,
            self.registration_status,
            self.ownership_category,
            self.total_investment_inr is not None or self.annual_turnover_inr is not None,
        ]
        filled = sum(1 for f in fields if f)
        return int((filled / len(fields)) * 100)
