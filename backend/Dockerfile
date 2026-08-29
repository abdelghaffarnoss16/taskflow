# --- TaskFlow Backend Dockerfile ---
# Simple, single-stage build. Beginner-friendly and easy to extend later
# (e.g. multi-stage builds, non-root users, etc. as part of DevOps learning).

FROM python:3.12-slim

WORKDIR /app

# Install system dependencies needed to build psycopg2 and other packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (better Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

EXPOSE 8000

# Basic container-level health check, useful later for orchestration tools
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
