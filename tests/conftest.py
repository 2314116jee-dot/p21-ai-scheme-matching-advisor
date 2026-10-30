import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.config import settings
from backend.database import Base, get_db
from backend.main import app
from backend.models.user import User, Role, UserRole
from backend.services.auth_service import hash_password, get_or_create_role
from backend.services.ingestion_service import seed_verified_schemes, seed_candidate_schemes

# Use test connection or local DB session
engine = create_engine(settings.DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def db_session_factory():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Ensure base roles and schemes exist
        get_or_create_role(db, "user", "Standard user role")
        get_or_create_role(db, "admin", "System Administrator role")
        seed_verified_schemes(db)
        seed_candidate_schemes(db)
        yield TestingSessionLocal
    finally:
        db.close()


@pytest.fixture
def db(db_session_factory):
    session = db_session_factory()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session_factory):
    def override_get_db():
        session = db_session_factory()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
