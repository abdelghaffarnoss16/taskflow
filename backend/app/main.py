"""
TaskFlow API - FastAPI application entry point.

This is a deliberately simple monolithic backend: React frontend -> this
API -> PostgreSQL. No microservices, no message queues, no extra moving
parts, so it stays easy to containerize and deploy later.
"""
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging_config import logger
from app.database.init_db import init_db
from app.routes import auth, system, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown logic."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} "
                f"in '{settings.ENVIRONMENT}' mode")
    # Skip automatic table creation during tests: the test suite manages
    # its own isolated SQLite schema via pytest fixtures (see tests/conftest.py).
    if settings.ENVIRONMENT != "test":
        init_db()
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A simple task management REST API built with FastAPI.",
    lifespan=lifespan,
)

# --- CORS ---
# Allows the React frontend (running on a different origin/port) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request logging middleware ---
# Logs every request: method, path, status code, and how long it took.
# This is intentionally simple plain-text output, useful later for a
# Linux-based log analysis exercise.
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Request received: {request.method} {request.url.path}")

    response = await call_next(request)

    duration_ms = round((time.time() - start_time) * 1000, 2)
    logger.info(
        f"Request completed: {request.method} {request.url.path} "
        f"status={response.status_code} duration_ms={duration_ms}"
    )
    return response


# --- Routers ---
app.include_router(system.router)
app.include_router(auth.router)
app.include_router(tasks.router)
