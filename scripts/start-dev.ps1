# scripts\start-dev.ps1 - Development Mode Launcher
# Runs FastAPI backend on http://127.0.0.1:8000 and Vite dev server on http://localhost:5173.

[CmdletBinding()]
param(
    [switch]$NoBrowser,
    [switch]$Foreground
)

$ErrorActionPreference = "Stop"

# Ensure script runs with working directory at project root
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $ProjectRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  P21: Starting in Development Mode" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$venvPython = Join-Path $ProjectRoot "venv\Scripts\python.exe"
$venvPythonw = Join-Path $ProjectRoot "venv\Scripts\pythonw.exe"
if (-not (Test-Path $venvPython)) {
    Write-Error "Virtual environment not found at '$venvPython'. Please run .\scripts\setup.ps1 first."
    exit 1
}

# 1. Clean up stale processes on port 8000 and 5173
$ports = @(8000, 5173)
foreach ($p in $ports) {
    $existing = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "  [*] Cleaning up stale process on port $p..." -ForegroundColor Yellow
        foreach ($conn in $existing) {
            try {
                cmd.exe /c "taskkill /PID $($conn.OwningProcess) /T /F" 2>$null
                Write-Host "  [OK] Released port $p (Process ID $($conn.OwningProcess))." -ForegroundColor Green
            } catch {}
        }
    }
}
Start-Sleep -Milliseconds 800

# Ensure logs folder exists
$logsDir = Join-Path $ProjectRoot "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}
$backendOut = Join-Path $logsDir "dev_backend.log"
$backendErr = Join-Path $logsDir "dev_backend_error.log"
$frontendOut = Join-Path $logsDir "dev_frontend.log"
$frontendErr = Join-Path $logsDir "dev_frontend_error.log"

# 2. Start FastAPI Backend
Write-Host "`n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$launcherExe = if (Test-Path $venvPythonw) { $venvPythonw } else { $venvPython }

$backendProcess = Start-Process -FilePath $launcherExe `
    -ArgumentList "-m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload" `
    -WorkingDirectory $ProjectRoot `
    -RedirectStandardOutput $backendOut `
    -RedirectStandardError $backendErr `
    -PassThru

# 3. Start Vite Dev Server
Write-Host "`n[2/2] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "npm.cmd" `
    -ArgumentList "run dev" `
    -WorkingDirectory (Join-Path $ProjectRoot "frontend") `
    -RedirectStandardOutput $frontendOut `
    -RedirectStandardError $frontendErr `
    -PassThru

# Save PIDs for stop.ps1
$pids = @{
    BackendPid = $backendProcess.Id
    FrontendPid = $frontendProcess.Id
    Mode = "dev"
}
$pids | ConvertTo-Json | Set-Content -Path (Join-Path $ProjectRoot ".running-services.json") -Encoding UTF8

# Active verification
Write-Host "  Verifying services startup..." -ForegroundColor Yellow
$backendUp = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Milliseconds 800
    $conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $backendUp = $true
        break
    }
}

if ($backendUp) {
    Write-Host "  [OK] Backend API verified live on port 8000." -ForegroundColor Green
} else {
    Write-Host "  [!] Backend starting on port 8000 (PID $($backendProcess.Id))." -ForegroundColor Yellow
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  Services running:" -ForegroundColor Green
Write-Host "  - Backend API: http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)" -ForegroundColor White
Write-Host "  - Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host "  - Logs: logs\dev_backend.log, logs\dev_frontend.log" -ForegroundColor White
Write-Host "  Run .\scripts\stop.ps1 (or .\stop.bat) to stop all services." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $NoBrowser) {
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:5173"
}
