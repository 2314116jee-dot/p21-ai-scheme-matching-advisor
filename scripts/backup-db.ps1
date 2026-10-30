# scripts\backup-db.ps1 - PostgreSQL Database Backup Script
# Creates a SQL dump of the p21 database into the backups\ folder.

[CmdletBinding()]
param(
    [string]$DbUser = "p21_user",
    [string]$DbPassword = "p21_password",
    [string]$DbName = "p21",
    [string]$HostName = "127.0.0.1",
    [int]$Port = 5432,
    [string]$BackupDir = "backups"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Database Backup" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupDir "p21_backup_$timestamp.sql"

Write-Host "Dumping database '$DbName' to '$backupFile'..." -ForegroundColor Yellow
$env:PGPASSWORD = $DbPassword

# Check if pg_dump is directly in PATH or standard PostgreSQL path
$pgDump = "pg_dump"
if (-not (Get-Command "pg_dump" -ErrorAction SilentlyContinue)) {
    $standardPath = "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe"
    if (Test-Path $standardPath) {
        $pgDump = $standardPath
    }
}

& $pgDump -U $DbUser -h $HostName -p $Port -d $DbName -f $backupFile --clean --if-exists

if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile)) {
    $size = (Get-Item $backupFile).Length / 1KB
    $rounded = [math]::Round($size, 1)
    Write-Host "`nBackup completed successfully: $backupFile ($rounded KB)" -ForegroundColor Green
} else {
    Write-Error "Database backup failed. Verify pg_dump is available in PATH or PostgreSQL 17 directory."
}
