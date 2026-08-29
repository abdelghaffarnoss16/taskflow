"""
Application configuration.

All configuration is read from environment variables so that no secrets
are ever hardcoded in the source code. When running locally, these values
are typically supplied via a `.env` file (see `.env.example`).
"""
import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Centralized application settings, loaded from environment variables."""

    # --- Database ---
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://taskflow:taskflow@localhost:5432/taskflow",
    )

    # --- Security / JWT ---
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PRODUCTION")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    # --- Application ---
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    APP_NAME: str = os.getenv("APP_NAME", "TaskFlow API")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # --- CORS ---
    # Comma-separated list of allowed origins for the frontend.
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (avoids re-reading env vars repeatedly)."""
    return Settings()


settings = get_settings()
