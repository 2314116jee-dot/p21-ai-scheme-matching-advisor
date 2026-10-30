# scripts\setup.ps1 - P21 Environment Setup Script
# Checks prerequisites, initializes Python virtual environment, installs backend and frontend packages,
# and generates .env with cryptographically secure random secrets.

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: AI Scheme-Matching Advisor - Environment Setup" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Prerequisites
Write-Host "`n[1/5] Checking System Prerequisites..." -ForegroundColor Yellow

# Python Check
try {
    $pyVer = python --version 2>&1
    Write-Host "  [OK] Python detected: $pyVer" -ForegroundColor Green
} catch {
    Write-Error "Python is not installed or not in PATH. Please install Python 3.11+."
}

# Node.js Check
try {
    $nodeVer = node --version 2>&1
    Write-Host "  [OK] Node.js detected: $nodeVer" -ForegroundColor Green
} catch {
    Write-Error "Node.js is not installed or not in PATH. Please install Node v20+."
}

# PostgreSQL Check
try {
    $psqlVer = psql --version 2>&1
    Write-Host "  [OK] PostgreSQL client detected: $psqlVer" -ForegroundColor Green
} catch {
    Write-Warning "psql command not in PATH. Verify PostgreSQL 15+ is installed and running."
}

# Ollama Check
try {
    $ollamaVer = ollama --version 2>&1
    Write-Host "  [OK] Ollama CLI detected: $ollamaVer" -ForegroundColor Green
} catch {
    Write-Host "  [INFO] Ollama not detected in PATH. Deterministic matching will run with local fallback." -ForegroundColor DarkGray
}

# 2. Setup Python Virtual Environment
Write-Host "`n[2/5] Configuring Python Virtual Environment..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    Write-Host "  Creating virtual environment in .\venv..."
    python -m venv venv
    Write-Host "  [OK] Virtual environment created." -ForegroundColor Green
} else {
    Write-Host "  [OK] Virtual environment already exists." -ForegroundColor Green
}

$pipPath = ".\venv\Scripts\pip.exe"
$pythonPath = ".\venv\Scripts\python.exe"

# 3. Install Backend Dependencies
Write-Host "`n[3/5] Installing Backend Python Packages..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    & $pipPath install -r requirements.txt
    Write-Host "  [OK] Backend packages installed from requirements.txt." -ForegroundColor Green
} else {
    Write-Warning "requirements.txt not found. Installing base packages..."
    & $pipPath install fastapi uvicorn[standard] sqlalchemy alembic psycopg[binary] bcrypt pyjwt pydantic-settings httpx pytest python-multipart email-validator
}

# 4. Install Frontend Dependencies
Write-Host "`n[4/5] Installing Frontend Packages..." -ForegroundColor Yellow
if (Test-Path "frontend\package.json") {
    Push-Location "frontend"
    try {
        npm install
        Write-Host "  [OK] Frontend packages installed successfully." -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# 5. Generate .env with Cryptographically Secure Secrets
Write-Host "`n[5/5] Configuring Environment (.env)..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "  Generating secure 64-char secrets for .env..."
    $secretKey = & $pythonPath -c "import secrets; print(secrets.token_hex(32))"
    $csrfSecret = & $pythonPath -c "import secrets; print(secrets.token_hex(32))"

    $lines = @(
        "ENVIRONMENT=development",
        "HOST=127.0.0.1",
        "PORT=8000",
        "",
        "# PostgreSQL 17 database",
        "DATABASE_URL=postgresql+psycopg://p21_user:p21_password@127.0.0.1:5432/p21",
        "PGHOST=127.0.0.1",
        "PGPORT=5432",
        "PGDATABASE=p21",
        "PGUSER=p21_user",
        "PGPASSWORD=p21_password",
        "",
        "# Cryptographic Keys (Auto-generated on setup)",
        "SECRET_KEY=$secretKey",
        "CSRF_SECRET=$csrfSecret",
        "ALGORITHM=HS256",
        "ACCESS_TOKEN_EXPIRE_MINUTES=720",
        "REFRESH_TOKEN_EXPIRE_DAYS=7",
        "COOKIE_SECURE=false",
        "COOKIE_SAMESITE=lax",
        "",
        "# Allowed CORS Origins",
        "CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000",
        "",
        "# AI Provider Layer (Ollama / Local LLM)",
        "AI_PROVIDER=ollama",
        "OLLAMA_BASE_URL=http://localhost:11434",
        "OLLAMA_MODEL=llama3.2",
        "AI_TIMEOUT_SECONDS=15",
        "AI_ENABLED=true",
        "",
        "# Security Rate Limiting",
        "RATE_LIMIT_LOGIN_MAX=5",
        "RATE_LIMIT_WINDOW_SECONDS=60"
    )

    $lines | Set-Content -Path ".env" -Encoding UTF8
    Write-Host "  [OK] .env successfully created with randomized secrets." -ForegroundColor Green
} else {
    Write-Host "  [OK] .env file already present." -ForegroundColor Green
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  Setup completed successfully!" -ForegroundColor Green
Write-Host "  Next step: run .\scripts\init-db.ps1 to configure PostgreSQL." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
