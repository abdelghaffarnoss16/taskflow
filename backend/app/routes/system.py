"""System routes: health check and version info.

These are intentionally unauthenticated so that external tools (Docker
healthchecks, load balancers, Kubernetes probes, monitoring systems like
Prometheus, uptime checks, etc.) can hit them without credentials.
"""
from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.core.logging_config import logger
from app.database.session import engine

router = APIRouter(tags=["system"])


@router.get("/health")
def health_check():
    """
    Health check endpoint.

    Reports overall status plus whether the database is reachable. Returns
    a 200 even if the database check fails, but reflects the failure in the
    response body — this is deliberate so that monitoring tools can
    distinguish between "backend is not running at all" (no response) and
    "backend is up but a dependency is unhealthy" (200 with status=unhealthy).
    """
    db_status = "unreachable"
    overall_status = "unhealthy"

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        db_status = "reachable"
        overall_status = "healthy"
    except Exception as exc:
        logger.error(f"Health check: database connection failed: {exc}")

    return {
        "status": overall_status,
        "database": db_status,
    }


@router.get("/api/version")
def get_version():
    """Return the current application version, read from APP_VERSION env var."""
    return {"version": settings.APP_VERSION}
