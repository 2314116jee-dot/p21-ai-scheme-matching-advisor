from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator
from backend.config import settings

# settings.db_url normalises the Neon postgresql:// URL to postgresql+psycopg://
# and falls back to the local DATABASE_URL in development.
# settings.is_production adds sslmode=require for Neon (already in the URL) via connect_args.
connect_args = {}
if settings.is_production:
    # Neon injects ?sslmode=require in the URL itself; this is a belt-and-suspenders guard.
    connect_args = {"sslmode": "require"}

engine = create_engine(
    settings.db_url,
    pool_pre_ping=True,
    pool_size=5,       # Neon free tier: max 10 connections; leave headroom for migrations
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
