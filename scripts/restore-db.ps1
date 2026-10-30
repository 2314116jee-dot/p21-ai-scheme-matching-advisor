# scripts\restore-db.ps1 - PostgreSQL Database Restore Script
# Restores the p21 database from a specified SQL backup file.

[CmdletBinding()]
param(
    [string]$BackupFile,
    [string]$DbUser = "p21_user",
    [string]$DbPassword = "p21_password",
    [string]$DbName = "p21",
    [string]$HostName = "127.0.0.1",
    [int]$Port = 5432
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Database Restore" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $BackupFile) {
    if (Test-Path "backups") {
        $latest = Get-ChildItem -Path "backups\*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latest) {
            $BackupFile = $latest.FullName
            Write-Host "Selected latest backup file: $BackupFile" -ForegroundColor Yellow
        }
    }
}

if (-not $BackupFile -or -not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found. Provide path via -BackupFile <path_to_sql>."
}

$confirm = Read-Host "WARNING: Restoring will overwrite current database '$DbName'. Type 'YES' to proceed"
if ($confirm -ne "YES") {
    Write-Host "Operation cancelled." -ForegroundColor DarkGray
    exit 0
}

Write-Host "Restoring database from '$BackupFile'..." -ForegroundColor Yellow
$env:PGPASSWORD = $DbPassword

$psqlCmd = "psql"
if (-not (Get-Command "psql" -ErrorAction SilentlyContinue)) {
    $standardPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
    if (Test-Path $standardPath) {
        $psqlCmd = $standardPath
    }
}

& $psqlCmd -U $DbUser -h $HostName -p $Port -d $DbName -f $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDatabase successfully restored from backup." -ForegroundColor Green
} else {
    Write-Error "Restore operation encountered errors."
}
