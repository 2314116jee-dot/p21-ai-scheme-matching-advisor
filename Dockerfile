# ============================================================
# P21: AI Scheme-Matching Advisor - Production Dockerfile
# Builds frontend + serves via FastAPI (single container)
# ============================================================

FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --frozen-lockfile
COPY frontend/ ./
RUN npm run build

# ============================================================

FROM python:3.12-slim AS backend

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Copy pre-built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Non-root user for security
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Run migrations then start server (honour Render's $PORT and default to 1 worker for free-tier RAM/DB limits)
CMD ["sh", "-c", "alembic upgrade head && uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${WEB_CONCURRENCY:-1}"]
