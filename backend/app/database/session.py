"""
Database engine and session management using SQLAlchemy.

`get_db()` is a FastAPI dependency that yields a database session for the
duration of a single request, and always closes it afterwards.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class that all SQLAlchemy models inherit from."""
    pass


def get_db() -> Generator:
    """FastAPI dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
