"""
Sagar Setu — Application Configuration
Loads settings from environment variables via pydantic-settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── App ──────────────────────────────────
    APP_NAME: str = "Sagar Setu"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ── Database ─────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://sagarsetu:sagarsetu_dev_2024@localhost:5432/sagarsetu"
    DATABASE_URL_SYNC: str = "postgresql://sagarsetu:sagarsetu_dev_2024@localhost:5432/sagarsetu"

    # ── Redis ────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── JWT Auth ─────────────────────────────
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60
    JWT_REFRESH_EXPIRY_DAYS: int = 7

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
