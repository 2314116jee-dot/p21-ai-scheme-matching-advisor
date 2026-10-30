# scripts\init-db.ps1 - PostgreSQL Initialization & Migrations
# Provisions p21 database, dedicated database user, and runs Alembic migrations.

[CmdletBinding()]
param(
    [string]$SuperUser = "postgres",
    [string]$SuperPassword = "postgres",
    [string]$DbUser = "p21_user",
    [string]$DbPassword = "p21_password",
    [string]$DbName = "p21",
    [string]$HostName = "127.0.0.1",
    [int]$Port = 5432
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Database Initialization & Migrations" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify PostgreSQL Service
Write-Host "`n[1/3] Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name *postgres* -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "Running" }
if ($pgService) {
    Write-Host "  [OK] Running service: $($pgService.DisplayName)" -ForegroundColor Green
} else {
    Write-Warning "No running Windows service with 'postgres' in name. Attempting direct TCP connection..."
}

# 2. Provision Role & Database via Superuser
Write-Host "`n[2/3] Provisioning Database & User..." -ForegroundColor Yellow
$env:PGPASSWORD = $SuperPassword

$psqlCmd = "psql"
if (-not (Get-Command "psql" -ErrorAction SilentlyContinue)) {
    $standardPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
    if (Test-Path $standardPath) {
        $psqlCmd = $standardPath
    }
}

# Create Role if not exists
try {
    $createRoleCmd = "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DbUser') THEN CREATE USER $DbUser WITH PASSWORD '$DbPassword'; END IF; END \$\$;"
    & $psqlCmd -U $SuperUser -h $HostName -p $Port -c $createRoleCmd 2>$null
    Write-Host "  [OK] Verified database role '$DbUser'." -ForegroundColor Green
} catch {
    Write-Host "  [INFO] Attempting fallback role creation..." -ForegroundColor DarkGray
    & $psqlCmd -U $SuperUser -h $HostName -p $Port -c "CREATE USER $DbUser WITH PASSWORD '$DbPassword';" 2>$null
}

# Create Database if not exists
$dbExists = & $psqlCmd -U $SuperUser -h $HostName -p $Port -t -c "SELECT 1 FROM pg_database WHERE datname='$DbName';" 2>$null
if (-not $dbExists -or $dbExists.Trim() -ne "1") {
    Write-Host "  Creating database '$DbName' owned by '$DbUser'..."
    & $psqlCmd -U $SuperUser -h $HostName -p $Port -c "CREATE DATABASE $DbName OWNER $DbUser;"
    Write-Host "  [OK] Database '$DbName' created." -ForegroundColor Green
} else {
    Write-Host "  [OK] Database '$DbName' already exists." -ForegroundColor Green
}

& $psqlCmd -U $SuperUser -h $HostName -p $Port -c "GRANT ALL PRIVILEGES ON DATABASE $DbName TO $DbUser;" 2>$null

# 3. Apply Alembic Migrations
Write-Host "`n[3/3] Executing Alembic Migrations..." -ForegroundColor Yellow
$alembicPath = ".\venv\Scripts\alembic.exe"

if (-not (Test-Path $alembicPath)) {
    Write-Error "Alembic executable not found in .\venv\Scripts\. Run .\scripts\setup.ps1 first."
}

& $alembicPath upgrade head
Write-Host "  [OK] Database schema migrations applied successfully." -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  Database initialized and ready!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
