import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    DATABASE_URL: str = "postgresql+psycopg://p21_user:p21_password@127.0.0.1:5432/p21"

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


settings = Settings()
