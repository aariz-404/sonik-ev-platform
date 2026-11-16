"""
config.py — Sonik EV Platform configuration hierarchy.

Usage:
    from config import config
    app.config.from_object(config['development'])
"""

import os
from dotenv import load_dotenv

load_dotenv()


def _build_db_uri() -> str:
    """Construct the database connection URI from environment variables."""
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    # Check for Vercel serverless environment
    if os.getenv("VERCEL"):
        import tempfile
        import shutil
        tmp_dir = tempfile.gettempdir()
        tmp_db = os.path.join(tmp_dir, "sonik_ev.db")
        base_dir = os.path.dirname(os.path.abspath(__file__))
        src_db = os.path.join(base_dir, "instance", "sonik_ev.db")
        if not os.path.exists(tmp_db) and os.path.exists(src_db):
            try:
                shutil.copyfile(src_db, tmp_db)
            except Exception:
                pass
        if os.path.exists(tmp_db):
            return f"sqlite:///{tmp_db}"
        return "sqlite:///:memory:"

    # If local instance sqlite database exists
    base_dir = os.path.dirname(os.path.abspath(__file__))
    inst_db = os.path.join(base_dir, "instance", "sonik_ev.db")
    if os.path.exists(inst_db):
        return f"sqlite:///{inst_db}"

    # If explicit MySQL host is configured
    if os.getenv("DB_HOST"):
        user = os.getenv("DB_USER", "sonik_user")
        password = os.getenv("DB_PASSWORD", "sonik_password")
        host = os.getenv("DB_HOST", "localhost")
        port = os.getenv("DB_PORT", "3306")
        name = os.getenv("DB_NAME", "sonik_ev_db")
        return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"

    return "sqlite:///sonik_ev.db"


class Config:
    """Base configuration shared by all environments."""

    # ------------------------------------------------------------------ #
    # Flask core
    # ------------------------------------------------------------------ #
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    DEBUG: bool = False
    TESTING: bool = False

    # ------------------------------------------------------------------ #
    # JWT
    # ------------------------------------------------------------------ #
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-jwt-secret-in-production")
    JWT_ACCESS_TOKEN_EXPIRES: int = 3600  # seconds (1 hour)

    # ------------------------------------------------------------------ #
    # SQLAlchemy / MySQL
    # ------------------------------------------------------------------ #
    SQLALCHEMY_DATABASE_URI: str = _build_db_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    SQLALCHEMY_ENGINE_OPTIONS: dict = {
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 5,
        "pool_recycle": 1800,  # recycle connections after 30 min
    }

    # ------------------------------------------------------------------ #
    # CORS
    # ------------------------------------------------------------------ #
    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:5173"
        ).split(",")
        if origin.strip()
    ]


class DevelopmentConfig(Config):
    """Settings for local development."""

    DEBUG: bool = True
    SQLALCHEMY_ECHO: bool = True  # log SQL statements to stdout


class ProductionConfig(Config):
    """Settings for production deployments."""

    DEBUG: bool = False
    SQLALCHEMY_ECHO: bool = False

    # Tighten pool settings for production traffic
    SQLALCHEMY_ENGINE_OPTIONS: dict = {
        "pool_pre_ping": True,
        "pool_size": 20,
        "max_overflow": 10,
        "pool_recycle": 1800,
    }


class TestingConfig(Config):
    """Settings for the automated test suite."""

    TESTING: bool = True
    DEBUG: bool = True

    # Use a lightweight in-memory SQLite DB so tests don't need MySQL
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///:memory:"
    SQLALCHEMY_ENGINE_OPTIONS: dict = {}  # no pooling needed for SQLite in-memory

    # Disable CSRF / external checks during tests
    WTF_CSRF_ENABLED: bool = False
    JWT_ACCESS_TOKEN_EXPIRES: int = 60  # short-lived tokens for testing


# ---------------------------------------------------------------------------
# Registry — maps environment name strings to config classes.
# ---------------------------------------------------------------------------
config: dict = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    # Convenience alias so FLASK_ENV=default works as well
    "default": DevelopmentConfig,
}
