"""
Database initialization.

For this beginner-friendly project we use SQLAlchemy's `create_all()` to
create tables directly from the models, instead of a full migration tool
like Alembic. This keeps the project simple. It can be replaced with
Alembic migrations later if needed.
"""
from app.core.logging_config import logger
from app.database.session import Base, engine

# Import models so they are registered on Base.metadata before create_all()
from app.models import task, user  # noqa: F401


def init_db() -> None:
    """Create all database tables if they don't already exist."""
    logger.info("Initializing database: creating tables if they do not exist")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialization complete")
