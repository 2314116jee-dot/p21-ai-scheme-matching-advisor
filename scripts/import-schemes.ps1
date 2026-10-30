# scripts\import-schemes.ps1 - Scheme Data Ingestion Script
# Imports verified Central Government schemes and candidate records from official sources and datasets.

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Scheme Data Ingestion Pipeline" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$pythonPath = ".\venv\Scripts\python.exe"

& $pythonPath -m backend.scripts.import_schemes

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  Scheme ingestion completed." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
