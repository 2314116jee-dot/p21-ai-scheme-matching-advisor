#!/bin/bash
# ============================================================
# Render.com Build Script for P21 Backend
# Runs on every deploy before the container starts.
# ============================================================
set -e

echo "=== P21 Cloud Build Script ==="
echo "Environment: ${ENVIRONMENT:-production}"

# Install Python dependencies
echo "[1/3] Installing Python dependencies..."
pip install -r requirements.txt

# Run Alembic DB migrations (safe to run on every deploy — idempotent)
echo "[2/3] Running database migrations..."
alembic upgrade head

# Seed verified schemes if database is empty (first deploy)
echo "[3/3] Checking scheme data..."
python -c "
from backend.database import SessionLocal
from backend.models.scheme import Scheme
db = SessionLocal()
count = db.query(Scheme).count()
db.close()
print(f'  Schemes in database: {count}')
if count == 0:
    print('  Empty database detected — running scheme ingestion...')
    import subprocess
    subprocess.run(['python', '-m', 'backend.scripts.import_schemes'], check=True)
    print('  Scheme ingestion complete.')
else:
    print('  Database already populated — skipping ingestion.')
" 2>/dev/null || echo "  Scheme check skipped (non-fatal)."

echo "=== Build complete. Starting server... ==="
