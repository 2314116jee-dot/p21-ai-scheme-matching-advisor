# scripts\start-dev.ps1 - Development Mode Launcher
# Runs FastAPI backend on http://127.0.0.1:8000 and Vite dev server on http://localhost:5173.

[CmdletBinding()]
param(
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Starting in Development Mode" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend
Write-Host "`n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath ".\venv\Scripts\python.exe" `
    -ArgumentList "-m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload" `
    -PassThru -NoNewWindow

# 2. Start Vite Dev Server
Write-Host "`n[2/2] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Push-Location "frontend"
$frontendProcess = Start-Process -FilePath "npm.cmd" `
    -ArgumentList "run dev" `
    -PassThru -NoNewWindow
Pop-Location

# Save PIDs for stop.ps1
$pids = @{
    BackendPid = $backendProcess.Id
    FrontendPid = $frontendProcess.Id
    Mode = "dev"
}
$pids | ConvertTo-Json | Set-Content -Path ".running-services.json" -Encoding UTF8

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  Services running:" -ForegroundColor Green
Write-Host "  - Backend API: http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)" -ForegroundColor White
Write-Host "  - Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host "  Run .\scripts\stop.ps1 to stop all services." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $NoBrowser) {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:5173"
}
