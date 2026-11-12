import os
import re
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


def _ensure_psycopg3_prefix(url: str) -> str:
    """
    Neon CLI writes standard postgresql:// / postgres:// URLs.
    SQLAlchemy with psycopg3 requires postgresql+psycopg://.
    This normalises the URL transparently for both local and cloud databases.
    """
    cleaned = url.strip().strip('"').strip("'")
    return re.sub(r"^postgres(ql)?://", "postgresql+psycopg://", cleaned)


def _is_local_db_url(url: str) -> bool:
    return "@127.0.0.1" in url or "@localhost" in url


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # Pooled connection URL (Neon pooler or local postgres).
    # Neon CLI writes postgresql:// — we normalise to postgresql+psycopg:// below.
    DATABASE_URL: str = "postgresql+psycopg://p21_user:p21_password@127.0.0.1:5432/p21"

    # Unpooled / direct URL for Alembic migrations (DDL must bypass the pooler).
    # Falls back to DATABASE_URL when not set (local dev without Neon).
    DATABASE_URL_UNPOOLED: Optional[str] = None

    # Neon branch metadata injected by `neon deploy` — informational, not required.
    NEON_BRANCH: Optional[str] = None
    NEON_BRANCH_ID: Optional[str] = None
    NEON_FUNCTION_HOST_SUFFIX: Optional[str] = None

    SECRET_KEY: str = "497928f049558b6c0a8a520e5c6acb9decc3deb69412bfb463cd24fc1ecd5017"
    CSRF_SECRET: str = "0ff9cb393523615e47b92f3b291c644f83c01c379feebacf5fc101071de3f998"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000"

    AI_PROVIDER: str = "ollama"  # "ollama", "gemini", or "deterministic"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash"
    AI_TIMEOUT_SECONDS: int = 20
    AI_ENABLED: bool = True

    RATE_LIMIT_LOGIN_MAX: int = 5
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    model_config = SettingsConfigDict(
        # In production (Render), env vars are injected directly — no .env file needed.
        # In development, .env file is loaded.
        env_file=".env" if os.getenv("ENVIRONMENT", "development") != "production" else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    def _validate_cloud_db_url(self, url: str) -> str:
        normalized = _ensure_psycopg3_prefix(url)
        if (self.is_production or os.getenv("RENDER") == "true") and _is_local_db_url(normalized):
            raise RuntimeError(
                "DATABASE_URL is not configured for cloud deployment (still pointing to 127.0.0.1/localhost). "
                "Set DATABASE_URL in your Render service Environment Variables to your Neon PostgreSQL connection string."
            )
        return normalized

    @property
    def db_url(self) -> str:
        """Pooled URL with psycopg3 driver prefix — used by the FastAPI app."""
        return self._validate_cloud_db_url(self.DATABASE_URL)

    @property
    def db_url_unpooled(self) -> str:
        """Direct (unpooled) URL for Alembic migrations — bypasses Neon pooler."""
        raw = self.DATABASE_URL_UNPOOLED or self.DATABASE_URL
        return self._validate_cloud_db_url(raw)


settings = Settings()
