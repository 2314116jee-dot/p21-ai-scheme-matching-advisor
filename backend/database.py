from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator
from backend.config import settings

# Neon.tech (and other cloud Postgres) requires SSL.
# psycopg3 passes through ?sslmode=require from the connection string automatically.
# For local dev, no SSL is needed — the connection string won't have sslmode.
connect_args = {}
if settings.is_production:
    # Ensure SSL is enforced for cloud databases (Neon, Supabase, etc.)
    connect_args = {"sslmode": "require"}

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,       # Reduced for free tier limits (Neon: 10 max connections)
    max_overflow=10,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
